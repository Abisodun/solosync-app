import React from 'react';
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';

export default function FinanceStats({ totalIncome, totalExpenses, netProfit, unpaidAmount, currency = 'USD' }) {
  const stats = [
    {
      label: 'Total Income',
      value: totalIncome,
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)',
      shadow: 'rgba(134, 239, 172, 0.15)',
      textColor: 'text-gray-800'
    },
    {
      label: 'Total Expenses',
      value: totalExpenses,
      icon: TrendingDown,
      gradient: 'linear-gradient(135deg, #FCA5A5 0%, #EF4444 100%)',
      shadow: 'rgba(252, 165, 165, 0.15)',
      textColor: 'text-gray-800'
    },
    {
      label: netProfit >= 0 ? 'Net Profit' : 'Net Loss',
      value: Math.abs(netProfit),
      icon: DollarSign,
      gradient: netProfit >= 0
        ? 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)'
        : 'linear-gradient(135deg, #FCA5A5 0%, #EF4444 100%)',
      shadow: 'rgba(167, 139, 250, 0.15)',
      textColor: netProfit >= 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      label: 'Unpaid Invoices',
      value: unpaidAmount,
      icon: AlertCircle,
      gradient: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
      shadow: 'rgba(252, 211, 77, 0.15)',
      textColor: 'text-gray-800'
    }
  ];

  const formatCurrency = (amount) => {
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
    return `${symbol}${amount.toLocaleString()}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="p-6 rounded-[20px]"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              boxShadow: `0 8px 32px ${stat.shadow}`
            }}
            role="region"
            aria-label={`${stat.label}: ${formatCurrency(stat.value)}`}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                style={{ background: stat.gradient }}
                aria-hidden="true"
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className={`text-2xl font-bold ${stat.textColor}`}>
                  {formatCurrency(stat.value)}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}