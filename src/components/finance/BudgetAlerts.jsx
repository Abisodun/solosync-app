import React from 'react';
import { Card } from "@/components/ui/card";
import { AlertTriangle, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export default function BudgetAlerts({ budgets, transactions, currency = 'USD', onDismiss }) {
  if (!budgets || budgets.length === 0) return null;

  // Calculate alerts
  const alerts = budgets
    .filter(budget => budget.is_active)
    .map(budget => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage = budget.monthly_limit > 0 ? (spent / budget.monthly_limit) * 100 : 0;

      if (percentage >= 100) {
        return {
          id: budget.id,
          type: 'exceeded',
          category: budget.category,
          spent,
          limit: budget.monthly_limit,
          percentage,
          overspent: spent - budget.monthly_limit
        };
      } else if (percentage >= budget.alert_threshold) {
        return {
          id: budget.id,
          type: 'warning',
          category: budget.category,
          spent,
          limit: budget.monthly_limit,
          percentage,
          remaining: budget.monthly_limit - spent
        };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => b.percentage - a.percentage);

  if (alerts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <Card 
        className="p-5 rounded-[20px]"
        style={{ 
          background: alerts.some(a => a.type === 'exceeded') 
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
          border: alerts.some(a => a.type === 'exceeded') ? '2px solid #FCA5A5' : '2px solid #FCD34D'
        }}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {alerts.some(a => a.type === 'exceeded') ? (
              <div className="w-12 h-12 rounded-[12px] flex items-center justify-center bg-red-100">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-[12px] flex items-center justify-center bg-orange-100">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Budget Alert{alerts.length > 1 ? 's' : ''}
            </h3>
            
            <div className="space-y-3">
              <AnimatePresence>
                {alerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start justify-between p-3 rounded-[12px] bg-white"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 mb-1">
                        {alert.category}
                      </p>
                      {alert.type === 'exceeded' ? (
                        <p className="text-sm text-red-700">
                          <span className="font-bold">Budget exceeded!</span> You've spent{' '}
                          <span className="font-bold">{formatCurrency(alert.spent, currency)}</span>{' '}
                          ({formatCurrency(alert.overspent, currency)} over budget)
                        </p>
                      ) : (
                        <p className="text-sm text-orange-700">
                          <span className="font-bold">{alert.percentage.toFixed(0)}% used</span>{' '}
                          - Only <span className="font-bold">{formatCurrency(alert.remaining, currency)}</span> remaining
                        </p>
                      )}
                    </div>

                    {onDismiss && (
                      <button
                        onClick={() => onDismiss(alert.id)}
                        className="p-1 hover:bg-gray-100 rounded-[6px] transition-colors ml-2"
                        aria-label="Dismiss alert"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}