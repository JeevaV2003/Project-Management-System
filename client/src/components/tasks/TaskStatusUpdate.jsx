import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, RotateCcw, Clock, AlertCircle } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

const TaskStatusUpdate = ({ task, onClose }) => {
  const { user, isTeamMember, canManageProjects } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState(task.status);
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: (status) => 
      axiosClient.patch(`/tasks/${task.id}/status/`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['task', task.id]);
      queryClient.invalidateQueries(['dashboard-stats']);
      queryClient.invalidateQueries(['notifications']);
      onClose();
    },
  });

  const handleStatusUpdate = () => {
    if (selectedStatus !== task.status) {
      updateStatusMutation.mutate(selectedStatus);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-neutral-100 text-neutral-800 border-neutral-300';
      case 'in_progress': return 'bg-warning-100 text-warning-800 border-warning-300';
      case 'done': return 'bg-primary-100 text-primary-800 border-primary-300';
      case 'completed': return 'bg-success-100 text-success-800 border-success-300';
      case 'reopened': return 'bg-danger-100 text-danger-800 border-danger-300';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'todo': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <AlertCircle className="h-4 w-4" />;
      case 'done': return <Check className="h-4 w-4" />;
      case 'completed': return <Check className="h-4 w-4" />;
      case 'reopened': return <RotateCcw className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getAvailableStatuses = () => {
    if (isTeamMember && task.assigned_to?.id === user.id) {
      // Team members can only update their own tasks
      if (task.status === 'todo') {
        return [
          { value: 'todo', label: 'To Do' },
          { value: 'in_progress', label: 'In Progress' }
        ];
      } else if (task.status === 'in_progress') {
        return [
          { value: 'in_progress', label: 'In Progress' },
          { value: 'done', label: 'Done' }
        ];
      } else if (task.status === 'reopened') {
        return [
          { value: 'reopened', label: 'Reopened' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'done', label: 'Done' }
        ];
      }
      return [{ value: task.status, label: task.status.replace('_', ' ') }];
    } else if (canManageProjects) {
      // Managers can approve/decline done tasks and manage all statuses
      return [
        { value: 'todo', label: 'To Do' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'done', label: 'Done' },
        { value: 'completed', label: 'Completed' },
        { value: 'reopened', label: 'Reopened' }
      ];
    }
    return [{ value: task.status, label: task.status.replace('_', ' ') }];
  };

  const availableStatuses = getAvailableStatuses();
  const canUpdate = availableStatuses.length > 1;

  const getWorkflowMessage = () => {
    if (isTeamMember && task.assigned_to?.id === user.id) {
      if (task.status === 'done') {
        return 'Task is awaiting manager review';
      } else if (task.status === 'completed') {
        return 'Task has been approved by manager';
      } else if (task.status === 'reopened') {
        return 'Task needs more work - please review manager feedback';
      }
    } else if (canManageProjects && task.status === 'done') {
      return 'Task is ready for your review - approve or request changes';
    }
    return null;
  };

  const workflowMessage = getWorkflowMessage();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">Update Task Status</h3>
        <p className="text-sm text-neutral-600">{task.title}</p>
      </div>

      {/* Workflow Message */}
      {workflowMessage && (
        <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
          <p className="text-sm text-primary-800">{workflowMessage}</p>
        </div>
      )}

      {/* Current Status */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Current Status
        </label>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(task.status)}`}>
          {getStatusIcon(task.status)}
                  <span className="capitalize">{task.status.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Status Selection */}
      {canUpdate && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Update to
          </label>
          <div className="space-y-2">
            {availableStatuses.map((status) => (
              <label
                key={status.value}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedStatus === status.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={status.value}
                  checked={selectedStatus === status.value}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="sr-only"
                />
                <div className={`flex items-center px-2 py-1 rounded-full text-sm font-medium border ${getStatusColor(status.value)}`}>
                  {getStatusIcon(status.value)}
                  <span>{status.label}</span>
                </div>
                {status.value === 'completed' && (
                  <span className="text-xs text-neutral-500">(Approve task)</span>
                )}
                {status.value === 'reopened' && (
                  <span className="text-xs text-neutral-500">(Request changes)</span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Permission Message */}
      {!canUpdate && (
        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
          <p className="text-sm text-neutral-600">
            {isTeamMember 
              ? task.assigned_to?.id !== user.id
                ? 'You can only update tasks assigned to you'
                : 'No status changes available for this task'
              : 'You do not have permission to update this task'
            }
          </p>
        </div>
      )}

      {/* Error Message */}
      {updateStatusMutation.isError && (
        <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
          <p className="text-sm text-danger-600">
            {updateStatusMutation.error?.response?.data?.error || 
             'Failed to update task status. Please try again.'}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={updateStatusMutation.isPending}
        >
          Cancel
        </Button>
        {canUpdate && selectedStatus !== task.status && (
          <Button
            onClick={handleStatusUpdate}
            loading={updateStatusMutation.isPending}
            disabled={updateStatusMutation.isPending}
          >
            Update Status
          </Button>
        )}
      </div>
    </div>
  );
};

export default TaskStatusUpdate;
