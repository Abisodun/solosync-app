import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function RemindersWidget({ reminders }) {
  const queryClient = useQueryClient();

  const dismissMutation = useMutation({
    mutationFn: (id) => base44.entities.Reminder.update(id, { is_dismissed: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    }
  });

  const unreadReminders = reminders.filter(r => !r.is_dismissed && !r.is_sent).slice(0, 4);

  const typeColors = {
    task: 'bg-purple-50 text-purple-700',
    habit: 'bg-green-50 text-green-700',
    goal: 'bg-blue-50 text-blue-700',
    invoice: 'bg-orange-50 text-orange-700',
    content: 'bg-pink-50 text-pink-700',
    custom: 'bg-gray-50 text-gray-700'
  };

  return (
    <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)' }}>
          <Bell className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Reminders</h3>
          <p className="text-xs text-gray-500">Your upcoming notifications</p>
        </div>
      </div>

      {unreadReminders.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">All caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {unreadReminders.map((reminder, index) => (
            <motion.div
              key={reminder.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 rounded-[12px] bg-gray-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-[6px] text-xs font-medium ${typeColors[reminder.type]}`}>
                      {reminder.type}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm mb-1">{reminder.title}</h4>
                  <p className="text-xs text-gray-600">{reminder.message}</p>
                  {reminder.reminder_time && (
                    <p className="text-xs text-gray-500 mt-1">
                      {format(parseISO(reminder.reminder_time), 'MMM dd, h:mm a')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => dismissMutation.mutate(reminder.id)}
                  className="p-1 hover:bg-gray-200 rounded-[6px] transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
}