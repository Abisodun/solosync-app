import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { X, DollarSign, Repeat, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, addDays, addWeeks, addMonths, addYears } from 'date-fns';

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Rental Income', 'Business', 'Other Income'];
const EXPENSE_CATEGORIES = ['Rent', 'Mortgage', 'Utilities', 'Subscriptions', 'Insurance', 'Loan Payment', 'Other Expense'];
const PAYMENT_METHODS = ['Bank Transfer', 'Credit Card', 'Cash', 'PayPal', 'Check', 'Other'];
const RECURRENCE_PATTERNS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly (Every 2 weeks)' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly (Every 3 months)' },
  { value: 'yearly', label: 'Yearly' }
];

const calculateNextOccurrence = (startDate, pattern) => {
  const date = new Date(startDate);
  switch (pattern) {
    case 'daily': return format(addDays(date, 1), 'yyyy-MM-dd');
    case 'weekly': return format(addWeeks(date, 1), 'yyyy-MM-dd');
    case 'biweekly': return format(addWeeks(date, 2), 'yyyy-MM-dd');
    case 'monthly': return format(addMonths(date, 1), 'yyyy-MM-dd');
    case 'quarterly': return format(addMonths(date, 3), 'yyyy-MM-dd');
    case 'yearly': return format(addYears(date, 1), 'yyyy-MM-dd');
    default: return format(addMonths(date, 1), 'yyyy-MM-dd');
  }
};

export default function RecurringTransactionForm({ transaction, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    payment_method: '',
    client_name: '',
    notes: '',
    is_recurring: true,
    is_template: true,
    recurrence_pattern: 'monthly',
    recurrence_end_date: '',
    next_occurrence_date: ''
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        ...transaction,
        date: transaction.date ? format(new Date(transaction.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        recurrence_end_date: transaction.recurrence_end_date ? format(new Date(transaction.recurrence_end_date), 'yyyy-MM-dd') : '',
        next_occurrence_date: transaction.next_occurrence_date || calculateNextOccurrence(transaction.date, transaction.recurrence_pattern)
      });
    }
  }, [transaction]);

  useEffect(() => {
    // Auto-calculate next occurrence when date or pattern changes
    if (formData.date && formData.recurrence_pattern) {
      const nextDate = calculateNextOccurrence(formData.date, formData.recurrence_pattern);
      setFormData(prev => ({ ...prev, next_occurrence_date: nextDate }));
    }
  }, [formData.date, formData.recurrence_pattern]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.category || !formData.date) {
      alert('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    // Validate end date if provided
    if (formData.recurrence_end_date && new Date(formData.recurrence_end_date) <= new Date(formData.date)) {
      alert('End date must be after the start date');
      return;
    }

    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      is_recurring: true,
      is_template: true
    });
  };

  const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-8"
    >
      <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}>
              <Repeat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {transaction ? 'Edit Recurring Transaction' : 'New Recurring Transaction'}
              </h3>
              <p className="text-sm text-gray-500">Automatic transactions on a schedule</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-[8px] transition-colors"
            aria-label="Close form"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type Selection */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Transaction Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                className={`px-6 py-3 rounded-[12px] font-medium transition-all ${
                  formData.type === 'income'
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={formData.type === 'income' ? {
                  background: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)'
                } : {}}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                className={`px-6 py-3 rounded-[12px] font-medium transition-all ${
                  formData.type === 'expense'
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={formData.type === 'expense' ? {
                  background: 'linear-gradient(135deg, #FCA5A5 0%, #EF4444 100%)'
                } : {}}
              >
                Expense
              </button>
            </div>
          </div>

          {/* Description & Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Description *
              </label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Monthly Rent, Salary"
                className="rounded-[12px]"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Amount *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="rounded-[12px] pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Category *
              </label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="rounded-[12px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Payment Method
              </label>
              <Select value={formData.payment_method} onValueChange={(value) => setFormData({ ...formData, payment_method: value })}>
                <SelectTrigger className="rounded-[12px]">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(method => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Recurrence Settings */}
          <div className="p-4 rounded-[14px] bg-purple-50 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-4">
              <Repeat className="w-5 h-5 text-purple-600" />
              <h4 className="font-bold text-gray-800">Recurrence Settings</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Frequency *
                </label>
                <Select value={formData.recurrence_pattern} onValueChange={(value) => setFormData({ ...formData, recurrence_pattern: value })}>
                  <SelectTrigger className="rounded-[12px] bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RECURRENCE_PATTERNS.map(pattern => (
                      <SelectItem key={pattern.value} value={pattern.value}>
                        {pattern.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Start Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="rounded-[12px] bg-white pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  End Date (Optional)
                </label>
                <Input
                  type="date"
                  value={formData.recurrence_end_date}
                  onChange={(e) => setFormData({ ...formData, recurrence_end_date: e.target.value })}
                  className="rounded-[12px] bg-white"
                  min={formData.date}
                />
              </div>
            </div>

            {/* Next Occurrence Preview */}
            {formData.next_occurrence_date && (
              <div className="mt-4 p-3 bg-white rounded-[10px]">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Next occurrence:</span>{' '}
                  {format(new Date(formData.next_occurrence_date), 'MMMM d, yyyy')}
                  {formData.recurrence_end_date && (
                    <span className="ml-2 text-gray-500">
                      (ends {format(new Date(formData.recurrence_end_date), 'MMM d, yyyy')})
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Client/Vendor Name */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              {formData.type === 'income' ? 'Client Name' : 'Vendor Name'}
            </label>
            <Input
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              placeholder={formData.type === 'income' ? 'Who pays you?' : 'Who do you pay?'}
              className="rounded-[12px]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Notes
            </label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this recurring transaction..."
              className="rounded-[12px] h-20"
            />
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 rounded-[12px] border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ How it works:</strong> This creates a recurring template. Actual transactions will be automatically generated on the scheduled dates. You can pause or edit this anytime.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="rounded-[12px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-[12px] text-white"
              style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
            >
              {transaction ? 'Update Recurring Transaction' : 'Create Recurring Transaction'}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}