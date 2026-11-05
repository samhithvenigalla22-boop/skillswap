import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as skillService from '../services/skillService';
import * as swapService from '../services/swapService';
import * as sessionService from '../services/sessionService';
import * as matchService from '../services/matchService';
import * as notificationService from '../services/notificationService';
import Button from '../components/common/Button';
import { CardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import { ProficiencyBadge, StatusBadge } from '../components/common/Badge';
import RatingStars from '../components/common/RatingStars';
import { formatDate, formatTime, getInitials } from '../utils/formatters';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  PlusCircle,
  Calendar,
  MessageSquare,
  Users,
  Bell,
  Clock,
  Video,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [skillsData, setSkillsData] = useState({ offeredSkills: [], wantedSkills: [] });
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [activeSwaps, setActiveSwaps] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [skillsRes, reqsRes, swapsRes, sessRes, matchRes, notifRes] =
          await Promise.allSettled([
            skillService.getMySkills(),
            swapService.getReceivedRequests(),
            swapService.getActiveSwaps('Active'),
            sessionService.getSessions({ status: 'Scheduled' }),
            matchService.getMatches(),
            notificationService.getNotifications(),
          ]);

        if (skillsRes.status === 'fulfilled') setSkillsData(skillsRes.value);
        if (reqsRes.status === 'fulfilled')
          setReceivedRequests(reqsRes.value.requests?.filter((r) => r.status === 'Pending') || []);
        if (swapsRes.status === 'fulfilled') setActiveSwaps(swapsRes.value.swaps || []);
        if (sessRes.status === 'fulfilled') setUpcomingSessions(sessRes.value.sessions || []);
        if (matchRes.status === 'fulfilled') setMatches(matchRes.value.matches?.slice(0, 3) || []);
        if (notifRes.status === 'fulfilled')
          setNotifications(notifRes.value.notifications?.slice(0, 4) || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute profile completion percentage
  const calculateProfileCompletion = () => {
    let score = 20; // registered
    if (user?.bio && user.bio.length > 20) score += 20;
    if (user?.location) score += 15;
    if (user?.profilePicture) score += 15;
    if (skillsData.offeredSkills?.length > 0) score += 15;
    if (skillsData.wantedSkills?.length > 0) score += 15;
    return Math.min(score, 100);
  };

  const completionPct = calculateProfileCompletion();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 p-6 sm:p-8 text-white shadow-xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SkillSwap Active Learner</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-primary-100 max-w-xl">
              Ready to learn and teach today? Check out your pending swap requests and upcoming scheduled sessions below.
            </p>
          </div>

          {/* Profile Completion Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[220px]">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span>Profile Strength</span>
              <span className="font-bold text-amber-300">{completionPct}%</span>
            </div>
            <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            {completionPct < 100 && (
              <Link
                to="/profile/edit"
                className="text-[11px] text-white underline hover:text-amber-200 mt-2 block"
              >
                Complete profile details →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/manage-skills"
          className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft hover-card"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Skills Offered
            </span>
            <BookOpen className="w-4 h-4 text-primary-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {skillsData.offeredSkills?.length || 0}
          </div>
          <p className="text-[11px] text-primary-600 dark:text-primary-400 font-medium mt-1">
            + Teach others
          </p>
        </Link>

        <Link
          to="/manage-skills"
          className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft hover-card"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Skills Wanted
            </span>
            <Sparkles className="w-4 h-4 text-secondary-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {skillsData.wantedSkills?.length || 0}
          </div>
          <p className="text-[11px] text-secondary-600 dark:text-secondary-400 font-medium mt-1">
            + Learn something new
          </p>
        </Link>

        <Link
          to="/swap-requests"
          className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft hover-card"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Pending Requests
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {receivedRequests.length}
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
            {receivedRequests.length > 0 ? 'Awaiting response' : 'All caught up'}
          </p>
        </Link>

        <Link
          to="/active-swaps"
          className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft hover-card"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Active Swaps
            </span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {activeSwaps.length}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            In progress exchanges
          </p>
        </Link>
      </div>

      {/* Main Dashboard Layout: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Active Swaps & Recommended Matches */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Swaps Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-500" />
                Active Skill Swaps
              </h2>
              <Link
                to="/active-swaps"
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                View all ({activeSwaps.length})
              </Link>
            </div>

            {activeSwaps.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No active swaps yet"
                description="Accept a pending request or find complementary matches to start swapping skills."
                actionLabel="Discover Matches"
                onAction={() => (window.location.href = '/matches')}
              />
            ) : (
              <div className="space-y-3">
                {activeSwaps.slice(0, 3).map((swap) => (
                  <div
                    key={swap._id}
                    className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      {swap.partner?.profilePicture ? (
                        <img
                          src={swap.partner.profilePicture}
                          alt={swap.partner.name}
                          className="w-11 h-11 rounded-full object-cover border border-primary-500"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-primary-500 text-white font-bold text-sm flex items-center justify-center">
                          {getInitials(swap.partner?.name)}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {swap.partner?.name || 'Swap Partner'}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>
                            Teaching:{' '}
                            <strong className="text-slate-800 dark:text-slate-200">
                              {swap.offeredSkill?.skillName}
                            </strong>
                          </span>
                          <span>•</span>
                          <span>
                            Learning:{' '}
                            <strong className="text-slate-800 dark:text-slate-200">
                              {swap.requestedSkill?.skillName}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Link to={`/messages/${swap._id}`} className="flex-1 sm:flex-none">
                        <Button size="sm" variant="outline" icon={MessageSquare}>
                          Chat
                        </Button>
                      </Link>
                      <Link to={`/sessions`} className="flex-1 sm:flex-none">
                        <Button size="sm" variant="primary" icon={Calendar}>
                          Schedule
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Skill Matches */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-secondary-500" />
                Recommended Matches For You
              </h2>
              <Link
                to="/matches"
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                View full matches ({matches.length})
              </Link>
            </div>

            {matches.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No complementary matches found yet"
                description="Add more skills you offer and want to learn to help our algorithm discover ideal partners."
                actionLabel="Manage My Skills"
                onAction={() => (window.location.href = '/manage-skills')}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.map((match) => (
                  <div
                    key={match.user._id}
                    className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft flex flex-col justify-between hover-card"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-primary-100 text-primary-800 dark:bg-primary-950/60 dark:text-primary-300">
                          {match.matchPercentage}% Match
                        </span>
                        <RatingStars
                          rating={match.user.averageRating}
                          count={match.user.reviewCount}
                          size="sm"
                        />
                      </div>

                      <div className="flex items-center gap-2.5 mb-3">
                        {match.user.profilePicture ? (
                          <img
                            src={match.user.profilePicture}
                            alt={match.user.name}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-primary-500 text-white font-bold text-xs flex items-center justify-center">
                            {getInitials(match.user.name)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {match.user.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 truncate">
                            {match.user.location || 'Member'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs mb-4">
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                            Can Teach You:
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                            {match.canTeachYou?.[0]?.skillName || 'Various Skills'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link to={`/matches`}>
                      <Button size="sm" variant="outline" className="w-full">
                        View Match Details
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Upcoming Sessions & Quick Actions */}
        <div className="space-y-8">
          {/* Quick Actions Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Quick Actions
            </h3>
            <Link to="/manage-skills" className="block">
              <Button size="sm" variant="outline" className="w-full justify-start" icon={PlusCircle}>
                Add Skills to Teach or Learn
              </Button>
            </Link>
            <Link to="/explore" className="block">
              <Button size="sm" variant="outline" className="w-full justify-start" icon={BookOpen}>
                Explore Skill Marketplace
              </Button>
            </Link>
            <Link to="/matches" className="block">
              <Button size="sm" variant="outline" className="w-full justify-start" icon={Sparkles}>
                Discover Mutual Barter Matches
              </Button>
            </Link>
          </div>

          {/* Upcoming Sessions Widget */}
          <div className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-500" />
                Upcoming Sessions
              </h3>
              <Link
                to="/sessions"
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                View Calendar
              </Link>
            </div>

            {upcomingSessions.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                No sessions scheduled yet. Coordinate with your swap partners!
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.slice(0, 3).map((sess) => (
                  <div
                    key={sess._id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {sess.title}
                      </span>
                      <StatusBadge status={sess.status} />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{formatDate(sess.scheduledDate)}</span>
                      <span>•</span>
                      <span>{formatTime(sess.startTime)}</span>
                    </div>
                    {sess.meetingLink && (
                      <a
                        href={sess.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:underline pt-1"
                      >
                        <Video className="w-3 h-3" />
                        Join Video Meeting
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity / Notifications Widget */}
          <div className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary-500" />
                Recent Notifications
              </h3>
              <Link
                to="/notifications"
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                All
              </Link>
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-2 text-center">
                No recent notifications
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map((n) => (
                  <div key={n._id} className="py-2.5 first:pt-0 last:pb-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {n.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
