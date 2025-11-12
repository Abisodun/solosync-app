import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Heart, Flame, Calendar, Award, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/common/Sidebar';
import HabitForm from '../components/habits/HabitForm';
import { format, parseISO } from 'date-fns';

export default function Habits() {
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const queryClient = useQueryClient();

  const { data: habits = [], isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: () => base44.entities.Habit.list('-created_date', 100),
  });

  const createHabitMutation = useMutation({
    mutationFn: (data) => base44.entities.Habit.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      setShowForm(false);
      setEditingHabit(null);
    }
  });

  const updateHabitMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Habit.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      setShowForm(false);
      setEditingHabit(null);
    }
  });

  const completeHabitMutation = useMutation({
    mutationFn: async (habit) => {
      const today = new Date().toISOString();
      const lastCompleted = habit.last_completed_date ? new Date(habit.last_completed_date) : null;
      const isConsecutive = lastCompleted && 
        (new Date().getTime() - new Date(lastCompleted).getTime()) < (48 * 60 * 60 * 1000);
      
      const newStreak = isConsecutive ? (habit.current_streak || 0) + 1 : 1;
      const newBestStreak = Math.max(newStreak, habit.best_streak || 0);
      
      return base44.entities.Habit.update(habit.id, {
        last_completed_date: today,
        current_streak: newStreak,
        best_streak: newBestStreak,
        total_completions: (habit.total_completions || 0) + 1,
        completion_dates: [...(habit.completion_dates || []), today]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    }
  });

  const handleSubmit = (data) => {
    if (editingHabit) {
      updateHabitMutation.mutate({ id: editingHabit.id, data });
    } else {
      createHabitMutation.mutate(data);
    }
  };

  const handleEdit = (habit) => {
    setEditingHabit(habit);
    setShowForm(true);
  };

  const handleComplete = (habit) => {
    completeHabitMutation.mutate(habit);
  };

  const activeHabits = habits.filter(h => h.is_active);
  const totalStreak = habits.reduce((sum, h) => sum + (h.current_streak || 0), 0);
  const bestStreak = Math.max(...habits.map(h => h.best_streak || 0), 0);
  const totalCompletions = habits.reduce((sum, h) => sum + (h.total_completions || 0), 0);

  const categoryColors = {
    health: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)',
    productivity: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
    learning: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)',
    creativity: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)',
    relationships: 'linear-gradient(135deg, #FCA5A5 0%, #EF4444 100%)',
    finance: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
  };

  const wasCompletedToday = (habit) => {
    if (!habit.last_completed_date) return false;
    const lastCompleted = new Date(habit.last_completed_date);
    const today = new Date();
    return lastCompleted.toDateString() === today.toDateString();
  };

  return (
    <>
      <Sidebar currentPage="Habits" />
      
      <div style={{
        marginLeft: '260px',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FAF5FF 0%, #F0FDF4 50%, #EFF6FF 100%)',
        padding: '32px 24px'
      }}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Habit Tracker</h1>
            <p className="text-gray-600 mt-1">Build consistency and track your daily routines</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingHabit(null);
            }}
            className="rounded-[14px] text-white"
            style={{ background: 'linear-gradient(135deg, #FCA5A5 0%, #EF4444 100%)' }}
            aria-label="Create new habit"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Habit
          </Button>
        </div>

        {/* Habit Form */}
        <AnimatePresence>
          {showForm && (
            <HabitForm
              habit={editingHabit}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingHabit(null);
              }}
            />
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Active Habits', value: activeHabits.length, icon: Heart, gradient: 'linear-gradient(135deg, #FCA5A5 0%, #EF4444 100%)' },
            { label: 'Total Streaks', value: totalStreak, icon: Flame, gradient: 'linear-gradient(135deg, #F59E0B 0%, #FB923C 100%)' },
            { label: 'Best Streak', value: bestStreak, icon: Award, gradient: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)' },
            { label: 'Completions', value: totalCompletions, icon: CheckCircle2, gradient: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' },
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

        {/* Habits List */}
        <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : habits.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No habits yet</h3>
              <p className="text-gray-600 mb-6">Start building positive routines today</p>
              <Button 
                onClick={() => {
                  setShowForm(true);
                  setEditingHabit(null);
                }} 
                className="rounded-[14px] text-white" 
                style={{ background: 'linear-gradient(135deg, #FCA5A5 0%, #EF4444 100%)' }}
                aria-label="Create your first habit"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create First Habit
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {habits.map((habit) => {
                const completedToday = wasCompletedToday(habit);
                return (
                  <div 
                    key={habit.id} 
                    className="p-6 rounded-[16px] bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => handleEdit(habit)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-[14px] flex items-center justify-center" style={{ background: categoryColors[habit.category] || categoryColors.productivity }}>
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex gap-2">
                        {habit.is_active && (
                          <span className="px-3 py-1 rounded-[8px] bg-green-100 text-green-700 text-xs font-semibold">
                            Active
                          </span>
                        )}
                        {completedToday && (
                          <span className="px-3 py-1 rounded-[8px] bg-blue-100 text-blue-700 text-xs font-semibold">
                            ✓ Today
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">{habit.name}</h3>
                    {habit.description && <p className="text-sm text-gray-600 mb-4">{habit.description}</p>}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Current Streak</span>
                        <div className="flex items-center gap-1 font-bold text-orange-600">
                          <Flame className="w-4 h-4" />
                          {habit.current_streak || 0} days
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Best Streak</span>
                        <div className="flex items-center gap-1 font-bold text-green-600">
                          <Award className="w-4 h-4" />
                          {habit.best_streak || 0} days
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Frequency</span>
                        <span className="font-medium text-gray-800 capitalize">{habit.frequency}</span>
                      </div>
                    </div>
                    {!completedToday && habit.is_active && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleComplete(habit);
                        }}
                        className="w-full rounded-[12px] text-white"
                        style={{ background: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)' }}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark Complete
                      </Button>
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