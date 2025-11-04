import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from 'framer-motion';
import { validateInput, validateAmount, sanitizeInput } from '@/utils/validation';
import { AlertCircle } from 'lucide-react';

export default function TransactionForm({ transaction, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(transaction || {
    type: 'income',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    client_name: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.amount || !validateAmount(formData.amount)) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (!formData.description || formData.description.trim().length < 3) {
      newErrors.description = 'Description must be at least 3 characters';
    }
    
    if (!formData.category || formData.category.trim().length < 2) {
      newErrors.category = 'Please enter a category';
    }
    
    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const sanitizedData = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: sanitizeInput(formData.description),
        category: sanitizeInput(formData.category),
        date: formData.date,
        client_name: sanitizeInput(formData.client_name)
      };
      
      await onSubmit(sanitizedData);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save transaction' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-8"
    >
      <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {transaction ? 'Edit Transaction' : 'New Transaction'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Type</label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleFieldChange('type', value)}
                aria-label="Transaction type"
              >
                <SelectTrigger className="rounded-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Amount *</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleFieldChange('amount', e.target.value)}
                className={`rounded-[12px] ${errors.amount ? 'border-red-500' : ''}`}
                aria-label="Transaction amount"
                aria-invalid={!!errors.amount}
                aria-describedby={errors.amount ? 'amount-error' : undefined}
              />
              {errors.amount && (
                <p id="amount-error" className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.amount}
                </p>
              )}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Description *</label>
            <Input
              placeholder="What was this transaction for?"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', validateInput(e.target.value, 200))}
              maxLength={200}
              className={`rounded-[12px] ${errors.description ? 'border-red-500' : ''}`}
              aria-label="Transaction description"
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'description-error' : undefined}
            />
            {errors.description && (
              <p id="description-error" className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.description}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Category *</label>
              <Input
                placeholder="e.g., Software, Marketing"
                value={formData.category}
                onChange={(e) => handleFieldChange('category', validateInput(e.target.value, 50))}
                maxLength={50}
                className={`rounded-[12px] ${errors.category ? 'border-red-500' : ''}`}
                aria-label="Transaction category"
                aria-invalid={!!errors.category}
              />
              {errors.category && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.category}
                </p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Date *</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleFieldChange('date', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={`rounded-[12px] ${errors.date ? 'border-red-500' : ''}`}
                aria-label="Transaction date"
                aria-invalid={!!errors.date}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Client/Vendor</label>
              <Input
                placeholder="Optional"
                value={formData.client_name}
                onChange={(e) => handleFieldChange('client_name', validateInput(e.target.value, 100))}
                maxLength={100}
                className="rounded-[12px]"
                aria-label="Client or vendor name"
              />
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
              style={{ background: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : transaction ? 'Update' : 'Add'} Transaction
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}