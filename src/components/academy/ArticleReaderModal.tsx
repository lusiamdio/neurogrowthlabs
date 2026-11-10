import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResearchPaper } from '../../data/academyData';
import { 
  X, Download, ExternalLink, FileText, BookOpen, 
  Calendar, Award, Hash, Check, Copy, Share2, Eye
} from 'lucide-react';

interface ArticleReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  paper: ResearchPaper;
  onDownload: (paper: ResearchPaper) => void;
  isDownloaded?: boolean;
}

export default function ArticleReaderModal({
  isOpen,
  onClose,
  paper,
  onDownload,
  isDownloaded
}: ArticleReaderModalProps) {
  const [viewTab, setViewTab] = useState<'text' | 'pdf'>('text');
  const [copiedBibtex, setCopiedBibtex] = useState(false);

  if (!isOpen) return null;

  const handleCopyBibtex = () => {
    navigator.clipboard.writeText(paper.bibtex);
    setCopiedBibtex(true);
    setTimeout(() => setCopiedBibtex(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-5xl bg-[#0c1018] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-10 my-4 flex flex-col max-h-[94vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-[#090d15] border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#c5a059]/15 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059] shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span className="text-[#c5a059] font-bold">RESEARCH PAPER</span>
                  <span>·</span>
                  <span>{paper.category}</span>
                  {paper.readingTime && (
                    <>
                      <span>·</span>
                      <span className="text-ai-cyan">{paper.readingTime}</span>
                    </>
                  )}
                  <span>·</span>
                  <span>{paper.pages} Pages</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate max-w-xl">
                  {paper.title}
                </h2>
              </div>
            </div>

            {/* View Mode Switcher & Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {paper.pdfUrl && (
                <div className="flex items-center gap-1 p-1 bg-white/[0.04] rounded-lg border border-white/10 text-xs">
                  <button
                    onClick={() => setViewTab('text')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                      viewTab === 'text'
                        ? 'bg-ai-cyan text-midnight-black font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Formatted Article
                  </button>
                  <button
                    onClick={() => setViewTab('pdf')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                      viewTab === 'pdf'
                        ? 'bg-ai-cyan text-midnight-black font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Original PDF
                  </button>
                </div>
              )}

              <button
                onClick={() => onDownload(paper)}
                className="px-3.5 py-1.5 rounded-lg bg-[#c5a059] hover:bg-white text-midnight-black text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#080b11]">
            {viewTab === 'pdf' && paper.pdfUrl ? (
              <div className="h-[75vh] flex flex-col space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 bg-white/[0.02] p-2.5 rounded-lg border border-white/10">
                  <span className="font-mono">Viewing original document: {paper.pdfUrl}</span>
                  <a
                    href={paper.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-ai-cyan hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Open in Full Tab</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <iframe
                  src={paper.pdfUrl}
                  title={paper.title}
                  className="w-full flex-1 rounded-xl border border-white/15 bg-[#141b26]"
                />
              </div>
            ) : (
              <article className="max-w-4xl mx-auto space-y-8 text-slate-200">
                {/* Article Header Card */}
                <div className="p-6 sm:p-8 rounded-2xl bg-[#0c1018] border border-white/10 space-y-4">
                  <div className="text-xs font-mono uppercase tracking-widest text-[#c5a059]">
                    {paper.category} · {paper.publishDate}
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    {paper.title}
                  </h1>
                  <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed">
                    {paper.subtitle}
                  </p>

                  <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
                    <div className="space-y-1">
                      <span className="font-semibold text-white block">Authors & Affiliations:</span>
                      {paper.authors.map((a, i) => (
                        <div key={i} className="text-slate-300">
                          <strong>{a.name}</strong> — <span className="text-slate-400">{a.affiliation}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1 font-mono text-right">
                      <div>DOI: <span className="text-ai-cyan">{paper.doi}</span></div>
                      <div>Pages: <span className="text-white">{paper.pages}</span></div>
                      <div>Citations: <span className="text-[#c5a059]">{paper.citationCount}</span></div>
                    </div>
                  </div>
                </div>

                {/* IN BRIEF / EXECUTIVE SUMMARY */}
                <div className="p-6 rounded-xl bg-amber-500/[0.05] border-l-4 border-[#c5a059] space-y-2">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#c5a059]">
                    IN BRIEF / THE ARGUMENT
                  </div>
                  <p className="text-sm leading-relaxed text-slate-200">
                    {paper.executiveSummary}
                  </p>
                </div>

                {/* Full Article Text */}
                {paper.fullArticleText ? (
                  <div className="prose prose-invert max-w-none space-y-6 text-sm sm:text-base leading-relaxed text-slate-300">
                    {paper.fullArticleText.split('\n\n').map((paragraph, pIdx) => {
                      const trimmed = paragraph.trim();
                      if (!trimmed) return null;

                      // Check for Section Titles (All caps or numbered)
                      if (
                        (trimmed.length < 90 && trimmed === trimmed.toUpperCase() && !trimmed.startsWith('•')) ||
                        trimmed.startsWith('1. ') ||
                        trimmed.startsWith('2. ') ||
                        trimmed.startsWith('3. ') ||
                        trimmed.startsWith('4. ') ||
                        trimmed.startsWith('5. ')
                      ) {
                        return (
                          <h2
                            key={pIdx}
                            className="text-lg sm:text-xl font-bold text-white pt-6 pb-2 border-b border-white/10 tracking-tight"
                          >
                            {trimmed}
                          </h2>
                        );
                      }

                      // Check for bullet lists
                      if (trimmed.startsWith('•') || trimmed.startsWith('01') || trimmed.startsWith('02') || trimmed.startsWith('03') || trimmed.startsWith('04')) {
                        return (
                          <div
                            key={pIdx}
                            className="p-3.5 rounded-lg bg-white/[0.02] border border-white/5 text-sm space-y-1"
                          >
                            {trimmed.split('\n').map((line, lIdx) => (
                              <p key={lIdx} className="text-slate-300">{line}</p>
                            ))}
                          </div>
                        );
                      }

                      // Check for quote blocks
                      if (trimmed.startsWith('“') || trimmed.startsWith('"None of this is inevitable')) {
                        return (
                          <blockquote
                            key={pIdx}
                            className="my-6 p-4 rounded-xl bg-ai-cyan/10 border-l-4 border-ai-cyan text-white italic text-base sm:text-lg"
                          >
                            {trimmed}
                          </blockquote>
                        );
                      }

                      return (
                        <p key={pIdx} className="text-slate-300 leading-relaxed">
                          {trimmed}
                        </p>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-white mb-2">Abstract</h3>
                      <p className="text-sm leading-relaxed text-slate-300">{paper.abstract}</p>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white mb-2">Methodology</h3>
                      <p className="text-sm leading-relaxed text-slate-300">{paper.methodology}</p>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white mb-2">Key Findings</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-slate-300">
                        {paper.findings.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white mb-2">Policy Recommendations</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-slate-300">
                        {paper.policyRecommendations.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Citation BibTeX Card */}
                <div className="p-5 rounded-xl bg-[#090d15] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-slate-400 uppercase">
                      Cite This Paper (BibTeX)
                    </span>
                    <button
                      onClick={handleCopyBibtex}
                      className="text-xs text-ai-cyan hover:text-white flex items-center gap-1 font-mono transition-colors"
                    >
                      {copiedBibtex ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedBibtex ? 'Copied' : 'Copy Citation'}</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-lg bg-black/60 border border-white/5 font-mono text-xs text-slate-300 overflow-x-auto">
                    {paper.bibtex}
                  </pre>
                </div>
              </article>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
