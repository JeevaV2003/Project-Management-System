import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, X, Check, Clock } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

const NotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notificationData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => axiosClient.get('/notifications/').then(res => res.data),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const notifications = notificationData?.notifications || [];
  const unreadCount = notificationData?.unread_count || 0;

  // Mark notifications as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationIds) => 
      axiosClient.patch('/notifications/read/', { notification_ids: notificationIds }),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const handleMarkAsRead = (notificationId) => {
    markAsReadMutation.mutate([notificationId]);
  };

  const handleMarkAllAsRead = () => {
    markAsReadMutation.mutate([]);
    setIsOpen(false);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/40 bg-white/80 text-neutral-500 shadow-inner transition hover:text-neutral-900"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger-500 text-xs font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute right-0 z-40 mt-3 w-80 rounded-3xl border border-white/40 bg-white/95 shadow-large backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
              <h3 className="text-base font-semibold text-neutral-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs font-semibold text-primary-600 transition hover:text-primary-700"
                    disabled={markAsReadMutation.isPending}
                  >
                    Mark all
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-100 border-t-primary-500" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-6 py-10 text-center text-neutral-500">
                  <Bell className="mx-auto mb-3 h-8 w-8 text-neutral-200" />
                  <p className="text-sm font-medium">You&apos;re all caught up</p>
                  <p className="text-xs text-neutral-400">We&apos;ll let you know when something needs attention.</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100/80">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-5 py-4 transition ${
                        !notification.is_read ? 'bg-primary-50/60' : 'bg-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className={`text-sm ${!notification.is_read ? 'font-semibold text-neutral-900' : 'text-neutral-600'}`}>
                            {notification.message}
                          </p>
                          {notification.task_title && (
                            <p className="text-xs text-neutral-400">Task · {notification.task_title}</p>
                          )}
                          <div className="flex items-center text-xs text-neutral-400">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(notification.created_at)}
                          </div>
                        </div>
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="rounded-full border border-primary-100 bg-white/80 p-1 text-primary-500 shadow-inner transition hover:bg-primary-50"
                            disabled={markAsReadMutation.isPending}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
