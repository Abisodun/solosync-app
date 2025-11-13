import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { X, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContentForm({ content, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'social_post',
    channel: 'instagram',
    status: 'idea',
    scheduled_date: '',
    notes: '',
    tags: []
  });

  const [tagInput, setTagInput] = useState('');
  const [dateError, setDateError] = useState('');

  // Initialize form when editing
  useEffect(() => {
    if (content) {
      const updatedData = { ...content };
      
      // Convert scheduled_date from ISO to datetime-local format for editing
      if (content.scheduled_date) {
        try {
          const date = new Date(content.scheduled_date);
          
          if (!isNaN(date.getTime())) {
            // Format: YYYY-MM-DDTHH:mm
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            
            updatedData.scheduled_date = `${year}-${month}-${day}T${hours}:${minutes}`;
            
            console.log('📝 Editing - Converted date:', {
              original: content.scheduled_date,
              converted: updatedData.scheduled_date
            });
          } else {
            console.error('❌ Invalid date when editing:', content.scheduled_date);
            updatedData.scheduled_date = '';
          }
        } catch (error) {
          console.error('❌ Error converting date for editing:', error);
          updatedData.scheduled_date = '';
        }
      }
      
      setFormData(updatedData);
    }
  }, [content]);

  const validateDate = (dateString) => {
    if (!dateString) return true; // Empty is valid (optional field)
    
    // Check format: YYYY-MM-DDTHH:mm
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return false;
    }
    
    // Check if it's a valid date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('🚀 === FORM SUBMIT START ===');
    console.log('Raw form data:', JSON.stringify(formData, null, 2));
    
    // Validate date before submission
    if (formData.scheduled_date) {
      if (!validateDate(formData.scheduled_date)) {
        const errorMsg = 'Invalid date format. Please select a valid date and time.';
        setDateError(errorMsg);
        alert(errorMsg);
        console.error('❌ Date validation failed:', formData.scheduled_date);
        return;
      }
    }
    
    // Clear any previous errors
    setDateError('');
    
    // Create submission data - keep exactly as is
    const submissionData = {
      ...formData,
      // Ensure status is scheduled if date is set
      status: formData.scheduled_date && formData.status !== 'published' 
        ? 'scheduled' 
        : formData.status
    };
    
    console.log('✅ Validated. Submitting:', JSON.stringify(submissionData, null, 2));
    console.log('🚀 === FORM SUBMIT END ===');
    
    onSubmit(submissionData);
  };

  const handleScheduledDateChange = (value) => {
    console.log('📅 Date input value:', value);
    
    // Validate the date
    if (value && !validateDate(value)) {
      setDateError('Invalid date format');
      console.warn('⚠️ Invalid date format:', value);
    } else {
      setDateError('');
    }
    
    setFormData(prev => ({
      ...prev,
      scheduled_date: value,
      // Auto-update status
      status: value ? 'scheduled' : (prev.status === 'scheduled' ? 'draft' : prev.status)
    }));
    
    console.log('✅ Date updated:', value);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-8"
    >
      <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {content ? 'Edit Content' : 'New Content'}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-[8px] transition-colors"
            aria-label="Close form"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="content-title" className="text-sm font-semibold text-gray-700 mb-2 block">
              Title *
            </label>
            <Input
              id="content-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Content title"
              className="rounded-[12px]"
              required
              autoComplete="off"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="content-description" className="text-sm font-semibold text-gray-700 mb-2 block">
              Description
            </label>
            <Textarea
              id="content-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your content..."
              className="rounded-[12px] h-24"
              autoComplete="off"
            />
          </div>

          {/* Type and Channel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="content-type" className="text-sm font-semibold text-gray-700 mb-2 block">
                Content Type *
              </label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger id="content-type" className="rounded-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog_post">Blog Post</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="social_post">Social Post</SelectItem>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                  <SelectItem value="podcast">Podcast</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="content-channel" className="text-sm font-semibold text-gray-700 mb-2 block">
                Channel
              </label>
              <Select
                value={formData.channel}
                onValueChange={(value) => setFormData({ ...formData, channel: value })}
              >
                <SelectTrigger id="content-channel" className="rounded-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="snapchat">Snapchat</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Scheduled Date - CRITICAL FIELD */}
          <div>
            <label htmlFor="scheduled-date" className="text-sm font-semibold text-gray-700 mb-2 block">
              Scheduled Date & Time *
            </label>
            <Input
              id="scheduled-date"
              type="datetime-local"
              value={formData.scheduled_date}
              onChange={(e) => handleScheduledDateChange(e.target.value)}
              className={`rounded-[12px] ${dateError ? 'border-red-500' : ''}`}
              autoComplete="off"
            />
            
            {/* Error Message */}
            {dateError && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {dateError}
              </p>
            )}
            
            {/* Success Message */}
            {formData.scheduled_date && !dateError && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                ✓ Will be scheduled for: {formData.scheduled_date}
              </p>
            )}
            
            {/* Help Text */}
            {!formData.scheduled_date && !dateError && (
              <p className="text-xs text-gray-500 mt-1">
                Select a date and time to schedule this content
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="content-status" className="text-sm font-semibold text-gray-700 mb-2 block">
              Status * {formData.scheduled_date && <span className="text-xs text-gray-500">(auto-set to scheduled)</span>}
            </label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger id="content-status" className="rounded-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idea">Idea</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="content-tags" className="text-sm font-semibold text-gray-700 mb-2 block">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                id="content-tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag and press Enter"
                className="rounded-[12px]"
                autoComplete="off"
              />
              <Button
                type="button"
                onClick={addTag}
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
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-[8px] text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-purple-900"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="content-notes" className="text-sm font-semibold text-gray-700 mb-2 block">
              Notes
            </label>
            <Textarea
              id="content-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              className="rounded-[12px] h-24"
              autoComplete="off"
            />
          </div>

          {/* Debug Info - Enhanced */}
          <div className="p-4 bg-blue-50 rounded-[12px] border border-blue-200 text-xs">
            <p className="font-semibold text-blue-800 mb-2">📋 Form Debug Info:</p>
            <div className="space-y-1 text-blue-700">
              <p>• Status: <span className="font-mono font-semibold">{formData.status}</span></p>
              <p>• Scheduled Date: <span className="font-mono font-semibold">{formData.scheduled_date || 'Not set'}</span></p>
              <p>• Date Valid: <span className="font-mono font-semibold">{formData.scheduled_date ? (validateDate(formData.scheduled_date) ? '✅ Yes' : '❌ No') : 'N/A'}</span></p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="rounded-[12px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-[12px] text-white"
              style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
              disabled={!!dateError}
            >
              {content ? 'Update Content' : 'Create Content'}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}