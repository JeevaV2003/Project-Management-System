import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, 
  User, 
  Settings, 
  LogOut, 
  Menu
} from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';

const Navbar = ({ onToggleSidebar = () => {} }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-20 border-b border-white/20 bg-white/70 backdrop-blur-2xl">
      <div className="app-shell flex h-full items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/30 bg-white/60 text-neutral-600 shadow-inner transition hover:text-primary-600 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-glow">
              <span className="text-base font-semibold tracking-tight">TM</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-base font-semibold text-neutral-900">Task Manager</p>
              <p className="text-xs uppercase tracking-wide text-neutral-400">Workspace</p>
            </div>
          </Link>
        </div>

        {/* <div className="hidden flex-1 md:flex">
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              placeholder="Search projects, tasks, teammates..."
              className="w-full rounded-2xl border border-white/40 bg-white/70 pl-11 ml-4 pr-4 text-sm text-neutral-600 shadow-inner focus:border-primary-300 focus:ring-4 focus:ring-primary-100"
            />
          </div>
        </div> */}

        <div className="ml-auto flex items-center gap-3">
          <NotificationBell />

          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/80 px-2 py-1 text-left text-sm text-neutral-600 shadow-inner transition hover:text-neutral-900"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-neutral-900">{user?.first_name || user?.username}</p>
                <p className="text-xs capitalize text-neutral-400">{user?.role}</p>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-60 rounded-2xl border border-white/30 bg-white/95 p-3 shadow-large">
                <div className="rounded-2xl border border-neutral-100/70 bg-neutral-50/80 p-3">
                  <p className="text-sm font-semibold text-neutral-900">{user?.username}</p>
                  <p className="text-xs text-neutral-500 capitalize">{user?.role}</p>
                </div>

                <div className="mt-3 space-y-1">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-danger-600 transition hover:bg-danger-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showProfileMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </header>
  );
};

export default Navbar;
