import React from 'react';
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingDown, AlertTriangle, Target } from 'lucide-react';
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

export default function BudgetOverview({ budgets, transactions, currency = 'USD' }) {
  if (!budgets || budgets.length === 0) return null;

  // Calculate totals
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.monthly_limit, 0);
  const totalSpent = budgets.reduce((sum, budget) => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .reduce((s, t) => s + t.amount, 0);
    return sum + spent;
  }, 0);
  const totalRemaining = totalBudgeted - totalSpent;
  
  const exceededCount = budgets.filter(budget => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .reduce((sum, t) => sum + t.amount, 0);
    return spent > budget.monthly_limit;
  }).length;

  const warningCount = budgets.filter(budget => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .reduce((sum, t) => sum + t.amount, 0);
    const percentage = (spent / budget.monthly_limit) * 100;
    return percentage >= budget.alert_threshold && percentage < 100;
  }).length;

  const stats = [
    { 
      label: 'Total Budgeted', 
      value: formatCurrency(totalBudgeted, currency), 
      icon: Target, 
      gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' 
    },
    { 
      label: 'Total Spent', 
      value: formatCurrency(totalSpent, currency), 
      icon: TrendingDown, 
      gradient: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' 
    },
    { 
      label: 'Remaining', 
      value: formatCurrency(Math.abs(totalRemaining), currency),
      subtext: totalRemaining < 0 ? 'Over Budget' : 'Available',
      icon: DollarSign, 
      gradient: totalRemaining >= 0 
        ? 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)'
        : 'linear-gradient(135deg, #FCA5A5 0%, #EF4444 100%)'
    },
    { 
      label: 'Budget Alerts', 
      value: exceededCount + warningCount,
      subtext: `${exceededCount} exceeded, ${warningCount} warning`,
      icon: AlertTriangle, 
      gradient: exceededCount > 0
        ? 'linear-gradient(135deg, #FCA5A5 0%, #EF4444 100%)'
        : warningCount > 0
        ? 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)'
        : 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-[14px] flex items-center justify-center" style={{ background: stat.gradient }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
              {stat.subtext && (
                <div className="text-xs text-gray-500 mt-1">{stat.subtext}</div>
              )}
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}