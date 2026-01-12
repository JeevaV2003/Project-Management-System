import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FolderOpen,
  CheckSquare,
  TrendingUp,
  Plus,
  Calendar,
  AlertTriangle,
  PieChart,
  BarChart3,
  Clock,
  Wallet as WalletIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import Card from '../ui/Card';
import Button from '../ui/Button';
import CreateProjectModal from '../modals/CreateProjectModal';
import CreateTaskModal from '../modals/CreateTaskModal';

const STATUS_LABELS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
  completed: 'Completed',
  reopened: 'Reopened',
};

const STATUS_COLORS = {
  todo: 'bg-neutral-200 text-neutral-800',
  in_progress: 'bg-warning-100 text-warning-800',
  done: 'bg-primary-100 text-primary-800',
  completed: 'bg-success-100 text-success-800',
  reopened: 'bg-danger-100 text-danger-800',
};

const STATUS_BAR_COLORS = {
  todo: 'bg-neutral-400',
  in_progress: 'bg-warning-500',
  done: 'bg-primary-500',
  completed: 'bg-success-500',
  reopened: 'bg-danger-500',
};

const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

const PRIORITY_COLORS = {
  low: 'bg-neutral-100 text-neutral-800',
  medium: 'bg-primary-100 text-primary-800',
  high: 'bg-warning-100 text-warning-800',
  urgent: 'bg-danger-100 text-danger-800',
};

const DashboardOverview = ({
  showHeader = true,
  showQuickActions = true,
  title,
  subtitle = "Here's what's happening with your projects today.",
  className = '',
}) => {
  const { user } = useAuth();
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [rangeDays, setRangeDays] = useState(7);
  const rupeeFormatter = useMemo(() => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }), []);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', rangeDays],
    queryFn: () => axiosClient.get(`/dashboard/stats/?range_days=${rangeDays}`).then(res => res.data),
  });

  // Fetch recent projects
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['recent-projects'],
    queryFn: () => axiosClient.get('/projects/?limit=5').then(res => res.data.results),
  });

  // Fetch recent tasks
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['recent-tasks'],
    queryFn: () => axiosClient.get('/tasks/?limit=10').then(res => res.data.results),
  });

  // Fetch recent activities
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: () => axiosClient.get('/activities/?limit=10').then(res => res.data.results),
  });

  // Fetch wallet overview for quick balance snapshot
  const { data: walletOverview, isLoading: walletLoading } = useQuery({
    queryKey: ['dashboard-wallet', user?.id],
    queryFn: () => axiosClient.get('/wallet/overview/').then(res => res.data),
    enabled: !!user,
  });

  const statusDistribution = useMemo(() => {
    const distribution = stats?.task_status_distribution || [];
    const total = distribution.reduce((sum, item) => sum + item.count, 0);
    return {
      total,
      items: distribution.map((item) => ({
        key: item.status,
        label: STATUS_LABELS[item.status] || item.status,
        count: item.count,
        percentage: total ? Math.round((item.count / total) * 100) : 0,
      })),
    };
  }, [stats]);

  const priorityDistribution = useMemo(() => {
    const distribution = stats?.priority_distribution || [];
    const total = distribution.reduce((sum, item) => sum + item.count, 0);
    return distribution.map((item) => ({
      key: item.priority,
      label: PRIORITY_LABELS[item.priority] || item.priority,
      count: item.count,
      percentage: total ? Math.round((item.count / total) * 100) : 0,
    }));
  }, [stats]);

  const projectStatusSummary = useMemo(() => {
    const summary = stats?.project_status_summary || [];
    const total = summary.reduce((sum, item) => sum + item.count, 0);
    return summary.map((item) => ({
      key: item.status,
      label: item.status.replace('_', ' '),
      count: item.count,
      percentage: total ? Math.round((item.count / total) * 100) : 0,
    }));
  }, [stats]);

  const statChanges = stats?.stat_changes || {};
  const upcomingTasks = stats?.upcoming_tasks || [];
  const rangeOptions = [7, 14, 30];
  const remuneration = stats?.remuneration || { total: 0, pending: 0, earned: 0 };
  const walletBalance = walletOverview?.balance || 0;
  const formatINR = (amount) => rupeeFormatter.format(Number(amount || 0));

  const StatCard = ({ title: statTitle, value, icon: Icon, gradient, change }) => (
    <Card className={`relative overflow-hidden border-none text-white shadow-large ${gradient}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 opacity-40" />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/70">{statTitle}</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
          {typeof change === 'number' && (
            <p className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${change >= 0 ? 'bg-white/20 text-white' : 'bg-black/20 text-white'}`}>
              <TrendingUp className="h-3 w-3" />
              {change >= 0 ? '+' : ''}{change}
            </p>
          )}
        </div>
        <div className="rounded-2xl bg-white/20 p-3 shadow-inner">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </Card>
  );

  const TaskCard = ({ task }) => {
    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'urgent': return 'bg-danger-100 text-danger-800';
        case 'high': return 'bg-warning-100 text-warning-800';
        case 'medium': return 'bg-primary-100 text-primary-800';
        case 'low': return 'bg-neutral-100 text-neutral-800';
        default: return 'bg-neutral-100 text-neutral-800';
      }
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'done':
        case 'completed':
          return 'bg-success-100 text-success-800';
        case 'in_progress':
          return 'bg-warning-100 text-warning-800';
        case 'todo':
          return 'bg-neutral-100 text-neutral-800';
        case 'reopened':
          return 'bg-danger-100 text-danger-800';
        default:
          return 'bg-neutral-100 text-neutral-800';
      }
    };

    return (
      <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
        <div className="flex-1">
          <h4 className="font-medium text-neutral-900">{task.title}</h4>
          <p className="text-sm text-neutral-600">{task.project_name}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
              {task.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        {task.due_date && (
          <div className="text-right">
            <p className="text-xs text-neutral-500">Due</p>
            <p className={`text-sm font-medium ${task.is_overdue ? 'text-danger-600' : 'text-neutral-900'}`}>
              {new Date(task.due_date).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    );
  };

  const WalletCard = () => (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600">Wallet Balance</p>
          <p className="text-3xl font-bold text-neutral-900 mt-1">
            {walletLoading ? '—' : formatINR(walletBalance)}
          </p>
        </div>
        <div className="p-3 rounded-full bg-primary-100">
          <WalletIcon className="h-6 w-6 text-primary-600" />
        </div>
      </div>
      <p className="text-sm text-neutral-500">
        {walletLoading ? 'Fetching latest balance...' : 'Includes completed task earnings'}
      </p>
    </Card>
  );

  const RemunerationCard = () => (
    <Card className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1">
        <p className="text-xs uppercase text-primary-600 font-semibold">Total</p>
        <p className="text-3xl font-bold text-neutral-900">{formatINR(remuneration.total)}</p>
        <p className="text-sm text-neutral-500">Remuneration assigned</p>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Pending</span>
          <span className="font-semibold text-warning-600">
            {formatINR(remuneration.pending)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Earned</span>
          <span className="font-semibold text-success-600">
            {formatINR(remuneration.earned)}
          </span>
        </div>
      </div>
    </Card>
  );

  const ActivityItem = ({ activity }) => (
    <div className="flex items-start gap-3 p-3">
      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
      <div className="flex-1">
        <p className="text-sm text-neutral-900">{activity.description}</p>
        <p className="text-xs text-neutral-500">
          {new Date(activity.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const containerClass = className ? `space-y-8 ${className}` : 'space-y-8';

  return (
    <div className={containerClass}>
      {showHeader && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-neutral-900">
              {title || `Welcome back, ${user?.first_name || user?.username}!`}
            </h1>
            <p className="text-neutral-500 mt-1">{subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2 shadow-soft">
              <span className="text-sm text-neutral-600">Range</span>
              <select
                value={rangeDays}
                onChange={(e) => setRangeDays(parseInt(e.target.value, 10))}
                className="bg-transparent text-sm font-medium focus:outline-none"
              >
                {rangeOptions.map((range) => (
                  <option key={range} value={range}>{range}d</option>
                ))}
              </select>
            </div>
            {showQuickActions && (
              <>
                <Button onClick={() => setShowCreateProject(true)}>
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
                <Button variant="secondary" onClick={() => setShowCreateTask(true)}>
                  <Plus className="h-4 w-4" />
                  New Task
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Projects"
          value={stats?.total_projects || 0}
          icon={FolderOpen}
          gradient="bg-gradient-to-br from-primary-500 to-secondary-500"
          change={statChanges.total_projects}
        />
        <StatCard
          title="Active Tasks"
          value={stats?.total_tasks || 0}
          icon={CheckSquare}
          gradient="bg-gradient-to-br from-success-500 to-primary-500"
          change={statChanges.total_tasks}
        />
        <StatCard
          title="Completed Tasks"
          value={stats?.completed_tasks || 0}
          icon={CheckSquare}
          gradient="bg-gradient-to-br from-secondary-500 to-primary-400"
          change={statChanges.completed_tasks}
        />
        <StatCard
          title="Overdue Tasks"
          value={stats?.overdue_tasks || 0}
          icon={AlertTriangle}
          gradient="bg-gradient-to-br from-danger-500 to-warning-500"
          change={statChanges.overdue_tasks}
        />
      </div>

      {/* Wallet Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WalletCard />
        <RemunerationCard />
      </div>

      {/* Analytics Widgets */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Task Status Distribution</h2>
              <p className="text-sm text-neutral-500">{statusDistribution.total} tasks tracked</p>
            </div>
            <PieChart className="h-5 w-5 text-primary-500" />
          </div>
          <div className="space-y-4">
            {statusDistribution.items.length > 0 ? (
              statusDistribution.items.map((item) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between text-sm text-neutral-600 mb-1">
                    <span>{item.label}</span>
                    <span>{item.count} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2">
                    <div
                      className={`${STATUS_BAR_COLORS[item.key] || 'bg-primary-500'} h-2 rounded-full`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500 text-center py-6">No task data available</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Priority Breakdown</h2>
              <p className="text-sm text-neutral-500">Understand urgency distribution</p>
            </div>
            <BarChart3 className="h-5 w-5 text-warning-500" />
          </div>
          <div className="space-y-3">
            {priorityDistribution.length > 0 ? (
              priorityDistribution.map((item) => (
                <div key={item.key} className="flex items-center justify-between border border-neutral-100 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${PRIORITY_COLORS[item.key] || 'bg-neutral-100 text-neutral-800'}`}>
                      {item.label}
                    </span>
                    <span className="text-sm text-neutral-600">{item.count} tasks</span>
                  </div>
                  <span className="text-sm font-medium text-neutral-900">{item.percentage}%</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500 text-center py-6">No priority data available</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Project Status</h2>
              <p className="text-sm text-neutral-500">Overall portfolio health</p>
            </div>
          </div>
          <div className="space-y-4">
            {projectStatusSummary.length > 0 ? (
              projectStatusSummary.map((item) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between text-sm text-neutral-600 mb-1">
                    <span className="capitalize">{item.label}</span>
                    <span>{item.count} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2">
                    <div
                      className="bg-secondary-500 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500 text-center py-6">No project data available</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">Recent Projects</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-3">
            {projectsLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-neutral-200 rounded"></div>
                ))}
              </div>
            ) : projects?.length > 0 ? (
              projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                  <div>
                    <h4 className="font-medium text-neutral-900">{project.name}</h4>
                    <p className="text-sm text-neutral-600">{project.task_count} tasks</p>
                  </div>
                  <div className="text-right">
                    <div className="w-16 bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${project.completion_percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">{project.completion_percentage}%</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-neutral-500 text-center py-4">No projects yet</p>
            )}
          </div>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">Recent Tasks</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-3">
            {tasksLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-neutral-200 rounded"></div>
                ))}
              </div>
            ) : tasks?.length > 0 ? (
              tasks.slice(0, 5).map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            ) : (
              <p className="text-neutral-500 text-center py-4">No tasks yet</p>
            )}
          </div>
        </Card>

        {/* Activity Feed */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">Recent Activity</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {activitiesLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-neutral-200 rounded"></div>
                ))}
              </div>
            ) : activities?.length > 0 ? (
              activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <p className="text-neutral-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Upcoming Deadlines</h2>
              <p className="text-sm text-neutral-500">Tasks due soon</p>
            </div>
            <Clock className="h-5 w-5 text-primary-500" />
          </div>
          <div className="space-y-3">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <div key={task.id} className="p-4 border border-neutral-100 rounded-lg hover:bg-neutral-50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-neutral-900">{task.title}</h4>
                      <p className="text-sm text-neutral-600">{task.project_name}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${PRIORITY_COLORS[task.priority] || 'bg-neutral-100 text-neutral-800'}`}>
                      {PRIORITY_LABELS[task.priority] || task.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-sm">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[task.status] || 'bg-neutral-100 text-neutral-800'}`}>
                      {STATUS_LABELS[task.status] || task.status}
                    </span>
                    <div className={`flex items-center text-xs ${task.is_overdue ? 'text-danger-600' : 'text-neutral-600'}`}>
                      <Calendar className="h-3 w-3" />
                      {new Date(task.due_date).toLocaleDateString()} (
                        {task.due_in_days === 0 ? 'Due today' : `Due in ${task.due_in_days}d`}
                      )
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-neutral-500 text-center py-6">No upcoming deadlines</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Workload Snapshot</h2>
              <p className="text-sm text-neutral-500">Completion rate • range {stats?.range_days || rangeDays}d</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-neutral-600 mb-2">Completion Rate</p>
              <div className="flex items-center gap-3">
                <div className="text-4xl font-semibold text-neutral-900">{stats?.completion_rate || 0}%</div>
                <div className="text-sm text-neutral-500">of tasks marked done</div>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-2 mt-3">
                <div className="bg-success-500 h-2 rounded-full" style={{ width: `${stats?.completion_rate || 0}%` }}></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-success-50 border border-success-100 rounded-lg">
                <p className="text-xs uppercase text-success-600 font-semibold">Completed</p>
                <p className="text-3xl font-bold text-success-700 mt-1">{stats?.completed_tasks || 0}</p>
              </div>
              <div className="p-4 bg-danger-50 border border-danger-100 rounded-lg">
                <p className="text-xs uppercase text-danger-600 font-semibold">Overdue</p>
                <p className="text-3xl font-bold text-danger-700 mt-1">{stats?.overdue_tasks || 0}</p>
              </div>
            </div>
            <div className="text-sm text-neutral-600">
              <p>Track progress trends by adjusting the range filter above.</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Modals */}
      <CreateProjectModal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
      />
      <CreateTaskModal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
      />
    </div>
  );
};

export default DashboardOverview;
