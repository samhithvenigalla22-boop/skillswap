import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import * as matchService from '../services/matchService';
import * as swapService from '../services/swapService';
import * as skillService from '../services/skillService';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import RatingStars from '../components/common/RatingStars';
import { ProficiencyBadge } from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/Skeleton';
import { getInitials } from '../utils/formatters';
import {
  Sparkles,
  RefreshCw,
  Send,
  ArrowRight,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const SkillMatchesPage = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emptyMessage, setEmptyMessage] = useState('');

  // Expanded score breakdowns
  const [expandedMatchId, setExpandedMatchId] = useState(null);

  // Swap Request Modal State
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [myOfferedSkillId, setMyOfferedSkillId] = useState('');
  const [targetRequestedSkillId, setTargetRequestedSkillId] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const data = await matchService.getMatches();
      if (data && data.success) {
        setMatches(data.matches || []);
        if (data.message) setEmptyMessage(data.message);
      }
    } catch (err) {
      console.error('Error loading matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleOpenSwapModal = (match) => {
    setSelectedMatch(match);
    // Pre-select skills if available
    const mySkill = match.youCanTeach?.[0] || match.user.wantedSkills?.[0];
    const targetSkill = match.canTeachYou?.[0] || match.user.offeredSkills?.[0];

    if (mySkill) setMyOfferedSkillId(mySkill._id);
    if (targetSkill) setTargetRequestedSkillId(targetSkill._id);

    setRequestMessage(
      `Hi ${match.user.name}! SkillSwap matched us with a ${match.matchPercentage}% compatibility score. Let's exchange skills!`
    );
    setRequestModalOpen(true);
  };

  const handleSendSwap = async (e) => {
    e.preventDefault();
    if (!myOfferedSkillId || !targetRequestedSkillId) {
      addToast({
        type: 'warning',
        title: 'Missing Skills Selection',
        message: 'Please choose both the skill you offer and the skill you request.',
      });
      return;
    }

    setSendingRequest(true);
    try {
      await swapService.createSwapRequest({
        receiverId: selectedMatch.user._id,
        offeredSkillId: myOfferedSkillId,
        requestedSkillId: targetRequestedSkillId,
        message: requestMessage,
      });

      addToast({
        type: 'success',
        title: 'Swap Request Sent! 🎉',
        message: `Your exchange proposal was sent to ${selectedMatch.user.name}.`,
      });

      setRequestModalOpen(false);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Request Failed',
        message: err.response?.data?.message || 'Could not send swap proposal.',
      });
    } finally {
      setSendingRequest(false);
    }
  };

  const getMatchScoreBadge = (pct) => {
    if (pct >= 80) {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300';
    }
    if (pct >= 60) {
      return 'bg-primary-100 text-primary-800 dark:bg-primary-950/60 dark:text-primary-300 border-primary-300';
    }
    return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300';
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary-600 dark:text-primary-400 tracking-wider uppercase">
            Algorithmic Pairing Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Complementary Skill Matches
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Our algorithm scans your offered and wanted skills against active members to discover reciprocal trade opportunities.
          </p>
        </div>

        <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchMatches}>
          Refresh Matches
        </Button>
      </div>

      {/* Info Explanation Card */}
      <div className="p-4 rounded-2xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 flex items-start gap-3">
        <Info className="w-5 h-5 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
        <div className="text-xs text-primary-900 dark:text-primary-200 leading-relaxed">
          <strong>How Match Scores Are Computed:</strong> 60% for reciprocal two-way trades (User A teaches what User B wants and vice versa) + 16% for exact skill name matches + 12% teacher proficiency weighting + 12% verified profile reputation.
        </div>
      </div>

      {/* Matches List */}
      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : matches.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No complementary matches found"
          description={
            emptyMessage ||
            'Add skills you can teach and skills you want to learn in your profile to discover mutual barter partners.'
          }
          actionLabel="Manage My Skills"
          onAction={() => (window.location.href = '/manage-skills')}
        />
      ) : (
        <div className="space-y-5">
          {matches.map((match) => {
            const isExpanded = expandedMatchId === match.user._id;

            return (
              <div
                key={match.user._id}
                className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft hover-card space-y-5"
              >
                {/* Match Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    {match.user.profilePicture ? (
                      <img
                        src={match.user.profilePicture}
                        alt={match.user.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-primary-500 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-secondary-500 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
                        {getInitials(match.user.name)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {match.user.name}
                        </h3>
                        <RatingStars
                          rating={match.user.averageRating}
                          count={match.user.reviewCount}
                          size="sm"
                        />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {match.user.location || 'Global Member'} • {match.user.bio || 'Active Swapper'}
                      </p>
                    </div>
                  </div>

                  {/* Match Score Badge */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`px-3.5 py-1.5 rounded-xl border text-center ${getMatchScoreBadge(
                        match.matchPercentage
                      )}`}
                    >
                      <div className="text-base font-black leading-none">
                        {match.matchPercentage}%
                      </div>
                      <div className="text-[9px] font-semibold uppercase tracking-wider mt-0.5">
                        {match.matchType}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="primary"
                      icon={Send}
                      onClick={() => handleOpenSwapModal(match)}
                    >
                      Propose Swap
                    </Button>
                  </div>
                </div>

                {/* Complementary Skills Exchange Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* They Can Teach You */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                      They Can Teach You ({match.canTeachYou.length}):
                    </span>
                    <div className="space-y-1.5">
                      {match.canTeachYou.map((s) => (
                        <div
                          key={s._id}
                          className="flex items-center justify-between text-xs bg-white/80 dark:bg-slate-900/60 p-2 rounded-xl"
                        >
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {s.skillName}
                          </span>
                          <ProficiencyBadge level={s.proficiencyLevel} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* You Can Teach Them */}
                  <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 space-y-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-indigo-800 dark:text-indigo-300 block">
                      You Can Teach Them ({match.youCanTeach.length}):
                    </span>
                    <div className="space-y-1.5">
                      {match.youCanTeach.map((s) => (
                        <div
                          key={s._id}
                          className="flex items-center justify-between text-xs bg-white/80 dark:bg-slate-900/60 p-2 rounded-xl"
                        >
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {s.skillName}
                          </span>
                          <ProficiencyBadge level={s.proficiencyLevel} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Accordion */}
                <div>
                  <button
                    onClick={() =>
                      setExpandedMatchId((prev) => (prev === match.user._id ? null : match.user._id))
                    }
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span>{isExpanded ? 'Hide score breakdown' : 'Why this match? View breakdown'}</span>
                  </button>

                  {isExpanded && (
                    <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                      {match.breakdown?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Propose Swap Modal */}
      {requestModalOpen && selectedMatch && (
        <Modal
          isOpen={requestModalOpen}
          onClose={() => setRequestModalOpen(false)}
          title={`Propose Swap with ${selectedMatch.user.name}`}
        >
          <form onSubmit={handleSendSwap} className="space-y-4 text-xs">
            {/* Choose what skill to learn */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Which skill do you want to learn from {selectedMatch.user.name}? *
              </label>
              <select
                value={targetRequestedSkillId}
                onChange={(e) => setTargetRequestedSkillId(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                {selectedMatch.user.offeredSkills?.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.skillName} ({s.category} • {s.proficiencyLevel})
                  </option>
                ))}
              </select>
            </div>

            {/* Choose what skill to teach */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Which skill will you teach in return? *
              </label>
              <select
                value={myOfferedSkillId}
                onChange={(e) => setMyOfferedSkillId(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                {selectedMatch.youCanTeach?.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.skillName} ({s.category} • {s.proficiencyLevel})
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Proposal Message
              </label>
              <textarea
                rows={3}
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setRequestModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={sendingRequest} icon={Send}>
                Send Exchange Proposal
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SkillMatchesPage;
