import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar, 
  Users, 
  CheckSquare, 
  Edit, 
  Trash2, 
  Plus,
  User,
  Clock
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Card from '../ui/Card';

const ProjectDetailsModal = ({ isOpen, onClose, projectId }) => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch project details
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => axiosClient.get(`/projects/${projectId}/`).then(res => res.data),
    enabled: isOpen && !!projectId,
  });

  // Fetch project tasks
  const { data: tasks } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: () => axiosClient.get(`/tasks/?project=${projectId}`).then(res => res.data.results),
    enabled: isOpen && !!projectId,
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: () => axiosClient.delete(`/projects/${projectId}/`),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      queryClient.invalidateQueries(['dashboard-stats']);
      onClose();
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      deleteProjectMutation.mutate();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-success-100 text-success-800';
      case 'completed': return 'bg-neutral-100 text-neutral-800';
      case 'on_hold': return 'bg-warning-100 text-warning-800';
      case 'cancelled': return 'bg-danger-100 text-danger-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-danger-100 text-danger-800';
      case 'high': return 'bg-warning-100 text-warning-800';
      case 'medium': return 'bg-primary-100 text-primary-800';
      case 'low': return 'bg-neutral-100 text-neutral-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'done': return 'bg-success-100 text-success-800';
      case 'in_progress': return 'bg-warning-100 text-warning-800';
      case 'todo': return 'bg-neutral-100 text-neutral-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Project Details" size="lg">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Modal>
    );
  }

  if (!project) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={project.name} size="lg">
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                {project.status.replace('_', ' ')}
              </span>
              <span className="text-sm text-neutral-500">
                Created {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
            {project.description && (
              <p className="text-neutral-600">{project.description}</p>
            )}
          </div>
          {isAdmin && (
            <div className="flex gap-2 ml-4">
              <Button size="sm" variant="secondary">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button 
                size="sm" 
                variant="danger" 
                onClick={handleDelete}
                loading={deleteProjectMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <CheckSquare className="h-4 w-4 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900">{project.task_count}</p>
                <p className="text-xs text-neutral-600">Total Tasks</p>
              </div>
            </div>
          </Card>
          
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success-100 rounded-lg">
                <CheckSquare className="h-4 w-4 text-success-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900">{project.completed_tasks}</p>
                <p className="text-xs text-neutral-600">Completed</p>
              </div>
            </div>
          </Card>

          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning-100 rounded-lg">
                <Clock className="h-4 w-4 text-warning-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900">{project.task_count - project.completed_tasks}</p>
                <p className="text-xs text-neutral-600">Remaining</p>
              </div>
            </div>
          </Card>

          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neutral-100 rounded-lg">
                <Users className="h-4 w-4 text-neutral-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900">{project.members?.length || 0}</p>
                <p className="text-xs text-neutral-600">Members</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">Progress</span>
            <span className="text-sm text-neutral-600">{project.completion_percentage}%</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300" 
              style={{ width: `${project.completion_percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-neutral-200">
          <nav className="-mb-px flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              Tasks ({tasks?.length || 0})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="max-h-96 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Project Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.start_date && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Start Date</label>
                    <div className="flex items-center text-sm text-neutral-600">
                      <Calendar className="h-4 w-4" />
                      {new Date(project.start_date).toLocaleDateString()}
                    </div>
                  </div>
                )}
                
                {project.end_date && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">End Date</label>
                    <div className="flex items-center text-sm text-neutral-600">
                      <Calendar className="h-4 w-4" />
                      {new Date(project.end_date).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>

              {/* Members */}
              {project.members && project.members.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Team Members</label>
                  <div className="space-y-2">
                    {project.members.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 p-2 bg-neutral-50 rounded-lg">
                        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">
                            {member.first_name && member.last_name 
                              ? `${member.first_name} ${member.last_name}` 
                              : member.username}
                          </p>
                          <p className="text-xs text-neutral-600 capitalize">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-3">
              {tasks && tasks.length > 0 ? (
                tasks.map((task) => (
                  <div key={task.id} className="p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-neutral-900">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTaskStatusColor(task.status)}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      {task.due_date && (
                        <div className="text-right ml-4">
                          <p className="text-xs text-neutral-500">Due</p>
                          <p className={`text-sm font-medium ${task.is_overdue ? 'text-danger-600' : 'text-neutral-900'}`}>
                            {new Date(task.due_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckSquare className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-neutral-500">No tasks in this project yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ProjectDetailsModal;
