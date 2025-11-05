
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle2, Target, DollarSign, TrendingUp, Calendar, Sparkles, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createPageUrl } from '@/utils';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [aiTip, setAiTip] = useState('');
  const [loadingTip, setLoadingTip] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // If not onboarded, redirect to onboarding
      if (!currentUser.onboarded) {
        window.location.href = createPageUrl('Onboarding');
      }
    } catch (error) {
      console.error('Error loading user:', error);
      // Redirect to login if not authenticated
      base44.auth.redirectToLogin();
    }
  };

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-created_date', 100),
    enabled: !!user
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list('-created_date', 100),
    enabled: !!user
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-date', 100),
    enabled: !!user
  });

  const { data: habits = [] } = useQuery({
    queryKey: ['habits'],
    queryFn: () => base44.entities.Habit.list('-created_date', 50),
    enabled: !!user
  });

  const { data: contentItems = [] } = useQuery({
    queryKey: ['content'],
    queryFn: () => base44.entities.ContentItem.list('-scheduled_date', 50),
    enabled: !!user
  });

  useEffect(() => {
    if (user && tasks.length > 0) { // Only generate tip if user and tasks data is available
      generateAITip();
    }
  }, [user, tasks]);

  const generateAITip = async () => {
    setLoadingTip(true);
    try {
      const urgentTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;
      const completedToday = tasks.filter(t => 
        t.status === 'done' && 
        new Date(t.updated_date).toDateString() === new Date().toDateString()
      ).length;

      const prompt = `You are a productivity coach. Based on this data:
- User type: ${user.user_type || 'professional'}
- Urgent tasks: ${urgentTasks}
- Tasks completed today: ${completedToday}
- Total active tasks: ${tasks.filter(t => t.status !== 'done').length}
- Active goals: ${goals.filter(g => g.status === 'active').length}

Provide ONE concise, actionable productivity tip (max 2 sentences) tailored to their situation.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      setAiTip(result || "Focus on your high-priority tasks first to maximize productivity.");
    } catch (error) {
      console.error('Error generating tip:', error);
      setAiTip("Break large tasks into smaller steps for better progress tracking.");
    }
    setLoadingTip(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const roleInfo = {
    freelancer: { emoji: '💼', title: 'Freelancer' },
    creator: { emoji: '🎨', title: 'Creator' },
    small_business: { emoji: '🏪', title: 'Business Owner' }
  };

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const urgentTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const upcomingContent = contentItems.filter(c => c.status === 'scheduled').length;
  const activeHabits = habits.filter(h => h.is_active).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF5FF] via-[#F0FDF4] to-[#EFF6FF]">
      {/* Header */}
      <div className="border-b border-purple-100 bg-white/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-[14px] flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
                boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)'
              }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SoloSync
              </h1>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => base44.auth.logout()}
            className="rounded-[14px]"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user.full_name || 'there'}! 👋
          </h2>
          <p className="text-lg text-gray-600">
            {roleInfo[user.user_type]?.emoji} {roleInfo[user.user_type]?.title} • Here's your workspace overview
          </p>
        </motion.div>

        {/* AI-Powered Tip */}
        {(aiTip || loadingTip) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card
              className="p-6 rounded-[20px]"
              style={{
                background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(147, 197, 253, 0.1) 100%)',
                boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)'
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)'
                  }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">💡 AI Productivity Tip</h3>
                  <p className="text-gray-700">{loadingTip ? 'Generating personalized tip...' : aiTip}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card
              className="p-6 rounded-[20px]"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)'
                  }}
                >
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                {urgentTasks > 0 && (
                  <div className="px-2 py-1 rounded-[8px] bg-red-100 text-red-700 text-xs font-bold">
                    {urgentTasks} urgent
                  </div>
                )}
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{completedTasks}/{tasks.length}</div>
              <div className="text-sm text-gray-600">Tasks Completed</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card
              className="p-6 rounded-[20px]"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 8px 32px rgba(244, 114, 182, 0.15)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)'
                  }}
                >
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{activeGoals}</div>
              <div className="text-sm text-gray-600">Active Goals</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card
              className="p-6 rounded-[20px]"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 8px 32px rgba(134, 239, 172, 0.15)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)'
                  }}
                >
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">${totalIncome.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Income</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card
              className="p-6 rounded-[20px]"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 8px 32px rgba(147, 197, 253, 0.15)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)'
                  }}
                >
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{upcomingContent}</div>
              <div className="text-sm text-gray-600">Upcoming Content</div>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card
              className="p-6 rounded-[20px]"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)'
              }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Tasks</h3>
              <div className="space-y-3">
                {tasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-4 rounded-[14px] bg-gray-50"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        task.status === 'done' ? 'bg-green-500' :
                        task.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400'
                      }`}
                    />
                    <div className="flex-1">
                      <div className={`font-medium ${task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {task.title}
                      </div>
                      {task.project && (
                        <div className="text-xs text-gray-500">{task.project}</div>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded-[8px] text-xs font-medium ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {task.priority}
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No tasks yet. Create your first task!
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Goals & Habits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <Card
              className="p-6 rounded-[20px]"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)'
              }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Active Goals</h3>
              <div className="space-y-4">
                {goals.filter(g => g.status === 'active').slice(0, 3).map((goal) => (
                  <div key={goal.id}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-gray-800 text-sm">{goal.title}</div>
                      <div className="text-xs text-purple-600 font-bold">{goal.progress}%</div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${goal.progress}%`,
                          background: 'linear-gradient(90deg, #A78BFA 0%, #8B5CF6 100%)'
                        }}
                      />
                    </div>
                  </div>
                ))}
                {goals.filter(g => g.status === 'active').length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Set your first goal!
                  </div>
                )}
              </div>
            </Card>

            <Card
              className="p-6 rounded-[20px]"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)'
              }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Active Habits</h3>
              <div className="space-y-3">
                {habits.filter(h => h.is_active).slice(0, 3).map((habit) => (
                  <div key={habit.id} className="flex items-center justify-between p-3 rounded-[12px] bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FCA5A5 0%, #EF4444 100%)' }}>
                        <span className="text-white text-lg">🔥</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 text-sm">{habit.name}</div>
                        <div className="text-xs text-gray-500">{habit.current_streak} day streak</div>
                      </div>
                    </div>
                  </div>
                ))}
                {habits.filter(h => h.is_active).length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">Start tracking habits!</div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
