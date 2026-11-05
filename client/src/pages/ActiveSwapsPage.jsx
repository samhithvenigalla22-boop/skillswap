import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as swapService from '../services/swapService';
import * as sessionService from '../services/sessionService';
import * as reviewService from '../services/reviewService';
import { useNotifications } from '../context/NotificationContext';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import RatingStars from '../components/common/RatingStars';
import { StatusBadge, ProficiencyBadge } from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/Skeleton';
import { formatDate, formatTime, getInitials } from '../utils/formatters';
import {
  Users,
  MessageSquare,
  Calendar,
  CheckCircle,
  Star,
  Plus,
  Clock,
  Sparkles,
} from 'lucide-react';

const ActiveSwapsPage = () => {
  const { addToast } = useNotifications();

  const [statusFilter, setStatusFilter] = useState('Active'); // 'Active', 'Completed', 'All'
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Schedule Session Modal State
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [activeSwapForSession, setActiveSwapForSession] = useState(null);
  const [sessionForm, setSessionForm] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    startTime: '10:00',
    endTime: '11:00',
    meetingLink: '',
  });
  const [scheduling, setScheduling] = useState(false);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [activeSwapForReview, setActiveSwapForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchSwaps = async () => {
    setLoading(true);
    try {
      const data = await swapService.getActiveSwaps(statusFilter);
      if (data && data.success) {
        setSwaps(data.swaps || []);
      }
    } catch (err) {
      console.error('Failed to load active swaps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwaps();
  }, [statusFilter]);

  // Complete Swap Action
  const handleCompleteSwap = async (swap) => {
    if (!window.confirm('Mark this skill barter exchange as completed?')) return;

    try {
      await swapService.completeSwap(swap._id);
      addToast({
        type: 'success',
        title: 'Swap Completed! 🎓',
        message: 'Congratulations on finishing your skill exchange! Please leave a review.',
      });

      // Prompt review modal
      setActiveSwapForReview(swap);
      setReviewRating(5);
      setReviewComment('');
      setReviewModalOpen(true);

      fetchSwaps();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Completion Error',
        message: err.response?.data?.message || 'Could not complete swap.',
      });
    }
  };

  // Schedule Session Action
  const handleOpenScheduleModal = (swap) => {
    setActiveSwapForSession(swap);
    setSessionForm({
      title: `Learning Session: ${swap.requestedSkill?.skillName || 'Skill Exchange'}`,
      description: 'Review curriculum fundamentals and practical exercises.',
      scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:00',
      meetingLink: 'https://meet.google.com/new',
    });
    setScheduleModalOpen(true);
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setScheduling(true);

    try {
      await sessionService.createSession({
        swapId: activeSwapForSession._id,
        title: sessionForm.title.trim(),
        description: sessionForm.description.trim(),
        scheduledDate: sessionForm.scheduledDate,
        startTime: sessionForm.startTime,
        endTime: sessionForm.endTime,
        meetingLink: sessionForm.meetingLink.trim(),
      });

      addToast({
        type: 'success',
        title: 'Session Scheduled 📅',
        message: `Your learning session has been booked for ${sessionForm.scheduledDate}!`,
      });

      setScheduleModalOpen(false);
      fetchSwaps();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Scheduling Failed',
        message: err.response?.data?.message || 'Could not book session.',
      });
    } finally {
      setScheduling(false);
    }
  };

  // Submit Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);

    try {
      await reviewService.createReview({
        swapId: activeSwapForReview._id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      addToast({
        type: 'success',
        title: 'Review Submitted ⭐',
        message: 'Thank you for building community reputation!',
      });

      setReviewModalOpen(false);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Review Submission Error',
        message: err.response?.data?.message || 'Could not submit review.',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary-600 dark:text-primary-400 tracking-wider uppercase">
            Active Collaborations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Skill Swap Exchanges
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your ongoing learning exchanges, direct messages, and session schedules.
          </p>
        </div>

        {/* Status Filter Buttons */}
        <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
          {['Active', 'Completed', 'All'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === status
                  ? 'bg-white dark:bg-darkCard text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Swaps List */}
      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : swaps.length === 0 ? (
        <EmptyState
          icon={Users}
          title={
            statusFilter === 'Active'
              ? 'No active swaps in progress'
              : 'No completed swaps found'
          }
          description={
            statusFilter === 'Active'
              ? 'Propose swaps to potential matches or accept pending proposals to start exchanging skills.'
              : 'Completed swaps and exchanges will appear here once marked as finished.'
          }
          actionLabel="Discover Matches"
          onAction={() => (window.location.href = '/matches')}
        />
      ) : (
        <div className="space-y-5">
          {swaps.map((swap) => (
            <div
              key={swap._id}
              className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft hover-card space-y-5"
            >
              {/* Partner and Status Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3.5">
                  {swap.partner?.profilePicture ? (
                    <img
                      src={swap.partner.profilePicture}
                      alt={swap.partner.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-primary-500 shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-secondary-500 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
                      {getInitials(swap.partner?.name)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {swap.partner?.name || 'Swap Partner'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Started on {formatDate(swap.startedAt)}
                      {swap.completedAt && ` • Completed on ${formatDate(swap.completedAt)}`}
                    </p>
                  </div>
                </div>

                <StatusBadge status={swap.status} />
              </div>

              {/* Skills Exchange Visual Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                    Offered Skill:
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                    {swap.offeredSkill?.skillName}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Category: {swap.offeredSkill?.category}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40">
                  <span className="text-[10px] uppercase font-bold text-indigo-800 dark:text-indigo-300 block mb-1">
                    Requested Skill:
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                    {swap.requestedSkill?.skillName}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Category: {swap.requestedSkill?.category}
                  </span>
                </div>
              </div>

              {/* Next Upcoming Session info if any */}
              {swap.nextSession && (
                <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>
                      Next Session: <strong>{swap.nextSession.title}</strong> on{' '}
                      {formatDate(swap.nextSession.scheduledDate)} at{' '}
                      {formatTime(swap.nextSession.startTime)}
                    </span>
                  </div>
                  {swap.nextSession.meetingLink && (
                    <a
                      href={swap.nextSession.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold underline text-[11px]"
                    >
                      Join Meeting
                    </a>
                  )}
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {swap.upcomingSessionsCount > 0
                    ? `${swap.upcomingSessionsCount} scheduled sessions`
                    : 'No sessions scheduled yet'}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link to={`/messages/${swap._id}`}>
                    <Button size="sm" variant="outline" icon={MessageSquare}>
                      Open Chat
                    </Button>
                  </Link>

                  {swap.status === 'Active' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Calendar}
                        onClick={() => handleOpenScheduleModal(swap)}
                      >
                        Schedule Session
                      </Button>

                      <Button
                        size="sm"
                        variant="primary"
                        icon={CheckCircle}
                        onClick={() => handleCompleteSwap(swap)}
                      >
                        Complete Swap
                      </Button>
                    </>
                  )}

                  {swap.status === 'Completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Star}
                      onClick={() => {
                        setActiveSwapForReview(swap);
                        setReviewRating(5);
                        setReviewComment('');
                        setReviewModalOpen(true);
                      }}
                    >
                      Write Review
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Session Modal */}
      {scheduleModalOpen && activeSwapForSession && (
        <Modal
          isOpen={scheduleModalOpen}
          onClose={() => setScheduleModalOpen(false)}
          title={`Schedule Session with ${activeSwapForSession.partner?.name}`}
        >
          <form onSubmit={handleCreateSession} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Session Title *
              </label>
              <input
                type="text"
                value={sessionForm.title}
                onChange={(e) => setSessionForm((p) => ({ ...p, title: e.target.value }))}
                required
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={sessionForm.scheduledDate}
                  onChange={(e) =>
                    setSessionForm((p) => ({ ...p, scheduledDate: e.target.value }))
                  }
                  required
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={sessionForm.startTime}
                  onChange={(e) =>
                    setSessionForm((p) => ({ ...p, startTime: e.target.value }))
                  }
                  required
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  End Time *
                </label>
                <input
                  type="time"
                  value={sessionForm.endTime}
                  onChange={(e) =>
                    setSessionForm((p) => ({ ...p, endTime: e.target.value }))
                  }
                  required
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Meeting Link (Google Meet, Zoom, etc.)
              </label>
              <input
                type="url"
                value={sessionForm.meetingLink}
                onChange={(e) =>
                  setSessionForm((p) => ({ ...p, meetingLink: e.target.value }))
                }
                placeholder="https://meet.google.com/abc-defg-hij"
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Agenda / Topics to Cover
              </label>
              <textarea
                rows={3}
                value={sessionForm.description}
                onChange={(e) =>
                  setSessionForm((p) => ({ ...p, description: e.target.value }))
                }
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setScheduleModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={scheduling} icon={Calendar}>
                Confirm Schedule
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Review Modal */}
      {reviewModalOpen && activeSwapForReview && (
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title={`Rate & Review: ${activeSwapForReview.partner?.name}`}
        >
          <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
            <div className="text-center py-2 space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                How was your learning exchange?
              </span>
              <RatingStars
                rating={reviewRating}
                interactive={true}
                size="lg"
                onChange={(val) => setReviewRating(val)}
                showScore={false}
              />
              <span className="text-xs font-bold text-primary-600 dark:text-primary-400 block">
                {reviewRating} out of 5 Stars
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Written Feedback & Testimonial
              </label>
              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience: Was the instructor helpful, patient, and knowledgeable?"
                required
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setReviewModalOpen(false)}>
                Later
              </Button>
              <Button type="submit" variant="primary" loading={submittingReview} icon={Star}>
                Submit Review
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ActiveSwapsPage;
