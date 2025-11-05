import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Users, MoreVertical } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProjectList({ projects, tasks, onEdit }) {
  const statusColors = {
    planning: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-purple-100 text-purple-700',
    on_hold: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-3">
      {projects.map((project) => {
        const projectTasks = tasks.filter(t => t.project_id === project.id);
        const completedTasks = projectTasks.filter(t => t.status === 'done').length;
        const progress = projectTasks.length > 0 
          ? Math.round((completedTasks / projectTasks.length) * 100) 
          : project.progress || 0;

        return (
          <div key={project.id} className="p-4 rounded-[16px] bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div
                  className="w-1 h-12 rounded-full"
                  style={{ background: project.color || '#A78BFA' }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-800">{project.name}</h3>
                    <span className={`px-3 py-1 rounded-[8px] text-xs font-semibold ${statusColors[project.status]}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {project.client_name && <span>{project.client_name}</span>}
                    {project.start_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(parseISO(project.start_date), 'MMM dd, yyyy')}
                      </div>
                    )}
                    {project.budget > 0 && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${project.budget.toLocaleString()}
                      </div>
                    )}
                    {project.team_members && project.team_members.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {project.team_members.length}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{progress}%</div>
                  <div className="text-xs text-gray-500">
                    {completedTasks}/{projectTasks.length} tasks
                  </div>
                </div>
                
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="mt-3 ml-5">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: project.color || 'linear-gradient(90deg, #A78BFA 0%, #8B5CF6 100%)',
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}