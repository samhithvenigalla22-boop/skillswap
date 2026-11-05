import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import { formatRelativeTime } from '../utils/formatters';
import {
  Bell,
  CheckCheck,
  Check,
  MessageSquare,
  Sparkles,
  Calendar,
  Star,
  Award,
  AlertCircle,
  Inbox,
} from 'lucide-react';

const NotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'SWAP_REQUEST':
        return <Inbox className="w-5 h-5 text-amber-500" />;
      case 'SWAP_ACCEPTED':
        return <Sparkles className="w-5 h-5 text-emerald-500" />;
      case 'NEW_MESSAGE':
        return <MessageSquare className="w-5 h-5 text-indigo-500" />;
      case 'SESSION_SCHEDULED':
      case 'SESSION_UPDATED':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'SWAP_COMPLETED':
        return <Award className="w-5 h-5 text-purple-500" />;
      case 'NEW_REVIEW':
        return <Star className="w-5 h-5 text-amber-400 fill-amber-400" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      markAsRead(notif._id);
    }

    // Direct routing based on notification type
    switch (notif.type) {
      case 'SWAP_REQUEST':
        navigate('/swap-requests');
        break;
      case 'SWAP_ACCEPTED':
      case 'SWAP_COMPLETED':
        navigate('/active-swaps');
        break;
      case 'NEW_MESSAGE':
        navigate(notif.relatedId ? `/messages/${notif.relatedId}` : '/messages');
        break;
      case 'SESSION_SCHEDULED':
      case 'SESSION_UPDATED':
        navigate('/sessions');
        break;
      case 'NEW_REVIEW':
        navigate('/reviews');
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary-600 dark:text-primary-400 tracking-wider uppercase">
            Activity Updates
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Stay informed on swap proposals, session alerts, reviews, and community messages.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            icon={CheckCheck}
            onClick={markAllAsRead}
          >
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="When members send you swap proposals, schedule sessions, or message you, alerts will appear here."
        />
      ) : (
        <div className="bg-white dark:bg-darkCard rounded-3xl border border-slate-200 dark:border-darkBorder shadow-soft divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleNotificationClick(n)}
              className={`p-5 flex items-start gap-4 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                !n.isRead ? 'bg-primary-50/40 dark:bg-primary-950/20' : ''
              }`}
            >
              <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                {getNotificationIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4
                    className={`text-sm ${
                      !n.isRead
                        ? 'font-extrabold text-slate-900 dark:text-white'
                        : 'font-semibold text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {formatRelativeTime(n.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {n.message}
                </p>
              </div>

              {!n.isRead && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(n._id);
                  }}
                  title="Mark as read"
                  className="p-1.5 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-950 rounded-lg shrink-0"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
