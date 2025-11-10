import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tantml:react-query';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Plus, ThumbsUp, CheckCircle2, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/common/Sidebar';

export default function Feedback() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'feature_request',
    title: '',
    description: '',
    category: 'other',
    priority: 'medium'
  });

  const queryClient = useQueryClient();

  const { data: feedbacks = [], isLoading } = useQuery({
    queryKey: ['feedbacks'],
    queryFn: () => base44.entities.Feedback.list('-created_date', 100)
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Feedback.create({ ...data, user_email: user.email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      setShowForm(false);
      setFormData({ type: 'feature_request', title: '', description: '', category: 'other', priority: 'medium' });
    }
  });

  const voteMutation = useMutation({
    mutationFn: ({ id, votes }) => base44.entities.Feedback.update(id, { votes: votes + 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const typeColors = {
    bug: 'bg-red-100 text-red-700',
    feature_request: 'bg-purple-100 text-purple-700',
    improvement: 'bg-blue-100 text-blue-700',
    general: 'bg-gray-100 text-gray-700'
  };

  const statusColors = {
    submitted: 'bg-yellow-100 text-yellow-700',
    reviewing: 'bg-blue-100 text-blue-700',
    planned: 'bg-purple-100 text-purple-700',
    in_progress: 'bg-indigo-100 text-indigo-700',
    completed: 'bg-green-100 text-green-700',
    declined: 'bg-gray-100 text-gray-700'
  };

  return (
    <>
      <Sidebar currentPage="Feedback" />
      
      <div style={{
        marginLeft: '260px',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FAF5FF 0%, #F0FDF4 50%, #EFF6FF 100%)',
        padding: '32px 24px'
      }}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Feedback & Requests</h1>
            <p className="text-gray-600 mt-1">Share your ideas and help us improve</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="rounded-[12px] text-white"
            style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
          >
            <Plus className="w-5 h-5 mr-2" />
            New Feedback
          </Button>
        </div>

        {/* Feedback Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Submit Feedback</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Type</label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger className="rounded-[12px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bug">🐛 Bug Report</SelectItem>
                          <SelectItem value="feature_request">✨ Feature Request</SelectItem>
                          <SelectItem value="improvement">📈 Improvement</SelectItem>
                          <SelectItem value="general">💬 General Feedback</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Category</label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger className="rounded-[12px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tasks">Tasks</SelectItem>
                          <SelectItem value="goals">Goals</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="content">Content</SelectItem>
                          <SelectItem value="habits">Habits</SelectItem>
                          <SelectItem value="ui_ux">UI/UX</SelectItem>
                          <SelectItem value="performance">Performance</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Title *</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Brief summary of your feedback"
                      className="rounded-[12px]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Description *</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Provide detailed information..."
                      className="rounded-[12px] h-32"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Priority</label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger className="rounded-[12px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-[12px]">
                      Cancel
                    </Button>
                    <Button type="submit" className="rounded-[12px] text-white" style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}>
                      Submit Feedback
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : feedbacks.length === 0 ? (
            <Card className="p-12 rounded-[20px] text-center" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No feedback yet</h3>
              <p className="text-gray-600 mb-6">Be the first to share your thoughts!</p>
              <Button
                onClick={() => setShowForm(true)}
                className="rounded-[12px] text-white"
                style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
              >
                <Plus className="w-5 h-5 mr-2" />
                Submit Feedback
              </Button>
            </Card>
          ) : (
            feedbacks.map((feedback) => (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 4px 16px rgba(167, 139, 250, 0.1)' }}>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-[8px] text-xs font-semibold ${typeColors[feedback.type]}`}>
                              {feedback.type.replace('_', ' ')}
                            </span>
                            <span className={`px-3 py-1 rounded-[8px] text-xs font-semibold ${statusColors[feedback.status]}`}>
                              {feedback.status.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-gray-500">{feedback.category}</span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-800 mb-2">{feedback.title}</h3>
                          <p className="text-gray-600 text-sm mb-3">{feedback.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>By {feedback.user_email}</span>
                            <span>•</span>
                            <span>{new Date(feedback.created_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {feedback.admin_response && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-[12px] border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-900">Team Response</span>
                          </div>
                          <p className="text-sm text-blue-800">{feedback.admin_response}</p>
                          {feedback.response_date && (
                            <p className="text-xs text-blue-600 mt-2">
                              {new Date(feedback.response_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => voteMutation.mutate({ id: feedback.id, votes: feedback.votes })}
                      className="rounded-[10px] flex-col h-auto py-2 px-3"
                    >
                      <ThumbsUp className="w-4 h-4 mb-1" />
                      <span className="text-xs font-bold">{feedback.votes}</span>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </>
  );
}