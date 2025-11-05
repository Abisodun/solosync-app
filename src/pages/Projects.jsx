import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, FolderKanban, LayoutGrid, List, BarChart3, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import ProjectForm from '../components/projects/ProjectForm';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectList from '../components/projects/ProjectList';
import GanttChart from '../components/projects/GanttChart';
import ProjectStats from '../components/projects/ProjectStats';

export default function Projects() {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid, list, gantt

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date', 100),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-created_date', 500),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list('-created_date', 100),
  });

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  const activeProjects = projects.filter(p => p.status === 'in_progress' || p.status === 'planning');
  const completedProjects = projects.filter(p => p.status === 'completed');

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Project Management</h1>
          <p className="text-gray-600 mt-1">Organize and track all your projects in one place</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-[12px]" style={{ background: 'rgba(167, 139, 250, 0.1)' }}>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-[10px]"
              style={viewMode === 'grid' ? { background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' } : {}}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-[10px]"
              style={viewMode === 'list' ? { background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' } : {}}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'gantt' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('gantt')}
              className="rounded-[10px]"
              style={viewMode === 'gantt' ? { background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' } : {}}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
          </div>

          <Button
            onClick={() => setShowForm(!showForm)}
            className="rounded-[14px] text-white"
            style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
          >
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats */}
      <ProjectStats projects={projects} tasks={tasks} />

      {/* Project Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <ProjectForm
            project={editingProject}
            clients={clients}
            onClose={handleCloseForm}
          />
        </motion.div>
      )}

      {/* Projects Display */}
      <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6">Start organizing your work with projects</p>
            <Button onClick={() => setShowForm(true)} className="rounded-[14px] text-white" style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}>
              <Plus className="w-5 h-5 mr-2" />
              Create First Project
            </Button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    tasks={tasks.filter(t => t.project_id === project.id)}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <ProjectList
                projects={projects}
                tasks={tasks}
                onEdit={handleEdit}
              />
            )}

            {viewMode === 'gantt' && (
              <GanttChart projects={projects} />
            )}
          </>
        )}
      </Card>
    </div>
  );
}