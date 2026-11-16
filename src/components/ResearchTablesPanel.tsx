import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Loader2,
  RefreshCw,
  Table2,
} from 'lucide-react';
import type { ResearchPaper } from '../data/academyData';
import {
  extractInlineTablesForPaper,
  type ParsedInlineTable,
} from '../utils/tableParser';
import { safeFetchJson } from '../utils/safeFetchJson';
import ResearchTableView from './ResearchTableView';

type TableLens = 'comprehensive' | 'technical' | 'governance' | 'implementation';

interface GeneratedResearchTable {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  columns: string[];
  rows: string[][];
  keyTakeaway: string;
}

interface TablesApiResponse {
  paperId: string;
  lens: TableLens;
  inlineTables: ParsedInlineTable[];
  generated: {
    lens: TableLens;
    modelUsed: string;
    generatedAt: string;
    tables: GeneratedResearchTable[];
  } | null;
  cached: boolean;
  error?: string;
}

const LENS_OPTIONS: { id: TableLens; label: string }[] = [
  { id: 'comprehensive', label: 'Comprehensive Overview' },
  { id: 'technical', label: 'Technical Architecture' },
  { id: 'governance', label: 'Governance & Risk' },
  { id: 'implementation', label: 'Implementation Roadmap' },
];

interface ResearchTablesPanelProps {
  paper: ResearchPaper;
  onTablesCountChange?: (count: number) => void;
}

export default function ResearchTablesPanel({
  paper,
  onTablesCountChange,
}: ResearchTablesPanelProps) {
  const [lens, setLens] = useState<TableLens>('comprehensive');
  const [inlineTables, setInlineTables] = useState<ParsedInlineTable[]>(() =>
    extractInlineTablesForPaper(paper)
  );
  const [generatedTables, setGeneratedTables] = useState<GeneratedResearchTable[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const synthesizeTables = useCallback(
    async (targetLens: TableLens, force = false) => {
      setLoading(true);
      setError(null);
      try {
        const res = await safeFetchJson<TablesApiResponse>(
          `/api/research/${encodeURIComponent(paper.id)}/tables`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lens: targetLens, force }),
          }
        );

        if (res.ok === false) {
          if (res.isHtmlFallback) {
            throw new Error(
              'Live analytical matrix synthesis requires the Express API runtime. Verbatim manuscript tables below remain interactive.'
            );
          }
          throw new Error(res.error);
        }

        const data = res.data;
        const resolvedInline =
          data.inlineTables && data.inlineTables.length > 0
            ? data.inlineTables
            : extractInlineTablesForPaper(paper);
        setInlineTables(resolvedInline);
        const genList = data.generated?.tables || [];
        setGeneratedTables(genList);
        setGeneratedAt(data.generated?.generatedAt || null);
        onTablesCountChange?.(resolvedInline.length + genList.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to generate tables.');
      } finally {
        setLoading(false);
      }
    },
    [onTablesCountChange, paper]
  );

  // Load verbatim tables immediately; fetch cached generated matrices cleanly without crashing on HTML responses
  useEffect(() => {
    let cancelled = false;
    setError(null);
    const localInline = extractInlineTablesForPaper(paper);
    setInlineTables(localInline);

    const loadOrGenerate = async () => {
      setLoading(true);
      try {
        const res = await safeFetchJson<TablesApiResponse>(
          `/api/research/${encodeURIComponent(paper.id)}/tables?lens=${encodeURIComponent(lens)}`
        );
        if (cancelled) return;

        if (res.ok === false) {
          onTablesCountChange?.(localInline.length);
          if (res.isHtmlFallback) {
            setLoading(false);
            return;
          }
          throw new Error(res.error);
        }

        const data = res.data;
        const resolvedInline =
          data.inlineTables && data.inlineTables.length > 0 ? data.inlineTables : localInline;
        setInlineTables(resolvedInline);

        if (data.generated && data.generated.tables.length > 0) {
          setGeneratedTables(data.generated.tables);
          setGeneratedAt(data.generated.generatedAt);
          onTablesCountChange?.(resolvedInline.length + data.generated.tables.length);
          setLoading(false);
        } else {
          await synthesizeTables(lens, false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load structured tables.');
          setLoading(false);
        }
      }
    };

    void loadOrGenerate();

    return () => {
      cancelled = true;
    };
  }, [lens, paper, synthesizeTables, onTablesCountChange]);

  return (
    <div className="space-y-8">
      {/* Analytical Lens & Synthesis Control Header */}
      <div className="rounded-xl bg-[#0d121d] light:bg-[#F7F4EE] p-5 sm:p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] light:shadow-[inset_0_0_0_1px_rgba(28,25,23,0.12)] space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400 light:text-stone-600">
              <Table2 className="w-3.5 h-3.5 text-[#c5a059]" />
              <span className="font-medium text-[#c5a059] light:text-[#78350F]">
                Structured Evidence & Matrices
              </span>
              {generatedAt && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">
                    Updated {new Date(generatedAt).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-white light:text-stone-900">
              Analytical Tables & Paper Data
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 light:text-stone-600 max-w-2xl leading-relaxed">
              Interactive evidence matrices synthesized directly from this monograph alongside all verbatim source tables. Sort columns, filter entries, or export CSV.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void synthesizeTables(lens, true)}
            disabled={loading}
            className="h-10 px-4 rounded-lg bg-[#c5a059] hover:bg-white light:hover:bg-stone-900 light:hover:text-white text-[#080b11] text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>{loading ? 'Synthesizing...' : 'Regenerate Matrices'}</span>
          </button>
        </div>

        {/* Lens Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {LENS_OPTIONS.map((opt) => {
            const active = lens === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLens(opt.id)}
                disabled={loading}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white text-[#080b11] light:bg-stone-900 light:text-white shadow-sm'
                    : 'bg-white/[0.04] light:bg-white text-slate-300 light:text-stone-700 hover:bg-white/[0.08] light:hover:bg-stone-100'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {loading && generatedTables.length === 0 && (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="rounded-xl bg-[#0d121d] light:bg-white p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] light:shadow-[inset_0_0_0_1px_rgba(28,25,23,0.12)] space-y-4 animate-pulse"
            >
              <div className="h-4 w-48 bg-white/10 light:bg-stone-200 rounded" />
              <div className="h-3 w-80 bg-white/5 light:bg-stone-100 rounded" />
              <div className="space-y-2 pt-2">
                <div className="h-9 w-full bg-white/5 light:bg-stone-100 rounded" />
                <div className="h-9 w-full bg-white/[0.03] light:bg-stone-50 rounded" />
                <div className="h-9 w-full bg-white/5 light:bg-stone-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-xl bg-amber-500/10 light:bg-amber-50 p-5 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-amber-200 light:text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 light:text-amber-700" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => void synthesizeTables(lens, true)}
            className="px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            Retry Synthesis
          </button>
        </div>
      )}

      {/* AI-Synthesized Analytical Tables */}
      {generatedTables.length > 0 && (
        <div className="space-y-6">
          {generatedTables.map((tbl, idx) => (
            <ResearchTableView
              key={`${tbl.id}-${idx}`}
              table={tbl}
              showToolbar
              filenameSlug={`${paper.id}-${tbl.id}`}
            />
          ))}
        </div>
      )}

      {/* Verbatim Source Tables Extracted from Manuscript */}
      {inlineTables.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <h3 className="font-serif text-lg sm:text-xl font-medium text-white light:text-stone-900">
              Original Manuscript Tables
            </h3>
            <p className="text-xs text-slate-400 light:text-stone-600">
              Verbatim reference tables published directly within this monograph.
            </p>
          </div>

          {inlineTables.map((tbl, idx) => (
            <ResearchTableView
              key={`inline-${idx}`}
              table={{
                category: `Manuscript Table ${idx + 1}`,
                title: tbl.title || `Reference Table ${idx + 1}`,
                columns: tbl.columns,
                rows: tbl.rows,
              }}
              showToolbar
              filenameSlug={`${paper.id}-manuscript-table-${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
