import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Repeat, Edit2, Trash2, Calendar, TrendingUp, TrendingDown, Pause, Play } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
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

const FREQUENCY_LABELS = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly'
};

export default function RecurringTransactionList({ 
  recurringTransactions, 
  onEdit, 
  onDelete, 
  onToggleActive,
  currency = 'USD' 
}) {
  if (!recurringTransactions || recurringTransactions.length === 0) {
    return (
      <Card className="p-8 rounded-[20px] text-center" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
        <Repeat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Recurring Transactions</h3>
        <p className="text-gray-600">Set up automatic transactions for rent, salary, subscriptions, and more</p>
      </Card>
    );
  }

  // Separate active and inactive
  const activeTransactions = recurringTransactions.filter(t => t.is_active);
  const inactiveTransactions = recurringTransactions.filter(t => !t.is_active);

  const renderTransaction = (transaction, index) => {
    const nextDate = transaction.next_occurrence ? parseISO(transaction.next_occurrence) : null;
    const daysUntilNext = nextDate ? differenceInDays(nextDate, new Date()) : null;
    const isUpcoming = daysUntilNext !== null && daysUntilNext >= 0 && daysUntilNext <= 7;

    return (
      <motion.div
        key={transaction.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="p-5 bg-gray-50 rounded-[16px] hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${
              transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {transaction.type === 'income' ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-gray-800">{transaction.description}</h4>
                {!transaction.is_active && (
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-[6px] text-xs font-semibold">
                    Paused
                  </span>
                )}
                {isUpcoming && transaction.is_active && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-[6px] text-xs font-semibold">
                    Coming Soon
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <span className="capitalize">{transaction.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Repeat className="w-3 h-3" />
                  {FREQUENCY_LABELS[transaction.frequency]}
                </span>
                {transaction.payment_method && (
                  <>
                    <span>•</span>
                    <span>{transaction.payment_method}</span>
                  </>
                )}
              </div>

              {nextDate && transaction.is_active && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-700 font-medium">
                    Next: {format(nextDate, 'MMM dd, yyyy')}
                    {daysUntilNext !== null && daysUntilNext >= 0 && (
                      <span className="text-gray-600 ml-1">
                        ({daysUntilNext === 0 ? 'Today' : daysUntilNext === 1 ? 'Tomorrow' : `in ${daysUntilNext} days`})
                      </span>
                    )}
                  </span>
                </div>
              )}

              {transaction.end_date && (
                <div className="mt-1 text-xs text-gray-500">
                  Ends: {format(parseISO(transaction.end_date), 'MMM dd, yyyy')}
                </div>
              )}

              {transaction.total_occurrences > 0 && (
                <div className="mt-1 text-xs text-gray-500">
                  Created {transaction.total_occurrences} transaction{transaction.total_occurrences !== 1 ? 's' : ''}
                </div>
              )}

              {transaction.notes && (
                <p className="mt-2 text-sm text-gray-600 p-2 bg-white rounded-[8px]">
                  {transaction.notes}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <div className="text-right mr-3">
              <div className={`text-xl font-bold ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, currency)}
              </div>
              <div className="text-xs text-gray-500 capitalize">{transaction.type}</div>
            </div>

            <button
              onClick={() => onToggleActive(transaction)}
              className="p-2 hover:bg-gray-200 rounded-[8px] transition-colors"
              aria-label={transaction.is_active ? 'Pause' : 'Resume'}
              title={transaction.is_active ? 'Pause' : 'Resume'}
            >
              {transaction.is_active ? (
                <Pause className="w-4 h-4 text-gray-600" />
              ) : (
                <Play className="w-4 h-4 text-green-600" />
              )}
            </button>

            <button
              onClick={() => onEdit(transaction)}
              className="p-2 hover:bg-gray-200 rounded-[8px] transition-colors"
              aria-label="Edit"
            >
              <Edit2 className="w-4 h-4 text-gray-600" />
            </button>

            <button
              onClick={() => {
                if (window.confirm(`Delete recurring transaction "${transaction.description}"?`)) {
                  onDelete(transaction.id);
                }
              }}
              className="p-2 hover:bg-red-100 rounded-[8px] transition-colors"
              aria-label="Delete"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Recurring Transactions</h3>
          <p className="text-sm text-gray-500 mt-1">
            {activeTransactions.length} active, {inactiveTransactions.length} paused
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Active Transactions */}
        {activeTransactions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-3">Active</h4>
            <div className="space-y-3">
              {activeTransactions.map((transaction, index) => renderTransaction(transaction, index))}
            </div>
          </div>
        )}

        {/* Inactive Transactions */}
        {inactiveTransactions.length > 0 && (
          <div className={activeTransactions.length > 0 ? 'mt-6' : ''}>
            <h4 className="text-sm font-semibold text-gray-600 mb-3">Paused</h4>
            <div className="space-y-3 opacity-60">
              {inactiveTransactions.map((transaction, index) => 
                renderTransaction(transaction, activeTransactions.length + index)
              )}
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      {activeTransactions.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                +{formatCurrency(
                  activeTransactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0),
                  currency
                )}
              </div>
              <div className="text-xs text-gray-500">Monthly Income</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                -{formatCurrency(
                  activeTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0),
                  currency
                )}
              </div>
              <div className="text-xs text-gray-500">Monthly Expenses</div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}