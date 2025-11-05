import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Trash2 } from 'lucide-react';

export default function ProjectForm({ project, clients, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client_id: '',
    client_name: '',
    status: 'planning',
    start_date: '',
    end_date: '',
    budget: 0,
    priority: 'medium',
    color: '#A78BFA',
    team_members: [],
    tags: [],
  });

  const [newMember, setNewMember] = useState({ name: '', role: '', email: '' });
  const [newTag, setNewTag] = useState('');

  const queryClient = useQueryClient();

  useEffect(() => {
    if (project) {
      setFormData({
        ...project,
        start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
        end_date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '',
      });
    }
  }, [project]);

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
      };
      
      if (project) {
        return base44.entities.Project.update(project.id, payload);
      }
      return base44.entities.Project.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleClientChange = (clientId) => {
    const selectedClient = clients.find(c => c.id === clientId);
    setFormData({
      ...formData,
      client_id: clientId,
      client_name: selectedClient?.name || '',
    });
  };

  const addTeamMember = () => {
    if (newMember.name) {
      setFormData({
        ...formData,
        team_members: [...formData.team_members, newMember],
      });
      setNewMember({ name: '', role: '', email: '' });
    }
  };

  const removeTeamMember = (index) => {
    setFormData({
      ...formData,
      team_members: formData.team_members.filter((_, i) => i !== index),
    });
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag],
      });
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    });
  };

  const colors = ['#A78BFA', '#93C5FD', '#86EFAC', '#FCD34D', '#F472B6', '#FCA5A5'];

  return (
    <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">
          {project ? 'Edit Project' : 'New Project'}
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-[10px]">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Project Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Website Redesign"
              className="rounded-[12px]"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Client</label>
            <Select value={formData.client_id} onValueChange={handleClientChange}>
              <SelectTrigger className="rounded-[12px]">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Project description..."
            className="rounded-[12px] h-24"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Start Date *</label>
            <Input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="rounded-[12px]"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">End Date *</label>
            <Input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="rounded-[12px]"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Budget</label>
            <Input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
              placeholder="5000"
              className="rounded-[12px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Status</label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger className="rounded-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
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
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Project Color</label>
          <div className="flex gap-2">
            {colors.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                className={`w-10 h-10 rounded-[10px] border-2 transition-all ${
                  formData.color === color ? 'border-gray-800 scale-110' : 'border-transparent'
                }`}
                style={{ background: color }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Team Members</label>
          <div className="space-y-2 mb-3">
            {formData.team_members.map((member, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-[10px]">
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-800">{member.name}</div>
                  <div className="text-xs text-gray-500">{member.role} • {member.email}</div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTeamMember(index)}
                  className="rounded-[8px]"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input
              placeholder="Name"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              className="rounded-[10px]"
            />
            <Input
              placeholder="Role"
              value={newMember.role}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
              className="rounded-[10px]"
            />
            <Input
              placeholder="Email"
              type="email"
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              className="rounded-[10px]"
            />
            <Button type="button" onClick={addTeamMember} variant="outline" className="rounded-[10px]">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Tags</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags.map(tag => (
              <div key={tag} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-[8px] text-sm flex items-center gap-2">
                {tag}
                <button type="button" onClick={() => removeTag(tag)}>
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="rounded-[10px]"
            />
            <Button type="button" onClick={addTag} variant="outline" className="rounded-[10px]">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-[12px]">
            Cancel
          </Button>
          <Button type="submit" className="rounded-[12px] text-white" style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}>
            {project ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Card>
  );
}