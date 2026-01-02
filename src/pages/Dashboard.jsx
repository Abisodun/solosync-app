import React, { useState, useEffect } from 'react';
import { useTasks } from '../hooks/useTasks';
import { supabase } from '../lib/supabase';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, Plus, Trash2, Edit, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const { tasks, loading, error, addTask, updateTask, deleteTask, toggleTaskStatus } = useTasks();
  const [user, setUser] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const result = await addTask({
      title: newTaskTitle,
      description: newTaskDescription,
      status: 'todo',
      priority: 'medium'
    });

    if (result.success) {
      setNewTaskTitle('');
      setNewTaskDescription('');
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    const result = await updateTask(editingTask.id, {
      title: editingTask.title,
      description: editingTask.description
    });

    if (result.success) {
      setEditingTask(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'todo').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Welcome back, {user?.email?.split('@')[0] || 'there'}! 👋
            </h1>
            <p className="text-gray-600">SoloSync Dashboard</p>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white rounded-2xl shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-800">{tasks.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white rounded-2xl shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-800">{pendingTasks}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white rounded-2xl shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-800">{completedTasks}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 mb-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Task</h2>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Task title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <textarea
                placeholder="Task description (optional)"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <Button type="submit" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </form>
        </Card>

        <Card className="p-6 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Tasks</h2>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              Error: {error}
            </div>
          )}

          {tasks.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No tasks yet. Create your first task above!</p>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    task.status === 'completed'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {editingTask?.id === task.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editingTask.title}
                        onChange={(e) =>
                          setEditingTask({ ...editingTask, title: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <textarea
                        value={editingTask.description || ''}
                        onChange={(e) =>
                          setEditingTask({ ...editingTask, description: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleUpdateTask} size="sm">
                          Save
                        </Button>
                        <Button
                          onClick={() => setEditingTask(null)}
                          size="sm"
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <button
                            onClick={() => toggleTaskStatus(task.id, task.status)}
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                              task.status === 'completed'
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-300 hover:border-purple-500'
                            }`}
                          >
                            {task.status === 'completed' && (
                              <CheckSquare className="w-4 h-4 text-white" />
                            )}
                          </button>
                          <h3
                            className={`text-lg font-semibold ${
                              task.status === 'completed'
                                ? 'line-through text-gray-500'
                                : 'text-gray-800'
                            }`}
                          >
                            {task.title}
                          </h3>
                        </div>
                        {task.description && (
                          <p className="text-gray-600 ml-9">{task.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}