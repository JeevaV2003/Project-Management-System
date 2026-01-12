import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  Calendar,
  User,
  TrendingUp,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TaskStatusModal from '../components/modals/TaskStatusModal';
import DashboardOverview from '../components/dashboard/DashboardOverview';

const TeamMemberDashboard = () => {
  const { user } = useAuth();
  const [selectedTaskForStatus, setSelectedTaskForStatus] = useState(null);

  // Fetch tasks assigned to this team member
  const { data: myTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: () => axiosClient.get('/tasks/').then(res => res.data.results),
  });

  // Filter tasks by status
  const todoTasks = myTasks?.filter(task => task.status === 'todo') || [];
  const inProgressTasks = myTasks?.filter(task => task.status === 'in_progress') || [];
  const doneTasks = myTasks?.filter(task => task.status === 'done') || [];
  const completedTasks = myTasks?.filter(task => task.status === 'completed') || [];
  const reopenedTasks = myTasks?.filter(task => task.status === 'reopened') || [];

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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-danger-100 text-danger-800';
      case 'high': return 'bg-warning-100 text-warning-800';
      case 'medium': return 'bg-primary-100 text-primary-800';
      case 'low': return 'bg-neutral-100 text-neutral-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const TaskCard = ({ task }) => (
    <div className="p-4 border border-neutral-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-neutral-900 mb-1">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-neutral-600 mb-2 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(task.status)}`}>
              {task.status.replace('_', ' ')}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>
          <div className="flex items-center text-xs text-neutral-500 gap-3">
            <span>Project: {task.project_name}</span>
            {task.due_date && (
              <div className={`flex items-center ${task.is_overdue ? 'text-danger-600' : ''}`}>
                <Calendar className="h-3 w-3" />
                Due: {new Date(task.due_date).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => setSelectedTaskForStatus(task)}
        >
          <RefreshCw className="h-3 w-3" />
          Update
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <DashboardOverview
        title="My Dashboard"
        subtitle={`Welcome back, ${user?.first_name || user?.username}!`}
        showQuickActions={false}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Tasks</p>
              <p className="text-3xl font-bold text-neutral-900">
                {tasksLoading ? '...' : myTasks?.length || 0}
              </p>
            </div>
            <div className="p-2 bg-primary-100 rounded-lg">
              <CheckSquare className="h-5 w-5 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">To Do</p>
              <p className="text-3xl font-bold text-neutral-900">
                {tasksLoading ? '...' : todoTasks.length}
              </p>
            </div>
            <div className="p-2 bg-neutral-100 rounded-lg">
              <Clock className="h-5 w-5 text-neutral-600" />
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">In Progress</p>
              <p className="text-3xl font-bold text-neutral-900">
                {tasksLoading ? '...' : inProgressTasks.length}
              </p>
            </div>
            <div className="p-2 bg-warning-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-warning-600" />
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Completed</p>
              <p className="text-3xl font-bold text-neutral-900">
                {tasksLoading ? '...' : completedTasks.length}
              </p>
            </div>
            <div className="p-2 bg-success-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-success-600" />
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Needs Work</p>
              <p className="text-3xl font-bold text-neutral-900">
                {tasksLoading ? '...' : reopenedTasks.length}
              </p>
            </div>
            <div className="p-2 bg-danger-100 rounded-lg">
              <RefreshCw className="h-5 w-5 text-danger-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Task Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Tasks Needing Attention */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Tasks Needing Attention</h3>
            <span className="px-2 py-1 text-xs font-medium bg-warning-100 text-warning-800 rounded-full">
              {reopenedTasks.length + todoTasks.length} tasks
            </span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {tasksLoading ? (
              <div className="animate-pulse space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-neutral-200 rounded"></div>
                ))}
              </div>
            ) : [...reopenedTasks, ...todoTasks].length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-neutral-500">All caught up! No tasks need attention.</p>
              </div>
            ) : (
              [...reopenedTasks, ...todoTasks].map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
          </div>
        </Card>

        {/* In Progress Tasks */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Currently Working On</h3>
            <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
              {inProgressTasks.length} tasks
            </span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {tasksLoading ? (
              <div className="animate-pulse space-y-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-20 bg-neutral-200 rounded"></div>
                ))}
              </div>
            ) : inProgressTasks.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-neutral-500">No tasks in progress.</p>
                <p className="text-sm text-neutral-400">Start working on a task to see it here.</p>
              </div>
            ) : (
              inProgressTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent Completed Tasks</h3>
        <div className="space-y-3">
          {tasksLoading ? (
            <div className="animate-pulse space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-neutral-200 rounded"></div>
              ))}
            </div>
          ) : [...doneTasks, ...completedTasks].length === 0 ? (
            <div className="text-center py-8">
              <CheckSquare className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-neutral-500">No completed tasks yet.</p>
            </div>
          ) : (
            [...doneTasks, ...completedTasks].slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">{task.title}</p>
                  <p className="text-sm text-neutral-600">Project: {task.project_name}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(task.status)}`}>
                    {task.status === 'done' ? 'Awaiting Review' : 'Completed'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Task Status Modal */}
      <TaskStatusModal
        isOpen={!!selectedTaskForStatus}
        onClose={() => setSelectedTaskForStatus(null)}
        task={selectedTaskForStatus}
      />
    </div>
  );
};

export default TeamMemberDashboard;
