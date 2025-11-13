import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { X, Repeat, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, addDays, addWeeks, addMonths, addQuarters, addYears } from 'date-fns';

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Rental Income', 'Other Income'];
const EXPENSE_CATEGORIES = ['Rent', 'Utilities', 'Insurance', 'Subscriptions', 'Loan Payment', 'Other Expense'];

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly (Every 2 weeks)' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly (Every 3 months)' },
  { value: 'yearly', label: 'Yearly' }
];

export default function RecurringTransactionForm({ recurringTransaction, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: 'Rent',
    frequency: 'monthly',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: '',
    payment_method: '',
    notes: '',
    is_active: true,
    auto_create: true
  });

  useEffect(() => {
    if (recurringTransaction) {
      setFormData({
        ...recurringTransaction,
        amount: recurringTransaction.amount.toString(),
        start_date: recurringTransaction.start_date || format(new Date(), 'yyyy-MM-dd'),
        end_date: recurringTransaction.end_date || ''
      });
    }
  }, [recurringTransaction]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    // Calculate next occurrence based on start date and frequency
    const startDate = new Date(formData.start_date);
    let nextOccurrence = startDate;
    
    // If start date is in the past, calculate the next future occurrence
    if (startDate < new Date()) {
      nextOccurrence = calculateNextOccurrence(startDate, formData.frequency);
    }

    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
      next_occurrence: format(nextOccurrence, 'yyyy-MM-dd'),
      end_date: formData.end_date || null
    };

    onSubmit(submitData);
  };

  const calculateNextOccurrence = (date, frequency) => {
    const today = new Date();
    let next = new Date(date);

    while (next < today) {
      switch (frequency) {
        case 'daily':
          next = addDays(next, 1);
          break;
        case 'weekly':
          next = addWeeks(next, 1);
          break;
        case 'biweekly':
          next = addWeeks(next, 2);
          break;
        case 'monthly':
          next = addMonths(next, 1);
          break;
        case 'quarterly':
          next = addMonths(next, 3);
          break;
        case 'yearly':
          next = addYears(next, 1);
          break;
        default:
          next = addMonths(next, 1);
      }
    }

    return next;
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
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center bg-purple-100">
              <Repeat className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              {recurringTransaction ? 'Edit Recurring Transaction' : 'New Recurring Transaction'}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-[8px] transition-colors"
            aria-label="Close form"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Type *
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income', category: INCOME_CATEGORIES[0] })}
                className={`flex-1 px-4 py-3 rounded-[12px] font-medium transition-all ${
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
                onClick={() => setFormData({ ...formData, type: 'expense', category: EXPENSE_CATEGORIES[0] })}
                className={`flex-1 px-4 py-3 rounded-[12px] font-medium transition-all ${
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

          {/* Description and Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Description *
              </label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Monthly Rent"
                className="rounded-[12px]"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Amount *
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="rounded-[12px]"
                required
              />
            </div>
          </div>

          {/* Category and Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Category *
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="rounded-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Frequency *
              </label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value })}
              >
                <SelectTrigger className="rounded-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Start Date and End Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Start Date *
              </label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="rounded-[12px]"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                End Date (Optional)
              </label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="rounded-[12px]"
                min={formData.start_date}
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for indefinite recurrence</p>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Payment Method
            </label>
            <Input
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              placeholder="e.g., Bank Account, Credit Card"
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
              placeholder="Optional notes..."
              className="rounded-[12px] h-20"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <span className="font-medium">Active</span>
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.auto_create}
                onChange={(e) => setFormData({ ...formData, auto_create: e.target.checked })}
                className="rounded"
              />
              <span className="font-medium">Automatically create transactions</span>
            </label>
            <p className="text-xs text-gray-500 ml-6">
              When enabled, transactions will be created automatically on the scheduled date
            </p>
          </div>

          {/* Preview */}
          <div className="p-4 bg-blue-50 rounded-[12px] border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-semibold text-blue-900">Preview</p>
            </div>
            <p className="text-sm text-blue-800">
              This {formData.type} will recur <span className="font-bold">{formData.frequency}</span> starting from{' '}
              <span className="font-bold">{format(new Date(formData.start_date), 'MMM dd, yyyy')}</span>
              {formData.end_date && (
                <> until <span className="font-bold">{format(new Date(formData.end_date), 'MMM dd, yyyy')}</span></>
              )}
              .
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
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
              {recurringTransaction ? 'Update' : 'Create'} Recurring Transaction
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}