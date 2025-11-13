import React from 'react';
import { Card } from "@/components/ui/card";
import { AlertTriangle, AlertCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function BudgetAlerts({ budgets, transactions, currency = 'USD' }) {
  const currentMonth = format(new Date(), 'yyyy-MM');

  // Calculate alerts for current month budgets
  const alerts = budgets
    .filter(budget => budget.is_active && budget.month === currentMonth)
    .map(budget => {
      // Calculate spending
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
        percentage,
        remaining,
        isOverBudget: spent > budget.monthly_limit,
        isNearLimit: percentage >= budget.alert_threshold && spent <= budget.monthly_limit
      };
    })
    .filter(budget => budget.isOverBudget || budget.isNearLimit);

  if (alerts.length === 0) {
    return null;
  }

  // Separate by severity
  const overBudget = alerts.filter(a => a.isOverBudget);
  const nearLimit = alerts.filter(a => a.isNearLimit);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-8"
      >
        {/* Over Budget Alerts */}
        {overBudget.length > 0 && (
          <Card 
            className="p-5 rounded-[16px] mb-4" 
            style={{ 
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
              border: '2px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            <div className="flex items-start gap-4">
              <div 
                className="w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }}
              >
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-800 mb-2">
                  ⚠️ {overBudget.length} Budget{overBudget.length !== 1 ? 's' : ''} Exceeded
                </h3>
                <div className="space-y-2">
                  {overBudget.map(alert => (
                    <div key={alert.id} className="p-3 bg-white rounded-[10px]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-800">{alert.category}</span>
                        <span className="text-sm font-bold text-red-600">
                          {formatCurrency(Math.abs(alert.remaining), currency)} over budget
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Spent: {formatCurrency(alert.spent, currency)} / Budget: {formatCurrency(alert.monthly_limit, currency)} ({alert.percentage.toFixed(0)}%)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Near Limit Warnings */}
        {nearLimit.length > 0 && (
          <Card 
            className="p-5 rounded-[16px]" 
            style={{ 
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
              border: '2px solid rgba(245, 158, 11, 0.3)'
            }}
          >
            <div className="flex items-start gap-4">
              <div 
                className="w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}
              >
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-orange-800 mb-2">
                  💡 {nearLimit.length} Budget{nearLimit.length !== 1 ? 's' : ''} Near Limit
                </h3>
                <div className="space-y-2">
                  {nearLimit.map(alert => (
                    <div key={alert.id} className="p-3 bg-white rounded-[10px]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-800">{alert.category}</span>
                        <span className="text-sm font-bold text-orange-600">
                          {formatCurrency(alert.remaining, currency)} remaining
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Spent: {formatCurrency(alert.spent, currency)} / Budget: {formatCurrency(alert.monthly_limit, currency)} ({alert.percentage.toFixed(0)}%)
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-orange-700 mt-3 font-medium">
                  💡 Tip: Review your spending to stay within budget this month
                </p>
              </div>
            </div>
          </Card>
        )}
      </motion.div>
    </AnimatePresence>
  );
}