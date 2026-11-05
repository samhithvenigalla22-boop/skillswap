import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import * as skillService from '../services/skillService';
import * as swapService from '../services/swapService';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import RatingStars from '../components/common/RatingStars';
import { ProficiencyBadge, CategoryBadge } from '../components/common/Badge';
import { CardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import { SKILL_CATEGORIES, PROFICIENCY_LEVELS } from '../utils/constants';
import { getInitials } from '../utils/formatters';
import {
  Search,
  Filter,
  ArrowRight,
  Send,
  BookOpen,
  Sparkles,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const ExploreSkillsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useNotifications();
  const [searchParams, setSearchParams] = useSearchParams();

  const [skills, setSkills] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters state initialized from URL or defaults
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [proficiency, setProficiency] = useState('All');
  const [skillType, setSkillType] = useState('Offer');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  // Swap Request Modal State
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [myOfferedSkills, setMyOfferedSkills] = useState([]);
  const [selectedMySkillId, setSelectedMySkillId] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const data = await skillService.getSkills({
        search,
        category: category !== 'All' ? category : undefined,
        proficiencyLevel: proficiency !== 'All' ? proficiency : undefined,
        skillType: skillType !== 'All' ? skillType : undefined,
        sort,
        page,
        limit: 9,
      });

      if (data && data.success) {
        setSkills(data.skills || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      }
    } catch (err) {
      console.error('Error fetching skills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [category, proficiency, skillType, sort, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSkills();
  };

  // Open Swap Request Modal
  const handleOpenSwapModal = async (skill) => {
    if (!isAuthenticated) {
      addToast({
        type: 'info',
        title: 'Sign In Required',
        message: 'Please sign in to send a skill swap proposal.',
      });
      window.location.href = '/login';
      return;
    }

    if (skill.userId._id.toString() === user?.id?.toString() || skill.userId._id.toString() === user?._id?.toString()) {
      addToast({
        type: 'warning',
        title: 'Own Skill',
        message: 'You cannot request a skill swap with yourself.',
      });
      return;
    }

    setSelectedSkill(skill);

    // Fetch user's offered skills to propose
    try {
      const mySkillsData = await skillService.getMySkills();
      const offers = mySkillsData.offeredSkills || [];
      setMyOfferedSkills(offers);
      if (offers.length > 0) {
        setSelectedMySkillId(offers[0]._id);
      }
      setRequestMessage(
        `Hi ${skill.user.name}, I would love to learn "${skill.skillName}" from you in exchange for my skills!`
      );
      setRequestModalOpen(true);
    } catch (err) {
      console.error('Error loading my skills:', err);
    }
  };

  const handleSendSwapRequest = async (e) => {
    e.preventDefault();

    if (!selectedMySkillId) {
      addToast({
        type: 'warning',
        title: 'No Offered Skill Selected',
        message: 'Please add or select a skill you can teach in return.',
      });
      return;
    }

    setSendingRequest(true);
    try {
      await swapService.createSwapRequest({
        receiverId: selectedSkill.userId._id,
        offeredSkillId: selectedMySkillId,
        requestedSkillId: selectedSkill._id,
        message: requestMessage,
      });

      addToast({
        type: 'success',
        title: 'Swap Request Sent! 🚀',
        message: `Your request was delivered to ${selectedSkill.user.name}.`,
      });

      setRequestModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send swap request.';
      addToast({
        type: 'error',
        title: 'Swap Request Failed',
        message: msg,
      });
    } finally {
      setSendingRequest(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-primary-600 dark:text-primary-400 tracking-wider uppercase">
          Skill Discovery Marketplace
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
          Explore Available Skills
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Discover members ready to teach what you wish to learn. Search by keywords, filter across 17 disciplines, and initiate a swap proposal.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skill (e.g. Python, UI/UX, SEO, Spanish, React)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Button type="submit" variant="primary" icon={Search}>
            Search Skills
          </Button>
        </form>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="All">All Categories</option>
              {SKILL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Proficiency */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Proficiency Level
            </label>
            <select
              value={proficiency}
              onChange={(e) => {
                setProficiency(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="All">All Levels</option>
              {PROFICIENCY_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          {/* Skill Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Listing Type
            </label>
            <select
              value={skillType}
              onChange={(e) => {
                setSkillType(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="Offer">Skills Offered (Can Teach)</option>
              <option value="Want">Skills Wanted (Looking to Learn)</option>
              <option value="All">All Listings</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Sort Order
            </label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="newest">Newest First</option>
              <option value="highest_rated">Highest Rated Instructor</option>
              <option value="name_asc">Skill Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          Showing <strong className="text-slate-800 dark:text-slate-200">{skills.length}</strong> of{' '}
          <strong className="text-slate-800 dark:text-slate-200">{total}</strong> skill listings
        </span>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : skills.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No skills match your filters"
          description="Try broadening your search keywords or resetting your category and proficiency filters."
          actionLabel="Reset All Filters"
          onAction={() => {
            setSearch('');
            setCategory('All');
            setProficiency('All');
            setSkillType('Offer');
            setSort('newest');
            setPage(1);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill) => (
            <div
              key={skill._id}
              className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft flex flex-col justify-between hover-card"
            >
              {/* Top: Instructor Profile Info */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {skill.user?.profilePicture ? (
                      <img
                        src={skill.user.profilePicture}
                        alt={skill.user.name}
                        className="w-10 h-10 rounded-full object-cover border border-primary-500"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-500 text-white font-bold text-xs flex items-center justify-center">
                        {getInitials(skill.user?.name)}
                      </div>
                    )}
                    <div>
                      <Link
                        to={`/skills/${skill._id}`}
                        className="text-sm font-bold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors block"
                      >
                        {skill.user?.name}
                      </Link>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <MapPin className="w-3 h-3" />
                        <span>{skill.user?.location || 'Global Member'}</span>
                      </div>
                    </div>
                  </div>

                  <RatingStars
                    rating={skill.user?.averageRating}
                    count={skill.user?.reviewCount}
                    size="sm"
                  />
                </div>

                {/* Skill Name & Badges */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {skill.skillName}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        skill.skillType === 'Offer'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                      }`}
                    >
                      {skill.skillType === 'Offer' ? 'Teaches' : 'Wants to Learn'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <CategoryBadge category={skill.category} />
                    <ProficiencyBadge level={skill.proficiencyLevel} />
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-4">
                  {skill.description ||
                    'Comprehensive peer training and hands-on guidance available.'}
                </p>

                {/* What they want in return (if available) */}
                {skill.user?.wantedSkills?.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Wants to learn in return:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {skill.user.wantedSkills.slice(0, 2).map((w) => (
                        <span
                          key={w._id}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-secondary-100 dark:bg-secondary-900/40 text-secondary-700 dark:text-secondary-300 font-medium"
                        >
                          {w.skillName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Link to={`/skills/${skill._id}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="primary"
                  icon={Send}
                  onClick={() => handleOpenSwapModal(skill)}
                >
                  Send Swap
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            icon={ChevronLeft}
          >
            Previous
          </Button>
          <span className="text-xs font-semibold px-4 text-slate-600 dark:text-slate-400">
            Page {page} of {pages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Send Swap Request Modal */}
      {requestModalOpen && selectedSkill && (
        <Modal
          isOpen={requestModalOpen}
          onClose={() => setRequestModalOpen(false)}
          title={`Propose Swap with ${selectedSkill.user?.name}`}
        >
          <form onSubmit={handleSendSwapRequest} className="space-y-4 text-xs">
            {/* Target Skill Details */}
            <div className="p-3.5 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-primary-600 dark:text-primary-400">
                You Will Learn:
              </span>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                {selectedSkill.skillName} ({selectedSkill.category})
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Taught by {selectedSkill.user?.name} • Level: {selectedSkill.proficiencyLevel}
              </p>
            </div>

            {/* Select what skill the sender will offer in return */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Which of your offered skills will you teach in return? *
              </label>
              {myOfferedSkills.length === 0 ? (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                  <p className="font-semibold mb-1">You have not listed any skills you can teach yet!</p>
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

            {/* Optional Proposal Message */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Introductory Proposal Message
              </label>
              <textarea
                rows={3}
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Introduce yourself and share what you hope to achieve..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Submit buttons */}
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

export default ExploreSkillsPage;
