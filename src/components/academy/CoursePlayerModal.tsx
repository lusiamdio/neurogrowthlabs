import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Course, YouTubeLecture, AssignmentQuestion } from '../../data/academyData';
import { 
  X, CheckCircle, Circle, Play, BookOpen, Terminal, 
  Award, ArrowRight, ArrowLeft, Clock, Shield, Sparkles, Check,
  Youtube, ExternalLink, HelpCircle, AlertCircle, RotateCcw,
  CheckCircle2, Video, Star, ThumbsUp, MessageSquare, Send
} from 'lucide-react';
import { 
  CourseReview, CourseRatingStats, getReviewsForCourse, 
  calculateCourseRatingStats, submitCourseReview, toggleReviewHelpful 
} from '../../data/academyReviews';

interface CoursePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  completedModuleIds: string[];
  onToggleModuleCompletion: (moduleId: string) => void;
  onClaimCertificate: (examScore?: number) => void;
  passedExamScore?: number | null;
  onSaveExamScore?: (courseId: string, score: number) => void;
  currentUser?: { uid?: string; id?: string; email?: string; displayName?: string } | null;
  onOpenAuth?: () => void;
}

export default function CoursePlayerModal({
  isOpen,
  onClose,
  course,
  completedModuleIds,
  onToggleModuleCompletion,
  onClaimCertificate,
  passedExamScore = null,
  onSaveExamScore,
  currentUser = null,
  onOpenAuth
}: CoursePlayerModalProps) {
  // Navigation tabs within classroom
  const [activeTab, setActiveTab] = useState<'modules' | 'videos' | 'assignment' | 'reviews'>('modules');
  
  // Reviews state
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

  // Active lesson module
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);

  // Active YouTube video selection
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

  // Final assignment states
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [submittedExam, setSubmittedExam] = useState(false);
  const [scorePercentage, setScorePercentage] = useState<number | null>(passedExamScore);
  const [hasPassed, setHasPassed] = useState<boolean>(passedExamScore !== null && passedExamScore >= 70);

  // Load reviews on mount
  React.useEffect(() => {
    if (!isOpen) return;
    getReviewsForCourse(course.id).then(list => {
      setCourseReviews(list);
      setReviewStats(calculateCourseRatingStats(list));
    });
  }, [isOpen, course.id]);

  if (!isOpen) return null;

  const currentModule = course.modules[selectedModuleIndex] || course.modules[0];
  const isCurrentCompleted = completedModuleIds.includes(currentModule.id);
  const totalModules = course.modules.length;
  const completedCount = course.modules.filter(m => completedModuleIds.includes(m.id)).length;
  const progressPercent = Math.round((completedCount / totalModules) * 100);

  const currentVideo = course.youtubeLectures[selectedVideoIndex] || course.youtubeLectures[0];

  const handleNextModule = () => {
    if (selectedModuleIndex < course.modules.length - 1) {
      setSelectedModuleIndex(prev => prev + 1);
    }
  };

  const handlePrevModule = () => {
    if (selectedModuleIndex > 0) {
      setSelectedModuleIndex(prev => prev - 1);
    }
  };

  // Handle final exam submission
  const handleSubmitAssignment = () => {
    const questions = course.finalAssignment.questions;
    let correctCount = 0;

    questions.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    setScorePercentage(calculatedScore);
    setSubmittedExam(true);

    if (calculatedScore >= 70) {
      setHasPassed(true);
      if (onSaveExamScore) {
        onSaveExamScore(course.id, calculatedScore);
      }
    } else {
      setHasPassed(false);
    }
  };

  const handleResetExam = () => {
    setUserAnswers({});
    setSubmittedExam(false);
  };

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

        {/* Classroom Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-5xl bg-[#0d121c] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-10 my-4 flex flex-col max-h-[92vh]"
        >
          {/* Top Bar with Course Identity & Tabs */}
          <div className="p-4 sm:p-5 bg-[#090d15] border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-ai-cyan/15 border border-ai-cyan/30 flex items-center justify-center text-ai-cyan shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span className="text-ai-cyan font-bold">{course.code}</span>
                  <span aria-hidden="true">·</span>
                  <span>{course.track}</span>
                  <span aria-hidden="true">·</span>
                  <span>{course.difficultyLevel}</span>
                </div>
                <h2 className="text-base font-bold text-white tracking-tight truncate max-w-md sm:max-w-xl">
                  {course.title}
                </h2>
              </div>
            </div>

            {/* Navigation Tabs (Modules / 5 YouTube Lectures / Final Assignment) */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-white/[0.04] rounded-lg border border-white/10">
                <button
                  onClick={() => setActiveTab('modules')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                    activeTab === 'modules'
                      ? 'bg-ai-cyan text-midnight-black font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Modules ({completedCount}/{totalModules})</span>
                </button>

                <button
                  onClick={() => setActiveTab('videos')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                    activeTab === 'videos'
                      ? 'bg-ai-cyan text-midnight-black font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Youtube className="w-3.5 h-3.5 text-red-400" />
                  <span>5 YouTube Lectures</span>
                </button>

                <button
                  onClick={() => setActiveTab('assignment')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                    activeTab === 'assignment'
                      ? 'bg-ai-cyan text-midnight-black font-semibold'
                      : hasPassed
                        ? 'text-green-400 hover:text-white'
                        : 'text-[#c5a059] hover:text-white'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>
                    Final Exam {hasPassed ? `(Passed ${scorePercentage}%)` : '(70% Req)'}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                    activeTab === 'reviews'
                      ? 'bg-ai-cyan text-midnight-black font-semibold'
                      : 'text-amber-400 hover:text-white'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>Reviews ({reviewStats.averageRating} ★)</span>
                </button>
              </div>

              {hasPassed && (
                <button
                  onClick={() => onClaimCertificate(scorePercentage || 85)}
                  className="px-3 py-1.5 rounded-lg bg-[#c5a059] text-midnight-black text-xs font-bold hover:bg-white transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Get Certificate</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* TAB 1: CURRICULUM MODULES (LESSONS & SANDBOX)           */}
          {/* ======================================================== */}
          {activeTab === 'modules' && (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
              {/* Modules List Sidebar */}
              <div className="md:col-span-4 border-r border-white/10 bg-[#090d15] p-4 overflow-y-auto max-h-[500px] md:max-h-[620px]">
                <div className="flex items-center justify-between mb-3 px-1 text-xs text-slate-400">
                  <span className="font-mono uppercase tracking-wider font-semibold">
                    Curriculum Lessons ({completedCount}/{totalModules})
                  </span>
                  <span className="text-ai-cyan">{progressPercent}%</span>
                </div>

                <div className="space-y-2">
                  {course.modules.map((mod, idx) => {
                    const isCompleted = completedModuleIds.includes(mod.id);
                    const isSelected = selectedModuleIndex === idx;

                    return (
                      <button
                        key={mod.id}
                        onClick={() => setSelectedModuleIndex(idx)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-ai-cyan/10 border-ai-cyan/40 text-white shadow-sm'
                            : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] text-slate-400 hover:text-white'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleModuleCompletion(mod.id);
                          }}
                          className="mt-0.5"
                          title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-500 hover:text-ai-cyan" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-0.5">
                            <span>Module {idx + 1}</span>
                            <span>{mod.duration}</span>
                          </div>
                          <p className="text-xs font-semibold leading-snug line-clamp-2">
                            {mod.title}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Capstone notice */}
                <div className="mt-6 p-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-xs">
                  <p className="font-bold text-white flex items-center gap-1.5 mb-1">
                    <Award className="w-4 h-4 text-[#c5a059]" />
                    <span>Certification Requirement</span>
                  </p>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    To unlock your autogenerated Certificate of Completion, complete all modules and achieve $\ge 70\%$ on the Final Capstone Exam.
                  </p>
                  <button
                    onClick={() => setActiveTab('assignment')}
                    className="mt-2 text-xs font-mono text-ai-cyan hover:underline block"
                  >
                    Open Final Exam →
                  </button>
                </div>
              </div>

              {/* Active Lesson Reader */}
              <div className="md:col-span-8 p-6 sm:p-8 overflow-y-auto max-h-[500px] md:max-h-[620px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
                    <span className="text-ai-cyan font-semibold">Module {selectedModuleIndex + 1} of {totalModules}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {currentModule.duration}</span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-3">
                    {currentModule.title}
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 p-3.5 rounded-lg bg-white/[0.02] border border-white/10">
                    {currentModule.summary}
                  </p>

                  <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-4">
                    <p>{currentModule.content}</p>

                    <div className="my-5 p-4 rounded-xl bg-[#06080e] border border-white/10 font-mono text-xs text-ai-cyan">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-ai-cyan" />
                          <span>Kernel & Defensive Telemetry Sandbox</span>
                        </span>
                        <span>eBPF Line Rate Probe</span>
                      </div>
                      <pre className="overflow-x-auto text-green-300 text-[11px] leading-relaxed">
{`# Neurogrowth Labs Real-Time Defensive Sandbox [${course.code}]
$ sudo ngl-defense-agent --inspect-network eth0 --threshold 0.70
[STATUS] Active model: ${course.code}
[METRICS] Line throughput: 42,000 pkt/sec | Latency: 0.18ms
[EVENT] Zero-day vector evaluation: Clean (All signatures verified)`}
                      </pre>
                    </div>

                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold mb-2">
                        Key Competencies Mastered:
                      </h4>
                      <div className="space-y-1.5">
                        {currentModule.keyTakeaways.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                            <Check className="w-3.5 h-3.5 text-ai-cyan shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Module Controls */}
                <div className="mt-8 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevModule}
                      disabled={selectedModuleIndex === 0}
                      className="px-3 py-1.5 rounded-md border border-white/10 text-xs text-slate-400 hover:text-white disabled:opacity-30 transition-colors flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>

                    <button
                      onClick={handleNextModule}
                      disabled={selectedModuleIndex === course.modules.length - 1}
                      className="px-3 py-1.5 rounded-md border border-white/10 text-xs text-slate-400 hover:text-white disabled:opacity-30 transition-colors flex items-center gap-1"
                    >
                      <span>Next Module</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onToggleModuleCompletion(currentModule.id)}
                      className={`px-4 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        isCurrentCompleted
                          ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                      }`}
                    >
                      {isCurrentCompleted ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                          <span>Module Completed</span>
                        </>
                      ) : (
                        <span>Mark as Completed</span>
                      )}
                    </button>

                    <button
                      onClick={() => setActiveTab('assignment')}
                      className="px-4 py-1.5 rounded-md text-xs font-semibold bg-ai-cyan text-midnight-black hover:bg-white transition-colors flex items-center gap-1.5"
                    >
                      <span>Take Final Exam</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: 5 YOUTUBE LECTURES SECTION                        */}
          {/* ======================================================== */}
          {activeTab === 'videos' && (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
              {/* YouTube Lectures Playlist Sidebar */}
              <div className="md:col-span-4 border-r border-white/10 bg-[#090d15] p-4 overflow-y-auto max-h-[500px] md:max-h-[620px]">
                <div className="flex items-center justify-between mb-3 px-1 text-xs text-slate-400">
                  <span className="font-mono uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    <Youtube className="w-4 h-4 text-red-400" />
                    <span>5 YouTube Lectures</span>
                  </span>
                  <span>Curated</span>
                </div>

                <div className="space-y-2">
                  {course.youtubeLectures.map((lec, idx) => {
                    const isSelected = selectedVideoIndex === idx;

                    return (
                      <button
                        key={lec.id}
                        onClick={() => setSelectedVideoIndex(idx)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-ai-cyan/10 border-ai-cyan/40 text-white shadow-sm'
                            : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono ${
                          isSelected ? 'bg-ai-cyan text-midnight-black font-bold' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}>
                          <Play className="w-3 h-3 fill-current" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-0.5">
                            <span>Lecture {idx + 1}</span>
                            <span>{lec.duration}</span>
                          </div>
                          <p className="text-xs font-semibold leading-snug line-clamp-2">
                            {lec.title}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{lec.channel}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* YouTube Video Stage Player & Notes */}
              <div className="md:col-span-8 p-6 sm:p-8 overflow-y-auto max-h-[500px] md:max-h-[620px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="font-mono text-ai-cyan">
                      Lecture {selectedVideoIndex + 1} of 5 · {currentVideo.channel}
                    </span>
                    <a
                      href={currentVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <span>Watch on YouTube</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Responsive YouTube Video Embed */}
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/15 bg-black shadow-lg mb-4">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${currentVideo.videoId}?rel=0`}
                      title={currentVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">
                    {currentVideo.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed p-3.5 rounded-lg bg-white/[0.02] border border-white/10">
                    {currentVideo.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Duration: <strong className="text-white">{currentVideo.duration}</strong>
                  </span>

                  <button
                    onClick={() => setActiveTab('assignment')}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-ai-cyan text-midnight-black hover:bg-white transition-colors flex items-center gap-1.5"
                  >
                    <span>Proceed to Final Assignment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: FINAL ASSIGNMENT (70% PASSING THRESHOLD)          */}
          {/* ======================================================== */}
          {activeTab === 'assignment' && (
            <div className="p-6 sm:p-8 overflow-y-auto max-h-[580px] space-y-6">
              {/* Exam Header */}
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#c5a059] font-bold mb-1">
                    <Award className="w-4 h-4" />
                    <span>FINAL CAPSTONE EVALUATION · 70% PASSING MARK MANDATORY</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {course.finalAssignment.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    {course.finalAssignment.description}
                  </p>
                </div>

                {scorePercentage !== null && (
                  <div className={`p-4 rounded-xl border text-center shrink-0 ${
                    hasPassed
                      ? 'bg-green-500/10 border-green-500/30 text-green-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                    <p className="text-xs font-mono uppercase tracking-wider font-semibold">Your Score</p>
                    <p className="text-3xl font-extrabold">{scorePercentage}%</p>
                    <p className="text-[11px] font-bold mt-0.5">
                      {hasPassed ? 'PASSED (70%+)' : 'NEEDS 70% TO PASS'}
                    </p>
                  </div>
                )}
              </div>

              {/* Pass / Fail Alert Banner */}
              {submittedExam && (
                <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                  hasPassed
                    ? 'bg-green-500/15 border-green-500/40 text-green-300'
                    : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                }`}>
                  <div className="flex items-center gap-3">
                    {hasPassed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-bold text-white">
                        {hasPassed
                          ? 'Congratulations! You have verified your competencies.'
                          : 'Score below passing threshold (70%).'}
                      </p>
                      <p className="text-xs text-slate-300">
                        {hasPassed
                          ? `You scored ${scorePercentage}%. Your autogenerated Certificate of Completion is now unlocked.`
                          : `You achieved ${scorePercentage}%. Review the modules and 5 video lectures, then retake the exam.`}
                      </p>
                    </div>
                  </div>

                  {hasPassed ? (
                    <button
                      onClick={() => onClaimCertificate(scorePercentage || 85)}
                      className="px-4 py-2 rounded-lg bg-green-400 hover:bg-white text-midnight-black font-bold text-xs shrink-0 transition-colors shadow-md flex items-center gap-1.5"
                    >
                      <Award className="w-4 h-4" />
                      <span>Issue Certificate</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleResetExam}
                      className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold shrink-0 transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake Exam</span>
                    </button>
                  )}
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-6">
                {course.finalAssignment.questions.map((q, qIndex) => {
                  const selectedOpt = userAnswers[q.id];
                  const isAnswered = selectedOpt !== undefined;
                  const isCorrect = isAnswered && selectedOpt === q.correctIndex;

                  return (
                    <div 
                      key={q.id}
                      className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-sm font-bold text-white flex items-start gap-2">
                          <span className="text-ai-cyan font-mono">Q{qIndex + 1}.</span>
                          <span>{q.question}</span>
                        </h4>

                        {submittedExam && (
                          <span className={`text-xs font-mono font-bold shrink-0 ${
                            isCorrect ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                          </span>
                        )}
                      </div>

                      {/* Options */}
                      <div className="space-y-2 pt-1">
                        {q.options.map((opt, optIndex) => {
                          const isOptionSelected = selectedOpt === optIndex;
                          const showCorrectHighlight = submittedExam && optIndex === q.correctIndex;
                          const showWrongHighlight = submittedExam && isOptionSelected && !isCorrect;

                          return (
                            <label
                              key={optIndex}
                              className={`p-3 rounded-lg border text-xs cursor-pointer flex items-start gap-3 transition-colors ${
                                showCorrectHighlight
                                  ? 'bg-green-500/10 border-green-500/50 text-white'
                                  : showWrongHighlight
                                    ? 'bg-red-500/10 border-red-500/50 text-white'
                                    : isOptionSelected
                                      ? 'bg-ai-cyan/10 border-ai-cyan text-white'
                                      : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.04] text-slate-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${q.id}`}
                                checked={isOptionSelected}
                                disabled={submittedExam && hasPassed}
                                onChange={() => setUserAnswers(prev => ({ ...prev, [q.id]: optIndex }))}
                                className="mt-0.5 text-ai-cyan focus:ring-0"
                              />
                              <span className="leading-relaxed">{opt}</span>
                            </label>
                          );
                        })}
                      </div>

                      {/* Post-submit explanation */}
                      {submittedExam && (
                        <p className="text-[11px] text-slate-400 pt-2 border-t border-white/5 leading-relaxed">
                          <strong className="text-slate-300">Explanation: </strong>
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit / Action Bar */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Answered {Object.keys(userAnswers).length} of {course.finalAssignment.questions.length} questions
                </span>

                <div className="flex items-center gap-3">
                  {submittedExam && (
                    <button
                      onClick={handleResetExam}
                      className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white border border-white/10 transition-colors"
                    >
                      Clear Answers
                    </button>
                  )}

                  <button
                    onClick={handleSubmitAssignment}
                    disabled={Object.keys(userAnswers).length < course.finalAssignment.questions.length}
                    className="px-5 py-2.5 rounded-lg text-xs font-bold bg-ai-cyan text-midnight-black hover:bg-white disabled:opacity-40 transition-colors shadow-md flex items-center gap-1.5"
                  >
                    <span>Submit Exam for Certification</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: REVIEWS & STAR-RATING                             */}
          {/* ======================================================== */}
          {activeTab === 'reviews' && (
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6">
              {/* Score Header */}
              <div className="p-5 bg-[#090d15] rounded-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-black text-white flex items-center gap-1">
                    <span>{reviewStats.averageRating}</span>
                    <span className="text-amber-400 text-2xl">★</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${s <= Math.round(reviewStats.averageRating) ? 'fill-amber-400' : 'text-slate-600'}`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {reviewStats.totalCount} peer ratings · {reviewStats.recommendPercent}% recommendation
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!currentUser && onOpenAuth) {
                        onOpenAuth();
                      } else {
                        const form = document.getElementById('player-review-form');
                        form?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-ai-cyan text-midnight-black text-xs font-bold hover:bg-white transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Rate & Review Course</span>
                  </button>
                </div>
              </div>

              {/* In-classroom review submission form */}
              <form
                id="player-review-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!currentUser) {
                    if (onOpenAuth) onOpenAuth();
                    return;
                  }
                  if (!newHeadline.trim() || !newReviewText.trim()) return;
                  setIsSubmittingReview(true);
                  try {
                    const res = await submitCourseReview({
                      courseId: course.id,
                      userId: currentUser.uid || currentUser.id || 'learner',
                      userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Verified Learner',
                      userEmail: currentUser.email,
                      rating: newRating,
                      headline: newHeadline.trim(),
                      reviewText: newReviewText.trim(),
                      roleTag: 'Verified Enrolled Scholar',
                      organization: 'Sovereign Academy',
                      recommendation: newRating >= 4
                    });
                    const updated = [res, ...courseReviews];
                    setCourseReviews(updated);
                    setReviewStats(calculateCourseRatingStats(updated));
                    setNewHeadline('');
                    setNewReviewText('');
                    setReviewSuccess(true);
                    setTimeout(() => setReviewSuccess(false), 3500);
                  } catch (err) {
                    console.warn(err);
                  } finally {
                    setIsSubmittingReview(false);
                  }
                }}
                className="p-5 rounded-xl bg-[#090d15] border border-white/10 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Submit Learner Review
                  </h3>
                  {reviewSuccess && (
                    <span className="text-emerald-400 text-xs flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Review published!</span>
                    </span>
                  )}
                </div>

                {/* Star Picker */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${star <= newRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-amber-400 font-mono font-bold">({newRating} / 5 Stars)</span>
                </div>

                <input
                  type="text"
                  value={newHeadline}
                  onChange={(e) => setNewHeadline(e.target.value)}
                  placeholder="Review title (e.g. Masterclass with actionable practical labs)"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-ai-cyan"
                />

                <textarea
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  placeholder="What did you think of the lecture modules, YouTube masterclasses, and capstone exam?"
                  rows={3}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-ai-cyan resize-none"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingReview || !newHeadline.trim() || !newReviewText.trim()}
                    className="px-4 py-2 rounded-lg bg-ai-cyan text-midnight-black text-xs font-bold hover:bg-white transition-colors disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isSubmittingReview ? 'Posting...' : 'Post Verified Review'}</span>
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-3">
                <div className="text-xs font-mono text-slate-400 border-b border-white/10 pb-2">
                  Peer Reviews ({courseReviews.length})
                </div>
                {courseReviews.map((rev) => {
                  const isUpvoted = !!upvotedMap[rev.id];
                  return (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl bg-[#090d15] border border-white/10 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{rev.userName}</span>
                          <span className="text-[10px] text-ai-cyan font-mono px-1.5 py-0.5 rounded bg-ai-cyan/10 border border-ai-cyan/20">
                            {rev.roleTag}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-400' : 'text-slate-600'}`}
                            />
                          ))}
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-white">"{rev.headline}"</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{rev.reviewText}</p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                        <button
                          type="button"
                          onClick={async () => {
                            if (upvotedMap[rev.id]) return;
                            setUpvotedMap(prev => ({ ...prev, [rev.id]: true }));
                            const count = await toggleReviewHelpful(rev.id);
                            setCourseReviews(prev => prev.map(r => r.id === rev.id ? { ...r, helpfulCount: count } : r));
                          }}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors ${
                            isUpvoted ? 'text-ai-cyan border-ai-cyan/40 bg-ai-cyan/10' : 'text-slate-400 border-white/10 hover:text-white'
                          }`}
                        >
                          <ThumbsUp className="w-2.5 h-2.5" />
                          <span>Helpful ({rev.helpfulCount || 0})</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
