import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Edit2, Trash2, TrendingUp, Calendar, Filter } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

const CURRENCY_SYMBOLS = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥',
  AUD: 'A$', CAD: 'C$', CHF: 'Fr', INR: '₹', RUB: '₽',
  BRL: 'R$', KRW: '₩', MXN: 'Mex$', ZAR: 'R', SGD: 'S$',
  HKD: 'HK$', NOK: 'kr', SEK: 'kr', DKK: 'kr', PLN: 'zł',
  THB: '฿', IDR: 'Rp', MYR: 'RM', PHP: '₱', TRY: '₺',
  AED: 'د.إ', SAR: '﷼', ILS: '₪', NZD: 'NZ$', CZK: 'Kč',
  HUF: 'Ft', RON: 'lei', BGN: 'лв', HRK: 'kn', ISK: 'kr', UAH: '₴',
};

const formatCurrency = (amount, currencyCode = 'USD') => {
  const symbol = CURRENCY_SYMBOLS[currencyCode?.toUpperCase()] || currencyCode || '$';
  return `${symbol}${amount.toLocaleString()}`;
};

export default function BudgetList({ budgets, transactions, onEdit, onDelete, currency = 'USD' }) {
  const [monthFilter, setMonthFilter] = useState('current');
  const [statusFilter, setStatusFilter] = useState('all');

  if (!budgets || budgets.length === 0) {
    return (
      <Card className="p-8 rounded-[20px] text-center" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
        <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No budgets yet</h3>
        <p className="text-gray-600">Create your first budget to track spending</p>
      </Card>
    );
  }

  // Calculate spending for each budget
  const budgetsWithSpending = budgets.map(budget => {
    // Filter transactions by category and month
    const spent = transactions
      .filter(t => {
        if (t.type !== 'expense') return false;
        if (t.category !== budget.category) return false;
        
        const transactionDate = new Date(t.date);
        const [year, month] = budget.month.split('-');
        return transactionDate.getFullYear() === parseInt(year) &&
               transactionDate.getMonth() === parseInt(month) - 1;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const percentage = (spent / budget.monthly_limit) * 100;
    const remaining = budget.monthly_limit - spent;
    
    return {
      ...budget,
      spent,
      percentage: Math.min(percentage, 100),
      remaining,
      isOverBudget: spent > budget.monthly_limit,
      isNearLimit: percentage >= budget.alert_threshold && !spent > budget.monthly_limit
    };
  });

  // Filter budgets
  const currentMonth = format(new Date(), 'yyyy-MM');
  let filteredBudgets = budgetsWithSpending;

  if (monthFilter === 'current') {
    filteredBudgets = filteredBudgets.filter(b => b.month === currentMonth);
  } else if (monthFilter !== 'all') {
    filteredBudgets = filteredBudgets.filter(b => b.month === monthFilter);
  }

  if (statusFilter === 'active') {
    filteredBudgets = filteredBudgets.filter(b => b.is_active);
  } else if (statusFilter === 'exceeded') {
    filteredBudgets = filteredBudgets.filter(b => b.isOverBudget);
  } else if (statusFilter === 'warning') {
    filteredBudgets = filteredBudgets.filter(b => b.isNearLimit);
  }

  // Get unique months
  const uniqueMonths = [...new Set(budgets.map(b => b.month))].sort().reverse();

  return (
    <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Budget Tracker</h3>
          <p className="text-sm text-gray-500 mt-1">
            {filteredBudgets.length} budget{filteredBudgets.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* Month Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="rounded-[10px] w-44">
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Month</SelectItem>
                <SelectItem value="all">All Months</SelectItem>
                {uniqueMonths.map(month => (
                  <SelectItem key={month} value={month}>
                    {format(parseISO(month + '-01'), 'MMMM yyyy')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="rounded-[10px] w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="exceeded">Over Budget</SelectItem>
              <SelectItem value="warning">Near Limit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Budget Cards */}
      <div className="space-y-4">
        {filteredBudgets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No budgets found for the selected filters
          </div>
        ) : (
          filteredBudgets.map((budget, index) => (
            <motion.div
              key={budget.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-5 bg-gray-50 rounded-[16px] hover:bg-gray-100 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-bold text-gray-800">{budget.category}</h4>
                    {budget.isOverBudget && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-[6px] text-xs font-semibold">
                        <AlertTriangle className="w-3 h-3" />
                        Over Budget
                      </span>
                    )}
                    {budget.isNearLimit && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-[6px] text-xs font-semibold">
                        <AlertTriangle className="w-3 h-3" />
                        Near Limit
                      </span>
                    )}
                    {!budget.is_active && (
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-[6px] text-xs font-semibold">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {format(parseISO(budget.month + '-01'), 'MMMM yyyy')}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(budget)}
                    className="p-2 hover:bg-gray-200 rounded-[8px] transition-colors"
                    aria-label="Edit budget"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete budget for ${budget.category}?`)) {
                        onDelete(budget.id);
                      }
                    }}
                    className="p-2 hover:bg-red-100 rounded-[8px] transition-colors"
                    aria-label="Delete budget"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    Spent: <span className="font-bold text-gray-800">{formatCurrency(budget.spent, currency)}</span>
                  </span>
                  <span className="text-sm text-gray-600">
                    Budget: <span className="font-bold text-gray-800">{formatCurrency(budget.monthly_limit, currency)}</span>
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${budget.percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      background: budget.isOverBudget
                        ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                        : budget.isNearLimit
                        ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                        : 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)'
                    }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">{budget.percentage.toFixed(1)}% used</span>
                  <span className={`text-xs font-semibold ${budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {budget.remaining >= 0 ? formatCurrency(budget.remaining, currency) : formatCurrency(Math.abs(budget.remaining), currency)} {budget.remaining >= 0 ? 'remaining' : 'over'}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {budget.notes && (
                <p className="text-sm text-gray-600 mt-3 p-3 bg-white rounded-[10px]">
                  {budget.notes}
                </p>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Summary */}
      {filteredBudgets.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {filteredBudgets.filter(b => b.is_active).length}
              </div>
              <div className="text-xs text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {filteredBudgets.filter(b => b.isNearLimit).length}
              </div>
              <div className="text-xs text-gray-500">Near Limit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {filteredBudgets.filter(b => b.isOverBudget).length}
              </div>
              <div className="text-xs text-gray-500">Exceeded</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  filteredBudgets
                    .filter(b => b.remaining > 0)
                    .reduce((sum, b) => sum + b.remaining, 0),
                  currency
                )}
              </div>
              <div className="text-xs text-gray-500">Total Remaining</div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}