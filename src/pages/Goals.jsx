import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Target, Trophy, Pause, Play, CheckCircle2, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function Goals() {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'business',
    target_date: '',
    progress: 0,
    status: 'active',
    milestones: []
  });
  const [newMilestone, setNewMilestone] = useState('');

  const queryClient = useQueryClient();

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list('-created_date', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Goal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Goal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Goal.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] })
  });

  const resetForm = () => {
    setFormData({ title: '', description: '', category: 'business', target_date: '', progress: 0, status: 'active', milestones: [] });
    setEditingGoal(null);
    setShowForm(false);
    setNewMilestone('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingGoal) {
      updateMutation.mutate({ id: editingGoal.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({ ...goal });
    setShowForm(true);
  };

  const addMilestone = () => {
    if (newMilestone.trim()) {
      setFormData({
        ...formData,
        milestones: [...(formData.milestones || []), { title: newMilestone, completed: false }]
      });
      setNewMilestone('');
    }
  };

  const toggleMilestone = (index) => {
    const updatedMilestones = [...formData.milestones];
    updatedMilestones[index].completed = !updatedMilestones[index].completed;
    setFormData({ ...formData, milestones: updatedMilestones });
  };

  const categoryColors = {
    business: { bg: 'bg-purple-100', text: 'text-purple-700', gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' },
    personal: { bg: 'bg-blue-100', text: 'text-blue-700', gradient: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' },
    health: { bg: 'bg-green-100', text: 'text-green-700', gradient: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)' },
    learning: { bg: 'bg-yellow-100', text: 'text-yellow-700', gradient: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)' },
    financial: { bg: 'bg-emerald-100', text: 'text-emerald-700', gradient: 'linear-gradient(135deg, #34D399 0%, #059669 100%)' }
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Goal Tracker</h1>
          <p className="text-gray-600 mt-1">Set and achieve your goals</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="rounded-[14px] text-white"
          style={{ background: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)' }}
        >
          <Plus className="w-5 h-5 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)' }}>
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">{activeGoals.length}</div>
              <div className="text-sm text-gray-600">Active Goals</div>
            </div>
          </div>
        </Card>
        <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)' }}>
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">{completedGoals.length}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </Card>
        <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' }}>
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-800">
                {activeGoals.length > 0 ? Math.round(activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length) : 0}%
              </div>
              <div className="text-sm text-gray-600">Avg Progress</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Goal Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8">
            <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
              <h3 className="text-xl font-bold text-gray-800 mb-4">{editingGoal ? 'Edit Goal' : 'Create New Goal'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input placeholder="Goal title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="rounded-[12px]" />
                <Textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="rounded-[12px] h-24" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="rounded-[12px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="date" value={formData.target_date} onChange={(e) => setFormData({ ...formData, target_date: e.target.value })} className="rounded-[12px]" />
                  <Input type="number" min="0" max="100" placeholder="Progress %" value={formData.progress} onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })} className="rounded-[12px]" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Milestones</label>
                  <div className="flex gap-2 mb-3">
                    <Input placeholder="Add milestone" value={newMilestone} onChange={(e) => setNewMilestone(e.target.value)} className="rounded-[12px]" />
                    <Button type="button" onClick={addMilestone} className="rounded-[12px]">Add</Button>
                  </div>
                  <div className="space-y-2">
                    {formData.milestones?.map((m, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-[10px]">
                        <input type="checkbox" checked={m.completed} onChange={() => toggleMilestone(i)} className="rounded" />
                        <span className={m.completed ? 'line-through text-gray-500' : 'text-gray-700'}>{m.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={resetForm} className="rounded-[12px]">Cancel</Button>
                  <Button type="submit" className="rounded-[12px] text-white" style={{ background: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)' }}>
                    {editingGoal ? 'Update' : 'Create'} Goal
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals List */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Active Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeGoals.map((goal) => {
              const colors = categoryColors[goal.category];
              return (
                <motion.div key={goal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0" style={{ background: colors.gradient }}>
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 text-lg">{goal.title}</h3>
                          {goal.description && <p className="text-sm text-gray-600 mt-1">{goal.description}</p>}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-1 rounded-[8px] text-xs font-medium ${colors.bg} ${colors.text}`}>{goal.category}</span>
                            {goal.target_date && <span className="text-xs text-gray-500">Due: {format(new Date(goal.target_date), 'MMM d, yyyy')}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(goal)} className="p-2 hover:bg-gray-100 rounded-[10px]">
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button onClick={() => deleteMutation.mutate(goal.id)} className="p-2 hover:bg-gray-100 rounded-[10px]">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-bold text-purple-600">{goal.progress}%</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${goal.progress}%`, background: colors.gradient }} />
                      </div>
                    </div>
                    {goal.milestones && goal.milestones.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-sm font-semibold text-gray-700">Milestones</span>
                        {goal.milestones.map((m, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            {m.completed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                            <span className={m.completed ? 'line-through text-gray-500' : 'text-gray-700'}>{m.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {completedGoals.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Completed Goals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedGoals.map((goal) => {
                const colors = categoryColors[goal.category];
                return (
                  <Card key={goal.id} className="p-6 rounded-[20px] opacity-75" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
                    <h3 className="font-bold text-gray-800">{goal.title}</h3>
                    <span className={`inline-block px-2 py-1 rounded-[8px] text-xs font-medium mt-2 ${colors.bg} ${colors.text}`}>{goal.category}</span>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}