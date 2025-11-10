import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Flag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QuickAddTask({ onSuccess }) {
  const [title, setTitle] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setTitle('');
      setDueDate('');
      setPriority('medium');
      setShowOptions(false);
      if (onSuccess) onSuccess();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    createMutation.mutate({
      title: title.trim(),
      priority,
      due_date: dueDate || undefined,
      status: 'todo'
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <form onSubmit={handleSubmit}>
        <div
          className="p-4 rounded-[16px]"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 4px 16px rgba(167, 139, 250, 0.1)'
          }}
        >
          <div className="flex items-center gap-3">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowOptions(true)}
              placeholder="Quick add task... (Press Enter to save)"
              className="rounded-[12px] border-none bg-gray-50 flex-1"
            />
            <Button
              type="button"
              variant={showOptions ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setShowOptions(!showOptions)}
              className="rounded-[10px]"
            >
              <Flag className="w-4 h-4" />
            </Button>
            <Button
              type="submit"
              className="rounded-[10px] text-white"
              style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
              disabled={!title.trim() || createMutation.isPending}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {showOptions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-3 mt-3 pt-3 border-t border-gray-200"
            >
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-gray-500" />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="text-sm border border-gray-200 rounded-[8px] px-3 py-1.5 bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="text-sm border border-gray-200 rounded-[8px] px-3 py-1.5 bg-white"
                />
              </div>
            </motion.div>
          )}
        </div>
      </form>
    </motion.div>
  );
}