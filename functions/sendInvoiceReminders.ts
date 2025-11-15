import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Checks for overdue invoices and sends reminder emails
 * Can be called manually or scheduled to run daily
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Use service role for automated task
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all sent invoices that are overdue
    const allInvoices = await base44.asServiceRole.entities.Invoice.list();
    const overdueInvoices = allInvoices.filter(invoice => {
      if (invoice.status !== 'sent') return false;
      const dueDate = new Date(invoice.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    });

    if (overdueInvoices.length === 0) {
      return Response.json({
        success: true,
        message: 'No overdue invoices found',
        processedCount: 0
      });
    }

    // Find reminder template
    const templates = await base44.asServiceRole.entities.EmailTemplate.filter({
      template_type: 'invoice_reminder',
      is_active: true
    });

    if (!templates || templates.length === 0) {
      return Response.json({
        success: false,
        message: 'No active invoice reminder template found. Please create one first.',
        processedCount: 0
      });
    }

    const template = templates[0];
    const results = [];

    // Send reminders
    for (const invoice of overdueInvoices) {
      try {
        if (!invoice.client_email) {
          results.push({
            invoiceNumber: invoice.invoice_number,
            success: false,
            error: 'No client email'
          });
          continue;
        }

        // Get invoice owner to use their name
        const owner = await base44.asServiceRole.entities.User.filter({ 
          email: invoice.created_by 
        });
        const businessName = owner[0]?.full_name || 'Your Business';

        // Replace placeholders
        const placeholderData = {
          client_name: invoice.client_name,
          invoice_number: invoice.invoice_number,
          amount: `$${invoice.amount.toLocaleString()}`,
          due_date: new Date(invoice.due_date).toLocaleDateString(),
          business_name: businessName
        };

        let subject = template.subject;
        let body = template.body;

        for (const [key, value] of Object.entries(placeholderData)) {
          const placeholder = new RegExp(`{{${key}}}`, 'g');
          subject = subject.replace(placeholder, value);
          body = body.replace(placeholder, value);
        }

        // Send email
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: invoice.client_email,
          subject: subject,
          body: body,
          from_name: businessName
        });

        // Log the email
        await base44.asServiceRole.entities.EmailLog.create({
          sender_email: invoice.created_by,
          recipients: [invoice.client_email],
          subject: subject,
          body: body,
          attached_file_urls: [],
          associated_entity_id: invoice.id,
          associated_entity_type: 'Invoice',
          status: 'sent',
          created_by: invoice.created_by
        });

        // Update invoice status to overdue
        await base44.asServiceRole.entities.Invoice.update(invoice.id, {
          status: 'overdue'
        });

        results.push({
          invoiceNumber: invoice.invoice_number,
          success: true,
          client: invoice.client_name
        });

      } catch (error) {
        results.push({
          invoiceNumber: invoice.invoice_number,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return Response.json({
      success: true,
      message: `Processed ${overdueInvoices.length} overdue invoices, sent ${successCount} reminders`,
      processedCount: overdueInvoices.length,
      sentCount: successCount,
      results: results
    });

  } catch (error) {
    console.error('Error sending invoice reminders:', error);
    return Response.json({ 
      error: error.message || 'Failed to process invoice reminders' 
    }, { status: 500 });
  }
});