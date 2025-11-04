import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Edit2, Trash2, Eye, Filter, Download, Send } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';

const statusConfig = {
  draft: { color: 'bg-gray-100 text-gray-700', label: 'Draft' },
  sent: { color: 'bg-blue-100 text-blue-700', label: 'Sent' },
  paid: { color: 'bg-green-100 text-green-700', label: 'Paid' },
  overdue: { color: 'bg-red-100 text-red-700', label: 'Overdue' }
};

export default function InvoiceList({ invoices, onEdit, onDelete, onView, onStatusChange }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('-issue_date');

  if (!invoices || invoices.length === 0) {
    return (
      <Card className="p-8 rounded-[20px] text-center" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
        <div
          className="w-16 h-16 rounded-[18px] flex items-center justify-center mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' }}
        >
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">No invoices yet</h3>
        <p className="text-gray-500">Create your first invoice to get started with billing</p>
      </Card>
    );
  }

  // Filter and sort invoices
  let filteredInvoices = invoices;
  
  if (statusFilter !== 'all') {
    filteredInvoices = filteredInvoices.filter(inv => {
      // Auto-update overdue status
      if (inv.status === 'sent' && inv.due_date && isPast(parseISO(inv.due_date))) {
        return statusFilter === 'overdue';
      }
      return inv.status === statusFilter;
    });
  }

  // Sort invoices
  filteredInvoices = [...filteredInvoices].sort((a, b) => {
    if (sortBy === '-issue_date') {
      return new Date(b.issue_date) - new Date(a.issue_date);
    } else if (sortBy === 'issue_date') {
      return new Date(a.issue_date) - new Date(b.issue_date);
    } else if (sortBy === '-amount') {
      return b.amount - a.amount;
    } else if (sortBy === 'amount') {
      return a.amount - b.amount;
    }
    return 0;
  });

  const handleStatusUpdate = (invoice, newStatus) => {
    if (window.confirm(`Mark invoice ${invoice.invoice_number} as ${newStatus}?`)) {
      onStatusChange(invoice.id, newStatus);
    }
  };

  return (
    <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-gray-800">Invoices</h3>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="rounded-[10px] w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="rounded-[10px] w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-issue_date">Newest First</SelectItem>
              <SelectItem value="issue_date">Oldest First</SelectItem>
              <SelectItem value="-amount">Highest Amount</SelectItem>
              <SelectItem value="amount">Lowest Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-3">
        {filteredInvoices.map((invoice) => {
          // Auto-detect overdue status
          const isOverdue = invoice.status === 'sent' && invoice.due_date && isPast(parseISO(invoice.due_date));
          const displayStatus = isOverdue ? 'overdue' : invoice.status;
          const config = statusConfig[displayStatus];

          return (
            <div
              key={invoice.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-[14px] hover:bg-gray-100 transition-colors"
              role="article"
              aria-label={`Invoice ${invoice.invoice_number}`}
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div
                  className="w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' }}
                >
                  <FileText className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800">{invoice.invoice_number}</h4>
                    <Badge className={`${config.color} text-xs`}>
                      {config.label}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-700 font-medium">{invoice.client_name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Issued: {format(new Date(invoice.issue_date), 'MMM d, yyyy')} • 
                    Due: {format(new Date(invoice.due_date), 'MMM d, yyyy')}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold text-gray-800">
                    ${invoice.amount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onView(invoice)}
                  className="rounded-[10px]"
                  aria-label={`View invoice ${invoice.invoice_number}`}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>

                {invoice.status === 'draft' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(invoice, 'sent')}
                    className="rounded-[10px] text-white"
                    style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' }}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Send
                  </Button>
                )}

                {invoice.status === 'sent' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(invoice, 'paid')}
                    className="rounded-[10px] text-white"
                    style={{ background: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)' }}
                  >
                    Mark Paid
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(invoice)}
                  className="rounded-[10px]"
                  aria-label={`Edit invoice ${invoice.invoice_number}`}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete invoice ${invoice.invoice_number}?`)) {
                      onDelete(invoice.id);
                    }
                  }}
                  className="rounded-[10px] hover:bg-red-50 hover:border-red-200"
                  aria-label={`Delete invoice ${invoice.invoice_number}`}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No invoices found matching the selected filters
        </div>
      )}
    </Card>
  );
}