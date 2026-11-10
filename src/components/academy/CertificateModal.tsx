import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Award, Download, Printer, Share2, Check, Copy, 
  ShieldCheck, Hexagon, Calendar, Hash, ExternalLink, Sparkles, Edit3
} from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateData: {
    certificateId: string;
    studentName: string;
    studentEmail: string;
    courseCode: string;
    courseTitle: string;
    issuedDate: string;
    verificationHash: string;
    grade?: string;
  };
  onUpdateName?: (newName: string) => void;
}

export default function CertificateModal({
  isOpen,
  onClose,
  certificateData,
  onUpdateName
}: CertificateModalProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [customName, setCustomName] = useState(certificateData.studentName);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/academy#verify=${certificateData.certificateId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadCertificate = () => {
    const student = customName || certificateData.studentName;
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Certificate of Completion - ${student} - ${certificateData.courseCode}</title>
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
    .sigs { display: flex; justify-content: space-around; margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; font-family: sans-serif; }
    .meta { font-family: monospace; font-size: 11px; color: #94a3b8; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="frame">
    <div class="inner">
      <div style="font-family: monospace; color: #c5a059; letter-spacing: 3px; font-size: 13px;">NEUROGROWTH LABS · SOVEREIGN ACADEMY</div>
      <h1>Certificate of Completion</h1>
      <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 12px; color: #00e5ff;">ADVANCED CYBERSECURITY & ARTIFICIAL INTELLIGENCE MASTERY</p>
      <p style="margin-top: 30px;">This accredited sovereign credential is proud to certify that</p>
      <h2>${student}</h2>
      <p>has demonstrated rigorous technical proficiency, completed all core modules, watched all required masterclasses, and passed the comprehensive capstone assessment with honours for</p>
      <h3>${certificateData.courseCode}: ${certificateData.courseTitle}</h3>
      <div class="seal">OFFICIAL SEAL<br>ACCREDITED</div>
      <div class="sigs">
        <div>
          <div style="font-style: italic; font-size: 20px; color: #00e5ff;">L. S. Simao</div>
          <strong>Mr. Lusimanadio Soki Simao, MBA</strong><br>
          <span style="font-size: 12px; color: #94a3b8;">Founder & Chief AI Strategist</span>
        </div>
        <div>
          <div style="font-style: italic; font-size: 20px; color: #fff;">Academic Review Board</div>
          <strong>Cyber-Physical Intelligence Directorate</strong><br>
          <span style="font-size: 12px; color: #94a3b8;">Curriculum Governance Board</span>
        </div>
      </div>
      <div class="meta">
        Certificate ID: ${certificateData.certificateId} · Issued: ${certificateData.issuedDate} · Verification Hash: ${certificateData.verificationHash}
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `Certificate-${certificateData.courseCode.replace(/[^a-zA-Z0-9]/g, '_')}-${student.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveName = () => {
    setIsEditingName(false);
    if (onUpdateName && customName.trim()) {
      onUpdateName(customName.trim());
    }
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
          className="fixed inset-0 bg-midnight-black/90 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-midnight-black border border-glass-border rounded-3xl shadow-[0_0_60px_rgba(0,229,255,0.25)] overflow-hidden z-10 my-6"
        >
          {/* Top Actions Bar */}
          <div className="p-4 sm:p-6 bg-white/[0.02] border-b border-glass-border flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-ai-cyan/10 border border-ai-cyan/30 flex items-center justify-center text-ai-cyan">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Autogenerated Certificate of Completion</span>
                  <span className="text-xs font-mono font-normal text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/30">
                    Verified
                  </span>
                </h3>
                <p className="text-xs text-quantum-silver">
                  Official credential issued by Neurogrowth Labs Sovereign Intelligence Academy
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadCertificate}
                className="px-3.5 py-1.5 rounded-xl bg-ai-cyan text-midnight-black hover:bg-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                title="Download Official Certificate Document"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Certificate</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-glass-border text-xs font-medium text-white flex items-center gap-1.5 transition-colors"
                title="Print or Save as PDF"
              >
                <Printer className="w-3.5 h-3.5 text-ai-cyan" />
                <span>Print / PDF</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-glass-border text-xs font-medium text-white flex items-center gap-1.5 transition-colors"
                title="Copy public verification link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-ai-cyan" />}
                <span>{copied ? 'Copied Link!' : 'Copy Verification'}</span>
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/5 border border-glass-border flex items-center justify-center text-quantum-silver hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Certificate Body (Printable Target) */}
          <div className="p-4 sm:p-8 overflow-x-auto">
            <div 
              ref={certificateRef}
              id="certificate-print-area"
              className="relative min-w-[700px] bg-[#0c101a] border-4 border-[#c5a059] p-8 sm:p-12 rounded-2xl shadow-2xl overflow-hidden text-center"
              style={{
                backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(20, 30, 48, 0.6) 0%, rgba(12, 16, 26, 1) 100%)'
              }}
            >
              {/* Inner Ornamental Border */}
              <div className="absolute inset-2 sm:inset-3 border border-[#c5a059]/40 pointer-events-none rounded-xl" />
              <div className="absolute inset-4 sm:inset-5 border-2 border-[#00e5ff]/30 pointer-events-none rounded-lg" />

              {/* Watermark Crest */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none">
                <Hexagon className="w-96 h-96 text-white stroke-[1]" />
              </div>

              {/* Certificate Header */}
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Hexagon className="w-8 h-8 text-[#00e5ff]" />
                  <span className="text-sm font-mono tracking-[0.25em] text-[#c5a059] uppercase font-bold">
                    NEUROGROWTH LABS • ACADEMY
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-serif tracking-wider text-white uppercase font-bold mt-2">
                  Certificate of Completion
                </h1>
                
                <p className="text-xs font-mono tracking-[0.3em] text-[#00e5ff] uppercase mt-1">
                  ADVANCED CYBERSECURITY & ARTIFICIAL INTELLIGENCE MASTERY
                </p>

                <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent mx-auto my-6" />

                <p className="text-xs uppercase tracking-widest text-quantum-silver font-sans">
                  This accredited sovereign credential is proud to certify that
                </p>

                {/* Recipient Name with interactive rename feature */}
                <div className="my-4 flex items-center justify-center gap-2">
                  {isEditingName ? (
                    <div className="flex items-center gap-2 max-w-md">
                      <input 
                        type="text" 
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="bg-white/10 border border-[#00e5ff] text-xl font-serif text-white px-3 py-1 rounded text-center focus:outline-none"
                        autoFocus
                      />
                      <button 
                        onClick={handleSaveName}
                        className="px-2 py-1 bg-[#00e5ff] text-black text-xs font-bold rounded"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="group inline-flex items-center gap-2 cursor-pointer" onClick={() => setIsEditingName(true)}>
                      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide border-b-2 border-[#c5a059]/40 pb-1 px-4">
                        {customName || certificateData.studentName}
                      </h2>
                      <span title="Click to format name">
                        <Edit3 className="w-4 h-4 text-quantum-silver opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-quantum-silver max-w-xl mx-auto leading-relaxed">
                  has demonstrated rigorous technical proficiency, completed all core theoretical modules, hands-on architectural labs, and passed the comprehensive capstone assessment for
                </p>

                {/* Course Name */}
                <div className="my-4 py-2 px-6 bg-[#00e5ff]/5 border border-[#00e5ff]/20 rounded-xl inline-block max-w-2xl">
                  <span className="text-[11px] font-mono font-bold text-[#00e5ff] uppercase tracking-wider block">
                    {certificateData.courseCode}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
                    {certificateData.courseTitle}
                  </h3>
                </div>

                {/* Honors & Validation */}
                <div className="flex items-center justify-center gap-6 my-4 text-xs font-mono text-quantum-silver">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Status: <strong className="text-white">Graduated with Distinction</strong>
                  </span>
                  <span>•</span>
                  <span>Tuition: <strong className="text-green-400">100% Sponsored (Free)</strong></span>
                  <span>•</span>
                  <span>Credit: <strong className="text-white">Professional CPD Units</strong></span>
                </div>

                {/* Signatures & Seal Grid */}
                <div className="grid grid-cols-3 items-end gap-6 mt-8 pt-6 border-t border-glass-border/40">
                  {/* Founder Signature */}
                  <div className="text-center">
                    <div className="h-10 flex items-center justify-center">
                      <span className="font-serif italic text-lg sm:text-xl text-[#00e5ff] font-bold tracking-wider">
                        L. S. Simao
                      </span>
                    </div>
                    <div className="w-36 h-0.5 bg-[#c5a059]/60 mx-auto my-1" />
                    <p className="text-xs font-bold text-white">Mr. Lusimanadio Soki Simao, MBA</p>
                    <p className="text-[10px] text-quantum-silver font-mono">Founder & Chief AI Strategist</p>
                    <p className="text-[9px] text-quantum-silver/70">Neurogrowth Labs</p>
                  </div>

                  {/* Holographic Official Seal */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-2 border-[#c5a059] bg-gradient-to-br from-[#c5a059]/20 via-[#00e5ff]/10 to-[#c5a059]/30 flex flex-col items-center justify-center p-1.5 shadow-[0_0_20px_rgba(197,160,89,0.3)] relative">
                      <div className="w-16 h-16 rounded-full border border-dashed border-[#c5a059] flex flex-col items-center justify-center text-center">
                        <ShieldCheck className="w-5 h-5 text-[#c5a059] mb-0.5" />
                        <span className="text-[7px] font-mono font-bold text-[#00e5ff] uppercase leading-tight tracking-tighter">
                          OFFICIAL SEAL
                        </span>
                        <span className="text-[6px] font-mono text-white/80">ACCREDITED</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-[#c5a059] uppercase tracking-widest mt-2">
                      CAPE TOWN, ZA
                    </span>
                  </div>

                  {/* Academic Board */}
                  <div className="text-center">
                    <div className="h-10 flex items-center justify-center">
                      <span className="font-serif italic text-base sm:text-lg text-white/90">
                        Academic Review Board
                      </span>
                    </div>
                    <div className="w-36 h-0.5 bg-[#c5a059]/60 mx-auto my-1" />
                    <p className="text-xs font-bold text-white">Cyber-Physical Intelligence Directorate</p>
                    <p className="text-[10px] text-quantum-silver font-mono">Curriculum Governance Board</p>
                    <p className="text-[9px] text-quantum-silver/70">Pan-African AI Consortium</p>
                  </div>
                </div>

                {/* Cryptographic Footprint */}
                <div className="mt-8 pt-4 border-t border-glass-border/30 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-quantum-silver/70 gap-2">
                  <div className="flex items-center gap-2">
                    <Hash className="w-3 h-3 text-[#00e5ff]" />
                    <span>Certificate ID: <strong className="text-white">{certificateData.certificateId}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-[#c5a059]" />
                    <span>Issue Date: <strong className="text-white">{certificateData.issuedDate}</strong></span>
                  </div>
                  <div>
                    <span>Hash: <strong className="text-white">{certificateData.verificationHash.slice(0, 16)}...</strong></span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Bottom Footer Note */}
          <div className="p-4 bg-white/[0.02] border-t border-glass-border text-center text-xs text-quantum-silver">
            <span className="text-ai-cyan">✓ Permanent Credential:</span> This certificate is cryptographically stored in Neurogrowth Labs' verified ledger. You can link it on your LinkedIn profile, CV, or institutional portfolio.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
