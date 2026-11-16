import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/sections/Navbar';
import Footer from '../components/sections/Footer';
import { useAuth } from '../components/AuthContext';
import { ACADEMY_COURSES, Course } from '../data/academyData';
import { 
  CourseReview, CourseRatingStats, getReviewsForCourse, 
  calculateCourseRatingStats, submitCourseReview, toggleReviewHelpful 
} from '../data/academyReviews';
import { 
  sendCertificateReadyNotification, sendCourseEnrollmentNotification 
} from '../services/emailNotificationService';
import { 
  ArrowLeft, ArrowRight, Award, BookOpen, Check, CheckCircle2, 
  Clock, ExternalLink, Globe, HelpCircle, MessageSquare, Play, 
  RotateCcw, Send, Shield, Sparkles, Star, ThumbsUp, Video, 
  X, Youtube, CheckCircle, Circle, Terminal, Lock, Users, Layers, ChevronDown
} from 'lucide-react';
import ModuleContentRenderer from '../components/academy/ModuleContentRenderer';

export default function CourseClassroom() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Find target course
  const course = ACADEMY_COURSES.find(c => c.id === courseId) || ACADEMY_COURSES[0];

  // Active view tab
  const [activeTab, setActiveTab] = useState<'modules' | 'videos' | 'assignment' | 'reviews'>('modules');

  // Completed modules tracking
  const [completedModuleIds, setCompletedModuleIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('ngl_completed_modules');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed[course.id] || [];
      }
      return [];
    } catch {
      return [];
    }
  });

  // Exam scores
  const [examScore, setExamScore] = useState<number | null>(() => {
    try {
      const stored = localStorage.getItem('ngl_course_exam_scores');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed[course.id] ?? null;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Active module & video selection
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [showCourseProfile, setShowCourseProfile] = useState(false);

  // Exam states
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [submittedExam, setSubmittedExam] = useState(false);
  const [hasPassedExam, setHasPassedExam] = useState(examScore !== null && examScore >= 70);

  // Reviews states
  const [courseReviews, setCourseReviews] = useState<CourseReview[]>([]);
  const [reviewStats, setReviewStats] = useState<CourseRatingStats>({
    averageRating: 5.0,
    totalCount: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    recommendPercent: 100
  });
  const [newRating, setNewRating] = useState(5);
  const [newHeadline, setNewHeadline] = useState('');
  const [newReviewText, setNewReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [upvotedMap, setUpvotedMap] = useState<Record<string, boolean>>({});

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync completed modules to localStorage & enroll user
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ngl_enrolled_courses');
      const enrolled = stored ? JSON.parse(stored) : [];
      if (!enrolled.includes(course.id)) {
        enrolled.push(course.id);
        localStorage.setItem('ngl_enrolled_courses', JSON.stringify(enrolled));
      }
    } catch {}
  }, [course.id]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ngl_completed_modules');
      const parsed = stored ? JSON.parse(stored) : {};
      parsed[course.id] = completedModuleIds;
      localStorage.setItem('ngl_completed_modules', JSON.stringify(parsed));
    } catch {}
  }, [completedModuleIds, course.id]);

  // Load reviews on mount
  useEffect(() => {
    getReviewsForCourse(course.id).then(list => {
      setCourseReviews(list);
      setReviewStats(calculateCourseRatingStats(list));
    });
  }, [course.id]);

  const currentModule = course.modules[selectedModuleIndex] || course.modules[0];
  const isCurrentCompleted = completedModuleIds.includes(currentModule.id);
  const totalModules = course.modules.length;
  const completedCount = course.modules.filter(m => completedModuleIds.includes(m.id)).length;
  const progressPercent = Math.round((completedCount / totalModules) * 100);

  const currentVideo = course.youtubeLectures[selectedVideoIndex] || course.youtubeLectures[0];

  const handleToggleModule = (modId: string) => {
    setCompletedModuleIds(prev => 
      prev.includes(modId) ? prev.filter(id => id !== modId) : [...prev, modId]
    );
  };

  const handleSubmitAssignment = () => {
    const questions = course.finalAssignment.questions;
    let correctCount = 0;

    questions.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    setExamScore(calculatedScore);
    setSubmittedExam(true);

    try {
      const stored = localStorage.getItem('ngl_course_exam_scores');
      const parsed = stored ? JSON.parse(stored) : {};
      parsed[course.id] = calculatedScore;
      localStorage.setItem('ngl_course_exam_scores', JSON.stringify(parsed));
    } catch {}

    if (calculatedScore >= 70) {
      setHasPassedExam(true);
      showToast(`🎉 Capstone Passed with ${calculatedScore}%! Certificate unlocked.`);
      if (user) {
        const certId = `NGL-CERT-${course.code}-${Math.floor(100000 + Math.random() * 900000)}`;
        sendCertificateReadyNotification({
          user,
          course,
          certificateId: certId,
          verificationCode: `SHA256-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          issuedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          grade: `Pass with Honors (${calculatedScore}%)`
        }).catch(console.warn);
      }
    } else {
      setHasPassedExam(false);
      showToast(`Score: ${calculatedScore}%. 70% required to certify. Review the material and retake!`);
    }
  };

  const handleResetExam = () => {
    setUserAnswers({});
    setSubmittedExam(false);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHeadline.trim() || !newReviewText.trim()) return;

    if (!user) {
      navigate(`/learner/auth?redirect=/course/${course.id}&context=course&item=${encodeURIComponent(course.title)}`);
      return;
    }

    setIsSubmittingReview(true);
    try {
      const added = await submitCourseReview({
        courseId: course.id,
        userId: user.uid || 'scholar-user',
        userName: user.displayName || 'Verified Scholar',
        userEmail: user.email || 'scholar@neurogrowthlabs.co.za',
        rating: newRating,
        headline: newHeadline.trim(),
        reviewText: newReviewText.trim(),
        roleTag: 'Security Researcher',
        organization: 'African Tech Institute',
        recommendation: newRating >= 4
      });

      setCourseReviews(prev => [added, ...prev]);
      setReviewStats(prev => calculateCourseRatingStats([added, ...courseReviews]));
      setNewHeadline('');
      setNewReviewText('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
      showToast('Thank you! Your verified review has been published.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleUpvote = async (revId: string) => {
    await toggleReviewHelpful(revId);
    setUpvotedMap(prev => ({ ...prev, [revId]: !prev[revId] }));
    setCourseReviews(prev => prev.map(r => 
      r.id === revId ? { ...r, helpfulCount: r.helpfulCount + (upvotedMap[revId] ? -1 : 1) } : r
    ));
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-200 flex flex-col justify-between selection:bg-ai-cyan selection:text-midnight-black">
      <Navbar />

      {/* Toast Notification */}
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

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-16 w-full space-y-6">
        
        {/* Navigation Breadcrumbs & Back Link */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Link to="/" className="hover:text-white transition-colors">NeuroGrowth Labs</Link>
            <span aria-hidden="true">/</span>
            <Link to="/academy" className="hover:text-white transition-colors">Academy</Link>
            <span aria-hidden="true">/</span>
            <span className="text-ai-cyan font-semibold">{course.code}</span>
          </div>

          <button
            onClick={() => navigate('/academy')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Academy Catalog</span>
          </button>
        </div>

        {/* Classroom Hero Header */}
        <div className="bg-[#0c1018] rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
                <span className="text-ai-cyan font-bold">{course.code}</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-300">{course.difficultyLevel.toUpperCase()}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#c5a059]">{course.courseType.toUpperCase()}</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-ai-cyan" /> {course.duration}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {reviewStats.averageRating} ({reviewStats.totalCount} reviews)
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
                {course.overview}
              </p>

              {(course.courseCapabilities || course.intendedAudience || course.prerequisitesList) && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCourseProfile(prev => !prev)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-ai-cyan transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>
                      {showCourseProfile ? 'Hide' : 'View'} Course Overview,{' '}
                      {course.intendedAudience ? 'Intended Audience & Prerequisites' : 'Learning Outcomes & Prerequisites'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCourseProfile ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              )}
            </div>

            {/* Quick Progress & Certificate Claim Box */}
            <div className="w-full lg:w-72 shrink-0 p-4 rounded-xl bg-white/[0.03] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Curriculum Progress</span>
                <span className="text-ai-cyan font-bold">{progressPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-ai-cyan to-electric-blue transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
                <span>{completedCount} of {totalModules} modules</span>
                {hasPassedExam ? (
                  <span className="text-green-400 font-bold">Exam: {examScore}% ✓</span>
                ) : (
                  <span className="text-amber-400">Exam: 70% Req</span>
                )}
              </div>

              {hasPassedExam ? (
                <Link
                  to={`/certificate/${course.id}`}
                  className="w-full py-2.5 px-3 rounded-lg bg-[#c5a059] hover:bg-white text-midnight-black text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md block text-center"
                >
                  <Award className="w-4 h-4 inline" />
                  <span>View Official Certificate</span>
                </Link>
              ) : (
                <button
                  onClick={() => setActiveTab('assignment')}
                  className="w-full py-2.5 px-3 rounded-lg bg-ai-cyan/15 hover:bg-ai-cyan text-ai-cyan hover:text-midnight-black text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>Take Capstone Exam</span>
                </button>
              )}
            </div>
          </div>

          {showCourseProfile && (course.courseCapabilities || course.intendedAudience || course.prerequisitesList) && (
            <div
              className={`grid grid-cols-1 gap-5 p-5 rounded-xl bg-white/[0.02] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] ${
                course.courseCapabilities && course.intendedAudience && course.prerequisitesList
                  ? 'md:grid-cols-3'
                  : 'md:grid-cols-2'
              }`}
            >
              {course.courseCapabilities && (
                <div className="space-y-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-ai-cyan font-bold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>{course.intendedAudience ? 'Pipeline Capabilities' : 'Course Learning Outcomes'}</span>
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {course.courseCapabilities.map((cap, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-ai-cyan font-mono font-bold">{idx + 1}.</span>
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {course.intendedAudience && (
                <div className="space-y-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#c5a059] font-bold flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>Intended Audience</span>
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-300">
                    {course.intendedAudience.map((aud, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-[#c5a059] mt-1.5 shrink-0" />
                        <span>{aud}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {course.prerequisitesList && (
                <div className="space-y-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    <span>Prerequisites</span>
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {course.prerequisitesList.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="w-3 h-3 text-green-400 mt-0.5 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <button
              onClick={() => setActiveTab('modules')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'modules'
                  ? 'bg-ai-cyan text-midnight-black shadow-sm'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Curriculum Modules ({totalModules})</span>
            </button>

            <button
              onClick={() => setActiveTab('videos')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'videos'
                  ? 'bg-ai-cyan text-midnight-black shadow-sm'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Youtube className="w-4 h-4 text-red-400" />
              <span>5 YouTube Masterclasses</span>
            </button>

            <button
              onClick={() => setActiveTab('assignment')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'assignment'
                  ? 'bg-ai-cyan text-midnight-black shadow-sm'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Award className="w-4 h-4 text-[#c5a059]" />
              <span>Capstone Exam (70% Threshold)</span>
              {hasPassedExam && <span className="text-green-400 font-bold font-mono">({examScore}%)</span>}
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'reviews'
                  ? 'bg-ai-cyan text-midnight-black shadow-sm'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Star className="w-4 h-4 text-amber-400" />
              <span>Scholar Reviews ({courseReviews.length})</span>
            </button>
          </div>
        </div>

        {/* ========================================================== */}
        {/* TAB 1: CURRICULUM LESSON MODULES                           */}
        {/* ========================================================== */}
        {activeTab === 'modules' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Modules List */}
            <div className="lg:col-span-4 space-y-2">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono px-1 mb-2">
                Course Syllabus ({completedCount}/{totalModules} Completed)
              </h2>

              {course.modules.map((mod, idx) => {
                const isSelected = selectedModuleIndex === idx;
                const isCompleted = completedModuleIds.includes(mod.id);

                return (
                  <div
                    key={mod.id}
                    onClick={() => setSelectedModuleIndex(idx)}
                    className={`p-4 rounded-xl cursor-pointer transition-all flex items-start gap-3 shadow-sm ${
                      isSelected
                        ? 'bg-[#121927] shadow-lg'
                        : 'bg-[#0c1018] hover:bg-[#0f1422]'
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleModule(mod.id);
                      }}
                      className="mt-0.5 text-slate-400 hover:text-ai-cyan transition-colors"
                      title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-ai-cyan" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                        <span>MODULE {idx + 1}</span>
                        <span>{mod.duration}</span>
                      </div>
                      <h3 className={`text-sm font-bold leading-snug line-clamp-2 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {mod.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-1">
                        {mod.summary}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Module Active Reader */}
            <div className="lg:col-span-8 bg-[#0c1018] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
                <div>
                  <span className="text-xs font-mono text-ai-cyan font-bold">
                    MODULE {selectedModuleIndex + 1} OF {totalModules} · {currentModule.duration.toUpperCase()}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                    {currentModule.title}
                  </h2>
                </div>

                <button
                  onClick={() => handleToggleModule(currentModule.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-sm ${
                    isCurrentCompleted
                      ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
                      : 'bg-ai-cyan text-midnight-black hover:bg-white'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{isCurrentCompleted ? 'Completed' : 'Mark as Completed'}</span>
                </button>
              </div>

              {/* Module Summary */}
              <div className="p-4 rounded-xl bg-white/[0.03] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] text-sm text-slate-300 leading-relaxed">
                <strong className="text-white block mb-1">Executive Summary</strong>
                {currentModule.summary}
              </div>

              {/* Full Structured Lesson Content */}
              <div className="pt-1">
                <ModuleContentRenderer content={currentModule.content} />
              </div>

              {/* Key Competencies Mastered */}
              {currentModule.keyTakeaways && currentModule.keyTakeaways.length > 0 && (
                <div className="p-5 rounded-xl bg-white/[0.025] shadow-[inset_0_0_0_1px_rgba(34,211,238,0.18)] space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-ai-cyan font-bold">
                    Key Competencies Mastered
                  </h4>
                  <div className="space-y-2">
                    {currentModule.keyTakeaways.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-ai-cyan shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation between modules */}
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setSelectedModuleIndex(prev => Math.max(0, prev - 1))}
                  disabled={selectedModuleIndex === 0}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous Module</span>
                </button>

                <button
                  onClick={() => setSelectedModuleIndex(prev => Math.min(totalModules - 1, prev + 1))}
                  disabled={selectedModuleIndex === totalModules - 1}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <span>Next Module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 2: 5 YOUTUBE MASTERCLASSES                             */}
        {/* ========================================================== */}
        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Video Playlist */}
            <div className="lg:col-span-4 space-y-2">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono px-1 mb-2">
                5 Video Masterclasses
              </h2>

              {course.youtubeLectures.map((vid, idx) => {
                const isSelected = selectedVideoIndex === idx;

                return (
                  <div
                    key={vid.id}
                    onClick={() => setSelectedVideoIndex(idx)}
                    className={`p-4 rounded-xl cursor-pointer transition-all flex items-start gap-3 shadow-sm ${
                      isSelected
                        ? 'bg-[#121927] shadow-lg'
                        : 'bg-[#0c1018] hover:bg-[#0f1422]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Play className="w-4 h-4 fill-current" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                        <span>CLASS {idx + 1}</span>
                        <span>{vid.duration}</span>
                      </div>
                      <h3 className={`text-sm font-bold leading-snug line-clamp-2 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {vid.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-1">
                        {vid.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Video Theater View */}
            <div className="lg:col-span-8 bg-[#0c1018] rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-2xl">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${currentVideo.videoId}`}
                  title={currentVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono text-red-400 font-bold uppercase">
                    VIDEO MASTERCLASS {selectedVideoIndex + 1} OF 5 · {currentVideo.duration}
                  </span>
                  <a
                    href={`https://www.youtube.com/watch?v=${currentVideo.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
                  >
                    <span>Watch on YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <h2 className="text-xl font-bold text-white tracking-tight">
                  {currentVideo.title}
                </h2>

                <div className="p-4 rounded-xl bg-white/[0.02] text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white block mb-1">Curator's Masterclass Notes:</strong>
                  {currentVideo.description}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 3: CAPSTONE ASSIGNMENT EXAMINATION (70% PASS)          */}
        {/* ========================================================== */}
        {activeTab === 'assignment' && (
          <div className="bg-[#0c1018] rounded-2xl p-6 sm:p-10 shadow-xl space-y-8 max-w-4xl mx-auto">
            <div className="space-y-3 text-center max-w-2xl mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-[#c5a059]/15 text-[#c5a059] flex items-center justify-center mx-auto">
                <Award className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {course.finalAssignment.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {course.finalAssignment.description}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-xs font-mono text-slate-300">
                <span>Passing Grade: <strong className="text-white">70%</strong></span>
                <span aria-hidden="true">·</span>
                <span>{course.finalAssignment.questions.length} Questions</span>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {course.finalAssignment.questions.map((q, qIdx) => {
                const selectedOpt = userAnswers[q.id];
                const isAnswered = selectedOpt !== undefined;
                const isCorrect = isAnswered && selectedOpt === q.correctIndex;

                return (
                  <div key={q.id} className="p-5 sm:p-6 rounded-xl bg-[#090d15] space-y-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-white/10 text-xs font-mono text-ai-cyan font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {qIdx + 1}
                      </span>
                      <p className="text-sm font-semibold text-white leading-relaxed">
                        {q.question}
                      </p>
                    </div>

                    <div className="space-y-2 pl-9">
                      {q.options.map((opt, oIdx) => {
                        const isChosen = selectedOpt === oIdx;

                        return (
                          <button
                            key={oIdx}
                            disabled={submittedExam}
                            onClick={() => setUserAnswers(prev => ({ ...prev, [q.id]: oIdx }))}
                            className={`w-full text-left p-3 rounded-lg text-xs transition-all flex items-center justify-between ${
                              isChosen
                                ? 'bg-ai-cyan text-midnight-black font-semibold shadow-md'
                                : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.07] hover:text-white'
                            }`}
                          >
                            <span>{opt}</span>
                            {isChosen && <Check className="w-4 h-4 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback on submit */}
                    {submittedExam && (
                      <div className={`mt-3 p-3 rounded-lg text-xs leading-relaxed pl-9 ${
                        isCorrect ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'
                      }`}>
                        <strong>{isCorrect ? 'Correct! ' : 'Incorrect: '}</strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submission Actions & Score Results */}
            <div className="p-6 rounded-2xl bg-white/[0.03] text-center space-y-4">
              {!submittedExam ? (
                <button
                  onClick={handleSubmitAssignment}
                  disabled={Object.keys(userAnswers).length < course.finalAssignment.questions.length}
                  className="px-8 py-3 rounded-xl bg-ai-cyan text-midnight-black text-sm font-bold hover:bg-white disabled:opacity-40 disabled:pointer-events-none transition-all shadow-lg"
                >
                  Submit Capstone Examination for Grading
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="text-3xl font-extrabold font-mono">
                    <span className={hasPassedExam ? 'text-green-400' : 'text-amber-400'}>
                      Score: {examScore}%
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 max-w-lg mx-auto">
                    {hasPassedExam ? (
                      'Congratulations! You have surpassed the 70% proficiency mark. Your accredited Certificate of Completion is ready to view and download.'
                    ) : (
                      'You scored below the 70% threshold required for formal certification. Review the curriculum modules and retake the examination.'
                    )}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {hasPassedExam ? (
                      <Link
                        to={`/certificate/${course.id}`}
                        className="px-6 py-2.5 rounded-lg bg-[#c5a059] hover:bg-white text-midnight-black text-xs font-bold transition-colors shadow-md flex items-center gap-1.5"
                      >
                        <Award className="w-4 h-4" />
                        <span>View and Download Certificate</span>
                      </Link>
                    ) : (
                      <button
                        onClick={handleResetExam}
                        className="px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Retake Examination</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 4: SCHOLAR REVIEWS & FEEDBACK                          */}
        {/* ========================================================== */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Rating Stats & Review Form */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#0c1018] rounded-2xl p-6 shadow-xl space-y-4">
                <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Ratings Overview
                </h2>

                <div className="flex items-center gap-4">
                  <div className="text-4xl font-extrabold text-white font-mono">
                    {reviewStats.averageRating}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(reviewStats.averageRating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      Based on {reviewStats.totalCount} peer reviews
                    </p>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-1.5 pt-3">
                  {[5, 4, 3, 2, 1].map(stars => {
                    const count = reviewStats.ratingDistribution[stars as keyof typeof reviewStats.ratingDistribution] || 0;
                    const pct = reviewStats.totalCount > 0 ? (count / reviewStats.totalCount) * 100 : 0;

                    return (
                      <div key={stars} className="flex items-center gap-2 text-xs font-mono text-slate-400">
                        <span className="w-5 text-right">{stars}★</span>
                        <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
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

              {/* Submit Review Form */}
              <div className="bg-[#0c1018] rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white">Share Your Scholar Experience</h3>
                
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Your Rating</label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-1 text-slate-600 hover:text-amber-400 transition-colors"
                        >
                          <Star className={`w-5 h-5 ${star <= newRating ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Headline</label>
                    <input
                      type="text"
                      required
                      value={newHeadline}
                      onChange={e => setNewHeadline(e.target.value)}
                      placeholder="e.g. Essential curriculum for African security teams"
                      className="w-full bg-[#080b11] rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-ai-cyan"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Detailed Review</label>
                    <textarea
                      required
                      rows={3}
                      value={newReviewText}
                      onChange={e => setNewReviewText(e.target.value)}
                      placeholder="Write your feedback on the curriculum, videos, and practical utility..."
                      className="w-full bg-[#080b11] rounded-lg p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-ai-cyan resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full py-2.5 rounded-lg bg-ai-cyan text-midnight-black text-xs font-bold hover:bg-white transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingReview ? 'Publishing...' : 'Publish Scholar Review'}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Right Reviews Feed */}
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Scholars Feedback ({courseReviews.length})
              </h2>

              {courseReviews.map(r => (
                <div key={r.id} className="p-5 rounded-2xl bg-[#0c1018] space-y-3 shadow-md">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-ai-cyan/15 text-ai-cyan font-bold text-xs flex items-center justify-center">
                        {r.userName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{r.userName}</span>
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

                  <h4 className="text-sm font-bold text-white">{r.headline}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{r.reviewText}</p>

                  <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500 font-mono">
                    <span>{r.createdAt}</span>
                    <button
                      onClick={() => handleUpvote(r.id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors ${
                        upvotedMap[r.id] ? 'text-ai-cyan' : 'text-slate-400'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>Helpful ({r.helpfulCount})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
