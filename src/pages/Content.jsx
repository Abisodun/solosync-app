import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Calendar as CalendarIcon, Instagram, Youtube, Twitter, Linkedin, TrendingUp, Edit2, List, Grid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import Sidebar from '../components/common/Sidebar';
import AIPublishingTips from '../components/content/AIPublishingTips';
import ContentForm from '../components/content/ContentForm';
import ContentCalendar from '../components/content/ContentCalendar';

export default function Content() {
  const [showForm, setShowForm] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [editingContent, setEditingContent] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const queryClient = useQueryClient();

  const { data: contentItems = [], isLoading } = useQuery({
    queryKey: ['content'],
    queryFn: async () => {
      const result = await base44.entities.ContentItem.list('-scheduled_date', 100);
      console.log('Fetched content items:', result);
      return result;
    },
  });

  const createContentMutation = useMutation({
    mutationFn: async (data) => {
      console.log('Creating content with data:', JSON.stringify(data, null, 2));
      const result = await base44.entities.ContentItem.create(data);
      console.log('Created content result:', JSON.stringify(result, null, 2));
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      queryClient.refetchQueries({ queryKey: ['content'] });
      setShowForm(false);
      setEditingContent(null);
    }
  });

  const updateContentMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      console.log('Updating content:', id, JSON.stringify(data, null, 2));
      const result = await base44.entities.ContentItem.update(id, data);
      console.log('Updated content result:', JSON.stringify(result, null, 2));
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      queryClient.refetchQueries({ queryKey: ['content'] });
      setShowForm(false);
      setEditingContent(null);
    }
  });

  const handleSubmit = (data) => {
    console.log('=== CONTENT SUBMIT START ===');
    console.log('Raw form data received:', JSON.stringify(data, null, 2));
    
    // Create a clean copy
    const finalData = { ...data };
    
    // Convert datetime-local format to ISO string if needed
    if (finalData.scheduled_date) {
      // If it's in datetime-local format (YYYY-MM-DDTHH:mm), convert to ISO
      if (finalData.scheduled_date.length === 16) {
        // Add seconds and convert to ISO
        finalData.scheduled_date = new Date(finalData.scheduled_date).toISOString();
        console.log('Converted scheduled_date to ISO:', finalData.scheduled_date);
      }
      
      // Ensure status is 'scheduled' when date exists
      if (finalData.status === 'idea' || finalData.status === 'draft' || !finalData.status) {
        console.log('Auto-setting status to "scheduled" because scheduled_date exists');
        finalData.status = 'scheduled';
      }
    }
    
    console.log('Final data to submit:', JSON.stringify(finalData, null, 2));
    console.log('=== CONTENT SUBMIT END ===');
    
    if (editingContent) {
      updateContentMutation.mutate({ id: editingContent.id, data: finalData });
    } else {
      createContentMutation.mutate(finalData);
    }
  };

  const handleEdit = (item) => {
    console.log('Editing content item:', JSON.stringify(item, null, 2));
    setEditingContent(item);
    setShowForm(true);
    setSelectedContent(null);
  };

  const handleContentClick = (item) => {
    setSelectedContent(selectedContent?.id === item.id ? null : item);
    // Switch to list view to show details
    if (selectedContent?.id !== item.id) {
      setViewMode('list');
    }
  };

  const channelIcons = {
    instagram: Instagram,
    youtube: Youtube,
    twitter: Twitter,
    linkedin: Linkedin,
  };

  const statusColors = {
    idea: 'bg-gray-100 text-gray-700',
    draft: 'bg-blue-100 text-blue-700',
    scheduled: 'bg-purple-100 text-purple-700',
    published: 'bg-green-100 text-green-700',
  };

  // Calculate stats with proper filtering
  const scheduledCount = contentItems.filter(c => c.status === 'scheduled').length;
  const publishedCount = contentItems.filter(c => c.status === 'published').length;
  const draftCount = contentItems.filter(c => c.status === 'draft').length;
  
  console.log('Content stats:', {
    total: contentItems.length,
    scheduled: scheduledCount,
    published: publishedCount,
    draft: draftCount,
    items: contentItems.map(c => ({ id: c.id, title: c.title, status: c.status, scheduled_date: c.scheduled_date }))
  });

  return (
    <>
      <Sidebar currentPage="Content" />
      
      <div style={{
        marginLeft: '260px',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FAF5FF 0%, #F0FDF4 50%, #EFF6FF 100%)',
        padding: '32px 24px'
      }}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Content Calendar</h1>
            <p className="text-gray-600 mt-1">Plan and schedule your content across platforms</p>
          </div>
          <div className="flex gap-3">
            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 bg-white rounded-[12px] border border-gray-200">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className={`rounded-[10px] ${viewMode === 'calendar' ? 'text-white' : ''}`}
                style={viewMode === 'calendar' ? { background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' } : {}}
                aria-label="Calendar view"
              >
                <Grid className="w-4 h-4 mr-2" />
                Calendar
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`rounded-[10px] ${viewMode === 'list' ? 'text-white' : ''}`}
                style={viewMode === 'list' ? { background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' } : {}}
                aria-label="List view"
              >
                <List className="w-4 h-4 mr-2" />
                List
              </Button>
            </div>
            <Button
              onClick={() => {
                setShowForm(!showForm);
                setEditingContent(null);
                setSelectedContent(null);
              }}
              className="rounded-[14px] text-white"
              style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
              aria-label="Create new content"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Content
            </Button>
          </div>
        </div>

        {/* Content Form */}
        <AnimatePresence>
          {showForm && (
            <ContentForm
              content={editingContent}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingContent(null);
              }}
            />
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Content', value: contentItems.length, icon: CalendarIcon, gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' },
            { label: 'Scheduled', value: scheduledCount, icon: CalendarIcon, gradient: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' },
            { label: 'Published', value: publishedCount, icon: TrendingUp, gradient: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)' },
            { label: 'Drafts', value: draftCount, icon: CalendarIcon, gradient: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)' },
          ].map((stat, index) => {
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
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* Calendar View */}
        {!isLoading && viewMode === 'calendar' && (
          <ContentCalendar 
            contentItems={contentItems} 
            onContentClick={handleContentClick}
          />
        )}

        {/* List View */}
        {!isLoading && viewMode === 'list' && (
          <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
            {contentItems.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No content yet</h3>
                <p className="text-gray-600 mb-6">Start planning your content strategy</p>
                <Button 
                  onClick={() => {
                    setShowForm(true);
                    setEditingContent(null);
                  }} 
                  className="rounded-[14px] text-white" 
                  style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
                  aria-label="Create your first content"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create First Content
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {contentItems.map((item) => {
                  const ChannelIcon = channelIcons[item.channel] || CalendarIcon;
                  const isSelected = selectedContent?.id === item.id;
                  
                  return (
                    <div key={item.id}>
                      <div 
                        className="p-4 rounded-[16px] bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                        style={{ border: isSelected ? '2px solid #A78BFA' : 'none' }}
                        onClick={() => setSelectedContent(isSelected ? null : item)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}>
                              <ChannelIcon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                              {item.description && <p className="text-sm text-gray-600 mb-2">{item.description}</p>}
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span className="capitalize">{item.type.replace('_', ' ')}</span>
                                {item.scheduled_date && (
                                  <>
                                    <span>•</span>
                                    <span>📅 {format(parseISO(item.scheduled_date), 'MMM dd, yyyy h:mm a')}</span>
                                  </>
                                )}
                                {item.channel && (
                                  <>
                                    <span>•</span>
                                    <span className="capitalize">{item.channel}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-[8px] text-xs font-semibold ${statusColors[item.status]}`}>
                              {item.status}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(item);
                              }}
                              className="p-2 hover:bg-gray-200 rounded-[8px] transition-colors"
                              aria-label="Edit content"
                            >
                              <Edit2 className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* AI Publishing Tips */}
                      {isSelected && (
                        <AIPublishingTips contentItem={item} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}
      </div>
    </>
  );
}