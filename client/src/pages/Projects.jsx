import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FolderOpen, Plus, Users, Calendar } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import CreateProjectModal from '../components/modals/CreateProjectModal';
import ProjectDetailsModal from '../components/modals/ProjectDetailsModal';
import { getStatusVariant, getStatusLabel } from '../utils/statusColors';

const Projects = () => {
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const { canManageProjects } = useAuth();
  
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => axiosClient.get('/projects/').then(res => res.data.results),
  });

  const ProjectCard = ({ project }) => {

    return (
      <Card className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-glow">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">{project.name}</h3>
              <p className="text-sm text-neutral-500 capitalize">Updated {new Date(project.updated_at || project.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <Badge variant={getStatusVariant(project.status)}>
            {getStatusLabel(project.status)}
          </Badge>
        </div>

        {project.description && (
          <p className="text-sm text-neutral-600 line-clamp-2">{project.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
          <span className="inline-flex items-center gap-2 rounded-2xl border border-neutral-100/70 bg-neutral-50/80 px-3 py-1">
            <Users className="h-4 w-4 text-primary-500" />
            {project.members?.length || 0} members
          </span>
          <span className="inline-flex items-center gap-2 rounded-2xl border border-neutral-100/70 bg-neutral-50/80 px-3 py-1">
            <Calendar className="h-4 w-4 text-secondary-500" />
            {project.task_count} tasks
          </span>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm text-neutral-500">
            <span>Progress</span>
            <span className="font-semibold text-neutral-800">{project.completion_percentage}%</span>
          </div>
          <div className="mt-2 h-3 w-full rounded-full bg-neutral-100">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 transition-all"
              style={{ width: `${project.completion_percentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
          <Button size="sm" onClick={() => setSelectedProjectId(project.id)}>
            View Details
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-neutral-400 mb-2">Portfolio</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Projects overview</h1>
          <p className="text-neutral-500 mt-1">Stay ahead of timelines and unblock teams faster.</p>
        </div>
        {canManageProjects && (
          <div className="flex flex-wrap items-center gap-3 sm:mt-0">
            <Button variant="secondary" onClick={() => setShowCreateProject(true)}>
              <Plus className="h-4 w-4" />
              Quick Draft
            </Button>
            <Button onClick={() => setShowCreateProject(true)}>
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="mb-4 h-4 rounded bg-neutral-200" />
              <div className="mb-2 h-3 rounded bg-neutral-200" />
              <div className="mb-4 h-3 rounded bg-neutral-200" />
              <div className="h-2 rounded bg-neutral-200" />
            </Card>
          ))}
        </div>
      ) : projects?.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <Card className="py-12 text-center">
          <FolderOpen className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No projects yet</h3>
          <p className="text-neutral-500 mb-6">
            {canManageProjects 
              ? 'Get started by creating your first project'
              : 'No projects assigned to you yet'
            }
          </p>
          {canManageProjects && (
            <Button onClick={() => setShowCreateProject(true)}>
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          )}
        </Card>
      )}

      {/* Modals */}
      <CreateProjectModal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
      />
      <ProjectDetailsModal
        isOpen={!!selectedProjectId}
        onClose={() => setSelectedProjectId(null)}
        projectId={selectedProjectId}
      />
    </div>
  );
};

export default Projects;
