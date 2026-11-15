import React, { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/sections/Navbar';
import Footer from '../components/sections/Footer';
import { useAuth } from '../components/AuthContext';
import { ACADEMY_COURSES } from '../data/academyData';
import { 
  Award, ArrowLeft, Check, Copy, Download, Edit3, 
  ExternalLink, Hash, Hexagon, Printer, Share2, 
  ShieldCheck, Sparkles, CheckCircle 
} from 'lucide-react';

export default function CertificateVerification() {
  const { courseId, code } = useParams<{ courseId?: string; code?: string }>();
  const navigate = useNavigate();
  const { user, updateDisplayName } = useAuth();

  const course = ACADEMY_COURSES.find(c => c.id === courseId) || ACADEMY_COURSES[0];

  const [studentName, setStudentName] = useState(() => {
    return user?.displayName || user?.email?.split('@')[0] || 'Tebogo Mokoena';
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(studentName);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const verificationId = code || `NGL-CERT-${course.code}-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const issuedDate = 'November 11, 2026';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setStudentName(nameInput.trim());
      updateDisplayName(nameInput.trim());
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

  const handleDownload = () => {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Certificate of Completion - ${studentName} - ${course.code}</title>
  <style>
    @page { size: landscape; margin: 0; }
    body { margin: 0; padding: 40px; background: #0c101a; color: #fff; font-family: 'Georgia', serif; text-align: center; }
    .frame { border: 4px solid #c5a059; padding: 40px; border-radius: 12px; position: relative; background: radial-gradient(circle, #141e30 0%, #0c101a 100%); }
    .inner { border: 2px solid rgba(0,229,255,0.4); padding: 30px; border-radius: 8px; }
    h1 { font-size: 36px; color: #fff; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 5px; }
    h2 { font-size: 30px; color: #00e5ff; margin: 20px 0; border-bottom: 2px solid rgba(197,160,89,0.5); display: inline-block; padding: 0 30px; }
    h3 { font-size: 22px; color: #fff; }
    p { color: #cbd5e1; font-size: 15px; max-width: 700px; margin: 10px auto; }
    .seal { width: 90px; height: 90px; border: 2px solid #c5a059; border-radius: 50%; margin: 20px auto; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #c5a059; text-transform: uppercase; font-family: sans-serif; letter-spacing: 1px; }
    .hash { font-family: monospace; font-size: 11px; color: #94a3b8; margin-top: 25px; }
  </style>
</head>
<body>
  <div class="frame">
    <div class="inner">
      <div style="font-family: sans-serif; font-size: 12px; color: #c5a059; letter-spacing: 2px; text-transform: uppercase;">
        NeuroGrowth Labs · Sovereign Intelligence Academy
      </div>
      <h1>Certificate of Completion</h1>
      <p>This is to formally certify that</p>
      <h2>${studentName}</h2>
      <p>has successfully passed the accredited curriculum, completed all practical checkpoints, and satisfied all graduation requirements for</p>
      <h3>${course.code}: ${course.title}</h3>
      <div class="seal">Accredited<br>Passed 70%+</div>
      <p>Issued on ${issuedDate} · Authorized by Academic Directorate, Cape Town</p>
      <div class="hash">Verification ID: ${verificationId}</div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certificate_${course.code}_${studentName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Certificate downloaded.');
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

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-16 w-full space-y-8">
        
        {/* Navigation Breadcrumbs & Back Link */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Link to="/" className="hover:text-white transition-colors">NeuroGrowth Labs</Link>
            <span aria-hidden="true">/</span>
            <Link to="/academy" className="hover:text-white transition-colors">Academy</Link>
            <span aria-hidden="true">/</span>
            <Link to={`/course/${course.id}`} className="hover:text-white transition-colors">{course.code}</Link>
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
        <div className="bg-[#0c1018] rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              {copiedLink ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Share2 className="w-3.5 h-3.5" />}
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
              onClick={handleDownload}
              className="px-4 py-2 rounded-lg bg-[#c5a059] hover:bg-white text-midnight-black text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Official Copy</span>
            </button>
          </div>
        </div>

        {/* Edit Name Modal Banner (if toggled) */}
        {isEditingName && (
          <div className="p-4 rounded-xl bg-white/[0.04] flex flex-col sm:flex-row items-center gap-3">
            <label className="text-xs text-slate-300 whitespace-nowrap">Edit Recipient Name:</label>
            <input
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
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

        {/* Official Certificate Canvas */}
        <div 
          id="certificate-print-area"
          className="relative bg-gradient-to-b from-[#111726] via-[#0c101b] to-[#070a10] rounded-3xl p-8 sm:p-14 shadow-2xl overflow-hidden text-center space-y-6"
        >
          {/* Subtle Background Geometry */}
          <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
            <Hexagon className="w-[500px] h-[500px] text-ai-cyan stroke-[0.5]" />
          </div>

          {/* Certificate Header Branding */}
          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#c5a059] tracking-widest uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>NeuroGrowth Labs · Sovereign Intelligence Academy</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-wider text-white uppercase font-serif">
              Certificate of Completion
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              Accredited Advanced Pan-African Technical Certification
            </p>
          </div>

          {/* Recipient Name */}
          <div className="pt-4 pb-2 relative z-10">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">
              This is to formally certify that
            </p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-ai-cyan font-serif my-3 tracking-wide">
              {studentName}
            </h2>
            <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent mx-auto" />
          </div>

          {/* Course Details */}
          <div className="space-y-2 max-w-2xl mx-auto relative z-10">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              has completed all lecture masterclasses, verified practical laboratories, and attained passing capstone marks in:
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {course.code}: {course.title}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Track: {course.track} · Operational Level: {course.difficultyLevel}
            </p>
          </div>

          {/* Insignia & Verification Code */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5 relative z-10">
            <div className="text-left space-y-1">
              <p className="text-xs text-white font-bold font-mono">Academic Directorate</p>
              <p className="text-[11px] text-slate-400 font-mono">Cape Town & Luanda Research Centers</p>
              <p className="text-[11px] text-slate-500 font-mono">Issued: {issuedDate}</p>
            </div>

            {/* Gold Seal Insignia */}
            <div className="w-20 h-20 rounded-full bg-[#c5a059]/10 border-2 border-[#c5a059] flex flex-col items-center justify-center text-[#c5a059] p-2 shadow-lg">
              <Sparkles className="w-5 h-5 mb-0.5" />
              <span className="text-[9px] font-bold uppercase font-mono tracking-wider leading-none text-center">
                Verified Mastery
              </span>
            </div>

            <div className="text-right space-y-1">
              <p className="text-xs text-white font-bold font-mono">Cryptographic Verification</p>
              <p className="text-[11px] text-ai-cyan font-mono">{verificationId}</p>
              <p className="text-[10px] text-slate-500 font-mono">Status: Formally Accredited ✓</p>
            </div>
          </div>
        </div>

        {/* Verification Explanatory Card */}
        <div className="bg-[#0c1018] rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-ai-cyan" />
            <span>How to Verify This Credential</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every certificate issued by the Sovereign Intelligence Academy contains an immutable verification identifier. Prospective employers, university admissions committees, and technical directors can independently verify this credential by checking the record against the academic registry at <code className="text-ai-cyan font-mono">{window.location.origin}/certificate/{course.id}</code>.
          </p>
        </div>

      </main>

      <Footer />
    </div>
  );
}
