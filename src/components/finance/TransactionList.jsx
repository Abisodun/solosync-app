import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Edit2, Trash2, Filter } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

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

export default function TransactionList({ transactions, onEdit, onDelete, currency = 'USD' }) {
  const [monthFilter, setMonthFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="p-8 rounded-[20px] text-center" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
        <p className="text-gray-500">No transactions yet. Add your first transaction to get started!</p>
      </Card>
    );
  }

  // Get unique months from transactions
  const uniqueMonths = [...new Set(transactions.map(t => {
    try {
      return format(new Date(t.date), 'yyyy-MM');
    } catch {
      return null;
    }
  }).filter(Boolean))].sort().reverse();

  // Filter transactions
  let filteredTransactions = transactions;

  // Filter by month
  if (monthFilter !== 'all') {
    filteredTransactions = filteredTransactions.filter(t => {
      try {
        const transactionDate = new Date(t.date);
        const [year, month] = monthFilter.split('-').map(Number);
        const monthStart = startOfMonth(new Date(year, month - 1));
        const monthEnd = endOfMonth(new Date(year, month - 1));
        return isWithinInterval(transactionDate, { start: monthStart, end: monthEnd });
      } catch {
        return false;
      }
    });
  }

  // Filter by type
  if (typeFilter !== 'all') {
    filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
  }

  return (
    <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-gray-800">Recent Transactions</h3>
        
        <div className="flex flex-wrap gap-3">
          {/* Month Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="rounded-[10px] w-40">
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {uniqueMonths.map(month => (
                  <SelectItem key={month} value={month}>
                    {format(new Date(month + '-01'), 'MMMM yyyy')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="rounded-[10px] w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No transactions found for the selected filters
          </div>
        ) : (
          filteredTransactions.slice(0, 20).map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-[14px] hover:bg-gray-100 transition-colors"
              role="article"
              aria-label={`Transaction: ${transaction.description}`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div
                  className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}
                  aria-hidden="true"
                >
                  {transaction.type === 'income' ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 truncate">{transaction.description}</div>
                  <div className="text-sm text-gray-500">
                    {transaction.category} • {format(new Date(transaction.date), 'MMM d, yyyy')}
                  </div>
                </div>
                <div className={`text-lg font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, currency)}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(transaction)}
                    className="p-2 hover:bg-gray-200 rounded-[10px] transition-colors"
                    aria-label={`Edit ${transaction.description}`}
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this transaction?')) {
                        onDelete(transaction.id);
                      }
                    }}
                    className="p-2 hover:bg-gray-200 rounded-[10px] transition-colors"
                    aria-label={`Delete ${transaction.description}`}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Results Summary */}
      {filteredTransactions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Showing {Math.min(filteredTransactions.length, 20)} of {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
            </span>
            {(monthFilter !== 'all' || typeFilter !== 'all') && (
              <button
                onClick={() => {
                  setMonthFilter('all');
                  setTypeFilter('all');
                }}
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}