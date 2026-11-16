import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/sections/Navbar';
import Footer from '../components/sections/Footer';
import OfficialCertificateCard from '../components/academy/OfficialCertificateCard';
import { useAuth } from '../components/AuthContext';
import { ACADEMY_COURSES } from '../data/academyData';
import { downloadCertificatePdf, type CertificateRenderData } from '../utils/certificatePdf';
import {
  Award,
  ArrowLeft,
  Check,
  Download,
  Edit3,
  Printer,
  Share2,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

function buildStableVerificationId(courseCode: string, email?: string, overrideCode?: string): string {
  if (overrideCode) return overrideCode;
  const seed = `${courseCode}:${(email || 'sample').toLowerCase()}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const suffix = String(100000 + (hash % 900000));
  return `NGL-CERT-${courseCode}-2026-${suffix}`;
}

export default function CertificateVerification() {
  const { courseId, code } = useParams<{ courseId?: string; code?: string }>();
  const navigate = useNavigate();
  const { user, updateDisplayName } = useAuth();

  const course = ACADEMY_COURSES.find((c) => c.id === courseId) || ACADEMY_COURSES[0];

  const registeredProfile = useMemo(() => {
    try {
      const savedSession = localStorage.getItem('ngl_learner_session');
      const sessionObj = savedSession ? JSON.parse(savedSession) : null;
      const emailKey = (user?.email || sessionObj?.email || '').trim().toLowerCase();
      const regStore = JSON.parse(localStorage.getItem('ngl_registered_learners') || '{}');
      const regEntry = emailKey ? regStore[emailKey] : null;
      return {
        name:
          user?.displayName ||
          sessionObj?.displayName ||
          regEntry?.displayName ||
          (emailKey ? emailKey.split('@')[0] : 'Tebogo Mokoena'),
        email: user?.email || sessionObj?.email || regEntry?.email || '',
        country: user?.country || sessionObj?.country || regEntry?.country || 'South Africa',
        registeredAt: user?.registeredAt || sessionObj?.registeredAt || regEntry?.registeredAt || '',
      };
    } catch {
      return {
        name: user?.displayName || user?.email?.split('@')[0] || 'Tebogo Mokoena',
        email: user?.email || '',
        country: user?.country || 'South Africa',
        registeredAt: user?.registeredAt || '',
      };
    }
  }, [user]);

  const [studentName, setStudentName] = useState(registeredProfile.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(registeredProfile.name);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync recipient name whenever registration / auth session updates
  useEffect(() => {
    setStudentName(registeredProfile.name);
    setNameInput(registeredProfile.name);
  }, [registeredProfile.name]);

  const examScore = useMemo<number | null>(() => {
    try {
      const stored = localStorage.getItem('ngl_course_exam_scores');
      if (stored) {
        const parsed = JSON.parse(stored);
        return typeof parsed[course.id] === 'number' ? parsed[course.id] : null;
      }
    } catch {}
    return null;
  }, [course.id]);

  const verificationId = useMemo(
    () => buildStableVerificationId(course.code, registeredProfile.email, code),
    [course.code, registeredProfile.email, code]
  );

  const issuedDate = useMemo(() => {
    try {
      const certKey = `${course.id}:${registeredProfile.email || 'sample'}`;
      const stored = JSON.parse(localStorage.getItem('ngl_certificate_dates') || '{}');
      if (stored[certKey]) return stored[certKey] as string;
      const formatted = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      stored[certKey] = formatted;
      localStorage.setItem('ngl_certificate_dates', JSON.stringify(stored));
      return formatted;
    } catch {
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  }, [course.id, registeredProfile.email]);

  const certificateData: CertificateRenderData = useMemo(
    () => ({
      verificationId,
      studentName,
      studentEmail: registeredProfile.email || undefined,
      studentCountry: registeredProfile.country || undefined,
      registeredDate: registeredProfile.registeredAt
        ? new Date(registeredProfile.registeredAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : undefined,
      courseCode: course.code,
      courseTitle: course.title,
      courseTrack: course.track,
      difficultyLevel: course.difficultyLevel,
      issuedDate,
      examScore,
    }),
    [verificationId, studentName, registeredProfile, course, issuedDate, examScore]
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      const clean = nameInput.trim();
      setStudentName(clean);
      updateDisplayName(clean);
      setIsEditingName(false);
      showToast('Recipient name updated on certificate.');
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/certificate/${course.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    showToast('Verification URL copied to clipboard.');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      await downloadCertificatePdf(certificateData);
      showToast('Official PDF certificate downloaded.');
    } catch (err) {
      console.warn('PDF export error:', err);
      showToast('Unable to export PDF directly; please try Print.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-200 flex flex-col justify-between selection:bg-ai-cyan selection:text-midnight-black">
      <style>{`
        @media print {
          @page { size: landscape; margin: 8mm; }
          body { background: #070a10 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print, nav, footer { display: none !important; }
          main { padding-top: 0 !important; padding-bottom: 0 !important; max-width: 100% !important; }
        }
      `}</style>

      <div className="no-print">
        <Navbar />
      </div>

      {/* Floating Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="no-print fixed top-24 z-50 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-lg bg-ai-cyan text-midnight-black font-semibold text-xs shadow-xl flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-16 w-full space-y-8">
        {/* Navigation Breadcrumbs & Back Link */}
        <div className="no-print flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Link to="/" className="hover:text-white transition-colors">
              NeuroGrowth Labs
            </Link>
            <span aria-hidden="true">/</span>
            <Link to="/academy" className="hover:text-white transition-colors">
              Academy
            </Link>
            <span aria-hidden="true">/</span>
            <Link to={`/course/${course.id}`} className="hover:text-white transition-colors">
              {course.code}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-ai-cyan font-semibold">Certificate</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/course/${course.id}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Classroom</span>
            </button>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="no-print bg-[#0c1018] rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c5a059]/15 text-[#c5a059] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Official Credential Verification</h2>
              <p className="text-xs text-slate-400 font-mono">ID: {verificationId}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsEditingName(true)}
              className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Name</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              {copiedLink ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="px-4 py-2 rounded-lg bg-[#c5a059] hover:bg-white text-midnight-black text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadingPdf ? 'Generating PDF...' : 'Download Official PDF'}</span>
            </button>
          </div>
        </div>

        {/* Edit Name Modal Banner */}
        {isEditingName && (
          <div className="no-print p-4 rounded-xl bg-white/[0.04] flex flex-col sm:flex-row items-center gap-3">
            <label className="text-xs text-slate-300 whitespace-nowrap">Edit Recipient Name:</label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="flex-1 bg-[#080b11] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-ai-cyan"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveName}
                className="px-3 py-1.5 rounded-lg bg-ai-cyan text-midnight-black text-xs font-bold hover:bg-white transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingName(false)}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Official Sample & Verified Certificate Canvas */}
        <OfficialCertificateCard data={certificateData} />

        {/* Verification Explanatory Card */}
        <div className="no-print bg-[#0c1018] rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-ai-cyan" />
            <span>How to Verify This Credential</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every certificate issued by the Sovereign Intelligence Academy reflects the legal scholar name, email, and primary jurisdiction captured during registration, paired with an immutable verification identifier. Institutions can audit this credential at{' '}
            <code className="text-ai-cyan font-mono">
              {window.location.origin}/certificate/{course.id}
            </code>
            .
          </p>
        </div>
      </main>

      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
}
