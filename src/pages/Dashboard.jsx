import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { CheckSquare, Target, DollarSign, Calendar, Heart, TrendingUp, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from '../components/common/Sidebar';
import SubscriptionBanner from '../components/subscription/SubscriptionBanner';
import QuickAddButtons from '../components/dashboard/QuickAddButtons';
import UpcomingTasksWidget from '../components/dashboard/UpcomingTasksWidget';
import RemindersWidget from '../components/dashboard/RemindersWidget';
import ContentCalendarWidget from '../components/dashboard/ContentCalendarWidget';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [aiTip, setAiTip] = useState('');
  const [loadingTip, setLoadingTip] = useState(true);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (!currentUser.onboarding_completed) {
        window.location.href = '/onboarding';
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-created_date', 100)
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list('-created_date', 100)
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-date', 100)
  });

  const { data: habits = [] } = useQuery({
    queryKey: ['habits'],
    queryFn: () => base44.entities.Habit.list('-created_date', 100)
  });

  const { data: contentItems = [] } = useQuery({
    queryKey: ['content'],
    queryFn: () => base44.entities.ContentItem.list('-scheduled_date', 100)
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date', 100)
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => base44.entities.Reminder.list('-reminder_time', 100)
  });

  // Generate AI Productivity Tip
  useEffect(() => {
    const generateTip = async () => {
      try {
        setLoadingTip(true);
        const activeTasks = tasks.filter(t => t.status !== 'done').length;
        const activeGoals = goals.filter(g => g.status === 'active').length;
        const completedToday = tasks.filter(t => 
          t.status === 'done' && 
          new Date(t.updated_date).toDateString() === new Date().toDateString()
        ).length;

        const prompt = `You are a productivity coach. Based on this user's data:
- Active tasks: ${activeTasks}
- Active goals: ${activeGoals}
- Tasks completed today: ${completedToday}
- Active habits: ${habits.filter(h => h.is_active).length}

Generate ONE short, actionable productivity tip (max 20 words) to help them stay focused and productive today. Be encouraging and specific.`;

        const response = await base44.integrations.Core.InvokeLLM({
          prompt,
          add_context_from_internet: false
        });

        setAiTip(response);
      } catch (error) {
        console.error('Error generating AI tip:', error);
        setAiTip('Focus on your top 3 priorities today. Small wins lead to big progress! 🚀');
      } finally {
        setLoadingTip(false);
      }
    };

    if (tasks.length > 0 || goals.length > 0) {
      generateTip();
    } else {
      setLoadingTip(false);
    }
  }, [tasks, goals, habits]);

  // Get dashboard preferences (with defaults)
  const preferences = user?.dashboard_preferences || {
    show_upcoming_tasks: true,
    show_recent_tasks: true,
    show_active_goals: true,
    show_active_habits: true,
    show_content_calendar: true,
    show_reminders: true,
    show_stats: true,
    show_ai_tip: true,
    show_projects: true
  };

  // Calculate stats
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  
  const thisMonthTransactions = transactions.filter(t => {
    const transDate = new Date(t.date);
    const now = new Date();
    return transDate.getMonth() === now.getMonth() && transDate.getFullYear() === now.getFullYear();
  });
  
  const income = thisMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = thisMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const activeTasks = tasks.filter(t => t.status !== 'done');
  const activeHabits = habits.filter(h => h.is_active);
  const totalStreak = activeHabits.reduce((sum, h) => sum + (h.current_streak || 0), 0);

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '2px solid #9333ea', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <>
      <Sidebar currentPage="Dashboard" />
      
      <div style={{
        marginLeft: '260px',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FAF5FF 0%, #F0FDF4 50%, #EFF6FF 100%)',
        padding: '32px 24px'
      }}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Welcome back, {user.full_name?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p className="text-gray-600 mt-1 capitalize">
                {user.user_type || 'Professional'} Dashboard
              </p>
            </div>
            <QuickAddButtons />
          </div>

          {/* Subscription Banner */}
          {showBanner && <SubscriptionBanner user={user} onDismiss={() => setShowBanner(false)} />}
        </div>

        {/* AI Productivity Tip */}
        {preferences.show_ai_tip && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="p-6 rounded-[20px]" style={{ background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(147, 197, 253, 0.1) 100%)' }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}>
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">💡 AI Productivity Tip</h3>
                  {loadingTip ? (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                      <span>Generating your personalized tip...</span>
                    </div>
                  ) : (
                    <p className="text-gray-700">{aiTip}</p>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Stats Grid */}
        {preferences.show_stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Active Tasks', value: activeTasks.length, total: tasks.length, icon: CheckSquare, gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' },
              { label: 'Active Goals', value: activeGoals, total: goals.length, icon: Target, gradient: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' },
              { label: 'Active Projects', value: activeProjects, total: projects.length, icon: Briefcase, gradient: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)' },
              { label: 'Income (Month)', value: `$${income.toFixed(0)}`, total: `Expenses: $${expenses.toFixed(0)}`, icon: DollarSign, gradient: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)' },
              { label: 'Content Items', value: contentItems.length, total: `${contentItems.filter(c => c.status === 'scheduled').length} scheduled`, icon: Calendar, gradient: 'linear-gradient(135deg, #F9A8D4 0%, #EC4899 100%)' },
              { label: 'Active Habits', value: activeHabits.length, total: `${totalStreak} total streak`, icon: Heart, gradient: 'linear-gradient(135deg, #FCA5A5 0%, #EF4444 100%)' }
            ].slice(0, preferences.show_projects ? 6 : 5).map((stat, index) => {
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
                    <div className="text-xs text-gray-500 mt-1">{stat.total}</div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Upcoming Tasks Widget */}
          {preferences.show_upcoming_tasks && (
            <UpcomingTasksWidget tasks={tasks} />
          )}

          {/* Reminders Widget */}
          {preferences.show_reminders && (
            <RemindersWidget reminders={reminders} />
          )}

          {/* Content Calendar Widget */}
          {preferences.show_content_calendar && (
            <ContentCalendarWidget contentItems={contentItems} />
          )}

          {/* Active Goals */}
          {preferences.show_active_goals && (
            <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' }}>
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Active Goals</h3>
                  <p className="text-xs text-gray-500">Track your progress</p>
                </div>
              </div>
              <div className="space-y-3">
                {goals.filter(g => g.status === 'active').slice(0, 3).map((goal) => (
                  <div key={goal.id} className="p-3 rounded-[12px] bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800 text-sm">{goal.title}</h4>
                      <span className="text-xs font-bold text-blue-600">{goal.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${goal.progress || 0}%`,
                          background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
                {goals.filter(g => g.status === 'active').length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No active goals yet</p>
                )}
              </div>
            </Card>
          )}

          {/* Active Habits */}
          {preferences.show_active_habits && (
            <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FCA5A5 0%, #EF4444 100%)' }}>
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Active Habits</h3>
                  <p className="text-xs text-gray-500">Build consistency</p>
                </div>
              </div>
              <div className="space-y-3">
                {activeHabits.slice(0, 4).map((habit) => (
                  <div key={habit.id} className="p-3 rounded-[12px] bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm">{habit.name}</h4>
                        <p className="text-xs text-gray-500 capitalize">{habit.frequency}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-orange-600">{habit.current_streak || 0}</div>
                        <div className="text-xs text-gray-500">day streak</div>
                      </div>
                    </div>
                  </div>
                ))}
                {activeHabits.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No active habits yet</p>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Recent Tasks (if enabled) */}
        {preferences.show_recent_tasks && (
          <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Tasks</h3>
            <div className="space-y-3">
              {activeTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-[12px] bg-gray-50">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm">{task.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-[6px] text-xs font-medium ${
                        task.status === 'todo' ? 'bg-gray-200 text-gray-700' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded-[6px] text-xs font-medium ${
                        task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {activeTasks.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No active tasks</p>
              )}
            </div>
          </Card>
        )}
      </div>
    </>
  );
}