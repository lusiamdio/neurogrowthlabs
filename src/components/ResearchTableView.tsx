import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  Copy,
  Download,
  Search,
} from 'lucide-react';

export interface ResearchTableData {
  title?: string;
  subtitle?: string;
  category?: string;
  columns: string[];
  rows: string[][];
  keyTakeaway?: string;
}

interface ResearchTableViewProps {
  table: ResearchTableData;
  compact?: boolean;
  showToolbar?: boolean;
  filenameSlug?: string;
}

function isNumericCell(val: string): boolean {
  const cleaned = val.replace(/[%,$€£+\s]/g, '');
  return cleaned.length > 0 && /^-?\d+(\.\d+)?$/.test(cleaned);
}

function parseSortableValue(val: string): number | string {
  const numericMatch = val.replace(/,/g, '').match(/^-?\d+(\.\d+)?/);
  if (numericMatch && isNumericCell(val)) {
    return Number(numericMatch[0]);
  }
  return val.toLowerCase();
}

export default function ResearchTableView({
  table,
  compact = false,
  showToolbar = false,
  filenameSlug = 'research-table',
}: ResearchTableViewProps) {
  const [filterText, setFilterText] = useState('');
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [copiedMd, setCopiedMd] = useState(false);

  const handleSort = (colIdx: number) => {
    if (sortCol === colIdx) {
      if (sortDir === 'asc') {
        setSortDir('desc');
      } else {
        setSortCol(null);
      }
    } else {
      setSortCol(colIdx);
      setSortDir('asc');
    }
  };

  const processedRows = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    let list = table.rows;
    if (q) {
      list = list.filter((row) => row.some((cell) => cell.toLowerCase().includes(q)));
    }
    if (sortCol !== null) {
      list = [...list].sort((a, b) => {
        const va = parseSortableValue(a[sortCol] ?? '');
        const vb = parseSortableValue(b[sortCol] ?? '');
        if (typeof va === 'number' && typeof vb === 'number') {
          return sortDir === 'asc' ? va - vb : vb - va;
        }
        return sortDir === 'asc'
          ? String(va).localeCompare(String(vb))
          : String(vb).localeCompare(String(va));
      });
    }
    return list;
  }, [filterText, sortCol, sortDir, table.rows]);

  const handleExportCsv = () => {
    const escapeCell = (cell: string) => `"${cell.replace(/"/g, '""')}"`;
    const csvLines = [
      table.columns.map(escapeCell).join(','),
      ...processedRows.map((row) => row.map(escapeCell).join(',')),
    ];
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filenameSlug}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = () => {
    const header = `| ${table.columns.join(' | ')} |`;
    const sep = `| ${table.columns.map(() => '---').join(' | ')} |`;
    const body = processedRows.map((row) => `| ${row.join(' | ')} |`).join('\n');
    navigator.clipboard.writeText(`${header}\n${sep}\n${body}`);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  return (
    <div className="my-6 rounded-xl bg-[#0a0f19] light:bg-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] light:shadow-[inset_0_0_0_1px_rgba(28,25,23,0.12)] overflow-hidden">
      {(table.title || table.subtitle || showToolbar) && (
        <div className="px-5 py-4 bg-white/[0.02] light:bg-stone-50 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1 min-w-0 flex-1">
            {table.category && (
              <div className="text-[11px] font-medium uppercase tracking-widest text-[#c5a059] light:text-[#78350F]">
                {table.category}
              </div>
            )}
            {table.title && (
              <h4 className="font-serif text-base sm:text-lg font-medium text-white light:text-stone-900 leading-snug">
                {table.title}
              </h4>
            )}
            {table.subtitle && (
              <p className="text-xs text-slate-400 light:text-stone-600 leading-relaxed">
                {table.subtitle}
              </p>
            )}
          </div>

          {showToolbar && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="Filter rows..."
                  aria-label="Filter table rows"
                  className="h-9 pl-8 pr-3 w-40 rounded-lg bg-white/[0.05] light:bg-white text-xs text-white light:text-stone-900 placeholder:text-slate-500 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] light:shadow-[inset_0_0_0_1px_rgba(28,25,23,0.15)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a059]"
                />
              </div>

              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="h-9 px-3 rounded-lg bg-white/[0.05] light:bg-white hover:bg-white/10 light:hover:bg-stone-100 text-xs font-medium text-slate-300 light:text-stone-700 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] light:shadow-[inset_0_0_0_1px_rgba(28,25,23,0.15)] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMd ? 'Copied' : 'Markdown'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className="h-9 px-3 rounded-lg bg-white/[0.05] light:bg-white hover:bg-white/10 light:hover:bg-stone-100 text-xs font-medium text-slate-300 light:text-stone-700 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] light:shadow-[inset_0_0_0_1px_rgba(28,25,23,0.15)] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Download CSV</span>
              </button>
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#111827] light:bg-[#EBE6DF]/60">
              {table.columns.map((col, cIdx) => {
                const isSorted = sortCol === cIdx;
                return (
                  <th
                    key={cIdx}
                    scope="col"
                    className={`${compact ? 'px-4 py-3 text-xs' : 'px-5 py-3.5 text-xs'} font-semibold text-slate-200 light:text-stone-900 tracking-wide whitespace-nowrap`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSort(cIdx)}
                      className="inline-flex items-center gap-1.5 hover:text-[#c5a059] transition-colors cursor-pointer text-left"
                    >
                      <span>{col}</span>
                      {isSorted ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="w-3 h-3 text-[#c5a059]" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-[#c5a059]" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-35" />
                      )}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/[0.05] light:divide-stone-200">
            {processedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={table.columns.length}
                  className="px-5 py-8 text-center text-xs text-slate-400 light:text-stone-500"
                >
                  No rows match your current filter.
                </td>
              </tr>
            ) : (
              processedRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className={`${
                    rIdx % 2 === 1
                      ? 'bg-white/[0.015] light:bg-stone-50/70'
                      : 'bg-transparent'
                  } hover:bg-white/[0.04] light:hover:bg-stone-100/80 transition-colors`}
                >
                  {row.map((cell, cellIdx) => {
                    const numeric = isNumericCell(cell);
                    return (
                      <td
                        key={cellIdx}
                        className={`${compact ? 'px-4 py-3 text-xs sm:text-[13px]' : 'px-5 py-3.5 text-sm'} align-top leading-relaxed ${
                          cellIdx === 0
                            ? 'font-medium text-white light:text-stone-900'
                            : 'text-slate-300 light:text-stone-700'
                        } ${numeric ? 'font-mono tabular-nums whitespace-nowrap' : ''}`}
                      >
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {table.keyTakeaway && (
        <div className="px-5 py-3 bg-white/[0.02] light:bg-stone-50 text-xs text-slate-300 light:text-stone-700 leading-relaxed">
          <span className="font-semibold text-[#c5a059] light:text-[#78350F]">Key Takeaway: </span>
          {table.keyTakeaway}
        </div>
      )}
    </div>
  );
}
