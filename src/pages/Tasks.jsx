import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CheckCircle2, Circle, Clock, Edit2, Trash2, Filter, GripVertical, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Sidebar from '../components/common/Sidebar';
import QuickAddTask from '../components/tasks/QuickAddTask';

export default function TasksPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
    project: '',
    tags: []
  });
  const [filters, setFilters] = useState({ status: 'all', priority: 'all' });

  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-created_date', 200)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  });

  const prioritizeMutation = useMutation({
    mutationFn: () => base44.functions.invoke('aiTaskPrioritization'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const resetForm = () => {
    setFormData({ title: '', description: '', status: 'todo', priority: 'medium', due_date: '', project: '', tags: [] });
    setEditingTask(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({ ...task });
    setShowForm(true);
  };

  const handleStatusToggle = (task) => {
    const newStatus = task.status === 'done' ? 'todo' : task.status === 'todo' ? 'in_progress' : 'done';
    updateMutation.mutate({ id: task.id, data: { ...task, status: newStatus } });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    if (source.droppableId === destination.droppableId) return;

    const task = tasks.find(t => t.id === result.draggableId);
    if (task) {
      updateMutation.mutate({
        id: task.id,
        data: { ...task, status: destination.droppableId }
      });
    }
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filters.status === 'all' || task.status === filters.status;
    const priorityMatch = filters.priority === 'all' || task.priority === filters.priority;
    return statusMatch && priorityMatch;
  });

  const tasksByStatus = {
    todo: filteredTasks.filter(t => t.status === 'todo'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    done: filteredTasks.filter(t => t.status === 'done')
  };

  return (
    <>
      <Sidebar currentPage="Tasks" />
      
      <div style={{
        marginLeft: '260px',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FAF5FF 0%, #F0FDF4 50%, #EFF6FF 100%)',
        padding: '32px 24px'
      }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Task Manager</h1>
            <p className="text-gray-600 mt-1">Organize and track your work</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => prioritizeMutation.mutate()}
              disabled={prioritizeMutation.isPending}
              variant="outline"
              className="rounded-[14px]"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {prioritizeMutation.isPending ? 'Prioritizing...' : 'AI Prioritize'}
            </Button>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="rounded-[14px] text-white"
              style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
            >
              <Plus className="w-5 h-5 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        {/* Quick Add Task */}
        <QuickAddTask onSuccess={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })} />

        {/* Task Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    placeholder="Task title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="rounded-[12px]"
                  />
                  <Textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="rounded-[12px] h-24"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger className="rounded-[12px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger className="rounded-[12px]">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="datetime-local"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="rounded-[12px]"
                    />
                  </div>
                  <Input
                    placeholder="Project (optional)"
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    className="rounded-[12px]"
                  />
                  <div className="flex gap-3 justify-end">
                    <Button type="button" variant="outline" onClick={resetForm} className="rounded-[12px]">Cancel</Button>
                    <Button type="submit" className="rounded-[12px] text-white" style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}>
                      {editingTask ? 'Update' : 'Create'} Task
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
            <SelectTrigger className="w-40 rounded-[12px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
            <SelectTrigger className="w-40 rounded-[12px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Kanban Board with Drag & Drop */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
              <Droppable key={status} droppableId={status}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        {status === 'todo' && <Circle className="w-5 h-5 text-gray-400" />}
                        {status === 'in_progress' && <Clock className="w-5 h-5 text-blue-500" />}
                        {status === 'done' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                        {status === 'todo' ? 'To Do' : status === 'in_progress' ? 'In Progress' : 'Done'}
                        <span className="text-sm text-gray-500">({statusTasks.length})</span>
                      </h3>
                    </div>
                    <div className="space-y-3 min-h-[200px]">
                      {statusTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                            >
                              <Card 
                                className="p-4 rounded-[16px] cursor-pointer hover:shadow-lg transition-all" 
                                style={{ 
                                  background: snapshot.isDragging ? 'rgba(167, 139, 250, 0.1)' : 'rgba(255, 255, 255, 0.95)',
                                  transform: snapshot.isDragging ? 'rotate(2deg)' : 'none'
                                }}
                              >
                                <div className="flex items-start gap-3 mb-3">
                                  <div {...provided.dragHandleProps} className="mt-1 cursor-grab active:cursor-grabbing">
                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                  </div>
                                  <button onClick={() => handleStatusToggle(task)} className="mt-1">
                                    {task.status === 'done' ? (
                                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    ) : task.status === 'in_progress' ? (
                                      <Clock className="w-5 h-5 text-blue-500" />
                                    ) : (
                                      <Circle className="w-5 h-5 text-gray-400" />
                                    )}
                                  </button>
                                  <div className="flex-1">
                                    <h4 className={`font-semibold text-gray-800 ${task.status === 'done' ? 'line-through text-gray-500' : ''}`}>
                                      {task.title}
                                    </h4>
                                    {task.description && (
                                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                    )}
                                    {task.project && (
                                      <div className="text-xs text-purple-600 mt-2">📁 {task.project}</div>
                                    )}
                                    {task.ai_priority_score && (
                                      <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        AI Score: {task.ai_priority_score}/100
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className={`px-2 py-1 rounded-[8px] text-xs font-medium ${
                                    task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                    task.priority === 'high' ? 'bg-orange-100 text-orange-700' : 
                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
                                    'bg-blue-100 text-blue-700'
                                  }`}>
                                    {task.priority}
                                  </div>
                                  <div className="flex gap-2">
                                    <button onClick={() => handleEdit(task)} className="p-1 hover:bg-gray-100 rounded">
                                      <Edit2 className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button onClick={() => deleteMutation.mutate(task.id)} className="p-1 hover:bg-gray-100 rounded">
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                  </div>
                                </div>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
    </>
  );
}