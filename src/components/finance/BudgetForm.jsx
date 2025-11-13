import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { X, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const PRESET_CATEGORIES = [
  'Groceries',
  'Dining',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Utilities',
  'Rent',
  'Insurance',
  'Education',
  'Travel',
  'Subscriptions',
  'Other'
];

const PRESET_COLORS = [
  '#A78BFA', '#93C5FD', '#86EFAC', '#FCD34D', '#F472B6',
  '#34D399', '#FBBF24', '#60A5FA', '#C084FC', '#FB923C'
];

export default function BudgetForm({ budget, onSubmit, onCancel }) {
  const currentMonth = format(new Date(), 'yyyy-MM');
  
  const [formData, setFormData] = useState({
    category: '',
    monthly_limit: '',
    month: currentMonth,
    alert_threshold: 80,
    color: PRESET_COLORS[0],
    notes: '',
    is_active: true
  });

  const [customCategory, setCustomCategory] = useState('');
  const [useCustomCategory, setUseCustomCategory] = useState(false);

  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category,
        monthly_limit: budget.monthly_limit,
        month: budget.month,
        alert_threshold: budget.alert_threshold || 80,
        color: budget.color || PRESET_COLORS[0],
        notes: budget.notes || '',
        is_active: budget.is_active !== undefined ? budget.is_active : true
      });
      
      // Check if it's a custom category
      if (!PRESET_CATEGORIES.includes(budget.category)) {
        setCustomCategory(budget.category);
        setUseCustomCategory(true);
      }
    }
  }, [budget]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const finalCategory = useCustomCategory ? customCategory : formData.category;
    
    if (!finalCategory || !formData.monthly_limit || !formData.month) {
      alert('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.monthly_limit) <= 0) {
      alert('Budget limit must be greater than 0');
      return;
    }

    onSubmit({
      ...formData,
      category: finalCategory,
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
            {budget ? 'Edit Budget' : 'New Budget'}
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
          {/* Category Selection */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Category *
            </label>
            
            <div className="mb-3">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomCategory}
                  onChange={(e) => setUseCustomCategory(e.target.checked)}
                  className="rounded"
                />
                Use custom category
              </label>
            </div>

            {useCustomCategory ? (
              <Input
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter custom category name"
                className="rounded-[12px]"
                required
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESET_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`px-4 py-2 rounded-[10px] text-sm font-medium transition-all ${
                      formData.category === cat
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={formData.category === cat ? {
                      background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)'
                    } : {}}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Monthly Limit and Month */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Monthly Limit *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="number"
                  step="0.01"
                  value={formData.monthly_limit}
                  onChange={(e) => setFormData({ ...formData, monthly_limit: e.target.value })}
                  placeholder="0.00"
                  className="rounded-[12px] pl-10"
                  required
                />
              </div>
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

          {/* Alert Threshold */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Alert Threshold: {formData.alert_threshold}%
            </label>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={formData.alert_threshold}
              onChange={(e) => setFormData({ ...formData, alert_threshold: e.target.value })}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              You'll receive an alert when spending reaches {formData.alert_threshold}% of the budget
            </p>
          </div>

          {/* Color Selection */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Color
            </label>
            <div className="flex gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-[10px] transition-all ${
                    formData.color === color ? 'ring-4 ring-offset-2' : ''
                  }`}
                  style={{
                    background: color,
                    ringColor: color
                  }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
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

          {/* Active Toggle */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <span className="font-medium">Active</span>
            </label>
            <p className="text-xs text-gray-500 ml-6">Inactive budgets won't show alerts</p>
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