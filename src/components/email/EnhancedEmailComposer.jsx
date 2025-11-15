import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Mail, Loader2, Paperclip, Trash2, Send, FileText, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ContactSelector from './ContactSelector';
import TemplateSelector from './TemplateSelector';
import EntityLinker from './EntityLinker';

export default function EnhancedEmailComposer({ 
  isOpen, 
  onClose, 
  defaultRecipients = [],
  defaultSubject = '',
  defaultBody = '',
  entityId = null,
  entityType = null,
  replyTo = null
}) {
  const [to, setTo] = useState(defaultRecipients.join(', '));
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showEntityLinker, setShowEntityLinker] = useState(false);
  const [linkedEntity, setLinkedEntity] = useState(entityId && entityType ? { id: entityId, type: entityType } : null);

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

  const applyTemplate = (template) => {
    setSubject(template.subject);
    setBody(template.body);
    setShowTemplates(false);
  };

  const handleSend = async () => {
    const toList = to.split(',').map(r => r.trim()).filter(r => r);
    const ccList = cc.split(',').map(r => r.trim()).filter(r => r);
    const bccList = bcc.split(',').map(r => r.trim()).filter(r => r);

    if (toList.length === 0) {
      alert('Please enter at least one recipient');
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
      const allRecipients = [...toList, ...ccList, ...bccList];

      let emailBody = body.replace(/<[^>]*>/g, '');
      if (attachments.length > 0) {
        emailBody += '\n\n---\nAttachments:\n';
        attachments.forEach(att => {
          emailBody += `${att.name}: ${att.url}\n`;
        });
      }

      const sendPromises = allRecipients.map(recipient => 
        base44.integrations.Core.SendEmail({
          to: recipient,
          subject: subject,
          body: emailBody,
          from_name: `${user.full_name || 'SoloSync'} (No-Reply)`
        })
      );

      await Promise.all(sendPromises);

      const threadId = replyTo?.thread_id || replyTo?.id || `thread_${Date.now()}`;

      await base44.entities.EmailLog.create({
        sender_email: user.email,
        recipients: toList,
        cc: ccList,
        bcc: bccList,
        subject: subject,
        body: emailBody,
        body_html: body,
        attached_file_urls: attachments.map(a => a.url),
        associated_entity_id: linkedEntity?.id,
        associated_entity_type: linkedEntity?.type,
        thread_id: threadId,
        in_reply_to: replyTo?.id,
        status: 'sent'
      });

      for (const email of toList) {
        const contacts = await base44.entities.Contact.filter({ email });
        if (contacts.length > 0) {
          await base44.entities.Contact.update(contacts[0].id, {
            last_contacted: new Date().toISOString(),
            email_count: (contacts[0].email_count || 0) + 1
          });
        }
      }

      alert('Email sent successfully!');
      onClose();
    } catch (error) {
      console.error('Send email error:', error);
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
          className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          <Card className="p-6 rounded-[20px]" style={{ background: 'white' }}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">New Message</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-[8px]" disabled={sending}>
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700 w-12">To:</span>
                <ContactSelector
                  value={to}
                  onChange={setTo}
                  placeholder="Recipients"
                  disabled={sending}
                />
                <div className="flex gap-2">
                  {!showCc && (
                    <Button size="sm" variant="ghost" onClick={() => setShowCc(true)} className="text-xs text-gray-600">
                      Cc
                    </Button>
                  )}
                  {!showBcc && (
                    <Button size="sm" variant="ghost" onClick={() => setShowBcc(true)} className="text-xs text-gray-600">
                      Bcc
                    </Button>
                  )}
                </div>
              </div>

              {showCc && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700 w-12">Cc:</span>
                  <ContactSelector value={cc} onChange={setCc} placeholder="Carbon copy" disabled={sending} />
                </div>
              )}

              {showBcc && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700 w-12">Bcc:</span>
                  <ContactSelector value={bcc} onChange={setBcc} placeholder="Blind carbon copy" disabled={sending} />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-semibold text-gray-700 w-12">Subject:</span>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                className="rounded-[10px]"
                disabled={sending}
              />
            </div>

            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
              <Button size="sm" variant="outline" onClick={() => setShowTemplates(!showTemplates)} className="rounded-[8px]">
                <FileText className="w-4 h-4 mr-1" />
                Templates
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowEntityLinker(!showEntityLinker)} className="rounded-[8px]">
                <LinkIcon className="w-4 h-4 mr-1" />
                Link to {linkedEntity ? linkedEntity.type : 'Entity'}
              </Button>
            </div>

            {showTemplates && (
              <div className="mb-4">
                <TemplateSelector onSelect={applyTemplate} onClose={() => setShowTemplates(false)} />
              </div>
            )}

            {showEntityLinker && (
              <div className="mb-4">
                <EntityLinker selectedEntity={linkedEntity} onSelect={setLinkedEntity} onClose={() => setShowEntityLinker(false)} />
              </div>
            )}

            <div className="mb-4">
              <ReactQuill
                value={body}
                onChange={setBody}
                placeholder="Compose your message..."
                className="rounded-[12px] bg-white"
                style={{ minHeight: '200px' }}
                modules={{
                  toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['link'],
                    ['clean']
                  ]
                }}
              />
            </div>

            {attachments.length > 0 && (
              <div className="mb-4 space-y-2">
                {attachments.map((att, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-[10px]">
                    <Paperclip className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 flex-1">{att.name}</span>
                    <button onClick={() => removeAttachment(index)} className="p-1 hover:bg-gray-200 rounded-[6px]" disabled={sending}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex gap-2">
                <label className="cursor-pointer">
                  <input type="file" multiple onChange={handleFileUpload} className="hidden" disabled={uploading || sending} />
                  <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-[10px] transition-colors">
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                    ) : (
                      <Paperclip className="w-4 h-4 text-gray-600" />
                    )}
                    <span className="text-sm text-gray-700">Attach</span>
                  </div>
                </label>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} disabled={sending} className="rounded-[12px]">
                  Cancel
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={sending || uploading}
                  className="rounded-[12px] text-white"
                  style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' }}
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}