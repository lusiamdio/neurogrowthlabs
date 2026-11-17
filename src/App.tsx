/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Landing from './pages/Landing';
import Portal from './pages/Portal';
import About from './pages/About';
import Partner from './pages/Partner';
import Careers from './pages/Careers';
import Contact from './pages/Contact';
import Webinar from './pages/Webinar';
import Academy from './pages/Academy';
import AdminDashboard from './pages/AdminDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AIEthics from './pages/AIEthics';
import CookiePolicy from './pages/CookiePolicy';
import DPA from './pages/DPA';
import SecurityPolicy from './pages/SecurityPolicy';
import { AuthProvider } from './components/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './components/ThemeContext';
import TebogoChatbot from './components/ui/TebogoChatbot';
import SEO from './components/SEO';

import CourseClassroom from './pages/CourseClassroom';
import ResearchArticle from './pages/ResearchArticle';
import CertificateVerification from './pages/CertificateVerification';
import CourseReviewsPage from './pages/CourseReviewsPage';
import LearnerAuth from './pages/LearnerAuth';
import NotificationCenterPage from './pages/NotificationCenterPage';
import Navbar from './components/sections/Navbar';
import Footer from './components/sections/Footer';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const targetId = hash.replace('#', '');
      const timer = setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 120);
      return () => clearTimeout(timer);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-midnight-black light:bg-white text-slate-300 flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-32 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ai-cyan/10 border border-ai-cyan/25 text-ai-cyan text-xs font-mono uppercase tracking-widest mb-6">
          404 · Route Not Found
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4">
          Endpoint Outside Ecosystem
        </h1>
        <p className="text-sm md:text-base text-quantum-silver max-w-md mb-8 leading-relaxed">
          The page you requested does not exist or has been relocated within the NeuroGrowth Labs platform.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-electric-blue text-white font-semibold text-sm hover:bg-blue-600 transition-colors"
          >
            Return to Home
          </Link>
          <Link
            to="/academy"
            className="px-6 py-3 rounded-xl bg-white/5 border border-glass-border text-white font-medium text-sm hover:bg-white/10 transition-colors"
          >
            Explore Academy
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-midnight-black light:bg-white"
    >
      {children}
    </motion.div>
  );
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/portal" element={<PageTransition><Portal /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/partner" element={<PageTransition><Partner /></PageTransition>} />
        <Route path="/careers" element={<PageTransition><Careers /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/webinar" element={<PageTransition><Webinar /></PageTransition>} />
        <Route path="/academy" element={<PageTransition><Academy /></PageTransition>} />
        <Route path="/courses" element={<PageTransition><Academy /></PageTransition>} />
        <Route path="/research" element={<PageTransition><Academy /></PageTransition>} />

        {/* Dedicated Complete Webpages (Transformed from Modals) */}
        <Route path="/course/:courseId" element={<PageTransition><CourseClassroom /></PageTransition>} />
        <Route path="/academy/course/:courseId" element={<PageTransition><CourseClassroom /></PageTransition>} />
        <Route path="/research/:paperId" element={<PageTransition><ResearchArticle /></PageTransition>} />
        <Route path="/academy/research/:paperId" element={<PageTransition><ResearchArticle /></PageTransition>} />
        <Route path="/certificate/:courseId" element={<PageTransition><CertificateVerification /></PageTransition>} />
        <Route path="/academy/certificate/:courseId" element={<PageTransition><CertificateVerification /></PageTransition>} />
        <Route path="/verify/:code" element={<PageTransition><CertificateVerification /></PageTransition>} />
        <Route path="/reviews/:courseId" element={<PageTransition><CourseReviewsPage /></PageTransition>} />
        <Route path="/academy/reviews/:courseId" element={<PageTransition><CourseReviewsPage /></PageTransition>} />
        <Route path="/learner/auth" element={<PageTransition><LearnerAuth /></PageTransition>} />
        <Route path="/academy/auth" element={<PageTransition><LearnerAuth /></PageTransition>} />
        <Route path="/academy/notifications" element={<PageTransition><NotificationCenterPage /></PageTransition>} />

        <Route path="/admin/recruitment" element={<PageTransition><AdminDashboard /></PageTransition>} />
        <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/terms-of-service" element={<PageTransition><TermsOfService /></PageTransition>} />
        <Route path="/ai-ethics" element={<PageTransition><AIEthics /></PageTransition>} />
        <Route path="/cookie-policy" element={<PageTransition><CookiePolicy /></PageTransition>} />
        <Route path="/dpa" element={<PageTransition><DPA /></PageTransition>} />
        <Route path="/security-policy" element={<PageTransition><SecurityPolicy /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <SEO />
            <AnimatedRoutes />
            <TebogoChatbot />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
