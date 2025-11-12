import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HabitForm({ habit, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(habit || {
    name: '',
    description: '',
    frequency: 'daily',
    target_value: '',
    category: 'productivity',
    reminder_time: '',
    reminder_enabled: true,
    difficulty: 'medium',
    is_active: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-8"
    >
      <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {habit ? 'Edit Habit' : 'New Habit'}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-[8px] transition-colors"
            aria-label="Close form"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="habit-name" className="text-sm font-semibold text-gray-700 mb-2 block">
              Habit Name *
            </label>
            <Input
              id="habit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Morning meditation"
              className="rounded-[12px]"
              required
              autoComplete="off"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="habit-description" className="text-sm font-semibold text-gray-700 mb-2 block">
              Description
            </label>
            <Textarea
              id="habit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your habit..."
              className="rounded-[12px] h-20"
              autoComplete="off"
            />
          </div>

          {/* Frequency and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="frequency" className="text-sm font-semibold text-gray-700 mb-2 block">
                Frequency *
              </label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value })}
              >
                <SelectTrigger id="frequency" className="rounded-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="category" className="text-sm font-semibold text-gray-700 mb-2 block">
                Category
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category" className="rounded-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="productivity">Productivity</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="creativity">Creativity</SelectItem>
                  <SelectItem value="relationships">Relationships</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Target Value and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="target-value" className="text-sm font-semibold text-gray-700 mb-2 block">
                Target Value
              </label>
              <Input
                id="target-value"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                placeholder="e.g., 30 minutes, 3 times"
                className="rounded-[12px]"
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="difficulty" className="text-sm font-semibold text-gray-700 mb-2 block">
                Difficulty
              </label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger id="difficulty" className="rounded-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reminder Time */}
          <div>
            <label htmlFor="reminder-time" className="text-sm font-semibold text-gray-700 mb-2 block">
              Reminder Time
            </label>
            <Input
              id="reminder-time"
              type="time"
              value={formData.reminder_time}
              onChange={(e) => setFormData({ ...formData, reminder_time: e.target.value })}
              className="rounded-[12px]"
            />
            <p className="text-xs text-gray-500 mt-1">Set a daily reminder time for this habit</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="rounded-[12px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-[12px] text-white"
              style={{ background: 'linear-gradient(135deg, #FCA5A5 0%, #EF4444 100%)' }}
            >
              {habit ? 'Update Habit' : 'Create Habit'}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}