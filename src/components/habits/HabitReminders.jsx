import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HabitReminders() {
  const queryClient = useQueryClient();

  const { data: reminders = [] } = useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      const now = new Date();
      const allReminders = await base44.entities.Reminder.filter({
        type: 'habit',
        is_sent: false,
        is_dismissed: false
      });
      
      // Filter reminders due within the next hour
      return allReminders.filter(r => {
        const reminderTime = new Date(r.reminder_time);
        const diff = reminderTime - now;
        return diff > 0 && diff < 60 * 60 * 1000; // Within 1 hour
      });
    },
    refetchInterval: 60000 // Check every minute
  });

  const { data: habits = [] } = useQuery({
    queryKey: ['habits'],
    queryFn: () => base44.entities.Habit.list()
  });

  const dismissMutation = useMutation({
    mutationFn: (id) => base44.entities.Reminder.update(id, { is_dismissed: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    }
  });

  const snoozeMutation = useMutation({
    mutationFn: ({ id, snoozeMinutes }) => {
      const snoozeTime = new Date();
      snoozeTime.setMinutes(snoozeTime.getMinutes() + snoozeMinutes);
      return base44.entities.Reminder.update(id, { snoozed_until: snoozeTime.toISOString() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    }
  });

  // Create reminders for habits with reminder_time set
  useEffect(() => {
    const createHabitReminders = async () => {
      for (const habit of habits) {
        if (habit.reminder_enabled && habit.reminder_time && habit.is_active) {
          const today = new Date();
          const [hours, minutes] = habit.reminder_time.split(':');
          const reminderDateTime = new Date(today.setHours(parseInt(hours), parseInt(minutes), 0, 0));

          // Only create if reminder is in the future
          if (reminderDateTime > new Date()) {
            // Check if reminder already exists for today
            const existing = await base44.entities.Reminder.filter({
              type: 'habit',
              entity_id: habit.id,
              is_sent: false
            });

            const todayStr = today.toDateString();
            const hasToday = existing.some(r => 
              new Date(r.reminder_time).toDateString() === todayStr
            );

            if (!hasToday) {
              await base44.entities.Reminder.create({
                type: 'habit',
                entity_id: habit.id,
                title: `Time for: ${habit.name}`,
                message: `Don't forget to complete your habit: ${habit.name}`,
                reminder_time: reminderDateTime.toISOString(),
                is_recurring: habit.frequency === 'daily',
                recurrence_pattern: habit.frequency
              });
            }
          }
        }
      }
    };

    if (habits.length > 0) {
      createHabitReminders();
    }
  }, [habits]);

  if (reminders.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3" style={{ maxWidth: '400px' }}>
      <AnimatePresence>
        {reminders.map((reminder) => (
          <motion.div
            key={reminder.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <Card
              className="p-4 rounded-[16px] shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-1">{reminder.title}</h4>
                  <p className="text-sm text-white/90 mb-3">{reminder.message}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => dismissMutation.mutate(reminder.id)}
                      className="rounded-[8px] bg-white/20 hover:bg-white/30 text-white text-xs"
                    >
                      Done
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => snoozeMutation.mutate({ id: reminder.id, snoozeMinutes: 15 })}
                      className="rounded-[8px] bg-white/10 hover:bg-white/20 text-white text-xs"
                    >
                      Snooze 15m
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => dismissMutation.mutate(reminder.id)}
                  className="h-6 w-6 rounded-[8px] text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}