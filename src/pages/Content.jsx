import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Calendar as CalendarIcon, Instagram, Youtube, Twitter, Linkedin, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import Sidebar from '../components/common/Sidebar';
import AIPublishingTips from '../components/content/AIPublishingTips';

export default function Content() {
  const [showForm, setShowForm] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const queryClient = useQueryClient();

  const { data: contentItems = [], isLoading } = useQuery({
    queryKey: ['content'],
    queryFn: () => base44.entities.ContentItem.list('-scheduled_date', 100),
  });

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
          <Button
            onClick={() => setShowForm(!showForm)}
            className="rounded-[14px] text-white"
            style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
          >
            <Plus className="w-5 h-5 mr-2" />
            New Content
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Content', value: contentItems.length, icon: CalendarIcon, gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' },
            { label: 'Scheduled', value: contentItems.filter(c => c.status === 'scheduled').length, icon: CalendarIcon, gradient: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' },
            { label: 'Published', value: contentItems.filter(c => c.status === 'published').length, icon: TrendingUp, gradient: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)' },
            { label: 'Drafts', value: contentItems.filter(c => c.status === 'draft').length, icon: CalendarIcon, gradient: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)' },
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

        {/* Content List */}
        <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : contentItems.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No content yet</h3>
              <p className="text-gray-600 mb-6">Start planning your content strategy</p>
              <Button onClick={() => setShowForm(true)} className="rounded-[14px] text-white" style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}>
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
                                  <span>{format(parseISO(item.scheduled_date), 'MMM dd, yyyy')}</span>
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
                        <span className={`px-3 py-1 rounded-[8px] text-xs font-semibold ${statusColors[item.status]}`}>
                          {item.status}
                        </span>
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
      </div>
    </>
  );
}