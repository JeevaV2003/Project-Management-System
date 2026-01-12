import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderOpen, 
  CheckSquare, 
  Users, 
  BarChart3, 
  Settings,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { clsx } from 'clsx';

const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const location = useLocation();
  const { isAdmin, canManageProjects } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,  
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: FolderOpen,
    },
    {
      name: 'Tasks',                      
      href: '/tasks',
      icon: CheckSquare,
    },
    // Analytics only for managers and superadmins
    ...(canManageProjects ? [{
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
    }] : []),
  ];

  const adminNavigation = [
    {
      name: 'Users',
      href: '/users',
      icon: Users,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <aside
      className={clsx(
        'fixed top-20 left-0 z-30 h-[calc(100vh-5rem)] w-72 border-r border-white/10 bg-neutral-950/80 px-6 py-8 text-white shadow-2xl backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0',
        {
          '-translate-x-full lg:translate-x-0': !isOpen,
          'translate-x-0': isOpen,
        }
      )}
    >
      <div className="flex h-full flex-col gap-8">
        {canManageProjects && (
          <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-inner">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Quick actions</p>
            <Link to="/projects/new" onClick={onClose}>
              <Button className="w-full justify-center text-white shadow-glow" size="sm">
                <Plus className="h-4 w-4" />
                <span>New Project</span>
              </Button>
            </Link>
            <Link to="/tasks/new" onClick={onClose}>
              <Button
                className="w-full justify-center border border-white/15 text-white/80 hover:bg-white/10"
                size="sm"
                variant="ghost"
              >
                <Plus className="h-4 w-4" />
                <span>New Task</span>
              </Button>
            </Link>
          </div>
        )}

        <nav className="space-y-6">
          <div>
            <p className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Main</p>
            <div className="mt-3 space-y-1.5">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={clsx('sidebar-item', { active })}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {isAdmin && (
            <div>
              <p className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Admin</p>
              <div className="mt-3 space-y-1.5">
                {adminNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={onClose}
                      className={clsx('sidebar-item', { active })}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
          <p className="font-semibold text-white">Need help?</p>
          <p className="mt-1 text-xs text-white/60">Access documentation, learn best practices, and reach out to support.</p>
          <a
            href="mailto:support@taskmanager.app"
            className="mt-3 inline-flex items-center text-xs font-semibold text-secondary-200 transition hover:text-white"
          >
            support@taskmanager.app
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
