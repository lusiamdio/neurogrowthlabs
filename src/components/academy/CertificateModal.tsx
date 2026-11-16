import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Download, Printer, Check, Copy } from 'lucide-react';
import OfficialCertificateCard from './OfficialCertificateCard';
import { downloadCertificatePdf, type CertificateRenderData } from '../../utils/certificatePdf';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateData: {
    certificateId: string;
    studentName: string;
    studentEmail: string;
    studentCountry?: string;
    courseCode: string;
    courseTitle: string;
    courseTrack?: string;
    difficultyLevel?: string;
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
  onUpdateName,
}: CertificateModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [customName, setCustomName] = useState(certificateData.studentName);

  useEffect(() => {
    setCustomName(certificateData.studentName);
  }, [certificateData.studentName]);

  if (!isOpen) return null;

  const renderData: CertificateRenderData = {
    verificationId: certificateData.certificateId,
    studentName: customName || certificateData.studentName,
    studentEmail: certificateData.studentEmail || undefined,
    studentCountry: certificateData.studentCountry || undefined,
    courseCode: certificateData.courseCode,
    courseTitle: certificateData.courseTitle,
    courseTrack: certificateData.courseTrack || 'Sovereign AI & Cybersecurity',
    difficultyLevel: certificateData.difficultyLevel || 'Accredited',
    issuedDate: certificateData.issuedDate,
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/academy#verify=${certificateData.certificateId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      if (onUpdateName && customName.trim()) {
        onUpdateName(customName.trim());
      }
      await downloadCertificatePdf(renderData);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-midnight-black/90 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-midnight-black border border-glass-border rounded-3xl shadow-[0_0_60px_rgba(0,229,255,0.25)] overflow-hidden z-10 my-6"
        >
          <div className="p-4 sm:p-6 bg-white/[0.02] border-b border-glass-border flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-ai-cyan/10 border border-ai-cyan/30 flex items-center justify-center text-ai-cyan">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Official Certificate of Completion</span>
                </h3>
                <p className="text-xs text-quantum-silver">
                  Official credential issued by Neurogrowth Labs Sovereign Intelligence Academy
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="px-3.5 py-1.5 rounded-xl bg-[#c5a059] text-midnight-black hover:bg-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-60"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloadingPdf ? 'Generating PDF...' : 'Download Official PDF'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-glass-border text-xs font-medium text-white flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-ai-cyan" />
                <span>Print</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-glass-border text-xs font-medium text-white flex items-center gap-1.5 transition-colors"
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

          <div className="p-4 sm:p-8 overflow-x-auto">
            <OfficialCertificateCard data={renderData} id="certificate-modal-print-area" />
          </div>

          <div className="p-4 bg-white/[0.02] border-t border-glass-border text-center text-xs text-quantum-silver">
            Permanent credential recorded with your registration name, email, and primary jurisdiction.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
