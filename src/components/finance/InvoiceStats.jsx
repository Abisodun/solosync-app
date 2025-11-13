import React from 'react';
import { Card } from "@/components/ui/card";
import { FileText, DollarSign, Clock, CheckCircle2 } from 'lucide-react';

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

export default function InvoiceStats({ invoices, currency = 'USD' }) {
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  const pendingInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue');
  const draftInvoices = invoices.filter(inv => inv.status === 'draft');

  const totalBilled = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  const stats = [
    {
      label: 'Total Invoiced',
      value: formatCurrency(totalBilled, currency),
      icon: DollarSign,
      gradient: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)',
      shadow: 'rgba(147, 197, 253, 0.15)',
      count: totalInvoices
    },
    {
      label: 'Paid',
      value: formatCurrency(totalPaid, currency),
      icon: CheckCircle2,
      gradient: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)',
      shadow: 'rgba(134, 239, 172, 0.15)',
      count: paidInvoices.length
    },
    {
      label: 'Pending',
      value: formatCurrency(totalPending, currency),
      icon: Clock,
      gradient: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
      shadow: 'rgba(252, 211, 77, 0.15)',
      count: pendingInvoices.length
    },
    {
      label: 'Draft',
      value: draftInvoices.length,
      icon: FileText,
      gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
      shadow: 'rgba(167, 139, 250, 0.15)',
      count: draftInvoices.length
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="p-5 rounded-[18px]"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              boxShadow: `0 8px 32px ${stat.shadow}`
            }}
            role="region"
            aria-label={`${stat.label}: ${stat.value}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                style={{ background: stat.gradient }}
                aria-hidden="true"
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-600 mb-0.5">{stat.label}</div>
                <div className="text-2xl font-bold text-gray-800">
                  {stat.value}
                </div>
              </div>
            </div>
            {index < 3 && stat.count > 0 && (
              <div className="text-xs text-gray-500 mt-2">
                {stat.count} invoice{stat.count !== 1 ? 's' : ''}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}