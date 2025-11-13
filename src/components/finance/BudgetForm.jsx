import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const COMMON_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Housing',
  'Insurance',
  'Travel',
  'Education',
  'Other'
];

export default function BudgetForm({ budget, onSubmit, onCancel, existingCategories = [] }) {
  const [formData, setFormData] = useState({
    category: '',
    monthly_limit: '',
    month: format(new Date(), 'yyyy-MM'),
    alert_threshold: 80,
    is_active: true,
    notes: ''
  });

  useEffect(() => {
    if (budget) {
      setFormData(budget);
    }
  }, [budget]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.category || !formData.monthly_limit || !formData.month) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.monthly_limit <= 0) {
      alert('Budget limit must be greater than 0');
      return;
    }

    // Check for duplicate category in the same month
    if (!budget && existingCategories.includes(formData.category)) {
      if (!window.confirm(`A budget for "${formData.category}" already exists this month. Create another?`)) {
        return;
      }
    }

    onSubmit({
      ...formData,
      monthly_limit: parseFloat(formData.monthly_limit),
      alert_threshold: parseInt(formData.alert_threshold)
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-8"
    >
      <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {budget ? 'Edit Budget' : 'Create Budget'}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-[8px] transition-colors"
            aria-label="Close form"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category & Month */}
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
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Month *
              </label>
              <Input
                type="month"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="rounded-[12px]"
                required
              />
            </div>
          </div>

          {/* Budget Limit & Alert Threshold */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Monthly Budget Limit *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.monthly_limit}
                onChange={(e) => setFormData({ ...formData, monthly_limit: e.target.value })}
                placeholder="1000"
                className="rounded-[12px]"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Alert Threshold (%)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.alert_threshold}
                onChange={(e) => setFormData({ ...formData, alert_threshold: e.target.value })}
                className="rounded-[12px]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get warned at {formData.alert_threshold}% of budget
              </p>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Budget is active
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Notes
            </label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes about this budget..."
              className="rounded-[12px] h-20"
            />
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
              {budget ? 'Update Budget' : 'Create Budget'}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}