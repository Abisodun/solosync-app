
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from 'framer-motion';
import { AlertCircle, Plus, Trash2, FileText } from 'lucide-react';
import { format } from 'date-fns';

import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const validateInput = (value, maxLength = 100) => {
  if (!value) return '';
  return String(value).trim().slice(0, maxLength);
};

const sanitizeInput = (input) => {
  if (!input) return '';
  return String(input).replace(/[<>]/g, '').trim();
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${year}${month}-${random}`;
};

export default function InvoiceForm({ invoice, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(invoice || {
    invoice_number: generateInvoiceNumber(),
    client_id: '',
    client_name: '',
    client_email: '',
    client_address: '',
    client_phone: '',
    amount: 0,
    status: 'draft',
    due_date: '',
    issue_date: new Date().toISOString().split('T')[0],
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    notes: '',
    tax_rate: 0
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useExistingClient, setUseExistingClient] = useState(false);

  // Load clients
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      try {
        return await base44.entities.Client.list('name', 500);
      } catch (error) {
        console.error('Error loading clients:', error);
        return [];
      }
    }
  });

  // Filter active clients
  const activeClients = clients.filter(c => c.status === 'active' || c.status === 'lead');

  // Calculate total whenever items or tax change
  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const tax = subtotal * (formData.tax_rate / 100);
    const total = subtotal + tax;
    
    if (formData.amount !== total) {
      setFormData(prev => ({ ...prev, amount: total }));
    }
  }, [formData.items, formData.tax_rate]);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.client_name || formData.client_name.trim().length < 2) {
      newErrors.client_name = 'Client name must be at least 2 characters';
    }
    
    if (formData.client_email && !validateEmail(formData.client_email)) {
      newErrors.client_email = 'Please enter a valid email address';
    }
    
    if (!formData.issue_date) {
      newErrors.issue_date = 'Please select an issue date';
    }
    
    if (!formData.due_date) {
      newErrors.due_date = 'Please select a due date';
    }
    
    if (formData.items.length === 0 || formData.items.every(item => !item.description)) {
      newErrors.items = 'Please add at least one line item';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const sanitizedData = {
        ...formData,
        client_name: sanitizeInput(formData.client_name),
        client_email: sanitizeInput(formData.client_email),
        client_address: sanitizeInput(formData.client_address),
        client_phone: sanitizeInput(formData.client_phone),
        notes: sanitizeInput(formData.notes),
        items: formData.items.filter(item => item.description.trim())
      };
      
      await onSubmit(sanitizedData);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save invoice' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    // Calculate item amount
    if (field === 'quantity' || field === 'rate') {
      const quantity = parseFloat(newItems[index].quantity) || 0;
      const rate = parseFloat(newItems[index].rate) || 0;
      newItems[index].amount = quantity * rate;
    }
    
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const subtotal = formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const tax = subtotal * (formData.tax_rate / 100);
  const total = subtotal + tax;

  const handleClientSelect = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setFormData(prev => ({
        ...prev,
        client_id: client.id,
        client_name: client.name,
        client_email: client.email || client.billing_email || '',
        client_phone: client.phone || '',
        client_address: client.address || '',
        payment_terms: client.payment_terms || 'Net 30'
      }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-8"
    >
      <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-[14px] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' }}
          >
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {invoice ? 'Edit Invoice' : 'New Invoice'}
            </h3>
            <p className="text-sm text-gray-500">{formData.invoice_number}</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Selection Toggle */}
          <div className="flex items-center gap-4 p-4 rounded-[14px] bg-purple-50">
            <input
              type="checkbox"
              id="useExistingClient"
              checked={useExistingClient}
              onChange={(e) => setUseExistingClient(e.target.checked)}
              className="w-4 h-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="useExistingClient" className="text-sm font-medium text-purple-900 cursor-pointer">
              Select from existing clients
            </label>
          </div>

          {/* Client Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Client Information</h4>
            
            {useExistingClient ? (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Select Client *</label>
                <Select 
                  value={formData.client_id} 
                  onValueChange={handleClientSelect}
                >
                  <SelectTrigger className="rounded-[12px]">
                    <SelectValue placeholder="Choose a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeClients.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500 text-center">
                        No clients found. Add clients in the Clients page.
                      </div>
                    ) : (
                      activeClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{client.name}</span>
                            {client.company && (
                              <span className="text-xs text-gray-500">{client.company}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                
                {formData.client_id && (
                  <div className="mt-3 p-3 rounded-[12px] bg-gray-50 text-sm">
                    <div className="font-medium text-gray-800 mb-1">{formData.client_name}</div>
                    {formData.client_email && (
                      <div className="text-gray-600">{formData.client_email}</div>
                    )}
                    {formData.client_phone && (
                      <div className="text-gray-600">{formData.client_phone}</div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Client Name *</label>
                    <Input
                      placeholder="John Doe / Acme Corp"
                      value={formData.client_name}
                      onChange={(e) => handleFieldChange('client_name', validateInput(e.target.value, 200))}
                      maxLength={200}
                      className={`rounded-[12px] ${errors.client_name ? 'border-red-500' : ''}`}
                      aria-invalid={!!errors.client_name}
                      aria-describedby={errors.client_name ? 'client-name-error' : undefined}
                    />
                    {errors.client_name && (
                      <p id="client-name-error" className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.client_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Client Email</label>
                    <Input
                      type="email"
                      placeholder="client@example.com"
                      value={formData.client_email}
                      onChange={(e) => handleFieldChange('client_email', validateInput(e.target.value, 100))}
                      maxLength={100}
                      className={`rounded-[12px] ${errors.client_email ? 'border-red-500' : ''}`}
                      aria-invalid={!!errors.client_email}
                    />
                    {errors.client_email && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.client_email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Phone Number</label>
                    <Input
                      placeholder="+1 (555) 123-4567"
                      value={formData.client_phone}
                      onChange={(e) => handleFieldChange('client_phone', validateInput(e.target.value, 50))}
                      maxLength={50}
                      className="rounded-[12px]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Address</label>
                    <Input
                      placeholder="123 Main St, City, State"
                      value={formData.client_address}
                      onChange={(e) => handleFieldChange('client_address', validateInput(e.target.value, 200))}
                      maxLength={200}
                      className="rounded-[12px]"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Invoice Details */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Invoice Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                <Select value={formData.status} onValueChange={(value) => handleFieldChange('status', value)}>
                  <SelectTrigger className="rounded-[12px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Issue Date *</label>
                <Input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => handleFieldChange('issue_date', e.target.value)}
                  className={`rounded-[12px] ${errors.issue_date ? 'border-red-500' : ''}`}
                  aria-invalid={!!errors.issue_date}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Due Date *</label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => handleFieldChange('due_date', e.target.value)}
                  min={formData.issue_date}
                  className={`rounded-[12px] ${errors.due_date ? 'border-red-500' : ''}`}
                  aria-invalid={!!errors.due_date}
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-800">Line Items *</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="rounded-[10px]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            {errors.items && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.items}
              </p>
            )}

            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="p-4 rounded-[14px] bg-gray-50 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-5">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="rounded-[10px]"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        min="0"
                        step="0.01"
                        className="rounded-[10px]"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        type="number"
                        placeholder="Rate"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                        min="0"
                        step="0.01"
                        className="rounded-[10px]"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        value={`$${(item.amount || 0).toFixed(2)}`}
                        disabled
                        className="rounded-[10px] bg-gray-100"
                      />
                    </div>
                    <div className="md:col-span-1 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={formData.items.length === 1}
                        className="p-2 hover:bg-red-100 rounded-[8px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full md:w-1/2 space-y-3">
              <div className="flex justify-between items-center p-3 rounded-[12px] bg-gray-50">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-semibold text-gray-800">${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-[12px] bg-gray-50">
                <span className="text-gray-700">Tax Rate:</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={formData.tax_rate}
                    onChange={(e) => handleFieldChange('tax_rate', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.1"
                    className="rounded-[10px] w-20 text-right"
                  />
                  <span className="text-gray-700">%</span>
                </div>
              </div>

              {formData.tax_rate > 0 && (
                <div className="flex justify-between items-center p-3 rounded-[12px] bg-gray-50">
                  <span className="text-gray-700">Tax Amount:</span>
                  <span className="font-semibold text-gray-800">${tax.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center p-4 rounded-[12px]" style={{ background: 'linear-gradient(135deg, rgba(147, 197, 253, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)' }}>
                <span className="text-lg font-bold text-gray-800">Total:</span>
                <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Notes</label>
            <Textarea
              placeholder="Payment terms, thank you note, or other information..."
              value={formData.notes}
              onChange={(e) => handleFieldChange('notes', validateInput(e.target.value, 500))}
              maxLength={500}
              className="rounded-[12px] h-24"
            />
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-[12px]">
              <p className="text-sm text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.submit}
              </p>
            </div>
          )}
          
          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="rounded-[12px]"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-[12px] text-white"
              style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : invoice ? 'Update' : 'Create'} Invoice
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
