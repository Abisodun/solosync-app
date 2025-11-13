import React from 'react';
import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
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
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export default function BudgetProgress({ budgets, transactions, currency = 'USD', onEdit }) {
  if (!budgets || budgets.length === 0) {
    return (
      <Card className="p-8 rounded-[20px] text-center" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
        <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No budgets set yet. Create your first budget to start tracking!</p>
      </Card>
    );
  }

  // Calculate spending per budget
  const budgetData = budgets.map(budget => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .reduce((sum, t) => sum + t.amount, 0);

    const percentage = budget.monthly_limit > 0 ? (spent / budget.monthly_limit) * 100 : 0;
    const remaining = budget.monthly_limit - spent;
    
    let status = 'safe';
    if (percentage >= 100) status = 'exceeded';
    else if (percentage >= budget.alert_threshold) status = 'warning';

    return {
      ...budget,
      spent,
      percentage: Math.min(percentage, 100),
      remaining,
      status
    };
  }).sort((a, b) => b.percentage - a.percentage);

  const statusConfig = {
    safe: { color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)', icon: CheckCircle2, label: 'On Track' },
    warning: { color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)', icon: AlertTriangle, label: 'Warning' },
    exceeded: { color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)', icon: AlertTriangle, label: 'Exceeded' }
  };

  return (
    <div className="space-y-4">
      {budgetData.map((budget, index) => {
        const config = statusConfig[budget.status];
        const Icon = config.icon;

        return (
          <motion.div
            key={budget.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="p-6 rounded-[20px] cursor-pointer hover:shadow-xl transition-all"
              style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}
              onClick={() => onEdit && onEdit(budget)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: budget.color }}
                    />
                    <h4 className="font-bold text-gray-800 text-lg">{budget.category}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon 
                      className="w-4 h-4"
                      style={{ color: config.color }}
                    />
                    <span 
                      className="text-sm font-semibold"
                      style={{ color: config.color }}
                    >
                      {config.label}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    {formatCurrency(budget.spent, currency)}
                  </div>
                  <div className="text-sm text-gray-500">
                    of {formatCurrency(budget.monthly_limit, currency)}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${budget.percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ 
                      background: budget.percentage >= 100 
                        ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                        : budget.percentage >= budget.alert_threshold
                        ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                        : 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-600">Remaining: </span>
                  <span className={`font-bold ${budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(budget.remaining), currency)}
                    {budget.remaining < 0 && ' over'}
                  </span>
                </div>
                <div className="text-gray-600">
                  <span className="font-bold text-gray-800">{budget.percentage.toFixed(1)}%</span> used
                </div>
              </div>

              {/* Alert Message */}
              {budget.status === 'exceeded' && (
                <div 
                  className="mt-4 p-3 rounded-[12px] flex items-start gap-2"
                  style={{ background: config.bgColor }}
                >
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: config.color }} />
                  <p className="text-sm font-medium" style={{ color: config.color }}>
                    Budget exceeded! You've spent {formatCurrency(budget.spent - budget.monthly_limit, currency)} more than planned.
                  </p>
                </div>
              )}

              {budget.status === 'warning' && (
                <div 
                  className="mt-4 p-3 rounded-[12px] flex items-start gap-2"
                  style={{ background: config.bgColor }}
                >
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: config.color }} />
                  <p className="text-sm font-medium" style={{ color: config.color }}>
                    You're at {budget.alert_threshold}% of your budget. Consider reducing spending in this category.
                  </p>
                </div>
              )}

              {/* Notes */}
              {budget.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">{budget.notes}</p>
                </div>
              )}
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}