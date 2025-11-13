import React from 'react';
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

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
  if (!transactions || transactions.length === 0) {
    return (
      <Card className="p-8 rounded-[20px] text-center" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
        <p className="text-gray-500">No transactions yet. Add your first transaction to get started!</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
      <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Transactions</h3>
      <div className="space-y-3">
        {transactions.slice(0, 10).map((transaction) => (
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
        ))}
      </div>
    </Card>
  );
}