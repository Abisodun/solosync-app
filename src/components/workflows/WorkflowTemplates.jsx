import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Clock, Mail, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const templates = [
  {
    id: 'overdue-invoice',
    name: 'Auto-Mark Overdue Invoices',
    description: 'Automatically change invoice status to overdue when past due date',
    icon: AlertTriangle,
    color: '#EF4444',
    trigger_type: 'invoice_overdue',
    trigger_config: {},
    actions: [
      {
        type: 'update_status',
        config: { status: 'overdue' }
      },
      {
        type: 'create_notification',
        config: { message: 'Invoice {invoice_number} is now overdue' }
      }
    ]
  },
  {
    id: 'payment-reminder-before',
    name: 'Payment Reminder (Before Due)',
    description: 'Send email reminder 3 days before invoice due date',
    icon: Mail,
    color: '#F59E0B',
    trigger_type: 'invoice_due_soon',
    trigger_config: { days_before: 3 },
    actions: [
      {
        type: 'send_email',
        config: {
          subject: 'Payment Reminder: Invoice {invoice_number}',
          body: 'Hi {client_name},\n\nThis is a friendly reminder that invoice {invoice_number} for ${amount} is due on {due_date}.\n\nThank you for your business!'
        }
      }
    ]
  },
  {
    id: 'payment-reminder-after',
    name: 'Overdue Payment Reminder',
    description: 'Send email reminder 2 days after invoice becomes overdue',
    icon: Clock,
    color: '#EF4444',
    trigger_type: 'invoice_overdue',
    trigger_config: { days_after: 2 },
    actions: [
      {
        type: 'send_email',
        config: {
          subject: 'Overdue Invoice: {invoice_number}',
          body: 'Hi {client_name},\n\nInvoice {invoice_number} for ${amount} is now overdue. It was due on {due_date}.\n\nPlease arrange payment at your earliest convenience.\n\nThank you!'
        }
      }
    ]
  },
  {
    id: 'high-value-client-alert',
    name: 'High-Value Client Invoice Alert',
    description: 'Get notified when invoices over $5,000 are created',
    icon: TrendingUp,
    color: '#10B981',
    trigger_type: 'invoice_created',
    trigger_config: { min_amount: 5000 },
    actions: [
      {
        type: 'create_notification',
        config: { message: 'High-value invoice created: ${amount} for {client_name}' }
      }
    ]
  },
  {
    id: 'client-status-change',
    name: 'Client Status Change Alert',
    description: 'Get notified when a client changes from lead to active',
    icon: Bell,
    color: '#8B5CF6',
    trigger_type: 'client_status_change',
    trigger_config: { from: 'lead', to: 'active' },
    actions: [
      {
        type: 'create_notification',
        config: { message: 'Client {client_name} is now active!' }
      }
    ]
  },
  {
    id: 'payment-received',
    name: 'Payment Received Notification',
    description: 'Get notified when invoice is marked as paid',
    icon: Zap,
    color: '#10B981',
    trigger_type: 'payment_received',
    trigger_config: {},
    actions: [
      {
        type: 'create_notification',
        config: { message: 'Payment received for invoice {invoice_number}: ${amount}' }
      }
    ]
  }
];

export default function WorkflowTemplates({ onSelectTemplate }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template, index) => {
        const Icon = template.icon;
        return (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card
              className="p-6 rounded-[20px] h-full hover:shadow-xl transition-all cursor-pointer group"
              style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}
              onClick={() => onSelectTemplate(template)}
            >
              <div
                className="w-14 h-14 rounded-[16px] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                style={{
                  background: `linear-gradient(135deg, ${template.color}22 0%, ${template.color}11 100%)`,
                  boxShadow: `0 4px 16px ${template.color}33`
                }}
              >
                <Icon className="w-7 h-7" style={{ color: template.color }} />
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-2">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{template.description}</p>
              
              <Button
                className="w-full rounded-[12px] text-white font-semibold"
                style={{ background: `linear-gradient(135deg, ${template.color} 0%, ${template.color}CC 100%)` }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTemplate(template);
                }}
              >
                Use Template
              </Button>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}