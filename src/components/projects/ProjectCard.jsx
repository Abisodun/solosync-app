import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Calendar, Users, DollarSign, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO, differenceInDays } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function ProjectCard({ project, tasks, onEdit }) {
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : project.progress || 0;
  
  const daysRemaining = project.end_date 
    ? differenceInDays(parseISO(project.end_date), new Date())
    : null;

  const statusColors = {
    planning: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-purple-100 text-purple-700',
    on_hold: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <Card className="p-6 rounded-[20px] h-full" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: project.color || '#A78BFA' }}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-[8px]">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onEdit(project)}>
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to={`${createPageUrl('Tasks')}?project=${project.id}`}>View Tasks</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2">{project.name}</h3>
        {project.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 rounded-[8px] text-xs font-semibold ${statusColors[project.status]}`}>
            {project.status.replace('_', ' ')}
          </span>
          <span className={`px-3 py-1 rounded-[8px] text-xs font-semibold ${priorityColors[project.priority]}`}>
            {project.priority}
          </span>
        </div>

        {project.client_name && (
          <div className="text-sm text-gray-600 mb-4">
            <strong>Client:</strong> {project.client_name}
          </div>
        )}

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Progress</span>
            </div>
            <span className="font-semibold text-purple-600">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress}%`,
                background: project.color || 'linear-gradient(90deg, #A78BFA 0%, #8B5CF6 100%)',
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {project.start_date && (
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">{format(parseISO(project.start_date), 'MMM dd')}</span>
            </div>
          )}
          {daysRemaining !== null && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="text-xs">{daysRemaining} days left</span>
            </div>
          )}
          {project.budget > 0 && (
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">${project.budget.toLocaleString()}</span>
            </div>
          )}
          {project.team_members && project.team_members.length > 0 && (
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span className="text-xs">{project.team_members.length} members</span>
            </div>
          )}
        </div>

        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {project.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-[6px] text-xs">
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-[6px] text-xs">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
}