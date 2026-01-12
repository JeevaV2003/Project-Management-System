import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, User, AlertCircle } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';

const CreateTaskModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();

  // Fetch projects for dropdown
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => axiosClient.get('/projects/').then(res => res.data.results),
    enabled: isOpen,
  });

  // Debug logging (remove in production)
  // console.log('Projects:', projects);
  // console.log('Team members:', teamMembers);

  // Fetch users for assignment (only team members)
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => axiosClient.get('/users/').then(res => res.data.results),
    enabled: isOpen,
  });

  // Filter to show only team members for assignment
  const teamMembers = users?.filter(user => user.role === 'member') || [];

  const createTaskMutation = useMutation({
    mutationFn: (taskData) => axiosClient.post('/tasks/', taskData),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['dashboard-stats']);
      queryClient.invalidateQueries(['recent-tasks']);
      reset();
      onClose();
    },
    onError: (error) => {
      console.error('Error creating task:', error);
    },
  });

  const onSubmit = (data) => {
    const taskData = {
      title: data.title,
      description: data.description,
      project: parseInt(data.project),
      assigned_to_id: data.assigned_to ? parseInt(data.assigned_to) : null,
      priority: data.priority,
      due_date: data.due_date || null,
      remuneration_amount: data.remuneration_amount ? parseFloat(data.remuneration_amount) : 0,
      status: 'todo',
    };
    createTaskMutation.mutate(taskData);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Task"
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

        {/* Priority */}
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

        {/* Remuneration */}
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

        {/* Due Date */}
        <Input
          label="Due Date"
          type="date"
          icon={Calendar}
          {...register('due_date')}
        />

        {/* Error Message */}
        {createTaskMutation.isError && (
          <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
            <p className="text-sm text-danger-600">
              {createTaskMutation.error?.response?.data?.detail || 
               'Failed to create task. Please try again.'}
            </p>
          </div>
        )}

        {/* No Projects Warning */}
        {projects?.length === 0 && (
          <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-warning-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-warning-800 font-medium">No projects available</p>
              <p className="text-xs text-warning-600">You need to create a project first before creating tasks.</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={createTaskMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={createTaskMutation.isPending}
            disabled={createTaskMutation.isPending || projects?.length === 0}
          >
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
