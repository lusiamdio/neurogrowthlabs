import React, { useState } from 'react';
import { Check, Copy, Sigma, Terminal, Table2 } from 'lucide-react';

interface ModuleContentRendererProps {
  content: string;
}

type ContentBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'h4'; text: string }
  | { type: 'hr' }
  | { type: 'paragraph'; text: string }
  | { type: 'callout'; label?: string; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'checklist'; items: { label: string; defaultChecked: boolean }[] }
  | { type: 'code'; lang: string; code: string }
  | { type: 'math'; lines: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] };

function renderInlineFormatting(text: string): React.ReactNode {
  // Handle **bold** and `inline code` cleanly
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-white/[0.07] text-ai-cyan font-mono text-[12px]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function parseContentBlocks(raw: string): ContentBlock[] {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const blocks: ContentBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Horizontal rule
    if (/^-{3,}$/.test(trimmed)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // Fenced blocks ```lang
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim().toLowerCase() || 'text';
      const inner: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        inner.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // consume closing ```

      if (lang === 'math') {
        blocks.push({
          type: 'math',
          lines: inner.filter((l) => l.trim().length > 0),
        });
      } else {
        blocks.push({
          type: 'code',
          lang,
          code: inner.join('\n'),
        });
      }
      continue;
    }

    // Markdown pipe table
    if (
      trimmed.startsWith('|') &&
      i + 1 < lines.length &&
      lines[i + 1].trim().startsWith('|') &&
      /[-|:\s]+/.test(lines[i + 1])
    ) {
      const parseRow = (rowLine: string) =>
        rowLine
          .trim()
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((c) => c.trim());

      const headers = parseRow(trimmed);
      i += 2; // skip header + separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(parseRow(lines[i]));
        i++;
      }
      blocks.push({ type: 'table', headers, rows });
      continue;
    }

    // Headings
    if (trimmed.startsWith('#### ')) {
      blocks.push({ type: 'h4', text: trimmed.slice(5).trim() });
      i++;
      continue;
    }
    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', text: trimmed.slice(4).trim() });
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', text: trimmed.slice(3).trim() });
      i++;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'h2', text: trimmed.slice(2).trim() });
      i++;
      continue;
    }

    // Callout lines (> ...)
    if (trimmed.startsWith('> ')) {
      const calloutLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        calloutLines.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push({ type: 'callout', text: calloutLines.join(' ') });
      continue;
    }

    // Checklist (- [ ] ... or - [x] ...)
    if (/^[-*]\s+\[[ xX]\]\s+/.test(trimmed)) {
      const items: { label: string; defaultChecked: boolean }[] = [];
      while (i < lines.length && /^[-*]\s+\[[ xX]\]\s+/.test(lines[i].trim())) {
        const t = lines[i].trim();
        const defaultChecked = /^[-*]\s+\[[xX]\]/.test(t);
        const label = t.replace(/^[-*]\s+\[[ xX]\]\s+/, '');
        items.push({ label, defaultChecked });
        i++;
      }
      blocks.push({ type: 'checklist', items });
      continue;
    }

    // Unordered list (- ... or * ...)
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (
        i < lines.length &&
        /^[-*]\s+/.test(lines[i].trim()) &&
        !/^[-*]\s+\[[ xX]\]\s+/.test(lines[i].trim())
      ) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    // Ordered list (1. ... )
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    // Paragraph (collect consecutive non-empty non-special lines)
    const paraLines: string[] = [];
    while (i < lines.length) {
      const cur = lines[i];
      const curTrim = cur.trim();
      if (
        !curTrim ||
        /^-{3,}$/.test(curTrim) ||
        curTrim.startsWith('```') ||
        curTrim.startsWith('#') ||
        curTrim.startsWith('> ') ||
        curTrim.startsWith('|') ||
        /^[-*]\s+/.test(curTrim) ||
        /^\d+\.\s+/.test(curTrim)
      ) {
        break;
      }
      paraLines.push(curTrim);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', text: paraLines.join(' ') });
    } else {
      i++;
    }
  }

  return blocks;
}

function ChecklistBlock({ items }: { items: { label: string; defaultChecked: boolean }[] }) {
  const [checkedMap, setCheckedMap] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    items.forEach((it, idx) => {
      init[idx] = it.defaultChecked;
    });
    return init;
  });

  return (
    <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
      {items.map((item, idx) => {
        const isChecked = !!checkedMap[idx];
        return (
          <button
            key={idx}
            type="button"
            onClick={() => setCheckedMap((prev) => ({ ...prev, [idx]: !prev[idx] }))}
            className="w-full text-left flex items-start gap-2.5 text-sm text-slate-300 hover:text-white transition-colors"
          >
            <span
              className={`w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center transition-colors ${
                isChecked
                  ? 'bg-ai-cyan text-midnight-black'
                  : 'bg-white/[0.06] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]'
              }`}
            >
              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
            </span>
            <span className={isChecked ? 'text-white' : 'text-slate-300'}>
              {renderInlineFormatting(item.label)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function CodeBlockCard({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const label =
    lang === 'diagram'
      ? 'Architecture & Data Flow Diagram'
      : lang === 'json'
      ? 'JSON Telemetry / Output'
      : lang === 'yaml'
      ? 'Automated Playbook (YAML)'
      : lang === 'policy'
      ? 'Policy Rules & Evaluation'
      : lang === 'scenario'
      ? 'Lab Specification'
      : 'Technical Specification';

  return (
    <div className="rounded-xl bg-[#060911] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.09)] overflow-hidden my-3">
      <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.07)]">
        <span className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-ai-cyan font-semibold">
          <Terminal className="w-3.5 h-3.5" />
          <span>{label}</span>
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[11px] font-mono text-slate-300 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre
        className={`p-4 overflow-x-auto font-mono text-xs leading-relaxed whitespace-pre ${
          lang === 'diagram'
            ? 'text-cyan-200'
            : lang === 'json' || lang === 'yaml'
            ? 'text-emerald-300'
            : 'text-slate-200'
        }`}
      >
        {code}
      </pre>
    </div>
  );
}

export default function ModuleContentRenderer({ content }: ModuleContentRendererProps) {
  const blocks = parseContentBlocks(content || '');

  return (
    <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'hr':
            return <div key={idx} className="h-px bg-white/[0.08] my-4" />;

          case 'h2':
            return (
              <div key={idx} className="pt-4 pb-1 first:pt-0">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
                  <span className="w-1.5 h-5 rounded-full bg-ai-cyan shrink-0" />
                  <span>{block.text}</span>
                </h3>
              </div>
            );

          case 'h3':
            return (
              <h4
                key={idx}
                className="text-base font-bold text-white tracking-tight pt-3 first:pt-0"
              >
                {block.text}
              </h4>
            );

          case 'h4':
            return (
              <h5
                key={idx}
                className="text-xs font-mono uppercase tracking-wider text-ai-cyan font-bold pt-2"
              >
                {block.text}
              </h5>
            );

          case 'paragraph':
            return (
              <p key={idx} className="text-sm text-slate-300 leading-relaxed">
                {renderInlineFormatting(block.text)}
              </p>
            );

          case 'callout':
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-ai-cyan/[0.06] shadow-[inset_3px_0_0_0_#22d3ee] text-sm text-slate-200 leading-relaxed"
              >
                {renderInlineFormatting(block.text)}
              </div>
            );

          case 'checklist':
            return <ChecklistBlock key={idx} items={block.items} />;

          case 'ul':
            return (
              <ul key={idx} className="space-y-1.5 pl-1">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-ai-cyan shrink-0 mt-2" />
                    <span className="leading-relaxed">{renderInlineFormatting(item)}</span>
                  </li>
                ))}
              </ul>
            );

          case 'ol':
            return (
              <ol key={idx} className="space-y-2 pl-1">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <span className="w-5 h-5 rounded-md bg-white/[0.06] text-[11px] font-mono text-ai-cyan font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {itemIdx + 1}
                    </span>
                    <span className="leading-relaxed">{renderInlineFormatting(item)}</span>
                  </li>
                ))}
              </ol>
            );

          case 'math':
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#070b14] shadow-[inset_0_0_0_1px_rgba(197,160,89,0.28)] space-y-1.5 my-2"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#c5a059] font-bold">
                  <Sigma className="w-3.5 h-3.5" />
                  <span>Quantitative Formulation</span>
                </div>
                <div className="font-mono text-xs sm:text-sm text-amber-200 space-y-1 overflow-x-auto">
                  {block.lines.map((l, lIdx) => (
                    <div key={lIdx} className="whitespace-pre">
                      {l}
                    </div>
                  ))}
                </div>
              </div>
            );

          case 'code':
            return <CodeBlockCard key={idx} lang={block.lang} code={block.code} />;

          case 'table':
            return (
              <div
                key={idx}
                className="rounded-xl bg-[#070b14] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] overflow-hidden my-3"
              >
                <div className="px-4 py-2 bg-white/[0.03] flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#c5a059] font-bold">
                  <Table2 className="w-3.5 h-3.5" />
                  <span>Structured Specification Table</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-white/[0.04] text-white font-mono uppercase tracking-wider">
                        {block.headers.map((h, hIdx) => (
                          <th key={hIdx} className="px-4 py-2.5 font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {block.rows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className={rIdx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.015]'}
                        >
                          {block.headers.map((_, cIdx) => (
                            <td key={cIdx} className="px-4 py-2.5 text-slate-300 font-mono">
                              {row[cIdx] && row[cIdx].length > 0 ? (
                                renderInlineFormatting(row[cIdx])
                              ) : (
                                <span className="text-slate-600">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
