import React from 'react';
import { Card } from "@/components/ui/card";
import { Calendar, TrendingUp, Instagram, Youtube, Twitter, Linkedin } from 'lucide-react';
import { format, parseISO, isThisWeek, isFuture } from 'date-fns';
import { motion } from 'framer-motion';

export default function ContentCalendarWidget({ contentItems }) {
  const upcomingContent = contentItems
    .filter(item => item.scheduled_date && isFuture(parseISO(item.scheduled_date)) && item.status !== 'published')
    .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
    .slice(0, 5);

  const channelIcons = {
    instagram: Instagram,
    youtube: Youtube,
    twitter: Twitter,
    linkedin: Linkedin
  };

  const channelColors = {
    instagram: 'bg-pink-100 text-pink-700',
    youtube: 'bg-red-100 text-red-700',
    twitter: 'bg-blue-100 text-blue-700',
    linkedin: 'bg-indigo-100 text-indigo-700',
    website: 'bg-purple-100 text-purple-700',
    email: 'bg-green-100 text-green-700'
  };

  return (
    <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F9A8D4 0%, #EC4899 100%)' }}>
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Content Calendar</h3>
          <p className="text-xs text-gray-500">Upcoming scheduled content</p>
        </div>
      </div>

      {upcomingContent.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No content scheduled</p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingContent.map((item, index) => {
            const ChannelIcon = channelIcons[item.channel] || Calendar;
            const isThisWeekContent = isThisWeek(parseISO(item.scheduled_date));

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-[12px] ${isThisWeekContent ? 'bg-purple-50' : 'bg-gray-50'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center ${channelColors[item.channel] || 'bg-gray-100 text-gray-700'}`}>
                    <ChannelIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm mb-1">{item.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="capitalize">{item.type.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{format(parseISO(item.scheduled_date), 'MMM dd, h:mm a')}</span>
                    </div>
                    {item.engagement_prediction && (
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600 capitalize">
                          {item.engagement_prediction} engagement
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </Card>
  );
}