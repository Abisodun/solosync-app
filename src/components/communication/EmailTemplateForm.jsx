import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from 'framer-motion';
import { FileText, X, Info } from 'lucide-react';

const TEMPLATE_TYPES = [
  { value: 'invoice_reminder', label: 'Invoice Reminder', placeholders: ['client_name', 'invoice_number', 'amount', 'due_date', 'business_name'] },
  { value: 'invoice_sent', label: 'Invoice Sent', placeholders: ['client_name', 'invoice_number', 'amount', 'due_date', 'business_name'] },
  { value: 'invoice_paid', label: 'Invoice Paid', placeholders: ['client_name', 'invoice_number', 'amount', 'business_name'] },
  { value: 'project_update', label: 'Project Update', placeholders: ['client_name', 'project_name', 'status', 'progress', 'business_name'] },
  { value: 'task_completed', label: 'Task Completed', placeholders: ['task_title', 'project_name', 'business_name'] },
  { value: 'custom', label: 'Custom', placeholders: [] }
];

export default function EmailTemplateForm({ template, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    body: '',
    template_type: 'custom',
    is_active: true,
    available_placeholders: []
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        description: template.description || '',
        subject: template.subject || '',
        body: template.body || '',
        template_type: template.template_type || 'custom',
        is_active: template.is_active !== undefined ? template.is_active : true,
        available_placeholders: template.available_placeholders || []
      });
    }
  }, [template]);

  const handleTypeChange = (type) => {
    const templateType = TEMPLATE_TYPES.find(t => t.value === type);
    setFormData({
      ...formData,
      template_type: type,
      available_placeholders: templateType?.placeholders || []
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const currentTemplateType = TEMPLATE_TYPES.find(t => t.value === formData.template_type);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="p-6 rounded-[20px] mb-6" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' }}>
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {template ? 'Edit Email Template' : 'Create Email Template'}
              </h3>
              <p className="text-sm text-gray-500">Design reusable email templates with placeholders</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-[8px]">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Template Type */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Template Type
            </label>
            <Select value={formData.template_type} onValueChange={handleTypeChange}>
              <SelectTrigger className="rounded-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Template Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Payment Reminder"
              className="rounded-[12px]"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Description
            </label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this template"
              className="rounded-[12px]"
            />
          </div>

          {/* Available Placeholders */}
          {currentTemplateType && currentTemplateType.placeholders.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-[12px] border border-blue-200">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-800 mb-2">Available Placeholders:</p>
                  <div className="flex flex-wrap gap-2">
                    {currentTemplateType.placeholders.map(ph => (
                      <code key={ph} className="px-2 py-1 bg-white rounded text-xs text-blue-700 border border-blue-300">
                        {`{{${ph}}}`}
                      </code>
                    ))}
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    Use these placeholders in your subject and body - they'll be replaced with actual values when sent
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Email Subject
            </label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., Reminder: Invoice {{invoice_number}} Due Soon"
              className="rounded-[12px]"
              required
            />
          </div>

          {/* Body */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Email Body
            </label>
            <Textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Dear {{client_name}},&#10;&#10;This is a reminder that your invoice {{invoice_number}} for {{amount}} is due on {{due_date}}.&#10;&#10;Best regards,&#10;{{business_name}}"
              className="rounded-[12px] h-48"
              required
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <label className="text-sm text-gray-700">
              Active (template will be available for use)
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="rounded-[12px]">
              Cancel
            </Button>
            <Button type="submit" className="rounded-[12px] text-white" style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' }}>
              {template ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}