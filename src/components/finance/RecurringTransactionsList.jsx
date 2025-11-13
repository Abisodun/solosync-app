import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Repeat, Play, Pause, Edit2, Trash2, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
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

const getFrequencyLabel = (pattern) => {
  const labels = {
    daily: 'Daily',
    weekly: 'Weekly',
    biweekly: 'Bi-weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly'
  };
  return labels[pattern] || pattern;
};

export default function RecurringTransactionsList({ transactions, onEdit, onDelete, onToggleActive, currency = 'USD' }) {
  const [activeFilter, setActiveFilter] = useState('all');

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="p-8 rounded-[20px] text-center" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
        <div className="w-16 h-16 rounded-[18px] flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}>
          <Repeat className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">No Recurring Transactions</h3>
        <p className="text-gray-500">Set up automatic transactions for rent, salary, subscriptions and more</p>
      </Card>
    );
  }

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    if (activeFilter === 'income') return t.type === 'income';
    if (activeFilter === 'expense') return t.type === 'expense';
    if (activeFilter === 'active') return !t.is_paused;
    if (activeFilter === 'paused') return t.is_paused;
    return true;
  });

  // Calculate stats
  const activeCount = transactions.filter(t => !t.is_paused).length;
  const totalMonthlyIncome = transactions
    .filter(t => t.type === 'income' && !t.is_paused && t.recurrence_pattern === 'monthly')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalMonthlyExpenses = transactions
    .filter(t => t.type === 'expense' && !t.is_paused && t.recurrence_pattern === 'monthly')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 rounded-[16px]" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[12px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}>
              <Repeat className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{activeCount}</div>
              <div className="text-sm text-gray-600">Active Recurring</div>
            </div>
          </div>
        </Card>

        <Card className="p-5 rounded-[16px]" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[12px] flex items-center justify-center bg-green-100">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalMonthlyIncome, currency)}</div>
              <div className="text-sm text-gray-600">Monthly Income</div>
            </div>
          </div>
        </Card>

        <Card className="p-5 rounded-[16px]" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[12px] flex items-center justify-center bg-red-100">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalMonthlyExpenses, currency)}</div>
              <div className="text-sm text-gray-600">Monthly Expenses</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { value: 'all', label: 'All' },
          { value: 'income', label: 'Income' },
          { value: 'expense', label: 'Expenses' },
          { value: 'active', label: 'Active' },
          { value: 'paused', label: 'Paused' }
        ].map(filter => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`px-4 py-2 rounded-[10px] text-sm font-medium transition-all whitespace-nowrap ${
              activeFilter === filter.value
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions found matching the selected filter
            </div>
          ) : (
            filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-5 bg-gray-50 rounded-[16px] hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left Side - Icon & Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0 ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      {transaction.type === 'income' ? (
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-red-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-gray-800 text-lg">{transaction.description}</h4>
                        {transaction.is_paused && (
                          <Badge className="bg-gray-200 text-gray-700 text-xs">Paused</Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(transaction.amount, currency)}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Repeat className="w-4 h-4" />
                          {getFrequencyLabel(transaction.recurrence_pattern)}
                        </span>
                        <span>•</span>
                        <span className="font-medium">{transaction.category}</span>
                        {transaction.client_name && (
                          <>
                            <span>•</span>
                            <span>{transaction.client_name}</span>
                          </>
                        )}
                      </div>

                      {transaction.next_occurrence_date && !transaction.is_paused && (
                        <div className="flex items-center gap-1 text-sm text-purple-600 font-medium">
                          <Calendar className="w-4 h-4" />
                          Next: {format(new Date(transaction.next_occurrence_date), 'MMM d, yyyy')}
                        </div>
                      )}

                      {transaction.recurrence_end_date && (
                        <div className="text-xs text-gray-500 mt-1">
                          Ends: {format(new Date(transaction.recurrence_end_date), 'MMM d, yyyy')}
                        </div>
                      )}

                      {transaction.notes && (
                        <p className="text-sm text-gray-600 mt-2 p-2 bg-white rounded-[8px]">
                          {transaction.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => onToggleActive(transaction)}
                      className={`p-2 rounded-[8px] transition-colors ${
                        transaction.is_paused
                          ? 'hover:bg-green-100 text-green-600'
                          : 'hover:bg-orange-100 text-orange-600'
                      }`}
                      title={transaction.is_paused ? 'Resume' : 'Pause'}
                    >
                      {transaction.is_paused ? (
                        <Play className="w-5 h-5" />
                      ) : (
                        <Pause className="w-5 h-5" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => onEdit(transaction)}
                      className="p-2 hover:bg-gray-200 rounded-[8px] transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5 text-gray-600" />
                    </button>
                    
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete recurring transaction "${transaction.description}"?\n\nThis will stop future automatic transactions but won't delete past transactions.`)) {
                          onDelete(transaction.id);
                        }
                      }}
                      className="p-2 hover:bg-red-100 rounded-[8px] transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}