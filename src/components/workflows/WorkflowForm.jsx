import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from 'framer-motion';
import { AlertCircle, Plus, Trash2, Zap } from 'lucide-react';

export default function WorkflowForm({ workflow, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(workflow || {
    name: '',
    description: '',
    trigger_type: 'invoice_overdue',
    trigger_config: {},
    actions: [],
    is_active: true,
    conditions: {}
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const triggerTypes = [
    { value: 'invoice_overdue', label: 'Invoice Overdue', config: ['days_after'] },
    { value: 'invoice_due_soon', label: 'Invoice Due Soon', config: ['days_before'] },
    { value: 'invoice_created', label: 'Invoice Created', config: ['min_amount'] },
    { value: 'client_status_change', label: 'Client Status Change', config: ['from', 'to'] },
    { value: 'payment_received', label: 'Payment Received', config: [] }
  ];

  const actionTypes = [
    { value: 'send_email', label: 'Send Email' },
    { value: 'update_status', label: 'Update Status' },
    { value: 'create_notification', label: 'Create Notification' }
  ];

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = 'Workflow name must be at least 3 characters';
    }
    
    if (formData.actions.length === 0) {
      newErrors.actions = 'Please add at least one action';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save workflow' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTriggerConfigChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      trigger_config: { ...prev.trigger_config, [key]: value }
    }));
  };

  const addAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, { type: 'send_email', config: {} }]
    }));
  };

  const removeAction = (index) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const handleActionChange = (index, field, value) => {
    const newActions = [...formData.actions];
    if (field === 'type') {
      newActions[index] = { type: value, config: {} };
    } else {
      newActions[index].config[field] = value;
    }
    setFormData(prev => ({ ...prev, actions: newActions }));
  };

  const selectedTrigger = triggerTypes.find(t => t.value === formData.trigger_type);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-8"
    >
      <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-[14px] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
          >
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            {workflow ? 'Edit Workflow' : 'New Workflow'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Basic Information</h4>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Workflow Name *</label>
              <Input
                placeholder="e.g., Payment Reminder - 3 Days Before"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className={`rounded-[12px] ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
              <Textarea
                placeholder="Describe what this workflow does..."
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="rounded-[12px] h-20"
              />
            </div>

            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleFieldChange('is_active', e.target.checked)}
                className="w-4 h-4 rounded border-purple-300 text-purple-600"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
                Active (workflow will run automatically)
              </label>
            </div>
          </div>

          {/* Trigger Configuration */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Trigger</h4>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">When should this run?</label>
              <Select value={formData.trigger_type} onValueChange={(value) => handleFieldChange('trigger_type', value)}>
                <SelectTrigger className="rounded-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {triggerTypes.map(trigger => (
                    <SelectItem key={trigger.value} value={trigger.value}>
                      {trigger.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Trigger-specific configuration */}
            {selectedTrigger?.config.includes('days_before') && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Days Before Due Date</label>
                <Input
                  type="number"
                  placeholder="3"
                  value={formData.trigger_config.days_before || ''}
                  onChange={(e) => handleTriggerConfigChange('days_before', parseInt(e.target.value))}
                  className="rounded-[12px]"
                  min="1"
                />
              </div>
            )}

            {selectedTrigger?.config.includes('days_after') && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Days After Overdue</label>
                <Input
                  type="number"
                  placeholder="2"
                  value={formData.trigger_config.days_after || ''}
                  onChange={(e) => handleTriggerConfigChange('days_after', parseInt(e.target.value))}
                  className="rounded-[12px]"
                  min="0"
                />
              </div>
            )}

            {selectedTrigger?.config.includes('min_amount') && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Minimum Invoice Amount</label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={formData.trigger_config.min_amount || ''}
                  onChange={(e) => handleTriggerConfigChange('min_amount', parseFloat(e.target.value))}
                  className="rounded-[12px]"
                  min="0"
                  step="0.01"
                />
              </div>
            )}

            {selectedTrigger?.config.includes('from') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">From Status</label>
                  <Select 
                    value={formData.trigger_config.from || ''} 
                    onValueChange={(value) => handleTriggerConfigChange('from', value)}
                  >
                    <SelectTrigger className="rounded-[12px]">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">To Status</label>
                  <Select 
                    value={formData.trigger_config.to || ''} 
                    onValueChange={(value) => handleTriggerConfigChange('to', value)}
                  >
                    <SelectTrigger className="rounded-[12px]">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-800">Actions *</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAction}
                className="rounded-[10px]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Action
              </Button>
            </div>

            {errors.actions && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.actions}
              </p>
            )}

            <div className="space-y-3">
              {formData.actions.map((action, index) => (
                <div key={index} className="p-4 rounded-[14px] bg-gray-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <Select 
                      value={action.type} 
                      onValueChange={(value) => handleActionChange(index, 'type', value)}
                    >
                      <SelectTrigger className="rounded-[10px] w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {actionTypes.map(actionType => (
                          <SelectItem key={actionType.value} value={actionType.value}>
                            {actionType.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <button
                      type="button"
                      onClick={() => removeAction(index)}
                      className="p-2 hover:bg-red-100 rounded-[8px] transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>

                  {/* Action-specific configuration */}
                  {action.type === 'send_email' && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Email Subject</label>
                        <Input
                          placeholder="Payment Reminder: Invoice {invoice_number}"
                          value={action.config.subject || ''}
                          onChange={(e) => handleActionChange(index, 'subject', e.target.value)}
                          className="rounded-[10px]"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Use {'{'}invoice_number{'}'}, {'{'}client_name{'}'}, {'{'}amount{'}'}, {'{'}due_date{'}'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Email Body</label>
                        <Textarea
                          placeholder="Hi {client_name}, your payment is due..."
                          value={action.config.body || ''}
                          onChange={(e) => handleActionChange(index, 'body', e.target.value)}
                          className="rounded-[10px] h-24"
                        />
                      </div>
                    </>
                  )}

                  {action.type === 'update_status' && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">New Status</label>
                      <Select 
                        value={action.config.status || ''} 
                        onValueChange={(value) => handleActionChange(index, 'status', value)}
                      >
                        <SelectTrigger className="rounded-[10px]">
                          <SelectValue placeholder="Select status..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {action.type === 'create_notification' && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Notification Message</label>
                      <Input
                        placeholder="Invoice {invoice_number} is now overdue"
                        value={action.config.message || ''}
                        onChange={(e) => handleActionChange(index, 'message', e.target.value)}
                        className="rounded-[10px]"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use {'{'}invoice_number{'}'}, {'{'}client_name{'}'}, {'{'}amount{'}'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-[12px]">
              <p className="text-sm text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.submit}
              </p>
            </div>
          )}
          
          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="rounded-[12px]"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-[12px] text-white"
              style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : workflow ? 'Update' : 'Create'} Workflow
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}