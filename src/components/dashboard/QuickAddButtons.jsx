import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Target, CheckSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuickAddButtons() {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [goalData, setGoalData] = useState({ title: '', description: '', category: 'business' });

  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setTaskTitle('');
      setShowTaskForm(false);
    }
  });

  const createGoalMutation = useMutation({
    mutationFn: (data) => base44.entities.Goal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setGoalData({ title: '', description: '', category: 'business' });
      setShowGoalForm(false);
    }
  });

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    if (taskTitle.trim()) {
      createTaskMutation.mutate({ title: taskTitle, status: 'todo', priority: 'medium' });
    }
  };

  const handleGoalSubmit = (e) => {
    e.preventDefault();
    if (goalData.title.trim()) {
      createGoalMutation.mutate(goalData);
    }
  };

  return (
    <div className="flex gap-3">
      {/* Quick Add Task Button */}
      <div className="relative">
        <Button
          onClick={() => {
            setShowTaskForm(!showTaskForm);
            setShowGoalForm(false);
          }}
          className="rounded-[14px] text-white"
          style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Quick Add Task
        </Button>

        <AnimatePresence>
          {showTaskForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 z-50"
              style={{ minWidth: '320px' }}
            >
              <Card className="p-4 rounded-[16px] shadow-2xl" style={{ background: 'white' }}>
                <form onSubmit={handleTaskSubmit} className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <CheckSquare className="w-4 h-4" />
                      New Task
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowTaskForm(false)}
                      className="p-1 hover:bg-gray-100 rounded-[8px]"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <Input
                    placeholder="Task title..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="rounded-[12px]"
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTaskForm(false)}
                      className="rounded-[8px]"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="rounded-[8px] text-white"
                      style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
                      disabled={createTaskMutation.isPending}
                    >
                      {createTaskMutation.isPending ? 'Adding...' : 'Add Task'}
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Add Goal Button */}
      <div className="relative">
        <Button
          onClick={() => {
            setShowGoalForm(!showGoalForm);
            setShowTaskForm(false);
          }}
          className="rounded-[14px] text-white"
          style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Quick Add Goal
        </Button>

        <AnimatePresence>
          {showGoalForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 z-50"
              style={{ minWidth: '320px' }}
            >
              <Card className="p-4 rounded-[16px] shadow-2xl" style={{ background: 'white' }}>
                <form onSubmit={handleGoalSubmit} className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      New Goal
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowGoalForm(false)}
                      className="p-1 hover:bg-gray-100 rounded-[8px]"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <Input
                    placeholder="Goal title..."
                    value={goalData.title}
                    onChange={(e) => setGoalData({ ...goalData, title: e.target.value })}
                    className="rounded-[12px]"
                    autoFocus
                  />
                  <Textarea
                    placeholder="Description (optional)..."
                    value={goalData.description}
                    onChange={(e) => setGoalData({ ...goalData, description: e.target.value })}
                    className="rounded-[12px] h-20"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowGoalForm(false)}
                      className="rounded-[8px]"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="rounded-[8px] text-white"
                      style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' }}
                      disabled={createGoalMutation.isPending}
                    >
                      {createGoalMutation.isPending ? 'Adding...' : 'Add Goal'}
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}