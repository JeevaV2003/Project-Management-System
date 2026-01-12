import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  Plus,
  UserPlus,
  Shield,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import DashboardOverview from '../components/dashboard/DashboardOverview';

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const [showCreateManager, setShowCreateManager] = useState(false);
  const [managerData, setManagerData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: ''
  });
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => axiosClient.get('/users/').then(res => res.data.results),
  });

  // Create manager mutation
  const createManagerMutation = useMutation({
    mutationFn: (data) => axiosClient.post('/users/create_manager/', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-users']);
      queryClient.invalidateQueries(['dashboard-stats']);
      setShowCreateManager(false);
      setManagerData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        password_confirm: ''
      });
    },
  });

  const handleCreateManager = (e) => {
    e.preventDefault();
    if (managerData.password !== managerData.password_confirm) {
      alert('Passwords do not match');
      return;
    }
    createManagerMutation.mutate(managerData);
  };

  const managers = users?.filter(u => u.role === 'manager') || [];
  const teamMembers = users?.filter(u => u.role === 'member') || [];

  return (
    <div className="space-y-8">
      <DashboardOverview
        title="Organization Overview"
        subtitle="Company-wide metrics across every team"
        showQuickActions={false}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-neutral-400 mb-2">Administration</p>
          <h1 className="text-3xl font-semibold text-neutral-900">Super Admin Dashboard</h1>
          <p className="text-neutral-500 mt-1">Manage the entire organization</p>
        </div>
        <div className="flex items-center gap-3 sm:mt-0">
          <Button onClick={() => setShowCreateManager(true)}>
            <UserPlus className="h-4 w-4" />
            Create Manager
          </Button>
        </div>
      </div>

      {/* Users Management */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Managers */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Managers</h3>
            <Button size="sm" onClick={() => setShowCreateManager(true)}>
              <Plus className="h-4 w-4" />
              Add Manager
            </Button>
          </div>
          <div className="space-y-3">
            {usersLoading ? (
              <div className="animate-pulse space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-neutral-200 rounded"></div>
                ))}
              </div>
            ) : managers.length === 0 ? (
              <p className="text-neutral-500 text-center py-4">No managers yet</p>
            ) : (
              managers.map((manager) => (
                <div key={manager.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div>
                    <p className="font-medium text-neutral-900">
                      {manager.first_name && manager.last_name 
                        ? `${manager.first_name} ${manager.last_name}` 
                        : manager.username}
                    </p>
                    <p className="text-sm text-neutral-600">{manager.email}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-warning-100 text-warning-800 rounded-full">
                    Manager
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Team Members */}
        <Card>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Team Members</h3>
          <div className="space-y-3">
            {usersLoading ? (
              <div className="animate-pulse space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-neutral-200 rounded"></div>
                ))}
              </div>
            ) : teamMembers.length === 0 ? (
              <p className="text-neutral-500 text-center py-4">No team members yet</p>
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
                    Member
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Create Manager Modal */}
      {showCreateManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Create Manager Account</h3>
            <form onSubmit={handleCreateManager} className="space-y-4">
              <Input
                label="Username"
                value={managerData.username}
                onChange={(e) => setManagerData({...managerData, username: e.target.value})}
                required
              />
              <Input
                label="Email"
                type="email"
                value={managerData.email}
                onChange={(e) => setManagerData({...managerData, email: e.target.value})}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={managerData.first_name}
                  onChange={(e) => setManagerData({...managerData, first_name: e.target.value})}
                />
                <Input
                  label="Last Name"
                  value={managerData.last_name}
                  onChange={(e) => setManagerData({...managerData, last_name: e.target.value})}
                />
              </div>
              <Input
                label="Password"
                type="password"
                value={managerData.password}
                onChange={(e) => setManagerData({...managerData, password: e.target.value})}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                value={managerData.password_confirm}
                onChange={(e) => setManagerData({...managerData, password_confirm: e.target.value})}
                required
              />
              
              {createManagerMutation.isError && (
                <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
                  <p className="text-sm text-danger-600">
                    {createManagerMutation.error?.response?.data?.detail || 
                     'Failed to create manager. Please try again.'}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateManager(false)}
                  disabled={createManagerMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={createManagerMutation.isPending}
                  disabled={createManagerMutation.isPending}
                >
                  Create Manager
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
