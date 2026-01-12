import React from 'react';
import { useAuth } from '../context/AuthContext';
import Dashboard from '../pages/Dashboard';
import SuperAdminDashboard from '../pages/SuperAdminDashboard';
import ManagerDashboard from '../pages/ManagerDashboard';
import TeamMemberDashboard from '../pages/TeamMemberDashboard';

const RoleDashboard = () => {
  const { user, isSuperAdmin, isManager, isTeamMember } = useAuth();

  if (isSuperAdmin) {
    return <SuperAdminDashboard />;
  } else if (isManager) {
    return <ManagerDashboard />;
  } else if (isTeamMember) {
    return <TeamMemberDashboard />;
  }

  // Fallback to regular dashboard
  return <Dashboard />;
};

export default RoleDashboard;
