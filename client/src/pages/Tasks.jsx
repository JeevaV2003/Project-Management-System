import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckSquare, Plus, Filter, Search, Calendar, User, RefreshCw, IndianRupee } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import CreateTaskModal from '../components/modals/CreateTaskModal';
import EditTaskModal from '../components/modals/EditTaskModal';
import TaskStatusModal from '../components/modals/TaskStatusModal';
import { getStatusVariant, getPriorityVariant, getStatusLabel, getPriorityLabel } from '../utils/statusColors';

const rupeeFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

const formatCurrency = (amount) => rupeeFormatter.format(Number(amount || 0));

const Tasks = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTaskForStatus, setSelectedTaskForStatus] = useState(null);
  const { canManageProjects, isTeamMember, user } = useAuth();

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks', statusFilter, priorityFilter],
    queryFn: () => {
      let url = '/tasks/';
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (params.toString()) url += `?${params.toString()}`;
      return axiosClient.get(url).then(res => res.data.results);
    },
  });

  const getPaymentStatusVariant = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'earned':
        return 'primary';
      default:
        return 'default';
    }
  };

  const TaskCard = ({ task }) => {

    return (
      <Card className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${task.status === 'done' || task.status === 'completed' ? 'bg-success-500' : task.status === 'in_progress' ? 'bg-warning-500' : 'bg-neutral-300'}`}>
              <CheckSquare className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">{task.title}</h3>
              <p className="text-sm text-neutral-500">{task.project_name}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={getPriorityVariant(task.priority)}>
              {getPriorityLabel(task.priority)}
            </Badge>
            <Badge variant={getStatusVariant(task.status)}>
              {getStatusLabel(task.status)}
            </Badge>
          </div>
        </div>

        {task.description && (
          <p className="text-sm text-neutral-600 line-clamp-2">{task.description}</p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-neutral-500">
          <div className="flex flex-wrap items-center gap-3">
            {task.assigned_to && (
              <span className="inline-flex items-center gap-1.5">
                <User className="h-4 w-4 text-primary-500" />
                {task.assigned_to.username}
              </span>
            )}
            {task.due_date && (
              <span className={`inline-flex items-center gap-1.5 ${task.is_overdue ? 'text-danger-600' : ''}`}>
                <Calendar className="h-4 w-4" />
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {((isTeamMember && task.assigned_to?.id === user?.id) || canManageProjects) && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setSelectedTaskForStatus(task)}
              >
                <RefreshCw className="h-3 w-3" />
                Update
              </Button>
            )}
            {(canManageProjects || (task.assigned_to?.id === user?.id)) && (
              <Button size="sm" variant="ghost" onClick={() => setSelectedTaskId(task.id)}>
                Edit
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-neutral-100/80 bg-neutral-50/60 p-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/80 p-2 shadow-inner">
              <IndianRupee className="h-4 w-4 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Remuneration</p>
              <p className="font-semibold text-neutral-900">{formatCurrency(task.remuneration_amount)}</p>
            </div>
          </div>
          <Badge variant={getPaymentStatusVariant(task.payment_status || 'pending')}>
            {getStatusLabel(task.payment_status || 'pending')}
          </Badge>
        </div>
      </Card>
    );
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
    { value: 'completed', label: 'Completed' },
    { value: 'reopened', label: 'Reopened' },
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priority' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  // Error handling
  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="text-danger-600 mb-6">
            <CheckSquare className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Error Loading Tasks</h3>
            <p className="text-sm text-neutral-600 mt-2">
              {error?.response?.data?.detail || error?.message || 'Failed to load tasks'}
            </p>
          </div>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-neutral-400 mb-2">Workflow</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Tasks</h1>
          <p className="text-neutral-500 mt-1">Manage and track your tasks</p>
        </div>
        {canManageProjects && (
          <div className="flex items-center gap-3 sm:mt-0">
            <Button onClick={() => setShowCreateTask(true)}>
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-xl border border-neutral-200/80 bg-white/90 px-3 py-2 shadow-inner">
            <Search className="h-4 w-4 text-neutral-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="flex-1 border-0 bg-transparent text-sm text-neutral-700 focus:outline-none focus:ring-0"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-neutral-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-neutral-200/80 bg-white/90 px-3 py-2 text-sm text-neutral-700 shadow-inner focus:border-primary-400 focus:ring-4 focus:ring-primary-100 focus:outline-none"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-xl border border-neutral-200/80 bg-white/90 px-3 py-2 text-sm text-neutral-700 shadow-inner focus:border-primary-400 focus:ring-4 focus:ring-primary-100 focus:outline-none"
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Tasks Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-4 bg-neutral-200 rounded mb-3"></div>
              <div className="h-3 bg-neutral-200 rounded mb-2"></div>
              <div className="h-3 bg-neutral-200 rounded mb-4"></div>
              <div className="h-2 bg-neutral-200 rounded"></div>
            </Card>
          ))}
        </div>
      ) : tasks?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CheckSquare className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No tasks found</h3>
          <p className="text-neutral-600 mb-6">
            {statusFilter !== 'all' || priorityFilter !== 'all' 
              ? 'Try adjusting your filters'
              : canManageProjects 
                ? 'Get started by creating your first task'
                : 'No tasks assigned to you yet'
            }
          </p>
          {canManageProjects && (
            <Button onClick={() => setShowCreateTask(true)}>
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
          )}
        </Card>
      )}

      {/* Modals */}
      <CreateTaskModal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
      />
      <EditTaskModal
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        taskId={selectedTaskId}
      />
      <TaskStatusModal
        isOpen={!!selectedTaskForStatus}
        onClose={() => setSelectedTaskForStatus(null)}
        task={selectedTaskForStatus}
      />
    </div>
  );
};

export default Tasks;
