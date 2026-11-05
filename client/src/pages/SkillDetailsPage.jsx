import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import * as skillService from '../services/skillService';
import * as swapService from '../services/swapService';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import RatingStars from '../components/common/RatingStars';
import { ProficiencyBadge, CategoryBadge } from '../components/common/Badge';
import { CardSkeleton } from '../components/common/Skeleton';
import { formatDate, getInitials } from '../utils/formatters';
import {
  ArrowLeft,
  Send,
  MapPin,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Calendar,
  MessageSquare,
} from 'lucide-react';

const SkillDetailsPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);

  // Swap Request Modal State
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [myOfferedSkills, setMyOfferedSkills] = useState([]);
  const [selectedMySkillId, setSelectedMySkillId] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    const fetchSkill = async () => {
      setLoading(true);
      try {
        const data = await skillService.getSkillById(id);
        if (data && data.success) {
          setSkill(data.skill);
        }
      } catch (err) {
        console.error('Failed to load skill details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSkill();
  }, [id]);

  const handleOpenSwapModal = async () => {
    if (!isAuthenticated) {
      addToast({
        type: 'info',
        title: 'Sign In Required',
        message: 'Please sign in to initiate a skill swap.',
      });
      navigate('/login');
      return;
    }

    if (
      skill.userId._id.toString() === user?.id?.toString() ||
      skill.userId._id.toString() === user?._id?.toString()
    ) {
      addToast({
        type: 'warning',
        title: 'Own Skill',
        message: 'You cannot request a skill swap with yourself.',
      });
      return;
    }

    try {
      const mySkillsData = await skillService.getMySkills();
      const offers = mySkillsData.offeredSkills || [];
      setMyOfferedSkills(offers);
      if (offers.length > 0) {
        setSelectedMySkillId(offers[0]._id);
      }
      setRequestMessage(
        `Hi ${skill.user.name}, I'm interested in learning "${skill.skillName}" from you!`
      );
      setRequestModalOpen(true);
    } catch (err) {
      console.error('Error fetching my skills:', err);
    }
  };

  const handleSendSwapRequest = async (e) => {
    e.preventDefault();
    if (!selectedMySkillId) {
      addToast({
        type: 'warning',
        title: 'Select a Skill',
        message: 'Please select a skill you can teach in return.',
      });
      return;
    }

    setSendingRequest(true);
    try {
      await swapService.createSwapRequest({
        receiverId: skill.userId._id,
        offeredSkillId: selectedMySkillId,
        requestedSkillId: skill._id,
        message: requestMessage,
      });

      addToast({
        type: 'success',
        title: 'Swap Request Sent! 🎉',
        message: `Your proposal has been delivered to ${skill.user.name}.`,
      });

      setRequestModalOpen(false);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Request Failed',
        message: err.response?.data?.message || 'Could not send swap request.',
      });
    } finally {
      setSendingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <CardSkeleton />
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Skill Listing Not Found
        </h2>
        <Link to="/explore">
          <Button variant="primary">Return to Marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-600 dark:hover:text-primary-400"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explore
        </Link>
      </div>

      {/* Main Skill Card */}
      <div className="p-8 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CategoryBadge category={skill.category} />
              <ProficiencyBadge level={skill.proficiencyLevel} />
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  skill.skillType === 'Offer'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                }`}
              >
                {skill.skillType === 'Offer' ? 'Offered to Teach' : 'Wanted to Learn'}
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">
              {skill.skillName}
            </h1>
          </div>

          <Button
            size="lg"
            variant="primary"
            icon={Send}
            onClick={handleOpenSwapModal}
          >
            Send Swap Proposal
          </Button>
        </div>

        {/* Skill Description */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            Curriculum & Overview
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {skill.description ||
              'Hands-on interactive learning sessions covering best practices, fundamentals, and portfolio projects.'}
          </p>
        </div>
      </div>

      {/* Two Column Grid: Instructor Info & Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column (1 Col): Instructor Bio */}
        <div className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft space-y-5 h-fit">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            About the Instructor
          </h3>

          <div className="flex items-center gap-3">
            {skill.user?.profilePicture ? (
              <img
                src={skill.user.profilePicture}
                alt={skill.user.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-primary-500"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary-500 text-white font-bold text-base flex items-center justify-center">
                {getInitials(skill.user?.name)}
              </div>
            )}
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {skill.user?.name}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{skill.user?.location || 'SkillSwap Member'}</span>
              </div>
            </div>
          </div>

          <RatingStars
            rating={skill.user?.averageRating}
            count={skill.user?.reviewCount}
            size="md"
          />

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {skill.user?.bio || 'Passionate peer educator committed to collaborative learning.'}
          </p>

          {/* Other Skills Offered */}
          {skill.user?.offeredSkills?.length > 1 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Also Teaches:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skill.user.offeredSkills
                  .filter((s) => s._id !== skill._id)
                  .map((s) => (
                    <Link
                      key={s._id}
                      to={`/skills/${s._id}`}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-primary-600"
                    >
                      {s.skillName}
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {/* Skills Wanted in Return */}
          {skill.user?.wantedSkills?.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Wants to Learn:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skill.user.wantedSkills.map((w) => (
                  <span
                    key={w._id}
                    className="text-xs px-2.5 py-1 rounded-lg bg-secondary-100 dark:bg-secondary-900/40 text-secondary-700 dark:text-secondary-300 font-medium"
                  >
                    {w.skillName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (2 Cols): Reviews Received */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Student Reviews & Verified Feedback ({skill.user?.reviews?.length || 0})
            </h3>
          </div>

          {!skill.user?.reviews || skill.user.reviews.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-darkCard rounded-2xl border border-slate-200 dark:border-darkBorder">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No reviews yet for this instructor. Be the first to swap skills and leave verified feedback!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {skill.user.reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {rev.reviewerId?.profilePicture ? (
                        <img
                          src={rev.reviewerId.profilePicture}
                          alt={rev.reviewerId.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-500 text-white font-bold text-xs flex items-center justify-center">
                          {getInitials(rev.reviewerId?.name)}
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          {rev.reviewerId?.name || 'Verified Swapper'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDate(rev.createdAt)}
                        </span>
                      </div>
                    </div>

                    <RatingStars rating={rev.rating} size="sm" showScore={false} />
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                    "{rev.comment || 'Great learning experience!'}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Swap Request Modal */}
      {requestModalOpen && (
        <Modal
          isOpen={requestModalOpen}
          onClose={() => setRequestModalOpen(false)}
          title={`Propose Swap with ${skill.user?.name}`}
        >
          <form onSubmit={handleSendSwapRequest} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-primary-600 dark:text-primary-400">
                You Will Learn:
              </span>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                {skill.skillName} ({skill.category})
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Which of your offered skills will you teach in return? *
              </label>
              {myOfferedSkills.length === 0 ? (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                  <p className="font-semibold mb-1">You haven't listed any skills you can teach yet!</p>
                  <Link
                    to="/manage-skills"
                    className="underline font-bold text-xs"
                    onClick={() => setRequestModalOpen(false)}
                  >
                    Click here to add an offered skill first →
                  </Link>
                </div>
              ) : (
                <select
                  value={selectedMySkillId}
                  onChange={(e) => setSelectedMySkillId(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  {myOfferedSkills.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.skillName} ({s.category} • {s.proficiencyLevel})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Introductory Message
              </label>
              <textarea
                rows={3}
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setRequestModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={sendingRequest}
                disabled={myOfferedSkills.length === 0}
                icon={Send}
              >
                Send Proposal
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SkillDetailsPage;
