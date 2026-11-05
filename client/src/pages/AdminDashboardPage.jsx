import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import * as adminService from '../services/adminService';
import Button from '../components/common/Button';
import RatingStars from '../components/common/RatingStars';
import { ProficiencyBadge, CategoryBadge } from '../components/common/Badge';
import { CardSkeleton, TableSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import { formatDate, getInitials } from '../utils/formatters';
import {
  ShieldCheck,
  Users,
  BookOpen,
  RefreshCw,
  Search,
  CheckCircle2,
  Ban,
  Trash2,
  TrendingUp,
  Award,
  AlertTriangle,
} from 'lucide-react';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'skills'
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // User Management State
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [togglingUserId, setTogglingUserId] = useState(null);

  // Skills Management State
  const [skills, setSkills] = useState([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [deletingSkillId, setDeletingSkillId] = useState(null);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const data = await adminService.getDashboardStats();
      if (data && data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await adminService.getAllUsers({ search: userSearch });
      if (data && data.success) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users for admin:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchSkills = async () => {
    setLoadingSkills(true);
    try {
      const data = await adminService.getAllSkills({ search: skillSearch });
      if (data && data.success) {
        setSkills(data.skills || []);
      }
    } catch (err) {
      console.error('Failed to load skills for admin:', err);
    } finally {
      setLoadingSkills(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'skills') fetchSkills();
  }, [activeTab]);

  const handleToggleUserStatus = async (targetUser) => {
    if (targetUser._id === (user?._id || user?.id)) {
      addToast({
        type: 'warning',
        title: 'Action Forbidden',
        message: 'Administrators cannot suspend their own account.',
      });
      return;
    }

    const newStatus = !targetUser.isActive;
    const actionLabel = newStatus ? 'reactivate' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${actionLabel} ${targetUser.name}'s account?`))
      return;

    setTogglingUserId(targetUser._id);
    try {
      await adminService.updateUserStatus(targetUser._id, newStatus);
      addToast({
        type: 'success',
        title: `Account ${newStatus ? 'Reactivated' : 'Suspended'}`,
        message: `${targetUser.name}'s account has been ${newStatus ? 'reactivated' : 'suspended'}.`,
      });
      fetchUsers();
      fetchStats();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: err.response?.data?.message || 'Could not update user status.',
      });
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleDeleteSkill = async (skillId, skillName) => {
    if (!window.confirm(`Remove skill "${skillName}" for violating guidelines?`)) return;

    setDeletingSkillId(skillId);
    try {
      await adminService.deleteSkillByAdmin(skillId);
      addToast({
        type: 'success',
        title: 'Skill Listing Removed',
        message: `"${skillName}" has been removed from the platform.`,
      });
      fetchSkills();
      fetchStats();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Removal Error',
        message: err.response?.data?.message || 'Could not delete skill listing.',
      });
    } finally {
      setDeletingSkillId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-900 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Admin Management Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time platform telemetry, user moderation, and community standards enforcement.
          </p>
        </div>

        <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchStats}>
          Refresh Platform Data
        </Button>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-6 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Platform Analytics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-6 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          User Accounts Moderation
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`py-3 px-6 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'skills'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Skill Listings Moderation
        </button>
      </div>

      {/* Tab 1: Platform Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {loadingStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            <>
              {/* Top Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-4 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">
                    Total Users
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {stats?.users?.total || 0}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                    {stats?.users?.active || 0} Active
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">
                    Total Skills
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {stats?.skills?.total || 0}
                  </div>
                  <span className="text-[10px] text-indigo-600 font-bold block mt-0.5">
                    {stats?.skills?.offered || 0} Offered
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">
                    Swap Proposals
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {stats?.requests?.total || 0}
                  </div>
                  <span className="text-[10px] text-amber-600 font-bold block mt-0.5">
                    {stats?.requests?.pending || 0} Pending
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">
                    Active Swaps
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {stats?.swaps?.active || 0}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                    In Progress
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">
                    Completed Swaps
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {stats?.swaps?.completed || 0}
                  </div>
                  <span className="text-[10px] text-purple-600 font-bold block mt-0.5">
                    100% Barter
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">
                    Platform Rating
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {stats?.reviews?.averageRating > 0
                      ? stats.reviews.averageRating.toFixed(1)
                      : '5.0'}
                    ★
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {stats?.reviews?.total || 0} Reviews
                  </span>
                </div>
              </div>

              {/* Recent Activity Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Recently Registered Users
                  </h3>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {stats?.recentUsers?.map((u) => (
                      <div key={u._id} className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-500 text-white font-bold text-xs flex items-center justify-center">
                            {getInitials(u.name)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block">
                              {u.name}
                            </span>
                            <span className="text-[10px] text-slate-400">{u.email}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {formatDate(u.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Swaps */}
                <div className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Recent Skill Swaps
                  </h3>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {stats?.recentSwaps?.map((swap) => (
                      <div key={swap._id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white block">
                            {swap.offeredSkill?.skillName} ↔ {swap.requestedSkill?.skillName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {swap.participants?.map((p) => p.name).join(' & ')}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-100 text-primary-800 dark:bg-primary-950/60 dark:text-primary-300">
                          {swap.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 2: User Moderation */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchUsers();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users by name, email, or location..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <Button type="submit" variant="primary">
              Filter
            </Button>
          </form>

          {loadingUsers ? (
            <TableSkeleton rows={5} />
          ) : (
            <div className="bg-white dark:bg-darkCard rounded-2xl border border-slate-200 dark:border-darkBorder shadow-soft overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Skills</th>
                    <th className="p-4">Swaps</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map((u) => {
                    const isSelf = u._id === (user?._id || user?.id);

                    return (
                      <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {u.profilePicture ? (
                              <img
                                src={u.profilePicture}
                                alt={u.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary-500 text-white font-bold text-xs flex items-center justify-center">
                                {getInitials(u.name)}
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {u.name}
                              </span>
                              <span className="text-[10px] text-slate-400">{u.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.role === 'admin'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                          {u.skillsCount || 0}
                        </td>
                        <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                          {u.swapsCount || 0}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.isActive
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}
                          >
                            {u.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            size="sm"
                            variant={u.isActive ? 'danger' : 'success'}
                            disabled={isSelf || togglingUserId === u._id}
                            loading={togglingUserId === u._id}
                            onClick={() => handleToggleUserStatus(u)}
                          >
                            {u.isActive ? 'Suspend' : 'Reactivate'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Skill Moderation */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchSkills();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                placeholder="Search skills by title or description..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <Button type="submit" variant="primary">
              Filter
            </Button>
          </form>

          {loadingSkills ? (
            <TableSkeleton rows={5} />
          ) : (
            <div className="bg-white dark:bg-darkCard rounded-2xl border border-slate-200 dark:border-darkBorder shadow-soft overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Skill Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Instructor</th>
                    <th className="p-4 text-right">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {skills.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        {s.skillName}
                      </td>
                      <td className="p-4">
                        <CategoryBadge category={s.category} />
                      </td>
                      <td className="p-4 font-semibold">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            s.skillType === 'Offer'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                          }`}
                        >
                          {s.skillType}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {s.userId?.name || 'Unknown'}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          size="sm"
                          variant="danger"
                          icon={Trash2}
                          loading={deletingSkillId === s._id}
                          onClick={() => handleDeleteSkill(s._id, s.skillName)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
