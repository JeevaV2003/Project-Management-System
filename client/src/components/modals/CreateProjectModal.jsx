import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Users } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';

const CreateProjectModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const createProjectMutation = useMutation({
    mutationFn: (projectData) => axiosClient.post('/projects/', projectData),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      queryClient.invalidateQueries(['dashboard-stats']);
      queryClient.invalidateQueries(['recent-projects']);
      reset();
      onClose();
    },
    onError: (error) => {
      console.error('Error creating project:', error);
    },
  });

  const onSubmit = (data) => {
    createProjectMutation.mutate({
      name: data.name,
      description: data.description,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      status: 'active',
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Project"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Project Name */}
        <Input
          label="Project Name"
          placeholder="Enter project name"
          error={errors.name?.message}
          {...register('name', {
            required: 'Project name is required',
            minLength: {
              value: 3,
              message: 'Project name must be at least 3 characters',
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
            placeholder="Enter project description (optional)"
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-danger-600">{errors.description.message}</p>
          )}
        </div>

        {/* Start Date */}
        <Input
          label="Start Date"
          type="date"
          icon={Calendar}
          {...register('start_date')}
        />

        {/* End Date */}
        <Input
          label="End Date"
          type="date"
          icon={Calendar}
          {...register('end_date', {
            validate: (value, { start_date }) => {
              if (value && start_date && new Date(value) < new Date(start_date)) {
                return 'End date must be after start date';
              }
              return true;
            },
          })}
          error={errors.end_date?.message}
        />

        {/* Error Message */}
        {createProjectMutation.isError && (
          <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
            <p className="text-sm text-danger-600">
              {createProjectMutation.error?.response?.data?.detail || 
               'Failed to create project. Please try again.'}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={createProjectMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={createProjectMutation.isPending}
            disabled={createProjectMutation.isPending}
          >
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;
