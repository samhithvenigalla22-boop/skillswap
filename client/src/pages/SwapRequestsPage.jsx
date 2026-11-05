import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as swapService from '../services/swapService';
import { useNotifications } from '../context/NotificationContext';
import Button from '../components/common/Button';
import { StatusBadge, ProficiencyBadge } from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/Skeleton';
import { formatDate, getInitials } from '../utils/formatters';
import {
  Inbox,
  Send,
  Check,
  X,
  Clock,
  ArrowRight,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

const SwapRequestsPage = () => {
  const { addToast } = useNotifications();

  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'
  const [loading, setLoading] = useState(true);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [receivedRes, sentRes] = await Promise.all([
        swapService.getReceivedRequests(),
        swapService.getSentRequests(),
      ]);

      if (receivedRes && receivedRes.success) {
        setReceivedRequests(receivedRes.requests || []);
      }
      if (sentRes && sentRes.success) {
        setSentRequests(sentRes.requests || []);
      }
    } catch (err) {
      console.error('Failed to load swap requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id, partnerName) => {
    setActionLoadingId(id);
    try {
      await swapService.acceptSwapRequest(id);
      addToast({
        type: 'success',
        title: 'Swap Accepted! 🎉',
        message: `You and ${partnerName} are now active swap partners. You can chat and schedule sessions!`,
      });
      fetchRequests();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Acceptance Error',
        message: err.response?.data?.message || 'Could not accept request.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to decline this swap proposal?')) return;
    setActionLoadingId(id);
    try {
      await swapService.rejectSwapRequest(id);
      addToast({
        type: 'info',
        title: 'Swap Declined',
        message: 'The swap request has been rejected.',
      });
      fetchRequests();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Rejection Error',
        message: err.response?.data?.message || 'Could not decline request.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this pending swap request?')) return;
    setActionLoadingId(id);
    try {
      await swapService.cancelSwapRequest(id);
      addToast({
        type: 'info',
        title: 'Request Cancelled',
        message: 'Your swap proposal has been cancelled.',
      });
      fetchRequests();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Cancellation Error',
        message: err.response?.data?.message || 'Could not cancel request.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const currentRequests = activeTab === 'received' ? receivedRequests : sentRequests;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-primary-600 dark:text-primary-400 tracking-wider uppercase">
          Proposal Management
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
          Skill Swap Requests
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review incoming exchange proposals or track requests you have dispatched to other members.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('received')}
          className={`flex items-center gap-2 py-3 px-6 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'received'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Received Requests ({receivedRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`flex items-center gap-2 py-3 px-6 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'sent'
              ? 'border-secondary-500 text-secondary-600 dark:text-secondary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Send className="w-4 h-4" />
          Sent Requests ({sentRequests.length})
        </button>
      </div>

      {/* Requests Content */}
      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : currentRequests.length === 0 ? (
        <EmptyState
          icon={activeTab === 'received' ? Inbox : Send}
          title={
            activeTab === 'received'
              ? 'No incoming swap requests'
              : 'No sent swap requests'
          }
          description={
            activeTab === 'received'
              ? 'When other members discover your offered skills and propose a swap, they will appear here.'
              : 'Explore the skills marketplace and send swap proposals to start learning!'
          }
          actionLabel="Explore Skills"
          onAction={() => (window.location.href = '/explore')}
        />
      ) : (
        <div className="space-y-4">
          {currentRequests.map((req) => {
            const isReceived = activeTab === 'received';
            const partner = isReceived ? req.senderId : req.receiverId;
            const isActionLoading = actionLoadingId === req._id;

            return (
              <div
                key={req._id}
                className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft hover-card space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3.5">
                    {partner?.profilePicture ? (
                      <img
                        src={partner.profilePicture}
                        alt={partner.name}
                        className="w-11 h-11 rounded-full object-cover border border-primary-500"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-primary-500 text-white font-bold text-xs flex items-center justify-center">
                        {getInitials(partner?.name)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {partner?.name || 'SkillSwap Member'}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {isReceived ? 'Sent you a proposal on' : 'Proposed on'}{' '}
                        {formatDate(req.createdAt)}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={req.status} />
                </div>

                {/* Exchanged Skills Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                      {isReceived ? 'They Offer to Teach:' : 'You Offer to Teach:'}
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                      {req.offeredSkillId?.skillName}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {req.offeredSkillId?.category} • Level: {req.offeredSkillId?.proficiencyLevel}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40">
                    <span className="text-[10px] uppercase font-bold text-indigo-800 dark:text-indigo-300 block mb-1">
                      {isReceived ? 'They Request from You:' : 'You Request to Learn:'}
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                      {req.requestedSkillId?.skillName}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {req.requestedSkillId?.category} • Level:{' '}
                      {req.requestedSkillId?.proficiencyLevel}
                    </span>
                  </div>
                </div>

                {/* Message if present */}
                {req.message && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 italic">
                    "{req.message}"
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  {isReceived && req.status === 'Pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        icon={X}
                        disabled={isActionLoading}
                        onClick={() => handleReject(req._id)}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        icon={Check}
                        loading={isActionLoading}
                        onClick={() => handleAccept(req._id, partner?.name)}
                      >
                        Accept Proposal
                      </Button>
                    </>
                  )}

                  {!isReceived && req.status === 'Pending' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-500 hover:text-rose-600"
                      disabled={isActionLoading}
                      onClick={() => handleCancel(req._id)}
                    >
                      Cancel Request
                    </Button>
                  )}

                  {req.status === 'Accepted' && (
                    <Link to="/active-swaps">
                      <Button size="sm" variant="outline" icon={ArrowRight}>
                        Go to Active Swaps
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SwapRequestsPage;
