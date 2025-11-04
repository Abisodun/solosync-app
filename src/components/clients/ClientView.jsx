import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Edit2, Mail, Phone, MapPin, Globe, Building2, DollarSign, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const statusConfig = {
  active: { color: 'bg-green-100 text-green-700', label: 'Active' },
  inactive: { color: 'bg-gray-100 text-gray-700', label: 'Inactive' },
  lead: { color: 'bg-blue-100 text-blue-700', label: 'Lead' }
};

export default function ClientView({ client, invoices = [], transactions = [], onClose, onEdit }) {
  if (!client) return null;

  const config = statusConfig[client.status];
  
  // Filter data for this client
  const clientInvoices = invoices.filter(inv => 
    inv.client_name === client.name || inv.client_email === client.email
  );
  
  const clientTransactions = transactions.filter(tx => 
    tx.client_name === client.name
  );

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
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-[16px] flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
              >
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{client.name}</h2>
                {client.company && client.company !== client.name && (
                  <p className="text-gray-600">{client.company}</p>
                )}
                <Badge className={`${config.color} text-xs mt-2`}>
                  {config.label}
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(client)}
                className="rounded-[10px]"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
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

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-5 rounded-[16px]" style={{ background: 'rgba(249, 250, 251, 0.8)' }}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
              <div className="space-y-3">
                {client.contact_person && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-[10px] flex items-center justify-center bg-purple-100 flex-shrink-0">
                      <Building2 className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Contact Person</div>
                      <div className="text-sm font-medium text-gray-800">{client.contact_person}</div>
                    </div>
                  </div>
                )}
                
                {client.email && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-[10px] flex items-center justify-center bg-blue-100 flex-shrink-0">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Email</div>
                      <a href={`mailto:${client.email}`} className="text-sm font-medium text-blue-600 hover:underline">
                        {client.email}
                      </a>
                    </div>
                  </div>
                )}
                
                {client.phone && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-[10px] flex items-center justify-center bg-green-100 flex-shrink-0">
                      <Phone className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Phone</div>
                      <a href={`tel:${client.phone}`} className="text-sm font-medium text-gray-800">
                        {client.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {client.address && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-[10px] flex items-center justify-center bg-orange-100 flex-shrink-0">
                      <MapPin className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Address</div>
                      <div className="text-sm font-medium text-gray-800">{client.address}</div>
                    </div>
                  </div>
                )}
                
                {client.website && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-[10px] flex items-center justify-center bg-pink-100 flex-shrink-0">
                      <Globe className="w-4 h-4 text-pink-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Website</div>
                      <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
                        {client.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-5 rounded-[16px]" style={{ background: 'rgba(249, 250, 251, 0.8)' }}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Business Details</h3>
              <div className="space-y-3">
                {client.industry && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Industry</div>
                    <div className="text-sm font-medium text-gray-800">{client.industry}</div>
                  </div>
                )}
                
                {client.payment_terms && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Payment Terms</div>
                    <div className="text-sm font-medium text-gray-800">{client.payment_terms}</div>
                  </div>
                )}
                
                {client.tax_id && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Tax ID / VAT</div>
                    <div className="text-sm font-medium text-gray-800">{client.tax_id}</div>
                  </div>
                )}
                
                {client.tags && client.tags.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 mb-2">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {client.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded-[6px] text-xs font-medium bg-purple-100 text-purple-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-4 rounded-[14px]" style={{ background: 'linear-gradient(135deg, rgba(134, 239, 172, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)' }}>
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-xs text-gray-600">Total Invoiced</div>
                  <div className="text-2xl font-bold text-gray-800">${(client.total_invoiced || 0).toLocaleString()}</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 rounded-[14px]" style={{ background: 'linear-gradient(135deg, rgba(147, 197, 253, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)' }}>
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-xs text-gray-600">Total Paid</div>
                  <div className="text-2xl font-bold text-gray-800">${(client.total_paid || 0).toLocaleString()}</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 rounded-[14px]" style={{ background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)' }}>
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-xs text-gray-600">Last Invoice</div>
                  <div className="text-sm font-bold text-gray-800">
                    {client.last_invoice_date 
                      ? format(new Date(client.last_invoice_date), 'MMM d, yyyy')
                      : 'Never'}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Invoice History */}
          {clientInvoices.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Invoices</h3>
              <Card className="p-4 rounded-[14px]" style={{ background: 'rgba(249, 250, 251, 0.8)' }}>
                <div className="space-y-2">
                  {clientInvoices.slice(0, 5).map((invoice) => (
                    <div key={invoice.id} className="flex justify-between items-center p-3 rounded-[10px] bg-white">
                      <div>
                        <div className="font-medium text-gray-800">{invoice.invoice_number}</div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(invoice.issue_date), 'MMM d, yyyy')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-800">${invoice.amount.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 capitalize">{invoice.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Notes */}
          {client.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Notes</h3>
              <Card className="p-4 rounded-[14px]" style={{ background: 'rgba(249, 250, 251, 0.8)' }}>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{client.notes}</p>
              </Card>
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}