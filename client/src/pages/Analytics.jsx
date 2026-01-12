import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { BarChart3, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import Card from '../components/ui/Card';

const Analytics = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => axiosClient.get('/dashboard/stats/').then(res => res.data),
  });

  const { data: projects } = useQuery({
    queryKey: ['projects-analytics'],
    queryFn: () => axiosClient.get('/projects/').then(res => res.data.results),
  });

  const { data: tasks } = useQuery({
    queryKey: ['tasks-analytics'],
    queryFn: () => axiosClient.get('/tasks/').then(res => res.data.results),
  });

  // Dynamic task status data from API
  const taskStatusData = stats?.task_status_distribution?.map(item => ({
    name: item.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: item.count,
    color: getStatusColor(item.status)
  })) || [];

  function getStatusColor(status) {
    switch (status) {
      case 'todo': return '#6B7280';
      case 'in_progress': return '#F59E0B';
      case 'done': return '#3B82F6';
      case 'completed': return '#10B981';
      case 'reopened': return '#EF4444';
      default: return '#6B7280';
    }
  }

  const projectProgressData = projects?.map(project => ({
    name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
    progress: project.completion_percentage,
    tasks: project.task_count,
  })) || [];

  // Calculate weekly progress from actual task data
  const getWeeklyProgressData = () => {
    if (!tasks) return [];
    
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay())); // Start of current week
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const weeklyData = weekDays.map((day, index) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + index);
      
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.created_at);
        return taskDate.toDateString() === dayDate.toDateString();
      });
      
      const completedTasks = tasks.filter(task => {
        const completedDate = task.completed_at ? new Date(task.completed_at) : null;
        return completedDate && completedDate.toDateString() === dayDate.toDateString();
      });
      
      return {
        day,
        created: dayTasks.length,
        completed: completedTasks.length
      };
    });
    
    return weeklyData;
  };

  const weeklyProgressData = getWeeklyProgressData();

  const COLORS = taskStatusData.map(item => item.color);

  // Calculate additional metrics
  const totalTasks = tasks?.length || 0;
  const completedTasksCount = tasks?.filter(task => task.status === 'completed').length || 0;
  const overdueTasks = tasks?.filter(task => {
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date);
    const now = new Date();
    return dueDate < now && !['completed'].includes(task.status);
  }).length || 0;
  
  const avgTasksPerProject = projects?.length > 0 ? (totalTasks / projects.length).toFixed(1) : 0;
  const completionRate = totalTasks > 0 ? ((completedTasksCount / totalTasks) * 100).toFixed(1) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-neutral-400 mb-2">Insights</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Analytics</h1>
          <p className="text-neutral-500 mt-1">Track your productivity and project insights</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Completion Rate</p>
              <p className="text-3xl font-bold text-neutral-900">{completionRate}%</p>
              <p className="text-sm text-neutral-500 flex items-center gap-1.5 mt-1">
                <CheckCircle className="h-3 w-3" />
                {completedTasksCount} of {totalTasks} tasks
              </p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-success-500 to-success-600">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Avg. Tasks/Project</p>
              <p className="text-3xl font-bold text-neutral-900">{avgTasksPerProject}</p>
              <p className="text-sm text-neutral-500 flex items-center gap-1.5 mt-1">
                <BarChart3 className="h-3 w-3" />
                Across {projects?.length || 0} projects
              </p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-warning-500 to-warning-600">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Projects</p>
              <p className="text-3xl font-bold text-neutral-900">{projects?.length || 0}</p>
              <p className="text-sm text-neutral-500 flex items-center gap-1.5 mt-1">
                <BarChart3 className="h-3 w-3" />
                {totalTasks} total tasks
              </p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-primary-500 to-primary-600">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Overdue Tasks</p>
              <p className="text-3xl font-bold text-neutral-900">{overdueTasks}</p>
              <p className="text-sm text-neutral-500 flex items-center gap-1.5 mt-1">
                <Clock className="h-3 w-3" />
                Need attention
              </p>
            </div>
            <div className="p-3 rounded-full bg-gradient-to-r from-gray-500 to-gray-600">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <Card>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Task Status Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Weekly Progress */}
        <Card>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Weekly Task Progress</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Completed"
                />
                <Line 
                  type="monotone" 
                  dataKey="created" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Created"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Project Progress */}
      <Card>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Project Progress Overview</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'progress' ? `${value}%` : value,
                  name === 'progress' ? 'Progress' : 'Tasks'
                ]}
              />
              <Bar dataKey="progress" fill="#3B82F6" name="progress" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">📈 Insights</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-success-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-neutral-900">High Productivity Week</p>
                <p className="text-xs text-neutral-600">You completed 15% more tasks than usual this week</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-warning-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-neutral-900">Overdue Tasks Alert</p>
                <p className="text-xs text-neutral-600">3 tasks are overdue and need immediate attention</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-neutral-900">Project Milestone</p>
                <p className="text-xs text-neutral-600">Website Redesign project is 80% complete</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">🎯 Recommendations</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-neutral-900">Focus on High Priority</p>
                <p className="text-xs text-neutral-600">Consider tackling urgent tasks first thing tomorrow</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-success-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-neutral-900">Team Collaboration</p>
                <p className="text-xs text-neutral-600">Assign more tasks to available team members</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-warning-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-neutral-900">Time Management</p>
                <p className="text-xs text-neutral-600">Break down large tasks into smaller, manageable chunks</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
