import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { X, Mail, Upload, Loader2, Paperclip, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function EmailComposerModal({ 
  isOpen, 
  onClose, 
  defaultRecipients = [],
  defaultSubject = '',
  defaultBody = '',
  entityId = null,
  entityType = null
}) {
  const [recipients, setRecipients] = useState(defaultRecipients.join(', '));
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      
      const newAttachments = files.map((file, index) => ({
        name: file.name,
        url: results[index].file_url
      }));

      setAttachments([...attachments, ...newAttachments]);
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    // Validate inputs
    if (!recipients.trim()) {
      alert('Please enter at least one recipient email');
      return;
    }

    if (!subject.trim()) {
      alert('Please enter a subject');
      return;
    }

    if (!body.trim()) {
      alert('Please enter a message');
      return;
    }

    setSending(true);
    try {
      const user = await base44.auth.me();
      const recipientList = recipients.split(',').map(r => r.trim()).filter(r => r);

      // Create email body with attachments
      let emailBody = body;
      if (attachments.length > 0) {
        emailBody += '\n\n---\nAttachments:\n';
        attachments.forEach(att => {
          emailBody += `${att.name}: ${att.url}\n`;
        });
      }

      // Send emails to all recipients
      const sendPromises = recipientList.map(recipient => 
        base44.integrations.Core.SendEmail({
          to: recipient,
          subject: subject,
          body: emailBody,
          from_name: user.full_name || 'Team'
        })
      );

      await Promise.all(sendPromises);

      // Log the email
      await base44.entities.EmailLog.create({
        sender_email: user.email,
        recipients: recipientList,
        subject: subject,
        body: body,
        attached_file_urls: attachments.map(a => a.url),
        associated_entity_id: entityId,
        associated_entity_type: entityType,
        status: 'sent'
      });

      alert('Email sent successfully!');
      onClose();
    } catch (error) {
      console.error('Send email error:', error);
      
      // Try to log the failed attempt
      try {
        const user = await base44.auth.me();
        await base44.entities.EmailLog.create({
          sender_email: user.email,
          recipients: recipients.split(',').map(r => r.trim()).filter(r => r),
          subject: subject,
          body: body,
          attached_file_urls: attachments.map(a => a.url),
          associated_entity_id: entityId,
          associated_entity_type: entityType,
          status: 'failed',
          error_message: error.message
        });
      } catch (logError) {
        console.error('Failed to log email error:', logError);
      }

      alert('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl"
        >
          <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.98)', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-[14px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' }}>
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Compose Email</h3>
                  <p className="text-sm text-gray-500">Share updates with clients or team</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-[8px] transition-colors"
                disabled={sending}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Recipients */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  To: (separate multiple emails with commas)
                </label>
                <Input
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  placeholder="client@example.com, team@example.com"
                  className="rounded-[12px]"
                  disabled={sending}
                />
              </div>

              {/* Subject */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Subject
                </label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject"
                  className="rounded-[12px]"
                  disabled={sending}
                />
              </div>

              {/* Body */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Message
                </label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your message here..."
                  className="rounded-[12px] h-40"
                  disabled={sending}
                />
              </div>

              {/* Attachments */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Attachments
                </label>
                
                {attachments.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {attachments.map((att, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-[10px]">
                        <Paperclip className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 flex-1">{att.name}</span>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="p-1 hover:bg-gray-200 rounded-[6px] transition-colors"
                          disabled={sending}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading || sending}
                    />
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-[10px] transition-colors">
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                      ) : (
                        <Upload className="w-4 h-4 text-gray-600" />
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        {uploading ? 'Uploading...' : 'Add Files'}
                      </span>
                    </div>
                  </label>
                  <span className="text-xs text-gray-500">
                    Upload documents, images, or PDFs
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={onClose}
                className="rounded-[12px]"
                disabled={sending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                className="rounded-[12px] text-white"
                style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' }}
                disabled={sending || uploading}
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}