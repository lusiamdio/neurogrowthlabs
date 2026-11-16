import React from 'react';
import { Hexagon, ShieldCheck, Sparkles } from 'lucide-react';
import type { CertificateRenderData } from '../../utils/certificatePdf';

interface OfficialCertificateCardProps {
  data: CertificateRenderData;
  id?: string;
}

export default function OfficialCertificateCard({
  data,
  id = 'certificate-print-area',
}: OfficialCertificateCardProps) {
  const regDetails: string[] = [];
  if (data.studentEmail) regDetails.push(data.studentEmail);
  if (data.studentCountry) regDetails.push(`Jurisdiction: ${data.studentCountry}`);

  return (
    <div
      id={id}
      className="relative bg-gradient-to-b from-[#111726] via-[#0c101b] to-[#070a10] rounded-3xl p-8 sm:p-14 shadow-2xl overflow-hidden text-center space-y-6 print:rounded-none print:shadow-none"
      style={{
        boxShadow: 'inset 0 0 0 1px rgba(197, 160, 89, 0.28)',
      }}
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

      {/* Recipient Name & Registration Identity */}
      <div className="pt-4 pb-2 relative z-10">
        <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">
          This is to formally certify that
        </p>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-ai-cyan font-serif my-3 tracking-wide">
          {data.studentName}
        </h2>
        {regDetails.length > 0 && (
          <p className="text-xs font-mono text-slate-300 mb-3">
            {regDetails.join(' · ')}
          </p>
        )}
        <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent mx-auto" />
      </div>

      {/* Course Details */}
      <div className="space-y-2 max-w-2xl mx-auto relative z-10">
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          has completed all lecture masterclasses, verified practical laboratories, and attained passing capstone marks in:
        </p>
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {data.courseCode}: {data.courseTitle}
        </h3>
        <p className="text-xs text-slate-400 font-mono">
          Track: {data.courseTrack} · Operational Level: {data.difficultyLevel}
          {typeof data.examScore === 'number' && data.examScore >= 70
            ? ` · Capstone Score: ${data.examScore}%`
            : ''}
        </p>
      </div>

      {/* Insignia & Verification Code */}
      <div
        className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10"
        style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}
      >
        <div className="text-center sm:text-left space-y-1">
          <p className="text-xs text-white font-bold font-mono">Academic Directorate</p>
          <p className="text-[11px] text-slate-400 font-mono">Cape Town & Luanda Research Centers</p>
          <p className="text-[11px] text-slate-500 font-mono">Issued: {data.issuedDate}</p>
        </div>

        {/* Gold Seal Insignia */}
        <div className="w-20 h-20 rounded-full bg-[#c5a059]/10 border-2 border-[#c5a059] flex flex-col items-center justify-center text-[#c5a059] p-2 shadow-lg">
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold uppercase font-mono tracking-wider leading-none text-center">
            Verified Mastery
          </span>
        </div>

        <div className="text-center sm:text-right space-y-1">
          <p className="text-xs text-white font-bold font-mono">Cryptographic Verification</p>
          <p className="text-[11px] text-ai-cyan font-mono">{data.verificationId}</p>
          <p className="text-[10px] text-slate-500 font-mono">Status: Formally Accredited ✓</p>
        </div>
      </div>
    </div>
  );
}
