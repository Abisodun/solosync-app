import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mail, Send, Archive, Star, Search, Pencil, Trash2, MoreVertical, Paperclip, Reply } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/common/Sidebar';
import EnhancedEmailComposer from '../components/email/EnhancedEmailComposer';

export default function MailboxPage() {
  const [activeTab, setActiveTab] = useState('sent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showComposer, setShowComposer] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const queryClient = useQueryClient();

  const { data: emails = [], isLoading } = useQuery({
    queryKey: ['emails', activeTab],
    queryFn: async () => {
      if (activeTab === 'sent') {
        return await base44.entities.EmailLog.filter({ is_archived: false, status: 'sent' }, '-created_date');
      } else if (activeTab === 'archived') {
        return await base44.entities.EmailLog.filter({ is_archived: true }, '-created_date');
      }
      return [];
    }
  });

  const toggleStarMutation = useMutation({
    mutationFn: ({ id, isStarred }) => base44.entities.EmailLog.update(id, { is_starred: !isStarred }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['emails'] })
  });

  const archiveMutation = useMutation({
    mutationFn: (id) => base44.entities.EmailLog.update(id, { is_archived: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      setSelectedEmail(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EmailLog.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      setSelectedEmail(null);
    }
  });

  const handleReply = (email) => {
    setReplyTo(email);
    setShowComposer(true);
  };

  // Filter emails by search
  const filteredEmails = emails.filter(email =>
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.recipients.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group by thread
  const groupedEmails = filteredEmails.reduce((acc, email) => {
    const threadId = email.thread_id || email.id;
    if (!acc[threadId]) acc[threadId] = [];
    acc[threadId].push(email);
    return acc;
  }, {});

  const threads = Object.values(groupedEmails).map(thread => ({
    id: thread[0].thread_id || thread[0].id,
    emails: thread.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)),
    latest: thread[0]
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Sidebar currentPage="Mailbox" />
      
      <div style={{ marginLeft: '260px', minHeight: '100vh', background: 'linear-gradient(135deg, #FAF5FF 0%, #F0FDF4 50%, #EFF6FF 100%)' }}>
        <div className="flex h-screen">
          {/* Email List */}
          <div className={`${selectedEmail ? 'w-1/3' : 'w-full'} border-r border-gray-200 bg-white flex flex-col`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Mailbox</h1>
                <Button
                  onClick={() => {
                    setReplyTo(null);
                    setShowComposer(true);
                  }}
                  className="rounded-[12px] text-white"
                  style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' }}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Compose
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search emails..."
                  className="pl-10 rounded-[10px]"
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setActiveTab('sent')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-[10px] transition-all ${
                    activeTab === 'sent' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  Sent
                </button>
                <button
                  onClick={() => setActiveTab('archived')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-[10px] transition-all ${
                    activeTab === 'archived' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Archive className="w-4 h-4" />
                  Archived
                </button>
              </div>
            </div>

            {/* Email List */}
            <div className="flex-1 overflow-y-auto">
              {threads.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No emails found</p>
                </div>
              ) : (
                <div>
                  {threads.map((thread) => {
                    const email = thread.latest;
                    const isSelected = selectedEmail?.id === email.id;
                    
                    return (
                      <button
                        key={thread.id}
                        onClick={() => setSelectedEmail(email)}
                        className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStarMutation.mutate({ id: email.id, isStarred: email.is_starred });
                            }}
                            className="mt-1"
                          >
                            <Star className={`w-4 h-4 ${email.is_starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-gray-800 truncate">
                                To: {email.recipients.join(', ')}
                              </span>
                              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                {format(new Date(email.created_date), 'MMM d, h:mm a')}
                              </span>
                            </div>
                            <div className="font-medium text-gray-700 truncate mb-1">{email.subject}</div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500 truncate">
                                {email.body.replace(/<[^>]*>/g, '').substring(0, 80)}...
                              </span>
                              {email.attached_file_urls?.length > 0 && (
                                <Paperclip className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              )}
                              {thread.emails.length > 1 && (
                                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full flex-shrink-0">
                                  {thread.emails.length}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Email Detail */}
          {selectedEmail && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 bg-white overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedEmail.subject}</h2>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReply(selectedEmail)}
                      className="rounded-[10px]"
                    >
                      <Reply className="w-4 h-4 mr-1" />
                      Reply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => archiveMutation.mutate(selectedEmail.id)}
                      className="rounded-[10px]"
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm('Delete this email?')) {
                          deleteMutation.mutate(selectedEmail.id);
                        }
                      }}
                      className="rounded-[10px] hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                {/* Meta */}
                <div className="mb-6 p-4 bg-gray-50 rounded-[12px]">
                  <div className="space-y-2 text-sm">
                    <div><strong>From:</strong> {selectedEmail.sender_email}</div>
                    <div><strong>To:</strong> {selectedEmail.recipients.join(', ')}</div>
                    {selectedEmail.cc?.length > 0 && (
                      <div><strong>Cc:</strong> {selectedEmail.cc.join(', ')}</div>
                    )}
                    <div><strong>Date:</strong> {format(new Date(selectedEmail.created_date), 'MMMM d, yyyy h:mm a')}</div>
                  </div>
                </div>

                {/* Body */}
                <div
                  className="prose max-w-none mb-6"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.body_html || selectedEmail.body.replace(/\n/g, '<br/>') }}
                />

                {/* Attachments */}
                {selectedEmail.attached_file_urls?.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-3">Attachments ({selectedEmail.attached_file_urls.length})</h3>
                    <div className="space-y-2">
                      {selectedEmail.attached_file_urls.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-[10px] hover:bg-gray-100 transition-colors"
                        >
                          <Paperclip className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">Attachment {index + 1}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Composer */}
      <EnhancedEmailComposer
        isOpen={showComposer}
        onClose={() => {
          setShowComposer(false);
          setReplyTo(null);
        }}
        defaultRecipients={replyTo ? [replyTo.sender_email] : []}
        defaultSubject={replyTo ? `Re: ${replyTo.subject}` : ''}
        defaultBody={replyTo ? `<br/><br/>--- Original Message ---<br/>${replyTo.body_html || replyTo.body}` : ''}
        replyTo={replyTo}
      />
    </>
  );
}