import React from 'react';
import { Card } from "@/components/ui/card";
import { FolderKanban, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProjectStats({ projects, tasks }) {
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const completionRate = projects.length > 0 
    ? Math.round((completedProjects / projects.length) * 100) 
    : 0;

  const stats = [
    { label: 'Active Projects', value: activeProjects, icon: FolderKanban, gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' },
    { label: 'Completed', value: completedProjects, icon: CheckCircle2, gradient: 'linear-gradient(135deg, #86EFAC 0%, #10B981 100%)' },
    { label: 'Total Budget', value: `$${totalBudget.toLocaleString()}`, icon: TrendingUp, gradient: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)' },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: Clock, gradient: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
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
  );
}