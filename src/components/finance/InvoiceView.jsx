import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Download, Send, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { formatCurrency, getCurrencySymbol } from '@/utils/currency';

const statusConfig = {
  draft: { color: 'bg-gray-100 text-gray-700', label: 'Draft' },
  sent: { color: 'bg-blue-100 text-blue-700', label: 'Sent' },
  paid: { color: 'bg-green-100 text-green-700', label: 'Paid' },
  overdue: { color: 'bg-red-100 text-red-700', label: 'Overdue' }
};

export default function InvoiceView({ invoice, user, onClose }) {
  if (!invoice) return null;

  const currency = user?.currency || 'USD';
  const symbol = getCurrencySymbol(currency);
  const config = statusConfig[invoice.status];
  const subtotal = invoice.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
  const taxRate = invoice.tax_rate || 0;
  const tax = subtotal * (taxRate / 100);
  const total = invoice.amount || (subtotal + tax);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a printable version
    const printContent = document.getElementById('invoice-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${invoice.invoice_number}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              .invoice-header { display: flex; justify-between; margin-bottom: 40px; }
              .invoice-details { margin-bottom: 30px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
              th { background-color: #f3f4f6; font-weight: 600; }
              .totals { margin-left: auto; width: 300px; margin-top: 20px; }
              .totals-row { display: flex; justify-between; padding: 8px 0; }
              .total-row { font-size: 18px; font-weight: bold; border-top: 2px solid #000; padding-top: 12px; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl my-8"
      >
        <Card className="p-8 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.98)', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' }}>
          {/* Header Actions */}
          <div className="flex justify-between items-center mb-6 print:hidden">
            <Badge className={`${config.color} text-sm`}>
              {config.label}
            </Badge>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                className="rounded-[10px]"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrint}
                className="rounded-[10px]"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onClose}
                className="rounded-[10px]"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Invoice Content */}
          <div id="invoice-content">
            {/* Header */}
            <div className="flex justify-between items-start mb-12">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  INVOICE
                </h1>
                <p className="text-lg text-gray-600">{invoice.invoice_number}</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {user?.full_name || 'Your Business Name'}
                </h2>
                <p className="text-gray-600">{user?.email}</p>
                {user?.country && (
                  <p className="text-gray-600">{user.state_province}, {user.country}</p>
                )}
              </div>
            </div>

            {/* Bill To & Dates */}
            <div className="grid grid-cols-2 gap-8 mb-12">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Bill To:</h3>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-gray-800">{invoice.client_name}</p>
                  {invoice.client_email && (
                    <p className="text-gray-600">{invoice.client_email}</p>
                  )}
                  {invoice.client_phone && (
                    <p className="text-gray-600">{invoice.client_phone}</p>
                  )}
                  {invoice.client_address && (
                    <p className="text-gray-600">{invoice.client_address}</p>
                  )}
                </div>
              </div>
              <div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Issue Date:</span>
                    <p className="text-gray-800 font-medium">
                      {format(new Date(invoice.issue_date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Due Date:</span>
                    <p className="text-gray-800 font-medium">
                      {format(new Date(invoice.due_date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 text-gray-700 font-semibold">Description</th>
                    <th className="text-right py-3 text-gray-700 font-semibold w-24">Qty</th>
                    <th className="text-right py-3 text-gray-700 font-semibold w-32">Rate</th>
                    <th className="text-right py-3 text-gray-700 font-semibold w-32">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-4 text-gray-800">{item.description}</td>
                      <td className="py-4 text-right text-gray-800">{item.quantity}</td>
                      <td className="py-4 text-right text-gray-800">{symbol}{item.rate.toFixed(2)}</td>
                      <td className="py-4 text-right text-gray-800 font-medium">
                        {symbol}{item.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-12">
              <div className="w-80 space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-semibold text-gray-800">{symbol}{subtotal.toFixed(2)}</span>
                </div>
                
                {taxRate > 0 && (
                  <>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-700">Tax ({taxRate}%):</span>
                      <span className="font-semibold text-gray-800">{symbol}{tax.toFixed(2)}</span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between py-4 border-t-2 border-gray-300">
                  <span className="text-xl font-bold text-gray-800">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">{symbol}{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="pt-8 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Notes:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>Thank you for your business!</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}