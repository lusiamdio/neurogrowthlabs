import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/sections/Navbar';
import Footer from '../components/sections/Footer';
import { useAuth } from '../components/AuthContext';
import { 
  ACADEMY_COURSES, RESEARCH_PAPERS, Course, ResearchPaper 
} from '../data/academyData';
import { 
  sendCourseEnrollmentNotification 
} from '../services/emailNotificationService';
import { 
  getReviewsForCourse, calculateCourseRatingStats 
} from '../data/academyReviews';
import { downloadAcademicPaper } from '../utils/paperDownloadHelper';
import heroDatacenterImg from '../assets/images/academy_hero_datacenter_1794212199298.jpg';
import { 
  ShieldCheck, BookOpen, Download, Award, CheckCircle, 
  Sparkles, Clock, Globe, ChevronDown, ChevronUp, Lock,
  FileText, ExternalLink, ArrowRight, UserCheck, Star,
  GraduationCap, Search, Filter, Share2, Terminal, Check,
  Layers, Compass, Cpu, Network, Shield, Bookmark, User,
  Calendar, Hash, X, Youtube, SlidersHorizontal, RotateCcw,
  Mail, Bell, ThumbsUp, MessageSquare, Table2
} from 'lucide-react';

export default function Academy() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, updateDisplayName } = useAuth();

  // Active view tab & search query
  const [activeTab, setActiveTab] = useState<'all' | 'courses' | 'papers' | 'my-learning'>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/research' || window.location.hash === '#research') {
        return 'papers';
      }
    }
    return 'courses';
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Sync tab with URL
  useEffect(() => {
    if (location.pathname === '/research' || location.hash === '#research') {
      setActiveTab('papers');
    } else if (location.pathname === '/courses') {
      setActiveTab('courses');
    }
  }, [location.pathname, location.hash]);

  // Sidebar Filter Checkboxes States
  // Difficulty Level: 'Beginner' | 'Intermediate' | 'Expert'
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  // Course Type: 'Research' | 'Applied AI' | 'Enterprise'
  const [selectedCourseType, setSelectedCourseType] = useState<string[]>([]);

  // Mobile sidebar toggle
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Accordion states
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [expandedPaperId, setExpandedPaperId] = useState<string | null>(null);
  const [expandedBibtexId, setExpandedBibtexId] = useState<string | null>(null);

  // Enrolled courses state (persisted per user in localStorage + state)
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('ngl_enrolled_courses');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Completed modules tracking { [courseId]: string[] of completed moduleIds }
  const [completedModulesByCourse, setCompletedModulesByCourse] = useState<Record<string, string[]>>(() => {
    try {
      const stored = localStorage.getItem('ngl_completed_modules');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Passed assignment scores { [courseId]: number }
  const [courseExamScores, setCourseExamScores] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem('ngl_course_exam_scores');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Downloaded papers tracker
  const [downloadedPaperIds, setDownloadedPaperIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('ngl_downloaded_papers');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live course ratings stats map
  const [courseStatsMap, setCourseStatsMap] = useState<Record<string, { averageRating: number; totalCount: number }>>({});

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('ngl_enrolled_courses', JSON.stringify(enrolledCourseIds));
  }, [enrolledCourseIds]);

  useEffect(() => {
    localStorage.setItem('ngl_completed_modules', JSON.stringify(completedModulesByCourse));
  }, [completedModulesByCourse]);

  useEffect(() => {
    localStorage.setItem('ngl_course_exam_scores', JSON.stringify(courseExamScores));
  }, [courseExamScores]);

  useEffect(() => {
    localStorage.setItem('ngl_downloaded_papers', JSON.stringify(downloadedPaperIds));
  }, [downloadedPaperIds]);

  // Load reviews stats for all courses
  useEffect(() => {
    ACADEMY_COURSES.forEach(async (c) => {
      const list = await getReviewsForCourse(c.id);
      const s = calculateCourseRatingStats(list);
      setCourseStatsMap(prev => ({
        ...prev,
        [c.id]: { averageRating: s.averageRating, totalCount: s.totalCount }
      }));
    });
  }, []);

  // Listen for real-time reviews submitted
  useEffect(() => {
    const handleReviewEvent = (e: any) => {
      const detail = e.detail;
      if (detail?.courseId) {
        getReviewsForCourse(detail.courseId).then(list => {
          const s = calculateCourseRatingStats(list);
          setCourseStatsMap(prev => ({
            ...prev,
            [detail.courseId]: { averageRating: s.averageRating, totalCount: s.totalCount }
          }));
        });
      }
    };
    window.addEventListener('ngl_review_submitted', handleReviewEvent);
    return () => {
      window.removeEventListener('ngl_review_submitted', handleReviewEvent);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Toggle Difficulty Filter Checkbox
  const toggleDifficulty = (level: string) => {
    setSelectedDifficulty(prev => 
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  // Toggle Course Type Filter Checkbox
  const toggleCourseType = (type: string) => {
    setSelectedCourseType(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  // Reset all sidebar and search filters
  const resetAllFilters = () => {
    setSelectedDifficulty([]);
    setSelectedCourseType([]);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedDifficulty.length > 0 || selectedCourseType.length > 0 || searchQuery.trim().length > 0;

  // Enrollment click handler - navigates to dedicated classroom webpage
  const handleEnrollClick = (course: Course) => {
    if (!user) {
      navigate(`/learner/auth?redirect=/course/${course.id}&context=course&item=${encodeURIComponent(course.title)}`);
      return;
    }

    if (!enrolledCourseIds.includes(course.id)) {
      setEnrolledCourseIds(prev => [...prev, course.id]);
      showToast(`Enrolled in ${course.code}: ${course.title}`);
      
      // Dispatch SendGrid email notification
      sendCourseEnrollmentNotification({ user, course }).then(() => {
        showToast(`📧 Enrollment confirmation email dispatched to ${user.email} via SendGrid!`);
      }).catch(err => console.warn('Notification err:', err));
    }

    navigate(`/course/${course.id}`);
  };

  // Download paper click handler - navigates or downloads directly
  const handleDownloadClick = async (paper: ResearchPaper) => {
    if (!user) {
      navigate(`/learner/auth?redirect=/research/${paper.id}&context=paper&item=${encodeURIComponent(paper.title)}`);
      return;
    }

    await downloadAcademicPaper(paper, user);
    setDownloadedPaperIds(prev => prev.includes(paper.id) ? prev : [...prev, paper.id]);
    showToast(`Downloading: "${paper.title}" (PDF/Full-Text)`);
  };

  // Open Certificate webpage
  const handleOpenCertificate = (course: Course) => {
    navigate(`/certificate/${course.id}`);
  };

  // Filtered courses based on:
  // 1. Global top search query (by title or category/track)
  // 2. Sidebar difficulty checkboxes (Beginner, Intermediate, Expert)
  // 3. Sidebar course type checkboxes (Research, Applied AI, Enterprise)
  const filteredCourses = ACADEMY_COURSES.filter(c => {
    // Search query matches title, code, track, or overview
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      c.title.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.track.toLowerCase().includes(q) ||
      c.courseType.toLowerCase().includes(q) ||
      c.overview.toLowerCase().includes(q) ||
      c.skills.some(s => s.toLowerCase().includes(q));

    // Difficulty level checkbox match
    const matchesDifficulty = selectedDifficulty.length === 0 || 
      selectedDifficulty.includes(c.difficultyLevel);

    // Course type checkbox match
    const matchesCourseType = selectedCourseType.length === 0 || 
      selectedCourseType.includes(c.courseType);

    return matchesSearch && matchesDifficulty && matchesCourseType;
  });

  // Filtered papers
  const filteredPapers = RESEARCH_PAPERS.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    return !q || 
      p.title.toLowerCase().includes(q) ||
      p.abstract.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.authors.some(a => a.name.toLowerCase().includes(q));
  });

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-200 relative overflow-hidden flex flex-col justify-between selection:bg-ai-cyan selection:text-midnight-black">
      <Navbar />

      {/* Floating Global Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 z-50 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-lg bg-ai-cyan text-midnight-black font-semibold text-xs shadow-[0_4px_20px_rgba(0,229,255,0.4)] flex items-center gap-2 border border-white/20"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* TOP NAVIGATION HEADER WITH GLOBAL SEARCH BAR             */}
      {/* ======================================================== */}
      <header className="pt-24 pb-4 px-6 bg-[#0c1018]/95 backdrop-blur-xl sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Breadcrumb & Brand Category */}
          <div className="flex items-center gap-2 text-xs text-slate-400 w-full md:w-auto">
            <span className="hover:text-white cursor-pointer" onClick={() => navigate('/')}>Neurogrowth Labs</span>
            <span aria-hidden="true">/</span>
            <span className="text-white font-medium">Academy</span>
            <span aria-hidden="true">/</span>
            <span className="text-ai-cyan font-mono font-semibold">Skills & Research Hub</span>
          </div>

          {/* GLOBAL REAL-TIME SEARCH BAR (Filters Courses by Title or Category) */}
          <div className="relative flex-1 max-w-xl w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses by title or category (e.g. Defensive AI, Zero Trust, Governance)..."
              className="w-full bg-[#080b11] focus:ring-1 focus:ring-ai-cyan rounded-lg pl-10 pr-9 py-2 text-xs text-white focus:outline-none transition-colors placeholder:text-slate-500 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* User Active Profile Quick Status (if logged in) */}
          {user && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-slate-300 shrink-0">
              <UserCheck className="w-3.5 h-3.5 text-green-400" />
              <span className="font-medium truncate max-w-[130px]">{user.displayName || user.email}</span>
            </div>
          )}

        </div>
      </header>

      {/* Two-Zone Hero Section */}
      <section className="relative py-10 lg:py-14 px-6 bg-gradient-to-b from-[#0c1018] to-[#080b11]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero Narrative */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-ai-cyan">
              <ShieldCheck className="w-4 h-4" />
              <span>SOVEREIGN AFRICAN INTELLIGENCE ACADEMY · MICROSOFT LEARN STANDARD</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]">
              Cybersecurity & AI Academy for Africa
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Equipping engineers, security architects, and policymakers with accredited coursework and {RESEARCH_PAPERS.length} peer-reviewed research papers. <strong className="text-white">Verifiable Certificate of Completion autogenerated upon achieving 70%+ on the capstone examination.</strong>
            </p>

            {/* Quick stats strip */}
            <div className="pt-4 grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className="font-bold text-white text-base">Curriculum Modules</p>
                <p className="text-slate-400">With 5 YouTube masterclasses each</p>
              </div>
              <div>
                <p className="font-bold text-[#c5a059] text-base">70% Capstone Mark</p>
                <p className="text-slate-400">Required to unlock certificate</p>
              </div>
              <div>
                <p className="font-bold text-green-400 text-base">Verified Certificate</p>
                <p className="text-slate-400">Official download & verification</p>
              </div>
            </div>
          </div>

          {/* Right Hero Image Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-xl overflow-hidden shadow-2xl bg-[#0b0f17] group">
              <img 
                src={heroDatacenterImg}
                alt="Neurogrowth Labs Sovereign Cloud Operations & Cybersecurity Academy"
                referrerPolicy="no-referrer"
                className="w-full h-[260px] sm:h-[300px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080b11] via-[#080b11]/30 to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg bg-[#0c111c]/90 backdrop-blur-md flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-ai-cyan shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">Autogenerated Certificate</p>
                    <p className="text-[10px] text-slate-400">Pass Capstone with 70%+ to download</p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenCertificate(ACADEMY_COURSES[0])}
                  className="px-3 py-1 rounded-md bg-ai-cyan text-midnight-black text-xs font-bold hover:bg-white transition-colors shrink-0"
                >
                  Preview Sample
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Main Academy Body: Left Sidebar + Right Course Listings */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ======================================================== */}
          {/* LEFT SIDEBAR: FILTERS (DIFFICULTY & COURSE TYPE)         */}
          {/* ======================================================== */}
          <aside className="lg:col-span-3 space-y-6">
            
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden flex items-center justify-between p-3 rounded-lg bg-white/[0.03]">
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="flex items-center gap-2 text-xs font-bold text-white"
              >
                <SlidersHorizontal className="w-4 h-4 text-ai-cyan" />
                <span>Filter Courses ({selectedDifficulty.length + selectedCourseType.length} active)</span>
              </button>

              {hasActiveFilters && (
                <button
                  onClick={resetAllFilters}
                  className="text-xs text-ai-cyan hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Sidebar Content (Desktop Always, Mobile Collapsible) */}
            <div className={`${mobileFilterOpen ? 'block' : 'hidden'} lg:block space-y-6`}>
              
              {/* Sidebar Header */}
              <div className="p-4 rounded-xl bg-[#0c1018] space-y-5 shadow-sm">
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
                    <Filter className="w-3.5 h-3.5 text-ai-cyan" />
                    <span>Filter Academy</span>
                  </div>

                  {hasActiveFilters && (
                    <button
                      onClick={resetAllFilters}
                      className="text-[11px] text-ai-cyan hover:underline flex items-center gap-1 font-mono"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                {/* Filter Group 1: Difficulty Level */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-white uppercase tracking-wider font-mono block">
                    Difficulty Level
                  </label>
                  <div className="space-y-2 text-xs">
                    {(['Beginner', 'Intermediate', 'Expert'] as const).map((level) => {
                      const count = ACADEMY_COURSES.filter(c => c.difficultyLevel === level).length;
                      const isChecked = selectedDifficulty.includes(level);

                      return (
                        <label 
                          key={level}
                          className="flex items-center justify-between cursor-pointer group text-slate-300 hover:text-white"
                        >
                          <div className="flex items-center gap-2.5">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleDifficulty(level)}
                              className="rounded bg-[#080b11] text-ai-cyan focus:ring-0 cursor-pointer w-4 h-4"
                            />
                            <span className="text-xs">{level}</span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-500 group-hover:text-slate-400">
                            {count}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Filter Group 2: Course Type */}
                <div className="space-y-2.5 pt-3">
                  <label className="text-xs font-bold text-white uppercase tracking-wider font-mono block">
                    Course Type
                  </label>
                  <div className="space-y-2 text-xs">
                    {(['Research', 'Applied AI', 'Enterprise'] as const).map((type) => {
                      const count = ACADEMY_COURSES.filter(c => c.courseType === type).length;
                      const isChecked = selectedCourseType.includes(type);

                      return (
                        <label 
                          key={type}
                          className="flex items-center justify-between cursor-pointer group text-slate-300 hover:text-white"
                        >
                          <div className="flex items-center gap-2.5">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCourseType(type)}
                              className="rounded bg-[#080b11] text-ai-cyan focus:ring-0 cursor-pointer w-4 h-4"
                            />
                            <span className="text-xs">{type}</span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-500 group-hover:text-slate-400">
                            {count}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Live Count Indicator */}
                <div className="pt-3 text-xs text-slate-400 flex items-center justify-between">
                  <span>Filtered Courses:</span>
                  <span className="font-mono text-ai-cyan font-bold">{filteredCourses.length} of 5</span>
                </div>
              </div>

              {/* Certification Rules Info Box */}
              <div className="p-4 rounded-xl bg-white/[0.02] space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-[#c5a059]">
                  <Award className="w-4 h-4" />
                  <span>Certification Requirements</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-400 leading-relaxed">
                  <li>• Watch all 5 curated YouTube masterclasses</li>
                  <li>• Complete practical module checkpoints</li>
                  <li>• Score at least <strong className="text-white">70%</strong> on the final capstone examination</li>
                  <li>• Instant autogenerated certificate download in official PDF format</li>
                </ul>
              </div>

            </div>
          </aside>

          {/* ======================================================== */}
          {/* RIGHT MAIN AREA: TAB SWITCHER & FILTERED LISTINGS        */}
          {/* ======================================================== */}
          <main className="lg:col-span-9 space-y-6">

            {/* Segmented Tab Navigation */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-3">
              <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] rounded-lg">
                <button
                  onClick={() => setActiveTab('courses')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                    activeTab === 'courses'
                      ? 'bg-ai-cyan text-midnight-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>5 Courses ({filteredCourses.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('papers')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                    activeTab === 'papers'
                      ? 'bg-ai-cyan text-midnight-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{RESEARCH_PAPERS.length} Research Papers ({filteredPapers.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('my-learning')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                    activeTab === 'my-learning'
                      ? 'bg-ai-cyan text-midnight-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>My Enrolled & Certifications ({enrolledCourseIds.length})</span>
                </button>
              </div>

              {/* Active Filter Chips */}
              {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-slate-400">Filters:</span>
                  {searchQuery && (
                    <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono flex items-center gap-1">
                      "{searchQuery}"
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                    </span>
                  )}
                  {selectedDifficulty.map(d => (
                    <span key={d} className="px-2 py-0.5 rounded bg-ai-cyan/15 text-ai-cyan font-mono flex items-center gap-1">
                      {d}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => toggleDifficulty(d)} />
                    </span>
                  ))}
                  {selectedCourseType.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded bg-[#c5a059]/15 text-[#c5a059] font-mono flex items-center gap-1">
                      {t}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => toggleCourseType(t)} />
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ======================================================== */}
            {/* VIEW 1: 5 COURSES ON CYBERSECURITY & DEFENSIVE AI        */}
            {/* ======================================================== */}
            {activeTab === 'courses' && (
              <div>
                {filteredCourses.length === 0 ? (
                  <div className="p-8 rounded-xl bg-white/[0.02] text-center space-y-3">
                    <p className="text-base font-bold text-white">No courses match your filter criteria.</p>
                    <p className="text-xs text-slate-400">Try clearing the sidebar checkboxes or resetting your search term.</p>
                    <button
                      onClick={resetAllFilters}
                      className="px-4 py-2 rounded-lg bg-ai-cyan text-midnight-black text-xs font-bold hover:bg-white transition-colors"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCourses.map((course) => {
                      const isEnrolled = enrolledCourseIds.includes(course.id);
                      const examScore = courseExamScores[course.id];
                      const hasPassedExam = examScore !== undefined && examScore >= 70;
                      const isExpanded = expandedCourseId === course.id;

                      return (
                        <div 
                          key={course.id}
                          className="bg-[#0c1018] hover:bg-[#0e1422] rounded-xl p-5 transition-all duration-300 shadow-md flex flex-col justify-between"
                        >
                          <div>
                            {/* Top Metadata Line */}
                            <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-2 font-mono">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-ai-cyan font-bold">{course.code}</span>
                                <span aria-hidden="true">·</span>
                                <span className="text-slate-300">{course.difficultyLevel}</span>
                                <span aria-hidden="true">·</span>
                                <span className="text-[#c5a059]">{course.courseType}</span>
                              </div>

                              <button
                                onClick={() => navigate(`/reviews/${course.id}`)}
                                className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-mono transition-colors cursor-pointer shrink-0"
                                title="View peer ratings & reviews"
                              >
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span className="font-bold text-white">{courseStatsMap[course.id]?.averageRating || 4.9}</span>
                                <span className="text-slate-400 text-[10px]">({courseStatsMap[course.id]?.totalCount || 3})</span>
                              </button>
                            </div>

                            {/* Course Title */}
                            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight hover:text-ai-cyan transition-colors leading-snug line-clamp-2 min-h-[3rem]">
                              {course.title}
                            </h3>

                            {/* Overview Snippet */}
                            <p className="text-slate-300 text-xs leading-relaxed mt-2 line-clamp-2">
                              {course.overview}
                            </p>

                            {/* Mini Feature Badges */}
                            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                              <span className="px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-ai-cyan" /> {course.duration}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 flex items-center gap-1">
                                <Youtube className="w-3 h-3" /> 5 Masterclasses
                              </span>
                              <span className="px-2 py-0.5 rounded bg-white/[0.04] text-slate-300">
                                {course.modules.length} Modules
                              </span>
                            </div>

                            {/* Capstone Exam Threshold / Score Status */}
                            <div className="mt-2.5 p-2 rounded-lg bg-[#c5a059]/5 flex items-center justify-between text-[11px]">
                              <div className="flex items-center gap-1.5 text-slate-300">
                                <Award className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                                <span>Capstone Exam (70% Pass)</span>
                              </div>
                              {examScore !== undefined ? (
                                <span className={`font-mono font-bold ${hasPassedExam ? 'text-green-400' : 'text-amber-400'}`}>
                                  {examScore}% {hasPassedExam ? '✓' : ''}
                                </span>
                              ) : (
                                <span className="text-slate-500 font-mono text-[10px]">Pending</span>
                              )}
                            </div>
                          </div>

                          {/* Card Actions Footer */}
                          <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEnrollClick(course)}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-ai-cyan text-midnight-black hover:bg-white transition-colors flex items-center gap-1.5 shadow-sm"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>{isEnrolled ? 'Open Classroom' : 'Enrol Now'}</span>
                              </button>

                              {hasPassedExam ? (
                                <button
                                  onClick={() => handleOpenCertificate(course)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#c5a059] hover:bg-white text-midnight-black transition-colors flex items-center gap-1 shadow-sm"
                                  title="Download Certificate"
                                >
                                  <Award className="w-3.5 h-3.5" />
                                  <span>Certificate</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => navigate(`/reviews/${course.id}`)}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-400 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 transition-colors flex items-center gap-1"
                                  title="Read scholar feedback"
                                >
                                  <Star className="w-3 h-3 fill-amber-400" />
                                  <span>Reviews</span>
                                </button>
                              )}
                            </div>

                            <button
                              onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors font-mono"
                            >
                              <span>{isExpanded ? 'Hide' : 'Curriculum'}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </div>

                          {/* Expandable Module & Video Preview */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 pt-3 space-y-3"
                              >
                                <div>
                                  <h4 className="text-[11px] font-mono uppercase text-red-400 mb-1.5 flex items-center gap-1">
                                    <Youtube className="w-3 h-3" />
                                    <span>5 YouTube Masterclasses:</span>
                                  </h4>
                                  <div className="space-y-1">
                                    {course.youtubeLectures.map((vid, vIdx) => (
                                      <div key={vid.id} className="p-1.5 rounded bg-black/40 flex items-center justify-between text-[11px] text-slate-300">
                                        <span className="truncate max-w-[200px]">{vIdx + 1}. {vid.title}</span>
                                        <span className="font-mono text-[10px] text-slate-500">{vid.duration}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="text-[11px] font-mono uppercase text-ai-cyan mb-1.5 flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" />
                                    <span>Curriculum Modules:</span>
                                  </h4>
                                  <div className="space-y-1">
                                    {course.modules.map((m, mIdx) => (
                                      <div key={m.id} className="p-1.5 rounded bg-white/[0.02] text-[11px]">
                                        <p className="font-semibold text-white">{mIdx + 1}. {m.title}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW 2: RESEARCH PAPERS IN COMPACT GRID                  */}
            {/* ======================================================== */}
            {activeTab === 'papers' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredPapers.map((paper) => {
                    const isBibtexOpen = expandedBibtexId === paper.id;

                    return (
                      <article
                        key={paper.id}
                        className="bg-[#0c111b] light:bg-white hover:bg-[#101725] light:hover:bg-stone-50 rounded-xl p-6 transition-colors duration-200 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] light:shadow-[inset_0_0_0_1px_rgba(28,25,23,0.12)] flex flex-col justify-between"
                      >
                        <div>
                          {/* Quiet Unboxed Metadata Strip */}
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 light:text-stone-600 mb-3">
                            <span className="text-[11px] uppercase tracking-wider text-[#c5a059] light:text-[#78350F] font-semibold truncate max-w-[210px]">
                              {paper.category}
                            </span>
                            <div className="flex items-center gap-1.5 font-mono tabular-nums text-[11px]">
                              <span>{paper.publishDate}</span>
                              <span aria-hidden="true">·</span>
                              <span>{paper.pages} pp.</span>
                              {paper.pdfUrl && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-emerald-400 light:text-emerald-700 font-semibold">
                                    PDF
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                        {/* Editorial Paper Title */}
                        <h3
                          onClick={() => navigate(`/research/${paper.id}`)}
                          className="font-serif text-lg sm:text-xl font-medium text-white light:text-stone-900 hover:text-[#c5a059] transition-colors leading-snug line-clamp-2 min-h-[3.25rem] cursor-pointer"
                        >
                          {paper.title}
                        </h3>

                        {/* Subtitle */}
                        <p className="text-slate-400 light:text-stone-600 text-xs font-medium line-clamp-1 mt-1.5">
                          {paper.subtitle}
                        </p>

                        {/* Authors */}
                        <div className="text-xs text-slate-400 light:text-stone-600 line-clamp-1 mt-2">
                          {paper.authors.map((a) => `${a.name} · ${a.affiliation}`).join(', ')}
                        </div>

                        {/* Abstract Excerpt */}
                        <p className="mt-3 p-3.5 rounded-lg bg-white/[0.025] light:bg-[#F7F4EE] text-xs text-slate-300 light:text-stone-700 leading-relaxed line-clamp-3">
                          {paper.abstract}
                        </p>
                      </div>

                      {/* Footer Stats & Actions */}
                      <div className="mt-5 pt-3 space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-400 light:text-stone-600 font-mono tabular-nums">
                          <span>{paper.downloadCount.toLocaleString()} downloads · {paper.citationCount} citations</span>
                          <button
                            type="button"
                            onClick={() => setExpandedBibtexId(isBibtexOpen ? null : paper.id)}
                            className="text-xs font-sans font-medium text-slate-300 light:text-stone-700 hover:text-[#c5a059] underline cursor-pointer"
                          >
                            {isBibtexOpen ? 'Hide BibTeX' : 'Cite'}
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/research/${paper.id}`)}
                            className="h-9 px-3 rounded-lg text-xs font-semibold bg-white text-[#080b11] light:bg-stone-900 light:text-white hover:bg-[#c5a059] hover:text-[#080b11] transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5 shrink-0" />
                            <span>Read</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => navigate(`/research/${paper.id}?tab=tables`)}
                            className="h-9 px-3 rounded-lg text-xs font-semibold bg-white/[0.05] light:bg-stone-100 hover:bg-white/[0.1] light:hover:bg-stone-200 text-slate-200 light:text-stone-800 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                          >
                            <Table2 className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                            <span>Tables</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadClick(paper)}
                            className="h-9 px-3 rounded-lg text-xs font-semibold bg-[#c5a059]/15 light:bg-[#EBE6DF] hover:bg-[#c5a059] text-[#e7c888] light:text-stone-900 hover:text-[#080b11] transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 shrink-0" />
                            <span>{paper.pdfUrl ? 'PDF' : 'Save'}</span>
                          </button>
                        </div>

                        {isBibtexOpen && (
                          <pre className="p-3 rounded-lg bg-[#06080d] light:bg-stone-100 font-mono text-[11px] text-slate-300 light:text-stone-800 overflow-x-auto">
                            {paper.bibtex}
                          </pre>
                        )}
                      </div>
                    </article>
                  );
                })}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW 3: MY ENROLLED & CERTIFICATIONS                     */}
            {/* ======================================================== */}
            {activeTab === 'my-learning' && (
              <div className="space-y-6">
                {!user ? (
                  <div className="p-10 rounded-xl bg-white/[0.02] text-center space-y-3 shadow-inner">
                    <p className="text-base font-bold text-white">Sign In to View Your Learning Transcript</p>
                    <p className="text-xs text-slate-400">Track your progress, watch required YouTube lectures, and claim certificates.</p>
                    <button
                      onClick={() => navigate('/learner/auth?redirect=/academy')}
                      className="px-5 py-2.5 rounded-lg bg-ai-cyan text-midnight-black text-xs font-bold hover:bg-white transition-colors"
                    >
                      Sign In or Register
                    </button>
                  </div>
                ) : enrolledCourseIds.length === 0 ? (
                  <div className="p-10 rounded-xl bg-white/[0.02] text-center space-y-3 shadow-inner">
                    <p className="text-base font-bold text-white">No Courses Enrolled</p>
                    <p className="text-xs text-slate-400">Select any of our 5 courses to begin learning for free.</p>
                    <button
                      onClick={() => setActiveTab('courses')}
                      className="px-5 py-2.5 rounded-lg bg-ai-cyan text-midnight-black text-xs font-bold hover:bg-white transition-colors"
                    >
                      Browse Courses
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {enrolledCourseIds.map(cId => {
                      const course = ACADEMY_COURSES.find(c => c.id === cId);
                      if (!course) return null;
                      const score = courseExamScores[course.id];
                      const hasPassed = score !== undefined && score >= 70;

                      return (
                        <div key={course.id} className="p-5 rounded-xl bg-[#0c1018] flex flex-col justify-between gap-4 shadow-sm">
                          <div>
                            <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                              <span className="text-ai-cyan font-bold">{course.code}</span>
                              <span className={hasPassed ? 'text-green-400 font-bold' : 'text-amber-400 font-bold'}>
                                {score !== undefined ? `Exam: ${score}%` : 'Exam pending'}
                              </span>
                            </div>
                            <h4 className="text-base font-bold text-white">{course.title}</h4>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/course/${course.id}`)}
                              className="flex-1 py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-ai-cyan" />
                              <span>Classroom</span>
                            </button>

                            {hasPassed ? (
                              <button
                                onClick={() => navigate(`/certificate/${course.id}`)}
                                className="px-3.5 py-2 rounded-lg bg-[#c5a059] text-midnight-black text-xs font-bold hover:bg-white transition-colors flex items-center gap-1"
                              >
                                <Award className="w-3.5 h-3.5" />
                                <span>Certificate</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  showToast('Pass final exam with 70%+ to unlock certificate.');
                                  navigate(`/course/${course.id}`);
                                }}
                                className="px-3 py-2 rounded-lg bg-white/5 text-xs text-slate-400 hover:text-white transition-colors"
                              >
                                <span>Exam Required (70%)</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
