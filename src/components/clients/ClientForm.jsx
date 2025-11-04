import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from 'framer-motion';
import { AlertCircle, Users } from 'lucide-react';

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

export default function ClientForm({ client, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(client || {
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    website: '',
    industry: '',
    status: 'active',
    notes: '',
    tags: [],
    payment_terms: 'Net 30',
    tax_id: '',
    billing_email: '',
    contact_person: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Client name must be at least 2 characters';
    }
    
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.billing_email && !validateEmail(formData.billing_email)) {
      newErrors.billing_email = 'Please enter a valid billing email';
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
        name: sanitizeInput(formData.name),
        email: sanitizeInput(formData.email),
        phone: sanitizeInput(formData.phone),
        address: sanitizeInput(formData.address),
        company: sanitizeInput(formData.company),
        website: sanitizeInput(formData.website),
        industry: sanitizeInput(formData.industry),
        notes: sanitizeInput(formData.notes),
        billing_email: sanitizeInput(formData.billing_email),
        contact_person: sanitizeInput(formData.contact_person),
        tax_id: sanitizeInput(formData.tax_id)
      };
      
      await onSubmit(sanitizedData);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save client' });
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

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
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
            style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
          >
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            {client ? 'Edit Client' : 'New Client'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Basic Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Client Name *</label>
                <Input
                  placeholder="John Doe / Acme Corp"
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', validateInput(e.target.value, 200))}
                  maxLength={200}
                  className={`rounded-[12px] ${errors.name ? 'border-red-500' : ''}`}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Company</label>
                <Input
                  placeholder="Company name"
                  value={formData.company}
                  onChange={(e) => handleFieldChange('company', validateInput(e.target.value, 200))}
                  maxLength={200}
                  className="rounded-[12px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Contact Person</label>
                <Input
                  placeholder="Primary contact name"
                  value={formData.contact_person}
                  onChange={(e) => handleFieldChange('contact_person', validateInput(e.target.value, 200))}
                  maxLength={200}
                  className="rounded-[12px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                <Select value={formData.status} onValueChange={(value) => handleFieldChange('status', value)}>
                  <SelectTrigger className="rounded-[12px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Contact Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                <Input
                  type="email"
                  placeholder="client@example.com"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', validateInput(e.target.value, 100))}
                  maxLength={100}
                  className={`rounded-[12px] ${errors.email ? 'border-red-500' : ''}`}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                <Input
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleFieldChange('phone', validateInput(e.target.value, 50))}
                  maxLength={50}
                  className="rounded-[12px]"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Address</label>
              <Input
                placeholder="123 Main St, City, State, ZIP"
                value={formData.address}
                onChange={(e) => handleFieldChange('address', validateInput(e.target.value, 300))}
                maxLength={300}
                className="rounded-[12px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Website</label>
                <Input
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) => handleFieldChange('website', validateInput(e.target.value, 200))}
                  maxLength={200}
                  className="rounded-[12px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Industry</label>
                <Input
                  placeholder="e.g., Technology, Marketing"
                  value={formData.industry}
                  onChange={(e) => handleFieldChange('industry', validateInput(e.target.value, 100))}
                  maxLength={100}
                  className="rounded-[12px]"
                />
              </div>
            </div>
          </div>

          {/* Billing Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Billing Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Billing Email</label>
                <Input
                  type="email"
                  placeholder="billing@example.com"
                  value={formData.billing_email}
                  onChange={(e) => handleFieldChange('billing_email', validateInput(e.target.value, 100))}
                  maxLength={100}
                  className={`rounded-[12px] ${errors.billing_email ? 'border-red-500' : ''}`}
                />
                {errors.billing_email && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.billing_email}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Payment Terms</label>
                <Select value={formData.payment_terms} onValueChange={(value) => handleFieldChange('payment_terms', value)}>
                  <SelectTrigger className="rounded-[12px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Due on receipt">Due on receipt</SelectItem>
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                    <SelectItem value="Net 90">Net 90</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Tax ID / VAT Number</label>
              <Input
                placeholder="Tax identification number"
                value={formData.tax_id}
                onChange={(e) => handleFieldChange('tax_id', validateInput(e.target.value, 50))}
                maxLength={50}
                className="rounded-[12px]"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Tags</label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="rounded-[12px]"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                variant="outline"
                className="rounded-[12px]"
              >
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-[8px] text-sm font-medium bg-purple-100 text-purple-700 flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-purple-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Notes</label>
            <Textarea
              placeholder="Internal notes about this client..."
              value={formData.notes}
              onChange={(e) => handleFieldChange('notes', validateInput(e.target.value, 1000))}
              maxLength={1000}
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
              style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : client ? 'Update' : 'Create'} Client
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}