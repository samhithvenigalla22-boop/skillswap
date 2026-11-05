import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import * as reviewService from '../services/reviewService';
import * as swapService from '../services/swapService';
import RatingStars from '../components/common/RatingStars';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/Skeleton';
import { formatDate, getInitials } from '../utils/formatters';
import { Star, Award, MessageSquare, CheckCircle, Sparkles } from 'lucide-react';

const ReviewsPage = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    averageRating: 0,
    count: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [completedSwaps, setCompletedSwaps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [activeSwapForReview, setActiveSwapForReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviewsAndSwaps = async () => {
    if (!user?._id && !user?.id) return;
    const userId = user._id || user.id;

    setLoading(true);
    try {
      const [reviewsRes, swapsRes] = await Promise.all([
        reviewService.getUserReviews(userId),
        swapService.getActiveSwaps('Completed'),
      ]);

      if (reviewsRes && reviewsRes.success) {
        setReviewsData(reviewsRes);
      }
      if (swapsRes && swapsRes.success) {
        setCompletedSwaps(swapsRes.swaps || []);
      }
    } catch (err) {
      console.error('Error fetching reviews and swaps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsAndSwaps();
  }, [user]);

  const handleOpenReviewModal = (swap) => {
    setActiveSwapForReview(swap);
    setRating(5);
    setComment('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await reviewService.createReview({
        swapId: activeSwapForReview._id,
        rating,
        comment: comment.trim(),
      });

      addToast({
        type: 'success',
        title: 'Review Published ⭐',
        message: 'Your rating and feedback have been added to the community.',
      });

      setReviewModalOpen(false);
      fetchReviewsAndSwaps();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Review Error',
        message: err.response?.data?.message || 'Could not submit review.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-primary-600 dark:text-primary-400 tracking-wider uppercase">
          Reputation & Credibility
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
          Reviews and Ratings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Verified testimonials and ratings exchanged after completed skill barter sessions.
        </p>
      </div>

      {/* Ratings Overview Card */}
      <div className="p-8 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Big Score Box */}
          <div className="text-center md:border-r border-slate-100 dark:border-slate-800 space-y-2">
            <div className="text-5xl font-black text-slate-900 dark:text-white">
              {reviewsData.averageRating > 0 ? reviewsData.averageRating.toFixed(1) : '5.0'}
            </div>
            <RatingStars rating={reviewsData.averageRating || 5} size="lg" showScore={false} />
            <p className="text-xs text-slate-400">
              Based on {reviewsData.count} verified student reviews
            </p>
          </div>

          {/* Distribution Bars */}
          <div className="md:col-span-2 space-y-2 text-xs">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviewsData.distribution?.[stars] || 0;
              const total = reviewsData.count || 1;
              const pct = Math.round((count / total) * 100);

              return (
                <div key={stars} className="flex items-center gap-3">
                  <span className="w-12 text-slate-600 dark:text-slate-400 font-semibold">
                    {stars} Stars
                  </span>
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-slate-400 font-medium">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Completed Swaps Awaiting Review */}
      {completedSwaps.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary-500" />
            Completed Swaps (Ready for Review)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedSwaps.map((swap) => (
              <div
                key={swap._id}
                className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {swap.partner?.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {swap.offeredSkill?.skillName} ↔ {swap.requestedSkill?.skillName}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  icon={Star}
                  onClick={() => handleOpenReviewModal(swap)}
                >
                  Rate Partner
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Received List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-primary-500" />
          Received Community Feedback ({reviewsData.reviews?.length || 0})
        </h2>

        {loading ? (
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : reviewsData.reviews?.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No reviews received yet"
            description="Complete your active skill swaps to receive verified ratings and comments from fellow learners."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviewsData.reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {rev.reviewerId?.profilePicture ? (
                      <img
                        src={rev.reviewerId.profilePicture}
                        alt={rev.reviewerId.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-500 text-white font-bold text-xs flex items-center justify-center">
                        {getInitials(rev.reviewerId?.name)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {rev.reviewerId?.name || 'Verified Member'}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {formatDate(rev.createdAt)}
                      </span>
                    </div>
                  </div>

                  <RatingStars rating={rev.rating} size="sm" showScore={false} />
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

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
                How would you rate your knowledge barter exchange?
              </span>
              <RatingStars
                rating={rating}
                interactive={true}
                size="lg"
                onChange={(val) => setRating(val)}
                showScore={false}
              />
              <span className="text-xs font-bold text-primary-600 dark:text-primary-400 block">
                {rating} out of 5 Stars
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Feedback
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe your learning experience, what you achieved, and how your partner helped you..."
                required
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={submitting} icon={Star}>
                Submit Verified Review
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ReviewsPage;
