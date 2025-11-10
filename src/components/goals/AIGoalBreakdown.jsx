import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, CheckCircle2, Loader2, ListTodo } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIGoalBreakdown({ goal }) {
  const [breakdown, setBreakdown] = useState(goal.ai_breakdown || []);
  const [loading, setLoading] = useState(false);
  const [showTasks, setShowTasks] = useState(false);

  const queryClient = useQueryClient();

  const updateGoalMutation = useMutation({
    mutationFn: (data) => base44.entities.Goal.update(goal.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const generateBreakdown = async () => {
    setLoading(true);
    try {
      const prompt = `You are a goal-setting expert. Break down this goal into 5-7 actionable steps:

Goal: ${goal.title}
Description: ${goal.description || 'No description provided'}
Target Date: ${goal.target_date ? new Date(goal.target_date).toLocaleDateString() : 'Not set'}
Category: ${goal.category}

Provide a JSON response with this structure:
{
  "steps": [
    {
      "step": "Step title",
      "description": "Detailed description",
      "duration": "Estimated time (e.g., '1 week', '3 days')"
    }
  ]
}

Make the steps specific, actionable, and achievable.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            steps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  step: { type: 'string' },
                  description: { type: 'string' },
                  duration: { type: 'string' }
                }
              }
            }
          }
        }
      });

      const steps = response.steps || [];
      setBreakdown(steps);
      
      // Update goal with AI breakdown
      await updateGoalMutation.mutateAsync({
        ai_breakdown: steps
      });
    } catch (error) {
      console.error('Error generating breakdown:', error);
    }
    setLoading(false);
  };

  const convertToTasks = async () => {
    setShowTasks(true);
    const taskIds = [];

    for (const step of breakdown) {
      const task = await createTaskMutation.mutateAsync({
        title: step.step,
        description: step.description,
        goal_id: goal.id,
        status: 'todo',
        priority: 'medium',
        project: goal.title
      });
      taskIds.push(task.id);
    }

    // Update goal with linked tasks
    await updateGoalMutation.mutateAsync({
      linked_task_ids: [...(goal.linked_task_ids || []), ...taskIds]
    });
  };

  return (
    <Card className="p-6 rounded-[20px] mt-6" style={{ background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.05) 0%, rgba(147, 197, 253, 0.05) 100%)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-[12px] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">AI Goal Breakdown</h3>
            <p className="text-xs text-gray-600">Let AI create actionable steps</p>
          </div>
        </div>

        {!breakdown.length && (
          <Button
            onClick={generateBreakdown}
            disabled={loading}
            className="rounded-[12px] text-white"
            style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Breakdown
              </>
            )}
          </Button>
        )}
      </div>

      <AnimatePresence>
        {breakdown.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {breakdown.map((step, index) => (
              <div
                key={index}
                className="p-4 bg-white rounded-[14px] border border-purple-100"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
                  >
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{step.step}</h4>
                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-[6px] font-medium">
                        ⏱️ {step.duration}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {!showTasks && (
              <Button
                onClick={convertToTasks}
                variant="outline"
                className="w-full rounded-[12px] mt-4"
              >
                <ListTodo className="w-4 h-4 mr-2" />
                Convert to Tasks
              </Button>
            )}

            {showTasks && (
              <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-green-50 rounded-[12px]">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-green-700">
                  Tasks created successfully!
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}