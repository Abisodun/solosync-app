import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Replaces placeholders in template with actual values
 */
function replacePlaceholders(text, data) {
  let result = text;
  for (const [key, value] of Object.entries(data)) {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(placeholder, value || '');
  }
  return result;
}

/**
 * Sends automated emails based on templates
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { templateId, recipientEmails, placeholderData, entityId, entityType } = await req.json();

    if (!templateId || !recipientEmails || recipientEmails.length === 0) {
      return Response.json({ 
        error: 'Missing required fields: templateId and recipientEmails' 
      }, { status: 400 });
    }

    // Fetch the template
    const templates = await base44.entities.EmailTemplate.filter({ id: templateId });
    if (!templates || templates.length === 0) {
      return Response.json({ error: 'Template not found' }, { status: 404 });
    }

    const template = templates[0];

    if (!template.is_active) {
      return Response.json({ error: 'Template is not active' }, { status: 400 });
    }

    // Replace placeholders
    const subject = replacePlaceholders(template.subject, placeholderData || {});
    const body = replacePlaceholders(template.body, placeholderData || {});

    // Send emails
    const sendPromises = recipientEmails.map(email =>
      base44.integrations.Core.SendEmail({
        to: email,
        subject: subject,
        body: body,
        from_name: user.full_name || 'Team'
      })
    );

    await Promise.all(sendPromises);

    // Log the email
    await base44.entities.EmailLog.create({
      sender_email: user.email,
      recipients: recipientEmails,
      subject: subject,
      body: body,
      attached_file_urls: [],
      associated_entity_id: entityId || null,
      associated_entity_type: entityType || null,
      status: 'sent'
    });

    return Response.json({
      success: true,
      message: `Email sent to ${recipientEmails.length} recipient(s)`,
      recipientCount: recipientEmails.length
    });

  } catch (error) {
    console.error('Error sending automated email:', error);
    return Response.json({ 
      error: error.message || 'Failed to send email' 
    }, { status: 500 });
  }
});