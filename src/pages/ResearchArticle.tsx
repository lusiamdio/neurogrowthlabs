import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/sections/Navbar';
import Footer from '../components/sections/Footer';
import { useAuth } from '../components/AuthContext';
import { RESEARCH_PAPERS } from '../data/academyData';
import { downloadAcademicPaper } from '../utils/paperDownloadHelper';
import { tryParseTableBlock } from '../utils/tableParser';
import ResearchTableView from '../components/ResearchTableView';
import ResearchTablesPanel from '../components/ResearchTablesPanel';
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Share2,
  Table2,
} from 'lucide-react';

interface TocHeading {
  id: string;
  label: string;
}

export default function ResearchArticle() {
  const { paperId } = useParams<{ paperId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const paper = RESEARCH_PAPERS.find((p) => p.id === paperId) || RESEARCH_PAPERS[0];

  const initialTabParam = searchParams.get('tab');
  const [viewTab, setViewTab] = useState<'text' | 'tables' | 'pdf'>(() => {
    if (initialTabParam === 'tables') return 'tables';
    if (initialTabParam === 'pdf' && paper.pdfUrl) return 'pdf';
    return 'text';
  });

  const [copiedBibtex, setCopiedBibtex] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [tablesBadgeCount, setTablesBadgeCount] = useState<number | null>(null);

  // Sync tab with paper changes & query param
  useEffect(() => {
    const t = searchParams.get('tab');
    if (t === 'tables') setViewTab('tables');
    else if (t === 'pdf' && paper.pdfUrl) setViewTab('pdf');
    else setViewTab('text');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [paper.id, paper.pdfUrl, searchParams]);

  // Subtle top reading progress indicator
  useEffect(() => {
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setReadingProgress(0);
        return;
      }
      setReadingProgress(Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCopyBibtex = () => {
    navigator.clipboard.writeText(paper.bibtex);
    setCopiedBibtex(true);
    setTimeout(() => setCopiedBibtex(false), 2000);
  };

  const handleDownload = async () => {
    if (!user) {
      navigate(
        `/learner/auth?redirect=/research/${paper.id}&context=paper&item=${encodeURIComponent(paper.title)}`
      );
      return;
    }
    await downloadAcademicPaper(paper, user);
    showToast(`Downloading: "${paper.title}"`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: paper.title,
          text: paper.subtitle,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Article link copied to clipboard.');
    }
  };

  const switchTab = (next: 'text' | 'tables' | 'pdf') => {
    setViewTab(next);
    const nextParams = new URLSearchParams(searchParams);
    if (next === 'text') nextParams.delete('tab');
    else nextParams.set('tab', next);
    setSearchParams(nextParams, { replace: true });
  };

  // Parse fullArticleText blocks once so TOC and inline HTML tables stay aligned
  const parsedBlocks = useMemo(() => {
    if (!paper.fullArticleText) return [];
    const rawBlocks = paper.fullArticleText.split('\n\n');
    const items: {
      index: number;
      text: string;
      kind: 'h2' | 'h3' | 'table' | 'list' | 'quote' | 'paragraph';
      headingId?: string;
      table?: ReturnType<typeof tryParseTableBlock>;
    }[] = [];

    for (let i = 0; i < rawBlocks.length; i++) {
      const trimmed = rawBlocks[i].trim();
      if (!trimmed) continue;

      const parsedTable = tryParseTableBlock(trimmed);
      if (parsedTable) {
        items.push({ index: i, text: trimmed, kind: 'table', table: parsedTable });
        continue;
      }

      const isAllCapsHeader =
        trimmed === trimmed.toUpperCase() && trimmed.length < 90 && !trimmed.includes('•');
      const isTopNumberedHeading =
        /^\d+\.\s+[A-Z][^\n]{2,100}$/.test(trimmed) && !trimmed.includes('.  ');

      if (isAllCapsHeader || isTopNumberedHeading) {
        items.push({
          index: i,
          text: trimmed,
          kind: 'h2',
          headingId: `sec-${i}`,
        });
        continue;
      }

      const isSubHeading =
        /^\d+\.\d+\s+[A-Z][^\n]{2,100}$/.test(trimmed) ||
        ['Abstract', 'Acknowledgements', 'References', 'Conclusion'].includes(trimmed);
      if (isSubHeading) {
        items.push({
          index: i,
          text: trimmed,
          kind: 'h3',
          headingId: `sec-${i}`,
        });
        continue;
      }

      if (trimmed.startsWith('•')) {
        items.push({ index: i, text: trimmed, kind: 'list' });
        continue;
      }

      if (trimmed.startsWith('“') || trimmed.startsWith('"')) {
        items.push({ index: i, text: trimmed, kind: 'quote' });
        continue;
      }

      items.push({ index: i, text: trimmed, kind: 'paragraph' });
    }
    return items;
  }, [paper.fullArticleText]);

  const tocHeadings: TocHeading[] = useMemo(() => {
    return parsedBlocks
      .filter((b) => b.kind === 'h2' && b.headingId)
      .map((b) => ({ id: b.headingId!, label: b.text }));
  }, [parsedBlocks]);

  const inlineTablesCount = useMemo(
    () => parsedBlocks.filter((b) => b.kind === 'table').length,
    [parsedBlocks]
  );

  const otherPapers = useMemo(
    () => RESEARCH_PAPERS.filter((p) => p.id !== paper.id).slice(0, 3),
    [paper.id]
  );

  return (
    <div className="min-h-screen bg-[#080b11] light:bg-[#FBF9F5] text-slate-200 light:text-stone-800 flex flex-col justify-between selection:bg-[#c5a059] selection:text-[#080b11]">
      <Navbar />

      {/* Subtle Scroll Depth Hairline Indicator */}
      <div className="fixed top-0 left-0 right-0 h-0.5 z-50 bg-transparent pointer-events-none">
        <div
          className="h-full bg-[#c5a059] transition-[width] duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Floating Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-24 z-50 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-lg bg-[#c5a059] text-[#080b11] font-semibold text-xs shadow-xl flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-20 w-full space-y-8">
        {/* Top Breadcrumbs & Back Link */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400 light:text-stone-500">
            <Link to="/" className="hover:text-white light:hover:text-stone-900 transition-colors">
              NeuroGrowth Labs
            </Link>
            <span aria-hidden="true">/</span>
            <Link to="/research" className="hover:text-white light:hover:text-stone-900 transition-colors">
              Research Monograph Archive
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-slate-200 light:text-stone-900 font-medium truncate max-w-[240px]">
              {paper.title}
            </span>
          </nav>

          <button
            type="button"
            onClick={() => navigate('/research')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/[0.04] light:bg-stone-200/70 hover:bg-white/[0.08] light:hover:bg-stone-200 text-xs font-medium text-slate-300 light:text-stone-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Research Papers</span>
          </button>
        </div>

        {/* Institutional Monograph Masthead */}
        <header className="bg-[#0c111b] light:bg-white rounded-2xl p-6 sm:p-10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] light:shadow-[inset_0_0_0_1px_rgba(28,25,23,0.12)] space-y-6">
          {/* Unboxed Typographic Metadata Strip (Zero Pills) */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-400 light:text-stone-600">
              <span className="font-semibold uppercase tracking-widest text-[#c5a059] light:text-[#78350F]">
                {paper.category}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">DOI {paper.doi}</span>
              <span aria-hidden="true">·</span>
              <span>{paper.publishDate}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{paper.pages} Pages</span>
              {paper.readingTime && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{paper.readingTime}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyBibtex}
                className="h-9 px-3.5 rounded-lg bg-white/[0.04] light:bg-stone-100 hover:bg-white/[0.08] light:hover:bg-stone-200 text-xs font-medium text-slate-300 light:text-stone-800 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copiedBibtex ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBibtex ? 'BibTeX Copied' : 'Cite'}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="h-9 px-3.5 rounded-lg bg-white/[0.04] light:bg-stone-100 hover:bg-white/[0.08] light:hover:bg-stone-200 text-xs font-medium text-slate-300 light:text-stone-800 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="h-9 px-4 rounded-lg bg-[#c5a059] hover:bg-white light:hover:bg-stone-900 light:hover:text-white text-[#080b11] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{paper.pdfUrl ? 'Download PDF' : 'Download Paper'}</span>
              </button>
            </div>
          </div>

          {/* Balanced Editorial Display Serif Headline */}
          <div className="space-y-3 max-w-4xl">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-medium text-white light:text-stone-900 tracking-tight leading-[1.15] text-balance">
              {paper.title}
            </h1>
            <p className="text-slate-300 light:text-stone-600 text-base sm:text-lg leading-relaxed max-w-3xl">
              {paper.subtitle}
            </p>
          </div>

          {/* Author Attribution Line */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs text-slate-300 light:text-stone-700">
            {paper.authors.map((auth, aIdx) => (
              <div key={aIdx} className="flex items-center gap-1.5">
                <span className="font-semibold text-white light:text-stone-900">{auth.name}</span>
                <span className="text-slate-400 light:text-stone-500">— {auth.affiliation}</span>
              </div>
            ))}
          </div>

          {/* Reader Mode Segmented Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-white/[0.04] light:bg-stone-100">
              <button
                type="button"
                onClick={() => switchTab('text')}
                className={`px-4 py-2 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                  viewTab === 'text'
                    ? 'bg-white text-[#080b11] light:bg-stone-900 light:text-white shadow-sm'
                    : 'text-slate-300 light:text-stone-700 hover:text-white light:hover:text-stone-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Monograph View</span>
              </button>

              <button
                type="button"
                onClick={() => switchTab('tables')}
                className={`px-4 py-2 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                  viewTab === 'tables'
                    ? 'bg-white text-[#080b11] light:bg-stone-900 light:text-white shadow-sm'
                    : 'text-slate-300 light:text-stone-700 hover:text-white light:hover:text-stone-900'
                }`}
              >
                <Table2 className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>
                  Data Tables
                  {tablesBadgeCount !== null
                    ? ` (${tablesBadgeCount})`
                    : inlineTablesCount > 0
                      ? ` (${inlineTablesCount}+)`
                      : ''}
                </span>
              </button>

              {paper.pdfUrl && (
                <button
                  type="button"
                  onClick={() => switchTab('pdf')}
                  className={`px-4 py-2 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    viewTab === 'pdf'
                      ? 'bg-white text-[#080b11] light:bg-stone-900 light:text-white shadow-sm'
                      : 'text-slate-300 light:text-stone-700 hover:text-white light:hover:text-stone-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Original PDF</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* VIEW 1: ASYMMETRIC MONOGRAPH READER (70% Narrative + 30% Sticky Margin Rail) */}
        {viewTab === 'text' && (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_310px] gap-8 items-start">
            {/* Primary Reading Canvas */}
            <article className="bg-[#0c111b] light:bg-white rounded-2xl p-6 sm:p-10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] light:shadow-[inset_0_0_0_1px_rgba(28,25,23,0.12)] space-y-8">
              {/* Abstract Lead Block with Drop Cap */}
              <div className="p-6 rounded-xl bg-white/[0.025] light:bg-[#F7F4EE] space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-[#c5a059] light:text-[#78350F]">
                  Abstract
                </h2>
                <p className="font-serif text-[15px] sm:text-base text-slate-200 light:text-stone-800 leading-[1.78] max-w-[68ch] first-letter:text-5xl first-letter:font-serif first-letter:font-semibold first-letter:text-[#c5a059] light:first-letter:text-[#78350F] first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none">
                  {paper.abstract}
                </p>
              </div>

              {/* Full Verbatim Article Text with Clean HTML Tables */}
              {parsedBlocks.length > 0 ? (
                <div className="space-y-5 max-w-[68ch]">
                  {parsedBlocks.map((block) => {
                    if (block.kind === 'table' && block.table) {
                      return (
                        <div key={block.index} className="max-w-none -mx-1 sm:mx-0">
                          <ResearchTableView table={block.table} compact />
                        </div>
                      );
                    }

                    if (block.kind === 'h2') {
                      return (
                        <h2
                          key={block.index}
                          id={block.headingId}
                          className="font-serif text-xl sm:text-2xl font-medium text-white light:text-stone-900 tracking-tight pt-6 scroll-mt-24"
                        >
                          {block.text}
                        </h2>
                      );
                    }

                    if (block.kind === 'h3') {
                      return (
                        <h3
                          key={block.index}
                          id={block.headingId}
                          className="text-base sm:text-lg font-semibold text-[#c5a059] light:text-[#78350F] tracking-tight pt-3 scroll-mt-24"
                        >
                          {block.text}
                        </h3>
                      );
                    }

                    if (block.kind === 'list') {
                      const items = block.text.split('\n');
                      return (
                        <ul key={block.index} className="space-y-2.5 my-3 pl-4">
                          {items.map((it, iIdx) => (
                            <li
                              key={iIdx}
                              className="text-[15px] leading-[1.72] text-slate-300 light:text-stone-700"
                            >
                              {it.startsWith('•') ? it : `• ${it}`}
                            </li>
                          ))}
                        </ul>
                      );
                    }

                    if (block.kind === 'quote') {
                      return (
                        <blockquote
                          key={block.index}
                          className="py-5 px-6 my-6 rounded-xl bg-white/[0.025] light:bg-[#F7F4EE] font-serif text-lg sm:text-xl italic text-slate-100 light:text-stone-800 leading-relaxed"
                        >
                          {block.text}
                        </blockquote>
                      );
                    }

                    return (
                      <p
                        key={block.index}
                        className="text-[15px] sm:text-base leading-[1.78] text-slate-300 light:text-stone-700 whitespace-pre-line"
                      >
                        {block.text}
                      </p>
                    );
                  })}
                </div>
              ) : (
                /* Fallback Structured Sections for Short Papers */
                <div className="space-y-8 max-w-[68ch]">
                  <div className="space-y-3">
                    <h2 className="font-serif text-xl font-medium text-white light:text-stone-900">
                      Methodology & Architectural Framework
                    </h2>
                    <p className="text-[15px] sm:text-base text-slate-300 light:text-stone-700 leading-[1.78]">
                      {paper.methodology}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h2 className="font-serif text-xl font-medium text-white light:text-stone-900">
                      Key Empirical Findings
                    </h2>
                    <div className="space-y-3">
                      {paper.findings.map((f, fIdx) => (
                        <div
                          key={fIdx}
                          className="p-4 rounded-xl bg-white/[0.025] light:bg-[#F7F4EE] flex items-start gap-3"
                        >
                          <span className="font-mono tabular-nums text-xs font-semibold text-[#c5a059] light:text-[#78350F] pt-0.5 shrink-0">
                            {String(fIdx + 1).padStart(2, '0')}.
                          </span>
                          <p className="text-sm text-slate-300 light:text-stone-700 leading-relaxed">
                            {f}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h2 className="font-serif text-xl font-medium text-white light:text-stone-900">
                      Policy & Enterprise Recommendations
                    </h2>
                    <div className="space-y-2.5">
                      {paper.policyRecommendations.map((r, rIdx) => (
                        <div
                          key={rIdx}
                          className="p-4 rounded-xl bg-white/[0.02] light:bg-stone-50 text-sm text-slate-300 light:text-stone-700 leading-relaxed"
                        >
                          • {r}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* BibTeX Citation Box */}
              <div className="pt-8 space-y-2.5 max-w-[68ch]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-widest text-slate-400 light:text-stone-500">
                    BibTeX Citation
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyBibtex}
                    className="text-xs font-medium text-[#c5a059] light:text-[#78350F] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedBibtex ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBibtex ? 'Copied' : 'Copy BibTeX'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-[#070a10] light:bg-stone-100 font-mono text-xs text-slate-300 light:text-stone-800 overflow-x-auto leading-relaxed">
                  {paper.bibtex}
                </pre>
              </div>
            </article>

            {/* Right Margin Sidebar: Accession Record, TOC, Findings & Tables Shortcut */}
            <aside className="space-y-6 lg:sticky lg:top-28">
              {/* Accession / Publication Record Definition List */}
              <div className="rounded-xl bg-[#0c111b] light:bg-white p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] light:shadow-[inset_0_0_0_1px_rgba(28,25,23,0.12)] space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 light:text-stone-500">
                  Publication Record
                </h3>
                <dl className="divide-y divide-white/[0.06] light:divide-stone-200 text-xs">
                  <div className="py-2.5 flex justify-between gap-3">
                    <dt className="text-slate-400 light:text-stone-500">DOI</dt>
                    <dd className="font-mono tabular-nums text-white light:text-stone-900 text-right">
                      {paper.doi}
                    </dd>
                  </div>
                  <div className="py-2.5 flex justify-between gap-3">
                    <dt className="text-slate-400 light:text-stone-500">Published</dt>
                    <dd className="text-white light:text-stone-900 text-right">{paper.publishDate}</dd>
                  </div>
                  <div className="py-2.5 flex justify-between gap-3">
                    <dt className="text-slate-400 light:text-stone-500">Length</dt>
                    <dd className="font-mono tabular-nums text-white light:text-stone-900 text-right">
                      {paper.pages} pp.
                    </dd>
                  </div>
                  <div className="py-2.5 flex justify-between gap-3">
                    <dt className="text-slate-400 light:text-stone-500">Downloads</dt>
                    <dd className="font-mono tabular-nums text-white light:text-stone-900 text-right">
                      {paper.downloadCount.toLocaleString()}
                    </dd>
                  </div>
                  <div className="py-2.5 flex justify-between gap-3">
                    <dt className="text-slate-400 light:text-stone-500">Citations</dt>
                    <dd className="font-mono tabular-nums text-white light:text-stone-900 text-right">
                      {paper.citationCount.toLocaleString()}
                    </dd>
                  </div>
                </dl>

                <button
                  type="button"
                  onClick={() => switchTab('tables')}
                  className="w-full py-2.5 px-3.5 rounded-lg bg-white/[0.05] light:bg-stone-100 hover:bg-[#c5a059] hover:text-[#080b11] light:hover:bg-stone-900 light:hover:text-white text-xs font-semibold text-white light:text-stone-900 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Table2 className="w-3.5 h-3.5" />
                  <span>Open Structured Data Tables</span>
                </button>
              </div>

              {/* Section Table of Contents */}
              {tocHeadings.length > 0 && (
                <div className="rounded-xl bg-[#0c111b] light:bg-white p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] light:shadow-[inset_0_0_0_1px_rgba(28,25,23,0.12)] space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 light:text-stone-500">
                      Monograph Sections
                    </h3>
                    <span className="font-mono tabular-nums text-[11px] text-slate-500">
                      {Math.round(readingProgress)}%
                    </span>
                  </div>
                  <nav aria-label="Article sections" className="space-y-1 max-h-72 overflow-y-auto pr-1">
                    {tocHeadings.map((sec) => (
                      <a
                        key={sec.id}
                        href={`#${sec.id}`}
                        className="block py-1.5 px-2 rounded-md text-xs text-slate-300 light:text-stone-700 hover:text-white light:hover:text-stone-900 hover:bg-white/[0.04] light:hover:bg-stone-100 transition-colors truncate"
                      >
                        {sec.label}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Findings Margin Notes */}
              <div className="rounded-xl bg-[#0c111b] light:bg-white p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] light:shadow-[inset_0_0_0_1px_rgba(28,25,23,0.12)] space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 light:text-stone-500">
                  Executive Findings
                </h3>
                <ul className="space-y-3">
                  {paper.findings.map((finding, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-300 light:text-stone-700 leading-relaxed flex gap-2"
                    >
                      <span className="font-mono tabular-nums text-[#c5a059] light:text-[#78350F] font-semibold shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        )}

        {/* VIEW 2: ANALYTICAL TABLES & MANUSCRIPT MATRICES */}
        {viewTab === 'tables' && (
          <ResearchTablesPanel paper={paper} onTablesCountChange={setTablesBadgeCount} />
        )}

        {/* VIEW 3: ORIGINAL PDF DOCUMENT EMBED */}
        {viewTab === 'pdf' && paper.pdfUrl && (
          <div className="bg-[#0c111b] light:bg-white rounded-2xl p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] light:shadow-[inset_0_0_0_1px_rgba(28,25,23,0.12)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
              <span className="text-xs font-mono tabular-nums text-slate-400 light:text-stone-600">
                Original Uploaded PDF Document ({paper.pages} Pages)
              </span>

              <div className="flex items-center gap-2">
                <a
                  href={paper.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-white/[0.05] light:bg-stone-100 hover:bg-white/10 light:hover:bg-stone-200 text-xs font-medium text-slate-200 light:text-stone-800 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in New Tab</span>
                </a>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-2 rounded-lg bg-[#c5a059] hover:bg-white light:hover:bg-stone-900 light:hover:text-white text-[#080b11] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
              </div>
            </div>

            <div className="w-full h-[750px] rounded-xl overflow-hidden bg-black/60">
              <iframe
                src={`${paper.pdfUrl}#toolbar=1&navpanes=0`}
                title={paper.title}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        )}

        {/* Related Research Papers */}
        <section className="space-y-4 pt-6">
          <h2 className="font-serif text-xl font-medium text-white light:text-stone-900">
            Related Research Monographs
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {otherPapers.map((op) => (
              <Link
                key={op.id}
                to={`/research/${op.id}`}
                className="p-5 rounded-xl bg-[#0c111b] light:bg-white hover:bg-[#111827] light:hover:bg-stone-50 transition-colors shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)] light:shadow-[inset_0_0_0_1px_rgba(28,25,23,0.12)] flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="text-[11px] uppercase tracking-wider text-[#c5a059] light:text-[#78350F] font-semibold truncate">
                    {op.category}
                  </div>
                  <h3 className="font-serif text-base font-medium text-white light:text-stone-900 group-hover:text-[#c5a059] transition-colors line-clamp-2">
                    {op.title}
                  </h3>
                  <p className="text-xs text-slate-400 light:text-stone-600 line-clamp-2">
                    {op.subtitle}
                  </p>
                </div>
                <div className="pt-4 text-[11px] font-mono tabular-nums text-slate-400 light:text-stone-500 flex items-center justify-between">
                  <span>{op.publishDate} · {op.pages} pp.</span>
                  <span className="text-[#c5a059] light:text-[#78350F] font-sans font-semibold">
                    Read Paper →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
