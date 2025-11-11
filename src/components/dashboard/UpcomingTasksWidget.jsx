import React from 'react';
import { Card } from "@/components/ui/card";
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';
import { motion } from 'framer-motion';

export default function UpcomingTasksWidget({ tasks }) {
  const upcomingTasks = tasks
    .filter(task => task.due_date && task.status !== 'done')
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

  const getTaskUrgency = (dueDate) => {
    const date = parseISO(dueDate);
    if (isPast(date) && !isToday(date)) return 'overdue';
    if (isToday(date)) return 'today';
    if (isTomorrow(date)) return 'tomorrow';
    return 'upcoming';
  };

  const urgencyConfig = {
    overdue: { color: 'text-red-600', bgColor: 'bg-red-50', icon: AlertCircle, label: 'Overdue' },
    today: { color: 'text-orange-600', bgColor: 'bg-orange-50', icon: Clock, label: 'Today' },
    tomorrow: { color: 'text-blue-600', bgColor: 'bg-blue-50', icon: Clock, label: 'Tomorrow' },
    upcoming: { color: 'text-gray-600', bgColor: 'bg-gray-50', icon: Clock, label: 'Upcoming' }
  };

  return (
    <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FCA5A5 0%, #EF4444 100%)' }}>
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Upcoming Deadlines</h3>
          <p className="text-xs text-gray-500">Tasks due soon</p>
        </div>
      </div>

      {upcomingTasks.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No upcoming deadlines!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingTasks.map((task, index) => {
            const urgency = getTaskUrgency(task.due_date);
            const config = urgencyConfig[urgency];
            const Icon = config.icon;

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-[12px] ${config.bgColor}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm mb-1">{task.title}</h4>
                    <div className="flex items-center gap-2 text-xs">
                      <Icon className={`w-3 h-3 ${config.color}`} />
                      <span className={config.color}>
                        {config.label} • {format(parseISO(task.due_date), 'MMM dd, h:mm a')}
                      </span>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-[6px] text-xs font-medium ${
                    task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    task.priority === 'high' ? 'bg-orange-100 text-orange-700' : 
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {task.priority}
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