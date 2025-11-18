
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Plus, Mail, Zap } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import Sidebar from '../components/common/Sidebar';
import EmailTemplateForm from '../components/communication/EmailTemplateForm';
import EmailTemplateList from '../components/communication/EmailTemplateList';
import { Card } from "@/components/ui/card";

export default function EmailTemplatesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: () => base44.entities.EmailTemplate.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EmailTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      setShowForm(false);
      setEditingTemplate(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EmailTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      setShowForm(false);
      setEditingTemplate(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EmailTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    }
  });

  const handleSubmit = (data) => {
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleDuplicate = (template) => {
    setEditingTemplate({
      ...template,
      id: undefined,
      name: `${template.name} (Copy)`
    });
    setShowForm(true);
  };

  const handleSendReminders = async () => {
    if (!window.confirm('Send reminder emails for all overdue invoices?')) return;

    try {
      const result = await base44.functions.invoke('sendInvoiceReminders', {});
      alert(result.data.message);
    } catch (error) {
      console.error('Error sending reminders:', error);
      alert('Failed to send reminders. Please check that you have an active "Invoice Reminder" template.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <>
      <Sidebar currentPage="EmailTemplates" />
      
      <div className="w-full" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FAF5FF 0%, #F0FDF4 50%, #EFF6FF 100%)',
        padding: '24px 16px',
        paddingTop: '72px'
      }}
      className="md:pt-6"
      >
        <div className="w-full max-w-full" style={{ padding: '0 4px' }}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Email Templates</h1>
              <p className="text-gray-600 mt-1">Create reusable templates for automated communications</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleSendReminders}
                variant="outline"
                className="rounded-[14px] border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <Zap className="w-4 h-4 mr-2" />
                Send Overdue Reminders
              </Button>
              <Button
                onClick={() => {
                  setEditingTemplate(null);
                  setShowForm(true);
                }}
                className="rounded-[14px] text-white"
                style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' }}
              >
                <Plus className="w-5 h-5 mr-2" />
                New Template
              </Button>
            </div>
          </div>

          {/* Info Card */}
          <Card className="p-5 rounded-[16px] mb-6" style={{ background: 'rgba(147, 197, 253, 0.1)', border: '1px solid rgba(147, 197, 253, 0.3)' }}>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">About Email Templates</h3>
                <p className="text-sm text-blue-800">
                  Create templates with placeholders like <code className="px-1 py-0.5 bg-white rounded text-xs">{'{{client_name}}'}</code> that get replaced with actual data when sent. 
                  Templates can be used manually or triggered automatically by workflows.
                </p>
              </div>
            </div>
          </Card>

          {/* Form */}
          <AnimatePresence>
            {showForm && (
              <EmailTemplateForm
                template={editingTemplate}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingTemplate(null);
                }}
              />
            )}
          </AnimatePresence>

          {/* Templates List */}
          <EmailTemplateList
            templates={templates}
            onEdit={handleEdit}
            onDelete={(id) => deleteMutation.mutate(id)}
            onDuplicate={handleDuplicate}
          />
        </div>
      </div>
    </>
  );
}
