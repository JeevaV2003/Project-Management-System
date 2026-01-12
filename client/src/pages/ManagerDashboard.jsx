import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  Plus,
  UserPlus,
  Clock,
  AlertCircle,
  CheckSquare
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import DashboardOverview from '../components/dashboard/DashboardOverview';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [showCreateMember, setShowCreateMember] = useState(false);
  const [memberData, setMemberData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: ''
  });
  const queryClient = useQueryClient();

  // Fetch team members created by this manager
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: () => axiosClient.get('/users/').then(res => res.data.results),
  });

  // Fetch tasks that need review (status = 'done')
  const { data: tasksForReview, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks-for-review'],
    queryFn: () => axiosClient.get('/tasks/?status=done').then(res => res.data.results),
  });

  // Create team member mutation
  const createMemberMutation = useMutation({
    mutationFn: (data) => axiosClient.post('/users/create_member/', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['team-members']);
      queryClient.invalidateQueries(['dashboard-stats']);
      setShowCreateMember(false);
      setMemberData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        password_confirm: ''
      });
    },
  });

  const handleCreateMember = (e) => {
    e.preventDefault();
    if (memberData.password !== memberData.password_confirm) {
      alert('Passwords do not match');
      return;
    }
    createMemberMutation.mutate(memberData);
  };

  const teamMembers = users?.filter(u => u.role === 'member') || [];

  return (
    <div className="space-y-8">
      <DashboardOverview
        title="Team Performance Overview"
        subtitle="Snapshot of projects, tasks, and deadlines for your organization"
        showQuickActions={false}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-neutral-400 mb-2">Management</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Manager Dashboard</h1>
          <p className="text-neutral-500 mt-1">Manage your team and projects</p>
        </div>
        <div className="flex items-center gap-3 sm:mt-0">
          <Button onClick={() => setShowCreateMember(true)}>
            <UserPlus className="h-4 w-4" />
            Create Team Member
          </Button>
        </div>
      </div>

      {/* Team KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">My Team Members</p>
              <p className="text-3xl font-bold text-neutral-900">
                {usersLoading ? '...' : teamMembers.length}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Pending Reviews</p>
              <p className="text-3xl font-bold text-neutral-900">
                {tasksLoading ? '...' : tasksForReview?.length || 0}
              </p>
            </div>
            <div className="p-3 bg-danger-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-danger-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Team Capacity</p>
              <p className="text-3xl font-bold text-neutral-900">
                {tasksLoading ? '...' : (tasksForReview?.length || 0) + teamMembers.length}
              </p>
            </div>
            <div className="p-3 bg-warning-100 rounded-lg">
              <Users className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Active Members</p>
              <p className="text-3xl font-bold text-neutral-900">
                {usersLoading ? '...' : teamMembers.filter(member => member.is_active !== false).length}
              </p>
            </div>
            <div className="p-3 bg-success-100 rounded-lg">
              <Users className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Team Members */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">My Team Members</h3>
            <Button size="sm" onClick={() => setShowCreateMember(true)}>
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          </div>
          <div className="space-y-3">
            {usersLoading ? (
              <div className="animate-pulse space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-neutral-200 rounded"></div>
                ))}
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-neutral-500">No team members yet</p>
                <Button 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setShowCreateMember(true)}
                >
                  Create First Team Member
                </Button>
              </div>
            ) : (
              teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div>
                    <p className="font-medium text-neutral-900">
                      {member.first_name && member.last_name 
                        ? `${member.first_name} ${member.last_name}` 
                        : member.username}
                    </p>
                    <p className="text-sm text-neutral-600">{member.email}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                    Team Member
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Tasks Pending Review */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Tasks Pending Review</h3>
            <span className="px-2 py-1 text-xs font-medium bg-warning-100 text-warning-800 rounded-full">
              {tasksForReview?.length || 0} pending
            </span>
          </div>
          <div className="space-y-3">
            {tasksLoading ? (
              <div className="animate-pulse space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-neutral-200 rounded"></div>
                ))}
              </div>
            ) : tasksForReview?.length === 0 ? (
              <div className="text-center py-8">
                <CheckSquare className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-neutral-500">No tasks pending review</p>
              </div>
            ) : (
              tasksForReview?.slice(0, 5).map((task) => (
                <div key={task.id} className="p-3 border border-warning-200 bg-warning-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">{task.title}</p>
                      <p className="text-sm text-neutral-600 mt-1">
                        Assigned to: {task.assigned_to?.username || 'Unassigned'}
                      </p>
                      <div className="flex items-center mt-2">
                        <Clock className="h-3 w-3 text-warning-600" />
                        <span className="text-xs text-warning-700">Awaiting your review</span>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-warning-200 text-warning-800 rounded-full">
                      Done
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          {tasksForReview?.length > 5 && (
            <div className="mt-4 text-center">
              <Button size="sm" variant="outline">
                View All ({tasksForReview.length})
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Create Team Member Modal */}
      {showCreateMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Create Team Member Account</h3>
            <form onSubmit={handleCreateMember} className="space-y-4">
              <Input
                label="Username"
                value={memberData.username}
                onChange={(e) => setMemberData({...memberData, username: e.target.value})}
                required
              />
              <Input
                label="Email"
                type="email"
                value={memberData.email}
                onChange={(e) => setMemberData({...memberData, email: e.target.value})}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={memberData.first_name}
                  onChange={(e) => setMemberData({...memberData, first_name: e.target.value})}
                />
                <Input
                  label="Last Name"
                  value={memberData.last_name}
                  onChange={(e) => setMemberData({...memberData, last_name: e.target.value})}
                />
              </div>
              <Input
                label="Password"
                type="password"
                value={memberData.password}
                onChange={(e) => setMemberData({...memberData, password: e.target.value})}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                value={memberData.password_confirm}
                onChange={(e) => setMemberData({...memberData, password_confirm: e.target.value})}
                required
              />
              
              {createMemberMutation.isError && (
                <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
                  <p className="text-sm text-danger-600">
                    {createMemberMutation.error?.response?.data?.detail || 
                     'Failed to create team member. Please try again.'}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateMember(false)}
                  disabled={createMemberMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={createMemberMutation.isPending}
                  disabled={createMemberMutation.isPending}
                >
                  Create Team Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
