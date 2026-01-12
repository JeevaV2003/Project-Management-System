import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, User, Trash2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';

const EditTaskModal = ({ isOpen, onClose, taskId }) => {
  const { isAdmin, canManageProjects } = useAuth();
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  // Fetch task details
  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => axiosClient.get(`/tasks/${taskId}/`).then(res => res.data),
    enabled: isOpen && !!taskId,
  });

  // Fetch projects for dropdown
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => axiosClient.get('/projects/').then(res => res.data.results),
    enabled: isOpen,
  });

  // Fetch users for assignment
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => axiosClient.get('/users/').then(res => res.data.results),
    enabled: isOpen,
  });

  // Filter to show only team members for assignment
  const teamMembers = users?.filter(user => user.role === 'member') || [];

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: (taskData) => axiosClient.put(`/tasks/${taskId}/`, taskData),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['task', taskId]);
      queryClient.invalidateQueries(['dashboard-stats']);
      queryClient.invalidateQueries(['recent-tasks']);
      queryClient.invalidateQueries(['project-tasks']);
      reset();
      onClose();
    },
    onError: (error) => {
      console.error('Error updating task:', error);
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: () => axiosClient.delete(`/tasks/${taskId}/`),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['dashboard-stats']);
      queryClient.invalidateQueries(['recent-tasks']);
      queryClient.invalidateQueries(['project-tasks']);
      onClose();
    },
  });

  // Populate form when task data is loaded
  useEffect(() => {
    if (task) {
      setValue('title', task.title);
      setValue('description', task.description || '');
      setValue('project', task.project);
      setValue('assigned_to', task.assigned_to?.id || '');
      setValue('priority', task.priority);
      setValue('status', task.status);
      setValue('due_date', task.due_date ? task.due_date.split('T')[0] : '');
      setValue('remuneration_amount', task.remuneration_amount ?? 0);
      setValue('payment_status', task.payment_status || 'pending');
    }
  }, [task, setValue]);

  const onSubmit = (data) => {
    updateTaskMutation.mutate({
      title: data.title,
      description: data.description,
      project: parseInt(data.project),
      assigned_to_id: data.assigned_to ? parseInt(data.assigned_to) : null,
      priority: data.priority,
      status: data.status,
      due_date: data.due_date || null,
      ...(canManageProjects && {
        remuneration_amount: data.remuneration_amount ? parseFloat(data.remuneration_amount) : 0,
      }),
    });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      deleteTaskMutation.mutate();
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Edit Task" size="md">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Modal>
    );
  }

  if (!task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Task"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Task Title */}
        <Input
          label="Task Title"
          placeholder="Enter task title"
          error={errors.title?.message}
          {...register('title', {
            required: 'Task title is required',
            minLength: {
              value: 3,
              message: 'Task title must be at least 3 characters',
            },
          })}
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Description
          </label>
          <textarea
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
            rows={3}
            placeholder="Enter task description (optional)"
            {...register('description')}
          />
        </div>

        {/* Project Selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Project *
          </label>
          <select
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            {...register('project', {
              required: 'Please select a project',
            })}
          >
            <option value="">Select a project</option>
            {projects?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          {errors.project && (
            <p className="mt-1 text-sm text-danger-600">{errors.project.message}</p>
          )}
        </div>

        {/* Status and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              {...register('status')}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Priority
            </label>
            <select
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              {...register('priority')}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Assigned To */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Assign To
          </label>
          <select
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            {...register('assigned_to')}
          >
            <option value="">Unassigned</option>
            {teamMembers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.first_name && user.last_name 
                  ? `${user.first_name} ${user.last_name}` 
                  : user.username}
              </option>
            ))}
          </select>
        </div>

        {/* Remuneration and Payment Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {canManageProjects ? (
            <Input
              label="Remuneration Amount"
              type="number"
              step="0.01"
              placeholder="Enter amount"
              error={errors.remuneration_amount?.message}
              {...register('remuneration_amount', {
                min: { value: 0, message: 'Amount must be positive' },
              })}
            />
          ) : (
            <Card padding="sm">
              <p className="text-sm text-neutral-500">Remuneration</p>
              <p className="text-lg font-semibold text-neutral-900 mt-1">
                {task.remuneration_amount ? `$${Number(task.remuneration_amount).toFixed(2)}` : '$0.00'}
              </p>
            </Card>
          )}

          <Card className="p-4">
            <p className="text-sm text-neutral-500">Payment Status</p>
            <p className="text-lg font-semibold capitalize mt-1">
              {task.payment_status || 'pending'}
            </p>
          </Card>
        </div>

        {/* Due Date */}
        <Input
          label="Due Date"
          type="date"
          icon={Calendar}
          {...register('due_date')}
        />

        {/* Error Message */}
        {updateTaskMutation.isError && (
          <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
            <p className="text-sm text-danger-600">
              {updateTaskMutation.error?.response?.data?.detail || 
               'Failed to update task. Please try again.'}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <div>
            {isAdmin && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                loading={deleteTaskMutation.isPending}
                disabled={updateTaskMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
                Delete Task
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={updateTaskMutation.isPending || deleteTaskMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={updateTaskMutation.isPending}
              disabled={updateTaskMutation.isPending || deleteTaskMutation.isPending}
            >
              Update Task
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditTaskModal;
