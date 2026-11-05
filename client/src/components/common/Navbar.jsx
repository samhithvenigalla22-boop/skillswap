import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Sparkles,
  Sun,
  Moon,
  Bell,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  BookOpen,
  MessageSquare,
  Calendar,
  Layers,
  ShieldCheck,
  Check,
  ArrowRight,
} from 'lucide-react';
import { getInitials } from '../../utils/formatters';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const userDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserDropdownOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
      isActive
        ? 'text-primary-600 dark:text-primary-400 font-semibold bg-primary-50/60 dark:bg-primary-950/40'
        : 'text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full glassmorphism border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                SkillSwap
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase -mt-1">
                Learn One. Teach One.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <NavLink to="/explore" className={navLinkClass}>
              Explore Skills
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink to="/matches" className={navLinkClass}>
                  Skill Matches
                </NavLink>
                <NavLink to="/swap-requests" className={navLinkClass}>
                  Swap Requests
                </NavLink>
                <NavLink to="/active-swaps" className={navLinkClass}>
                  Active Swaps
                </NavLink>
                <NavLink to="/sessions" className={navLinkClass}>
                  Sessions
                </NavLink>
                <NavLink to="/messages" className={navLinkClass}>
                  Messages
                </NavLink>
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `text-sm font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
                        isActive
                          ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300'
                          : 'border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50/50'
                      }`
                    }
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin
                  </NavLink>
                )}
              </>
            )}
          </nav>

          {/* Right Action Icons (Theme, Notifications, Profile) */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notification Bell Dropdown */}
                <div className="relative" ref={notifDropdownRef}>
                  <button
                    onClick={() => setNotifDropdownOpen((prev) => !prev)}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-darkCard rounded-2xl shadow-xl border border-slate-200 dark:border-darkBorder overflow-hidden z-50 animate-in fade-in zoom-in-95">
                      <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((n) => (
                            <div
                              key={n._id}
                              onClick={() => {
                                if (!n.isRead) markAsRead(n._id);
                                setNotifDropdownOpen(false);
                                navigate('/notifications');
                              }}
                              className={`p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                                !n.isRead ? 'bg-primary-50/40 dark:bg-primary-950/20' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                                  {n.title}
                                </span>
                                {!n.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-primary-500" />
                                )}
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                                {n.message}
                              </p>
                            </div>
                          ))
                        )}
                      </div>

                      <Link
                        to="/notifications"
                        onClick={() => setNotifDropdownOpen(false)}
                        className="block p-2.5 text-center text-xs font-semibold text-primary-600 dark:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800 border-t border-slate-100 dark:border-slate-800"
                      >
                        View all notifications
                      </Link>
                    </div>
                  )}
                </div>

                {/* User Avatar & Menu */}
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-primary-500"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-500 text-white font-bold text-xs flex items-center justify-center">
                        {getInitials(user?.name)}
                      </div>
                    )}
                    <span className="hidden sm:inline-block text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                      {user?.name}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-darkCard rounded-2xl shadow-xl border border-slate-200 dark:border-darkBorder overflow-hidden z-50">
                      <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                        <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                          {user?.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {user?.email}
                        </p>
                      </div>

                      <div className="p-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Layers className="w-4 h-4 text-primary-500" />
                          Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <User className="w-4 h-4 text-primary-500" />
                          My Profile
                        </Link>
                        <Link
                          to="/manage-skills"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <BookOpen className="w-4 h-4 text-primary-500" />
                          Manage My Skills
                        </Link>
                        <Link
                          to="/profile/edit"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Settings className="w-4 h-4 text-primary-500" />
                          Account Settings
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          >
                            <ShieldCheck className="w-4 h-4 text-rose-500" />
                            Admin Console
                          </Link>
                        )}
                      </div>

                      <div className="p-1 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-primary-600 px-3 py-2 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-darkCard border-b border-slate-200 dark:border-darkBorder px-4 pt-2 pb-6 space-y-2">
          <NavLink
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Explore Skills
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/matches"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Skill Matches
              </NavLink>
              <NavLink
                to="/swap-requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Swap Requests
              </NavLink>
              <NavLink
                to="/active-swaps"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Active Swaps
              </NavLink>
              <NavLink
                to="/sessions"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Sessions
              </NavLink>
              <NavLink
                to="/messages"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Messages
              </NavLink>
              <NavLink
                to="/manage-skills"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Manage My Skills
              </NavLink>
              {isAdmin && (
                <NavLink
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-bold text-rose-600 dark:text-rose-400"
                >
                  Admin Console
                </NavLink>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-rose-600 rounded-lg hover:bg-rose-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold bg-primary-500 text-white rounded-xl shadow-md"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
