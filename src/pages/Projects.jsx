
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, FolderKanban, Mail } from 'lucide-react'; // Removed LayoutGrid, List, BarChart3, CalendarIcon as they are no longer used
import { motion, AnimatePresence } from 'framer-motion'; // Added AnimatePresence
import ProjectForm from '../components/projects/ProjectForm';
// ProjectCard is likely not used directly anymore as ProjectList handles display
import ProjectList from '../components/projects/ProjectList';
import GanttChart from '../components/projects/GanttChart';
import ProjectStats from '../components/projects/ProjectStats';
import Sidebar from '../components/common/Sidebar';
import EmailComposerModal from '../components/communication/EmailComposerModal'; // New import
import EmailHistory from '../components/communication/EmailHistory'; // New import

export default function ProjectsPage() { // Renamed from Projects to ProjectsPage
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  // Removed [viewMode, setViewMode] as the display logic has changed

  // New state variables from the outline
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailingProject, setEmailingProject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewingProject, setViewingProject] = useState(null); // State for viewing a single project's details

  const queryClient = useQueryClient();

  const { data: projects = [], isLoading, error } = useQuery({
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

  const { data: user } = useQuery({ // Query for the current user, used in EmailComposerModal
    queryKey: ['user'],
    queryFn: () => base44.entities.User.me(), // Assuming an API endpoint for the current user
    staleTime: Infinity, // User data typically doesn't change often
  });

  // Mutations for project creation, update, and deletion
  const createProjectMutation = useMutation({
    mutationFn: (newProject) => base44.entities.Project.create(newProject),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      setShowForm(false);
      setEditingProject(null);
    },
    onError: (err) => {
      console.error("Error creating project:", err);
      // Implement more robust error handling (e.g., toast messages)
    }
  });

  const updateProjectMutation = useMutation({
    mutationFn: (updatedProject) => base44.entities.Project.update(updatedProject.id, updatedProject),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['projects']);
      setShowForm(false);
      setEditingProject(null);
      // If the currently viewed project was updated, refresh its details
      if (viewingProject && viewingProject.id === data.id) {
        setViewingProject(data);
      }
    },
    onError: (err) => {
      console.error("Error updating project:", err);
      // Implement more robust error handling
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (projectId) => base44.entities.Project.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      // Optionally show a success notification
    },
    onError: (err) => {
      console.error("Error deleting project:", err);
      // Implement more robust error handling
    }
  });

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowForm(true);
    setViewingProject(null); // Ensure form is for editing, not just viewing
  };

  const handleCloseForm = () => { // Renamed from handleCancel for consistency with original code
    setShowForm(false);
    setEditingProject(null);
  };

  const handleSubmit = (projectData) => {
    if (editingProject) {
      updateProjectMutation.mutate({ ...projectData, id: editingProject.id });
    } else {
      createProjectMutation.mutate(projectData);
    }
  };

  const handleShareProject = (project) => {
    setEmailingProject(project);
    setShowEmailModal(true);
  };

  // Removed activeProjects and completedProjects as they are not used in the new display logic

  // Display loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        Error loading projects: {error.message}
      </div>
    );
  }

  return (
    <>
      <Sidebar currentPage="Projects" />
      
      <div style={{
        marginLeft: '260px',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FAF5FF 0%, #F0FDF4 50%, #EFF6FF 100%)',
        padding: '32px 24px'
      }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Project Management</h1>
            <p className="text-gray-600 mt-1">Organize and track all your projects in one place</p>
          </div>
          {/* Removed View Mode Toggle buttons */}
          <Button
            onClick={() => {
              setEditingProject(null);
              setShowForm(true);
              setViewingProject(null); // Ensure we're not viewing a project when creating a new one
            }}
            className="rounded-[14px] text-white"
            style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' }}
          >
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </Button>
        </div>

        {/* Project Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="mb-8"
            >
              <ProjectForm
                project={editingProject}
                clients={clients}
                onSubmit={handleSubmit}
                onClose={handleCloseForm} // Using onClose consistent with original ProjectForm prop
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="mb-8">
          <ProjectStats projects={projects} tasks={tasks} /> {/* Pass tasks for comprehensive stats */}
        </div>

        {/* Conditional rendering based on whether a single project is being viewed */}
        {viewingProject ? (
          <>
            {/* Tabs for viewing a specific project */}
            <div className="flex gap-2 mb-6">
              {['overview', 'email-history'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-[14px] font-medium transition-all ${
                    activeTab === tab
                      ? 'text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  style={activeTab === tab ? {
                    background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)'
                  } : {}}
                >
                  {tab === 'overview' ? 'Overview' : 'Email History'}
                </button>
              ))}
            </div>

            {activeTab === 'overview' ? (
              <>
                {/* Back Button & Share for Overview tab */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="outline"
                    onClick={() => setViewingProject(null)}
                    className="rounded-[12px]"
                  >
                    ← Back to Projects
                  </Button>
                  <Button
                    onClick={() => handleShareProject(viewingProject)}
                    className="rounded-[12px] text-white"
                    style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)' }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Share Update
                  </Button>
                </div>

                {/* Gantt Chart for the single viewed project */}
                {/* Wrapped in Card for consistent styling */}
                <Card className="p-6 rounded-[20px]" style={{ background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 8px 32px rgba(167, 139, 250, 0.15)' }}>
                  <GanttChart projects={[viewingProject]} /> {/* GanttChart expects an array of projects */}
                </Card>
              </>
            ) : (
              <>
                {/* Back Button for Email History tab */}
                <Button
                  variant="outline"
                  onClick={() => setViewingProject(null)}
                  className="rounded-[12px] mb-6"
                >
                  ← Back to Projects
                </Button>
                
                {/* Email History for the single viewed project */}
                <EmailHistory
                  entityId={viewingProject.id}
                  entityType="Project"
                />
              </>
            )}
          </>
        ) : (
          // Default view: list of all projects (when no specific project is selected)
          <>
            {projects.length === 0 && !isLoading && !showForm ? ( // Show empty state if no projects, not loading, and form not open
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
              <ProjectList
                projects={projects}
                tasks={tasks} // Pass tasks to ProjectList if needed for e.g., progress calculation
                onView={(project) => { // Handler for viewing a specific project from the list
                  setViewingProject(project);
                  setActiveTab('overview'); // Set default tab to overview
                }}
                onEdit={handleEdit}
                onDelete={(id) => deleteProjectMutation.mutate(id)}
              />
            )}
          </>
        )}
      </div>

      {/* Email Composer Modal */}
      {emailingProject && (
        <EmailComposerModal
          isOpen={showEmailModal}
          onClose={() => {
            setShowEmailModal(false);
            setEmailingProject(null);
          }}
          // defaultRecipients logic would need client email addresses to be retrieved
          defaultRecipients={[]} // Keeping it empty as per outline example for now
          defaultSubject={`Update on ${emailingProject.name}`}
          defaultBody={`Hi,\n\nHere's an update on the ${emailingProject.name} project:\n\nStatus: ${emailingProject.status}\nProgress: ${emailingProject.progress}%\n\nBest regards,\n${user?.full_name || 'Team'}`}
          entityId={emailingProject.id}
          entityType="Project"
        />
      )}
    </>
  );
}
