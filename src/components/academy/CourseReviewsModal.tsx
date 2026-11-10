import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Course } from '../../data/academyData';
import { 
  CourseReview, CourseRatingStats, getReviewsForCourse, 
  calculateCourseRatingStats, submitCourseReview, toggleReviewHelpful 
} from '../../data/academyReviews';
import { 
  Star, X, CheckCircle, ThumbsUp, MessageSquare, 
  ShieldCheck, User, Sparkles, Send, Filter, AlertCircle,
  Award, ChevronDown
} from 'lucide-react';

interface CourseReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  currentUser: { uid?: string; id?: string; email?: string; displayName?: string } | null;
  onOpenAuth: () => void;
  onReviewAdded?: () => void;
}

export default function CourseReviewsModal({
  isOpen,
  onClose,
  course,
  currentUser,
  onOpenAuth,
  onReviewAdded
}: CourseReviewsModalProps) {
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [stats, setStats] = useState<CourseRatingStats>({
    averageRating: 5.0,
    totalCount: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    recommendPercent: 100
  });
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formRating, setFormRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [headline, setHeadline] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [roleTag, setRoleTag] = useState('');
  const [organization, setOrganization] = useState('');
  const [recommendation, setRecommendation] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Filter & Sort
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'helpful'>('newest');

  // Upvoted review tracking
  const [upvotedMap, setUpvotedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const list = await getReviewsForCourse(course.id);
        if (mounted) {
          setReviews(list);
          setStats(calculateCourseRatingStats(list));
        }
      } catch (err) {
        console.warn('Error loading reviews:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchReviews();
    return () => { mounted = false; };
  }, [isOpen, course.id]);

  if (!isOpen) return null;

  const starLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Exceptional!'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!headline.trim() || !reviewText.trim()) {
      setFormError('Please provide both a headline and detailed feedback.');
      return;
    }

    if (reviewText.trim().length < 20) {
      setFormError('Please share at least 20 characters of constructive course feedback.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const created = await submitCourseReview({
        courseId: course.id,
        userId: currentUser.uid || currentUser.id || 'anonymous-scholar',
        userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Verified Learner',
        userEmail: currentUser.email,
        rating: formRating,
        headline: headline.trim(),
        reviewText: reviewText.trim(),
        roleTag: roleTag.trim() || 'Verified Learner',
        organization: organization.trim() || 'Sovereign Academy Scholar',
        recommendation
      });

      const updated = [created, ...reviews];
      setReviews(updated);
      setStats(calculateCourseRatingStats(updated));
      setFormSuccess(true);
      setIsFormOpen(false);
      setHeadline('');
      setReviewText('');

      if (onReviewAdded) onReviewAdded();
      setTimeout(() => setFormSuccess(false), 4000);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpfulClick = async (reviewId: string) => {
    if (upvotedMap[reviewId]) return;
    setUpvotedMap(prev => ({ ...prev, [reviewId]: true }));
    const newCount = await toggleReviewHelpful(reviewId);
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpfulCount: newCount } : r));
  };

  // Filtered and sorted reviews
  const displayedReviews = reviews
    .filter(r => {
      if (starFilter === 'all') return true;
      return Math.round(r.rating) === starFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'helpful') return (b.helpfulCount || 0) - (a.helpfulCount || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-4xl bg-[#0d121c] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-10 my-6 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 bg-[#090d15] border-b border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span className="text-ai-cyan font-bold">{course.code}</span>
                  <span>·</span>
                  <span>{course.track}</span>
                  <span>·</span>
                  <span className="text-amber-400 font-semibold">{stats.averageRating} ★ ({stats.totalCount} reviews)</span>
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight truncate max-w-lg">
                  Learner Reviews & Ratings
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Rating Breakdown Dashboard */}
            <div className="p-5 bg-[#090d15] rounded-xl border border-white/10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Overall Score */}
              <div className="md:col-span-4 text-center md:border-r md:border-white/10 md:pr-6">
                <div className="text-5xl font-black text-white tracking-tight flex items-center justify-center gap-1">
                  <span>{stats.averageRating}</span>
                  <span className="text-amber-400 text-3xl">★</span>
                </div>
                <div className="flex items-center justify-center gap-1 my-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(stats.averageRating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Based on {stats.totalCount} verified scholar reviews
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{stats.recommendPercent}% Recommend</span>
                </div>
              </div>

              {/* Star Distribution Bars */}
              <div className="md:col-span-8 space-y-1.5">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = stats.ratingDistribution[stars as keyof typeof stats.ratingDistribution] || 0;
                  const pct = stats.totalCount > 0 ? Math.round((count / stats.totalCount) * 100) : 0;
                  return (
                    <button
                      key={stars}
                      onClick={() => setStarFilter(starFilter === stars ? 'all' : stars)}
                      className={`w-full flex items-center gap-3 text-xs transition-opacity ${
                        starFilter === stars ? 'opacity-100 font-semibold text-white' : 'opacity-80 hover:opacity-100 text-slate-400'
                      }`}
                    >
                      <span className="w-12 text-left font-mono">{stars} Stars</span>
                      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-10 text-right font-mono text-slate-500">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Success alert */}
            {formSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Thank you! Your verified review and rating have been published to the course catalog.</span>
              </div>
            )}

            {/* Action Bar (Write Review + Filters) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (!currentUser) {
                      onOpenAuth();
                    } else {
                      setIsFormOpen(prev => !prev);
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-ai-cyan text-midnight-black text-xs font-bold hover:bg-white transition-colors flex items-center gap-2 shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isFormOpen ? 'Cancel Review' : 'Write a Review'}</span>
                </button>

                {!currentUser && (
                  <span className="text-xs text-slate-400">
                    (Sign-in required to post feedback)
                  </span>
                )}
              </div>

              {/* Filter by star + Sort Controls */}
              <div className="flex items-center gap-2 text-xs">
                {starFilter !== 'all' && (
                  <button
                    onClick={() => setStarFilter('all')}
                    className="px-2.5 py-1.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 font-medium flex items-center gap-1"
                  >
                    <span>{starFilter}★ Only</span>
                    <X className="w-3 h-3" />
                  </button>
                )}

                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
                  <span className="text-slate-500 px-1.5 font-mono">Sort:</span>
                  <button
                    onClick={() => setSortBy('newest')}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      sortBy === 'newest' ? 'bg-white/15 text-white font-medium' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Newest
                  </button>
                  <button
                    onClick={() => setSortBy('highest')}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      sortBy === 'highest' ? 'bg-white/15 text-white font-medium' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Highest
                  </button>
                  <button
                    onClick={() => setSortBy('helpful')}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      sortBy === 'helpful' ? 'bg-white/15 text-white font-medium' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Helpful
                  </button>
                </div>
              </div>
            </div>

            {/* Review Composition Form */}
            <AnimatePresence>
              {isFormOpen && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleSubmit}
                  className="p-5 rounded-xl bg-[#090d15] border border-ai-cyan/30 space-y-4 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-ai-cyan" />
                      <span>Share Your Feedback for {course.code}</span>
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      Posting as: <strong className="text-white">{currentUser?.displayName || currentUser?.email}</strong>
                    </span>
                  </div>

                  {formError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Star Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Your Rating *
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const active = (hoverRating !== null ? hoverRating : formRating) >= star;
                          return (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setFormRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(null)}
                              className="p-1 hover:scale-110 transition-transform"
                              aria-label={`${star} Stars`}
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  active
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-600'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                      <span className="text-xs font-mono text-amber-400 font-bold ml-2">
                        {starLabels[hoverRating !== null ? hoverRating : formRating]} ({formRating} / 5)
                      </span>
                    </div>
                  </div>

                  {/* Headline */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Review Title / Headline *
                    </label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g., Exceptional real-world adversarial ML labs"
                      maxLength={140}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-ai-cyan"
                    />
                  </div>

                  {/* Feedback Text */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Detailed Course Review *
                    </label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Discuss the theoretical modules, YouTube video masterclasses, hands-on terminal sandbox, and capstone exam..."
                      rows={4}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-ai-cyan resize-none"
                    />
                  </div>

                  {/* Optional Role and Org */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Your Professional Role
                      </label>
                      <input
                        type="text"
                        value={roleTag}
                        onChange={(e) => setRoleTag(e.target.value)}
                        placeholder="e.g., Senior Security Operations Engineer"
                        maxLength={80}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-ai-cyan"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Organization / University
                      </label>
                      <input
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="e.g., Safaricom, Paystack, or Independent"
                        maxLength={80}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-ai-cyan"
                      />
                    </div>
                  </div>

                  {/* Recommendation Checkbox */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="rec-check"
                      checked={recommendation}
                      onChange={(e) => setRecommendation(e.target.checked)}
                      className="rounded border-white/20 text-ai-cyan focus:ring-0"
                    />
                    <label htmlFor="rec-check" className="text-xs text-slate-300 cursor-pointer">
                      I recommend this course to fellow cybersecurity and AI researchers.
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-4 py-2 rounded-lg bg-white/5 text-slate-400 hover:text-white text-xs font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-lg bg-ai-cyan text-midnight-black text-xs font-bold hover:bg-white transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Publishing...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Publish Verified Review</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Reviews List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono border-b border-white/10 pb-2">
                <span>
                  Showing {displayedReviews.length} of {reviews.length} reviews
                </span>
                {starFilter !== 'all' && (
                  <span className="text-amber-400">
                    Filtered by {starFilter}-star rating
                  </span>
                )}
              </div>

              {loading ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  Loading scholar reviews...
                </div>
              ) : displayedReviews.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  No reviews match your selected filter. Be the first to share your thoughts!
                </div>
              ) : (
                displayedReviews.map((rev) => {
                  const isUpvoted = !!upvotedMap[rev.id];
                  return (
                    <div
                      key={rev.id}
                      className="p-5 rounded-xl bg-[#090d15] border border-white/10 hover:border-white/20 transition-all space-y-3"
                    >
                      {/* Reviewer Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-ai-cyan/20 to-amber-500/20 border border-white/20 flex items-center justify-center text-white text-xs font-bold">
                            {rev.userName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">
                                {rev.userName}
                              </span>
                              {rev.verifiedLearner && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-ai-cyan/15 border border-ai-cyan/30 text-ai-cyan font-mono">
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>Verified Scholar</span>
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400">
                              {rev.roleTag}
                              {rev.organization && (
                                <span> · {rev.organization}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stars & Date */}
                        <div className="text-right">
                          <div className="flex items-center gap-0.5 justify-end">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= rev.rating
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] font-mono text-slate-500">
                            {new Date(rev.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Headline & Body */}
                      <div>
                        <h4 className="text-sm font-bold text-white mb-1.5">
                          "{rev.headline}"
                        </h4>
                        <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-line">
                          {rev.reviewText}
                        </p>
                      </div>

                      {/* Footer / Upvote */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          {rev.recommendation && (
                            <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>Recommends this masterclass</span>
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleHelpfulClick(rev.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors border ${
                            isUpvoted
                              ? 'bg-ai-cyan/20 border-ai-cyan text-ai-cyan'
                              : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-400 hover:text-white'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>Helpful ({rev.helpfulCount || 0})</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
