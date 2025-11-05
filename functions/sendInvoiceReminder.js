import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invoiceId } = await req.json();

    if (!invoiceId) {
      return Response.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    // Fetch invoice
    const invoices = await base44.entities.Invoice.filter({ id: invoiceId });
    
    if (invoices.length === 0) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const invoice = invoices[0];

    if (!invoice.client_email) {
      return Response.json({ error: 'Client email not found' }, { status: 400 });
    }

    // Calculate days overdue/remaining
    const dueDate = new Date(invoice.due_date);
    const today = new Date();
    const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

    let subject, body;

    if (daysOverdue > 0) {
      // Overdue reminder
      subject = `Payment Reminder: Invoice ${invoice.invoice_number} is ${daysOverdue} days overdue`;
      body = `Dear ${invoice.client_name},

This is a friendly reminder that payment for Invoice #${invoice.invoice_number} is now ${daysOverdue} days overdue.

Invoice Details:
- Invoice Number: ${invoice.invoice_number}
- Amount Due: $${invoice.amount.toFixed(2)}
- Original Due Date: ${dueDate.toLocaleDateString()}

Please process this payment at your earliest convenience. If you have already sent payment, please disregard this reminder.

If you have any questions or need to discuss payment arrangements, please don't hesitate to reach out.

Best regards,
${user.full_name}
${user.email}`;
    } else {
      // Upcoming payment reminder
      const daysRemaining = Math.abs(daysOverdue);
      subject = `Payment Due Soon: Invoice ${invoice.invoice_number}`;
      body = `Dear ${invoice.client_name},

This is a friendly reminder that payment for Invoice #${invoice.invoice_number} is due in ${daysRemaining} days.

Invoice Details:
- Invoice Number: ${invoice.invoice_number}
- Amount Due: $${invoice.amount.toFixed(2)}
- Due Date: ${dueDate.toLocaleDateString()}

Please ensure payment is processed by the due date to avoid any late fees.

If you have any questions, please feel free to contact me.

Best regards,
${user.full_name}
${user.email}`;
    }

    // Send email
    await base44.integrations.Core.SendEmail({
      from_name: user.full_name,
      to: invoice.client_email,
      subject: subject,
      body: body,
    });

    // Update invoice to track reminder sent
    const remindersSent = (invoice.reminders_sent || 0) + 1;
    await base44.entities.Invoice.update(invoiceId, {
      reminders_sent: remindersSent,
      last_reminder_date: new Date().toISOString(),
    });

    return Response.json({ 
      success: true,
      message: 'Reminder sent successfully',
      reminders_sent: remindersSent,
    });
  } catch (error) {
    console.error('Send reminder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});