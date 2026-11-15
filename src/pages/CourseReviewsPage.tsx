import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/sections/Navbar';
import Footer from '../components/sections/Footer';
import { useAuth } from '../components/AuthContext';
import { ACADEMY_COURSES } from '../data/academyData';
import { 
  CourseReview, CourseRatingStats, getReviewsForCourse, 
  calculateCourseRatingStats, submitCourseReview, toggleReviewHelpful 
} from '../data/academyReviews';
import { 
  ArrowLeft, Star, ThumbsUp, Send, CheckCircle, 
  BookOpen, Clock, ShieldCheck, User, MessageSquare 
} from 'lucide-react';

export default function CourseReviewsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const course = ACADEMY_COURSES.find(c => c.id === courseId) || ACADEMY_COURSES[0];

  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [stats, setStats] = useState<CourseRatingStats>({
    averageRating: 5.0,
    totalCount: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    recommendPercent: 100
  });

  const [formRating, setFormRating] = useState(5);
  const [headline, setHeadline] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [roleTag, setRoleTag] = useState('');
  const [organization, setOrganization] = useState('');
  const [recommendation, setRecommendation] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upvotedMap, setUpvotedMap] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    getReviewsForCourse(course.id).then(list => {
      setReviews(list);
      setStats(calculateCourseRatingStats(list));
    });
  }, [course.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim() || !reviewText.trim()) return;

    if (!user) {
      navigate(`/learner/auth?redirect=/reviews/${course.id}&context=course&item=${encodeURIComponent(course.title)}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await submitCourseReview({
        courseId: course.id,
        userId: user.uid || 'scholar-user',
        userName: user.displayName || user.email?.split('@')[0] || 'Verified Scholar',
        userEmail: user.email || 'scholar@neurogrowthlabs.co.za',
        rating: formRating,
        headline: headline.trim(),
        reviewText: reviewText.trim(),
        roleTag: roleTag.trim() || 'Security Engineer',
        organization: organization.trim() || 'Pan-African Enterprise',
        recommendation
      });

      setReviews(prev => [created, ...prev]);
      setStats(calculateCourseRatingStats([created, ...reviews]));
      setHeadline('');
      setReviewText('');
      setRoleTag('');
      setOrganization('');
      showToast('Thank you! Your verified scholar review has been published.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (revId: string) => {
    await toggleReviewHelpful(revId);
    setUpvotedMap(prev => ({ ...prev, [revId]: !prev[revId] }));
    setReviews(prev => prev.map(r => 
      r.id === revId ? { ...r, helpfulCount: r.helpfulCount + (upvotedMap[revId] ? -1 : 1) } : r
    ));
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-200 flex flex-col justify-between selection:bg-ai-cyan selection:text-midnight-black">
      <Navbar />

      {/* Floating Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 z-50 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-lg bg-ai-cyan text-midnight-black font-semibold text-xs shadow-xl flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16 w-full space-y-8">
        
        {/* Navigation Breadcrumbs & Back Link */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Link to="/" className="hover:text-white transition-colors">NeuroGrowth Labs</Link>
            <span aria-hidden="true">/</span>
            <Link to="/academy" className="hover:text-white transition-colors">Academy</Link>
            <span aria-hidden="true">/</span>
            <Link to={`/course/${course.id}`} className="hover:text-white transition-colors">{course.code}</Link>
            <span aria-hidden="true">/</span>
            <span className="text-ai-cyan font-semibold">Ratings & Reviews</span>
          </div>

          <button
            onClick={() => navigate(`/course/${course.id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Enter Classroom</span>
          </button>
        </div>

        {/* Course Header Banner */}
        <div className="bg-[#0c1018] rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="text-ai-cyan font-bold">{course.code}</span>
              <span aria-hidden="true">·</span>
              <span>{course.difficultyLevel.toUpperCase()}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#c5a059]">{course.courseType.toUpperCase()}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {course.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {course.overview}
            </p>
          </div>

          <Link
            to={`/course/${course.id}`}
            className="px-5 py-2.5 rounded-xl bg-ai-cyan hover:bg-white text-midnight-black text-xs font-bold transition-colors flex items-center justify-center gap-2 shrink-0 shadow-md"
          >
            <BookOpen className="w-4 h-4" />
            <span>Open Classroom</span>
          </Link>
        </div>

        {/* Main Grid: Rating Breakdown + Review Submission + Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Overall Score & Form */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Score Distribution Card */}
            <div className="bg-[#0c1018] rounded-2xl p-6 shadow-xl space-y-5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Scholar Rating Summary
              </h2>

              <div className="flex items-center gap-4">
                <div className="text-5xl font-extrabold text-white font-mono">
                  {stats.averageRating}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(stats.averageRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    {stats.totalCount} Verified Reviews · {stats.recommendPercent}% Recommendation Rate
                  </p>
                </div>
              </div>

              {/* Star Distribution Bars */}
              <div className="space-y-2 pt-2">
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = stats.ratingDistribution[stars as keyof typeof stats.ratingDistribution] || 0;
                  const pct = stats.totalCount > 0 ? (count / stats.totalCount) * 100 : 0;

                  return (
                    <div key={stars} className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <span className="w-6 text-right">{stars}★</span>
                      <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-slate-500">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submission Form Card */}
            <div className="bg-[#0c1018] rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white">Write a Scholar Review</h3>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Your Star Rating</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormRating(star)}
                        className="p-1 text-slate-600 hover:text-amber-400 transition-colors"
                      >
                        <Star className={`w-6 h-6 ${star <= formRating ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Headline</label>
                  <input
                    type="text"
                    required
                    value={headline}
                    onChange={e => setHeadline(e.target.value)}
                    placeholder="e.g. Robust Defensive Architecture Curriculum"
                    className="w-full bg-[#080b11] rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-ai-cyan"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Detailed Review</label>
                  <textarea
                    required
                    rows={4}
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="Explain what you learned, the quality of lectures, and practical applicability..."
                    className="w-full bg-[#080b11] rounded-lg p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-ai-cyan resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Professional Role</label>
                    <input
                      type="text"
                      value={roleTag}
                      onChange={e => setRoleTag(e.target.value)}
                      placeholder="e.g. Cloud Architect"
                      className="w-full bg-[#080b11] rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-ai-cyan"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Organization</label>
                    <input
                      type="text"
                      value={organization}
                      onChange={e => setOrganization(e.target.value)}
                      placeholder="e.g. FinTech / Gov"
                      className="w-full bg-[#080b11] rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-ai-cyan"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-lg bg-ai-cyan text-midnight-black text-xs font-bold hover:bg-white transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Post Verified Review'}</span>
                </button>
              </form>
            </div>

          </div>

          {/* Right Column: Reviews List Feed */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              All Peer Reviews ({reviews.length})
            </h2>

            {reviews.map(r => (
              <div key={r.id} className="p-6 rounded-2xl bg-[#0c1018] space-y-3.5 shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-ai-cyan/15 text-ai-cyan font-bold text-xs flex items-center justify-center">
                      {r.userName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">{r.userName}</span>
                        {r.verifiedLearner && (
                          <span className="text-[10px] text-green-400 font-mono">Verified Learner ✓</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {r.roleTag} · {r.organization}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                    ))}
                  </div>
                </div>

                <h4 className="text-base font-bold text-white">{r.headline}</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{r.reviewText}</p>

                <div className="flex items-center justify-between pt-2 text-xs text-slate-500 font-mono">
                  <span>{r.createdAt}</span>
                  <button
                    onClick={() => handleUpvote(r.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors ${
                      upvotedMap[r.id] ? 'text-ai-cyan' : 'text-slate-400'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Helpful ({r.helpfulCount})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
