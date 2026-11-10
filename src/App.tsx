/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-midnight-black dark:bg-midnight-black light:bg-white"
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
        <Route path="/admin/recruitment" element={<PageTransition><AdminDashboard /></PageTransition>} />
        <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/terms-of-service" element={<PageTransition><TermsOfService /></PageTransition>} />
        <Route path="/ai-ethics" element={<PageTransition><AIEthics /></PageTransition>} />
        <Route path="/cookie-policy" element={<PageTransition><CookiePolicy /></PageTransition>} />
        <Route path="/dpa" element={<PageTransition><DPA /></PageTransition>} />
        <Route path="/security-policy" element={<PageTransition><SecurityPolicy /></PageTransition>} />
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
            <SEO />
            <AnimatedRoutes />
            <TebogoChatbot />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
