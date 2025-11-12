import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Instagram, Youtube, Twitter, Linkedin } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, addMonths, subMonths, startOfWeek, endOfWeek, isValid } from 'date-fns';
import { motion } from 'framer-motion';

export default function ContentCalendar({ contentItems, onContentClick }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const channelIcons = {
    instagram: Instagram,
    youtube: Youtube,
    twitter: Twitter,
    linkedin: Linkedin,
  };

  const getContentForDay = (day) => {
    // Normalize the day to start of day in local timezone
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayContent = contentItems.filter(item => {
      if (!item.scheduled_date) {
        return false;
      }
      
      try {
        // Parse the scheduled date
        let itemDate;
        
        if (item.scheduled_date instanceof Date) {
          itemDate = item.scheduled_date;
        } else if (typeof item.scheduled_date === 'string') {
          itemDate = new Date(item.scheduled_date);
        } else {
          console.warn('⚠️ Invalid date format:', item.scheduled_date);
          return false;
        }
        
        // Check if date is valid
        if (!isValid(itemDate) || isNaN(itemDate.getTime())) {
          console.warn('⚠️ Invalid date:', item.scheduled_date);
          return false;
        }
        
        // Normalize item date to start of day
        const itemDateStart = new Date(itemDate);
        itemDateStart.setHours(0, 0, 0, 0);
        
        // Compare year, month, and day
        const match = itemDateStart.getTime() === dayStart.getTime();
        
        // Debug logging for November 2025
        if (dayStart.getMonth() === 10 && dayStart.getFullYear() === 2025) {
          console.log('🔍 Checking Nov 2025 day:', {
            day: format(dayStart, 'MMM dd, yyyy'),
            itemTitle: item.title,
            itemDate: item.scheduled_date,
            parsedItemDate: format(itemDate, 'MMM dd, yyyy HH:mm'),
            match: match
          });
        }
        
        if (match) {
          console.log('✅ MATCH FOUND:', {
            title: item.title,
            scheduled_date: item.scheduled_date,
            day: format(dayStart, 'MMM dd, yyyy'),
            status: item.status
          });
        }
        
        return match;
      } catch (error) {
        console.error('❌ Error parsing date:', {
          title: item.title,
          scheduled_date: item.scheduled_date,
          error: error.message
        });
        return false;
      }
    });
    
    return dayContent;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const statusColors = {
    idea: 'bg-gray-100 border-gray-300',
    draft: 'bg-blue-100 border-blue-300',
    scheduled: 'bg-purple-100 border-purple-300',
    published: 'bg-green-100 border-green-300',
  };

  // Debug log - detailed
  console.log('📅 === CALENDAR RENDERING ===');
  console.log('Current Month:', format(currentMonth, 'MMMM yyyy'));
  console.log('Total Content Items:', contentItems.length);
  console.log('Items with scheduled_date:', contentItems.filter(c => c.scheduled_date).length);
  
  // Log all scheduled items with parsed dates
  const scheduledItems = contentItems.filter(c => c.scheduled_date);
  console.log('📋 All scheduled content:');
  scheduledItems.forEach(item => {
    try {
      const parsed = new Date(item.scheduled_date);
      console.log(`  - "${item.title}": ${item.scheduled_date} → ${format(parsed, 'MMM dd, yyyy HH:mm')} (${item.status})`);
    } catch (error) {
      console.log(`  - "${item.title}": ${item.scheduled_date} → PARSE ERROR`);
    }
  });
  console.log('=========================');

  return (
    <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {contentItems.filter(c => c.scheduled_date).length} scheduled posts total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="rounded-[10px]"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousMonth}
            className="rounded-[10px]"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            className="rounded-[10px]"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          const dayContent = getContentForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          return (
            <motion.div
              key={day.toString()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.005 }}
              className={`min-h-[100px] p-2 rounded-[12px] border-2 transition-all ${
                isCurrentMonth ? 'bg-white' : 'bg-gray-50'
              } ${isToday ? 'border-purple-400 bg-purple-50' : 'border-gray-200'}`}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-sm font-semibold ${
                    isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                  } ${isToday ? 'text-purple-600' : ''}`}
                >
                  {format(day, 'd')}
                </span>
                {dayContent.length > 0 && (
                  <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                    {dayContent.length}
                  </span>
                )}
              </div>

              {/* Content Items */}
              <div className="space-y-1">
                {dayContent.slice(0, 3).map((item) => {
                  const ChannelIcon = channelIcons[item.channel] || CalendarIcon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onContentClick?.(item)}
                      className={`w-full text-left p-1.5 rounded-[8px] border ${statusColors[item.status]} hover:shadow-md transition-all cursor-pointer`}
                    >
                      <div className="flex items-start gap-1">
                        <ChannelIcon className="w-3 h-3 mt-0.5 text-gray-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate" title={item.title}>
                            {item.title}
                          </p>
                          {item.scheduled_date && (
                            <p className="text-[10px] text-gray-500">
                              {(() => {
                                try {
                                  const date = typeof item.scheduled_date === 'string' 
                                    ? parseISO(item.scheduled_date) 
                                    : item.scheduled_date;
                                  return format(date, 'h:mm a');
                                } catch (error) {
                                  console.error('Error formatting time:', error);
                                  return '';
                                }
                              })()}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
                {dayContent.length > 3 && (
                  <div className="text-[10px] text-center text-purple-600 font-semibold mt-1">
                    +{dayContent.length - 3} more
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-gray-200">
        <span className="text-sm text-gray-600 font-semibold">Status:</span>
        {Object.entries(statusColors).map(([status, colors]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded border ${colors}`}></div>
            <span className="text-xs text-gray-600 capitalize">{status}</span>
          </div>
        ))}
      </div>

      {/* Debug Info Panel */}
      <div className="mt-4 p-4 bg-blue-50 rounded-[12px] border border-blue-200">
        <p className="text-xs font-semibold text-blue-800 mb-2">Debug Info:</p>
        <div className="space-y-1 text-xs text-blue-700">
          <p>Total scheduled posts: {contentItems.filter(c => c.scheduled_date).length}</p>
          {contentItems.filter(c => c.scheduled_date).length > 0 && (
            <>
              <p className="font-semibold mt-2">Scheduled dates:</p>
              {contentItems.filter(c => c.scheduled_date).slice(0, 10).map((item, idx) => {
                try {
                  const date = new Date(item.scheduled_date);
                  return (
                    <p key={idx} className="ml-2">
                      • {item.title.substring(0, 40)}... → {format(date, 'MMM dd, yyyy HH:mm')}
                    </p>
                  );
                } catch (error) {
                  return (
                    <p key={idx} className="ml-2 text-red-600">
                      • {item.title.substring(0, 40)}... → Invalid date: {item.scheduled_date}
                    </p>
                  );
                }
              })}
            </>
          )}
          {contentItems.filter(c => c.scheduled_date).length === 0 && (
            <p className="text-yellow-700">No scheduled content found. Create a post with a scheduled date.</p>
          )}
        </div>
      </div>
    </Card>
  );
}