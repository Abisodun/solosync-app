import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from "@/components/ui/card";
import { Mail, Paperclip, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function EmailHistory({ entityId, entityType }) {
  const { data: emails = [], isLoading } = useQuery({
    queryKey: ['email-history', entityId, entityType],
    queryFn: async () => {
      if (!entityId || !entityType) return [];
      return await base44.entities.EmailLog.filter({
        associated_entity_id: entityId,
        associated_entity_type: entityType
      });
    },
    enabled: !!entityId && !!entityType
  });

  const sortedEmails = [...emails].sort((a, b) => 
    new Date(b.created_date) - new Date(a.created_date)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (sortedEmails.length === 0) {
    return (
      <Card className="p-8 rounded-[20px] text-center" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
        <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No emails sent yet</p>
        <p className="text-sm text-gray-400 mt-1">Email communications will appear here</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sortedEmails.map((email, index) => (
        <motion.div
          key={email.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card 
            className="p-5 rounded-[16px] hover:shadow-lg transition-all"
            style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 ${
                  email.status === 'sent' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {email.status === 'sent' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 mb-1">{email.subject}</h4>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <span>To: {email.recipients.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{format(new Date(email.created_date), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {email.status === 'failed' && (
                <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                  Failed
                </span>
              )}
            </div>

            {/* Body */}
            <div className="pl-13 mb-3">
              <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
                {email.body}
              </p>
            </div>

            {/* Attachments */}
            {email.attached_file_urls && email.attached_file_urls.length > 0 && (
              <div className="pl-13">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Paperclip className="w-4 h-4" />
                  <span className="font-medium">
                    {email.attached_file_urls.length} attachment{email.attached_file_urls.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {email.error_message && (
              <div className="mt-3 p-3 bg-red-50 rounded-[10px] border border-red-200">
                <p className="text-xs text-red-700">
                  <strong>Error:</strong> {email.error_message}
                </p>
              </div>
            )}

            {/* Sender Info */}
            <div className="pl-13 mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Sent by {email.sender_email}
              </p>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}