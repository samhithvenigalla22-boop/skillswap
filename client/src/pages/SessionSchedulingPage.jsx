import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as sessionService from '../services/sessionService';
import * as swapService from '../services/swapService';
import { useNotifications } from '../context/NotificationContext';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { StatusBadge } from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/Skeleton';
import { formatDate, formatTime } from '../utils/formatters';
import {
  Calendar,
  Clock,
  Video,
  Plus,
  Edit2,
  CheckCircle,
  XCircle,
  ExternalLink,
  Users,
} from 'lucide-react';

const SessionSchedulingPage = () => {
  const { addToast } = useNotifications();

  const [sessions, setSessions] = useState([]);
  const [activeSwaps, setActiveSwaps] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    swapId: '',
    title: '',
    description: '',
    scheduledDate: '',
    startTime: '10:00',
    endTime: '11:00',
    meetingLink: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessRes, swapsRes] = await Promise.all([
        sessionService.getSessions({ status: statusFilter !== 'All' ? statusFilter : undefined }),
        swapService.getActiveSwaps('Active'),
      ]);

      if (sessRes && sessRes.success) {
        setSessions(sessRes.sessions || []);
      }
      if (swapsRes && swapsRes.success) {
        const availableSwaps = swapsRes.swaps || [];
        setActiveSwaps(availableSwaps);
        if (availableSwaps.length > 0 && !formData.swapId) {
          setFormData((p) => ({ ...p, swapId: availableSwaps[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to load sessions data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleOpenAddModal = () => {
    if (activeSwaps.length === 0) {
      addToast({
        type: 'warning',
        title: 'No Active Swaps',
        message: 'You need an active skill swap before you can schedule sessions.',
      });
      return;
    }

    setEditingSession(null);
    setFormData({
      swapId: activeSwaps[0]?._id || '',
      title: 'Skill Barter Mentoring Session',
      description: 'Hands-on practice and interactive code/design walkthrough.',
      scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:00',
      meetingLink: 'https://meet.google.com/new',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (session) => {
    setEditingSession(session);
    setFormData({
      swapId: session.swapId?._id || session.swapId,
      title: session.title,
      description: session.description || '',
      scheduledDate: new Date(session.scheduledDate).toISOString().split('T')[0],
      startTime: session.startTime,
      endTime: session.endTime,
      meetingLink: session.meetingLink || '',
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Check time
    const [startH, startM] = formData.startTime.split(':').map(Number);
    const [endH, endM] = formData.endTime.split(':').map(Number);
    if (endH * 60 + endM <= startH * 60 + startM) {
      addToast({
        type: 'warning',
        title: 'Invalid Times',
        message: 'Session end time must be later than start time.',
      });
      return;
    }

    setSaving(true);
    try {
      if (editingSession) {
        await sessionService.updateSession(editingSession._id, formData);
        addToast({
          type: 'success',
          title: 'Session Updated',
          message: 'The learning session timetable was updated successfully.',
        });
      } else {
        await sessionService.createSession(formData);
        addToast({
          type: 'success',
          title: 'Session Booked 📅',
          message: 'Your learning session was scheduled and partner notified.',
        });
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: err.response?.data?.message || 'Could not save session.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteSession = async (id) => {
    try {
      await sessionService.completeSession(id);
      addToast({
        type: 'success',
        title: 'Session Completed',
        message: 'The session was marked as completed.',
      });
      fetchData();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Could not mark session as complete.',
      });
    }
  };

  const handleCancelSession = async (id) => {
    if (!window.confirm('Cancel this scheduled learning session?')) return;
    try {
      await sessionService.deleteSession(id);
      addToast({
        type: 'info',
        title: 'Session Cancelled',
        message: 'The session has been cancelled.',
      });
      fetchData();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Could not cancel session.',
      });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary-600 dark:text-primary-400 tracking-wider uppercase">
            Timetable & Calendar
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Learning Sessions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Schedule 1:1 barter mentoring calls, add video conference links, and track completion.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
            Schedule New Session
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {['All', 'Scheduled', 'Completed', 'Cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`py-3 px-5 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              statusFilter === tab
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab} Sessions
          </button>
        ))}
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No learning sessions found"
          description="Book a session with your active swap partners to practice and trade skills."
          actionLabel="Schedule Session"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((sess) => (
            <div
              key={sess._id}
              className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft flex flex-col justify-between hover-card space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {sess.title}
                  </h3>
                  <StatusBadge status={sess.status} />
                </div>

                {/* Date & Time pill */}
                <div className="flex items-center gap-3 text-xs text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/40 p-2.5 rounded-xl border border-primary-200/50 dark:border-primary-900/40 mb-3">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Calendar className="w-4 h-4 text-primary-500" />
                    <span>{formatDate(sess.scheduledDate)}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5 font-bold">
                    <Clock className="w-4 h-4 text-primary-500" />
                    <span>
                      {formatTime(sess.startTime)} – {formatTime(sess.endTime)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3">
                  {sess.description || 'No agenda provided.'}
                </p>

                {sess.meetingLink && (
                  <div className="pt-1 mb-2">
                    <a
                      href={sess.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Join Meeting Link
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                {sess.status === 'Scheduled' && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Edit2}
                      onClick={() => handleOpenEditModal(sess)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      icon={XCircle}
                      onClick={() => handleCancelSession(sess._id)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      icon={CheckCircle}
                      onClick={() => handleCompleteSession(sess._id)}
                    >
                      Mark Complete
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Session Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingSession ? 'Edit Learning Session' : 'Schedule Learning Session'}
        >
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            {/* Swap Selection */}
            {!editingSession && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Active Swap Partner *
                </label>
                <select
                  value={formData.swapId}
                  onChange={(e) => setFormData((p) => ({ ...p, swapId: e.target.value }))}
                  required
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {activeSwaps.map((s) => (
                    <option key={s._id} value={s._id}>
                      With {s.partner?.name} ({s.offeredSkill?.skillName} ↔ {s.requestedSkill?.skillName})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Session Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                required
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Scheduled Date *
                </label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, scheduledDate: e.target.value }))
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
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, startTime: e.target.value }))
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
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, endTime: e.target.value }))
                  }
                  required
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Meeting Link (Optional)
              </label>
              <input
                type="url"
                value={formData.meetingLink}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, meetingLink: e.target.value }))
                }
                placeholder="https://meet.google.com/..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Agenda / Topics to Cover
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={saving}>
                {editingSession ? 'Update Session' : 'Schedule Session'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SessionSchedulingPage;
