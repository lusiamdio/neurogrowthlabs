import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/sections/Navbar';
import Footer from '../components/sections/Footer';
import { useAuth } from '../components/AuthContext';
import { 
  getStoredEmailNotifications, EmailNotificationRecord, 
  sendCourseEnrollmentNotification, sendCertificateReadyNotification 
} from '../services/emailNotificationService';
import { ACADEMY_COURSES } from '../data/academyData';
import { 
  ArrowLeft, Mail, Bell, CheckCircle, Send, 
  Clock, Shield, Award, BookOpen, RotateCcw, Filter 
} from 'lucide-react';

export default function NotificationCenterPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<EmailNotificationRecord[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'enrollment' | 'certificate'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    setNotifications(getStoredEmailNotifications(user?.uid || user?.email));
    const handleSent = () => {
      setNotifications(getStoredEmailNotifications(user?.uid || user?.email));
    };
    window.addEventListener('ngl_email_sent', handleSent);
    return () => window.removeEventListener('ngl_email_sent', handleSent);
  }, [user]);

  const filtered = notifications.filter(n => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  const handleTestDispatch = async () => {
    if (!user) {
      showToast('Please sign in to test SendGrid email dispatch.');
      return;
    }
    const sampleCourse = ACADEMY_COURSES[0];
    await sendCourseEnrollmentNotification({ user, course: sampleCourse });
    showToast(`Dispatched test enrollment alert to ${user.email} via SendGrid!`);
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-200 flex flex-col justify-between selection:bg-ai-cyan selection:text-midnight-black">
      <Navbar />

      {/* Toast */}
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

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-16 w-full space-y-8">
        
        {/* Navigation Breadcrumbs & Back Link */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Link to="/" className="hover:text-white transition-colors">NeuroGrowth Labs</Link>
            <span aria-hidden="true">/</span>
            <Link to="/academy" className="hover:text-white transition-colors">Academy</Link>
            <span aria-hidden="true">/</span>
            <span className="text-ai-cyan font-semibold">Transactional Notifications</span>
          </div>

          <button
            onClick={() => navigate('/academy')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Academy</span>
          </button>
        </div>

        {/* Header Banner */}
        <div className="bg-[#0c1018] rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-ai-cyan">
              <Mail className="w-4 h-4" />
              <span>SENDGRID TRANSACTIONAL INFRASTRUCTURE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Email Dispatch & Notification Logs
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Auditable activity logs for automated course enrollment confirmations, student credentials, and capstone certificate delivery.
            </p>
          </div>

          <button
            onClick={handleTestDispatch}
            className="px-4 py-2.5 rounded-xl bg-ai-cyan hover:bg-white text-midnight-black text-xs font-bold transition-colors flex items-center justify-center gap-2 shrink-0 shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispatch Test Email</span>
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-[#0c1018] shadow-md space-y-1">
            <span className="text-xs font-mono text-slate-400">Total Dispatched</span>
            <p className="text-2xl font-bold font-mono text-white">{notifications.length}</p>
          </div>
          <div className="p-5 rounded-xl bg-[#0c1018] shadow-md space-y-1">
            <span className="text-xs font-mono text-slate-400">Enrollment Alerts</span>
            <p className="text-2xl font-bold font-mono text-ai-cyan">
              {notifications.filter(n => n.type === 'enrollment').length}
            </p>
          </div>
          <div className="p-5 rounded-xl bg-[#0c1018] shadow-md space-y-1">
            <span className="text-xs font-mono text-slate-400">Certificate Alerts</span>
            <p className="text-2xl font-bold font-mono text-[#c5a059]">
              {notifications.filter(n => n.type === 'certificate').length}
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 p-1 bg-white/[0.03] rounded-lg w-fit">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              filterType === 'all' ? 'bg-ai-cyan text-midnight-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Logs ({notifications.length})
          </button>
          <button
            onClick={() => setFilterType('enrollment')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              filterType === 'enrollment' ? 'bg-ai-cyan text-midnight-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Enrollments ({notifications.filter(n => n.type === 'enrollment').length})
          </button>
          <button
            onClick={() => setFilterType('certificate')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              filterType === 'certificate' ? 'bg-ai-cyan text-midnight-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Certificates ({notifications.filter(n => n.type === 'certificate').length})
          </button>
        </div>

        {/* Notifications Feed */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#0c1018] text-center space-y-3">
              <Mail className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-base font-bold text-white">No Email Notifications Dispatched Yet</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Whenever you enroll in an accredited course or pass the capstone exam, an official SendGrid transactional email alert is sent to your email and recorded here.
              </p>
            </div>
          ) : (
            filtered.map(item => (
              <div key={item.id} className="p-5 rounded-xl bg-[#0c1018] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    item.type === 'certificate' ? 'bg-[#c5a059]/15 text-[#c5a059]' : 'bg-ai-cyan/15 text-ai-cyan'
                  }`}>
                    {item.type === 'certificate' ? <Award className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="font-bold text-white uppercase">{item.type}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-green-400 font-semibold">{item.status.toUpperCase()}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-500">{item.provider}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{item.subject}</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Recipient: {item.userEmail} {item.courseCode ? `· Track: ${item.courseCode}` : ''}
                    </p>
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-500 sm:text-right shrink-0">
                  {new Date(item.sentAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
