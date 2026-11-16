export interface ParsedInlineTable {
  title?: string;
  columns: string[];
  rows: string[][];
}

export interface ArticleChapter {
  id: string;
  index: number;
  title: string;
  kind: 'brief' | 'abstract' | 'section';
  estimatedSeconds: number;
  wordCount: number;
  spokenText: string;
}

export function tryParseTableBlock(block: string): ParsedInlineTable | null {
  const lines = block
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return null;

  // Detect pipe-delimited tables (`col1 | col2 | col3`) or tab-delimited tables
  const pipeLines = lines.filter((line) => line.includes(' | '));
  const tabLines = lines.filter((line) => line.includes('\t'));

  const usePipe = pipeLines.length >= 2 && pipeLines.length >= lines.length - 1;
  const useTab = !usePipe && tabLines.length >= 2 && tabLines.length >= lines.length - 1;

  if (!usePipe && !useTab) return null;

  const delimiter = usePipe ? ' | ' : '\t';

  // Skip architecture ASCII boxes that happen to use pipes without tabular structure
  if (usePipe) {
    const hasArrowOrBox = lines.some(
      (l) => l.includes('-->') || l.includes('───') || l.includes('└──') || l === '|'
    );
    if (hasArrowOrBox) return null;
  }

  let title: string | undefined;
  let tableLines = lines;

  // Optional caption line immediately preceding the header row
  if (!tableLines[0].includes(delimiter)) {
    title = tableLines[0];
    tableLines = tableLines.slice(1);
  }

  if (tableLines.length < 2) return null;

  // Filter out pure markdown separator rows like `--- | --- | ---`
  const cleanedLines = tableLines.filter((line) => !/^[\s|\-:]+$/.test(line));
  if (cleanedLines.length < 2) return null;

  const splitRow = (line: string): string[] => {
    const trimmed = line.replace(/^\|/, '').replace(/\|$/, '').trim();
    return trimmed.split(delimiter).map((cell) => cell.trim());
  };

  const columns = splitRow(cleanedLines[0]);
  if (columns.length < 2) return null;

  // Ensure it actually reads as a multi-column table rather than a single wrapped diagram line
  const rows = cleanedLines.slice(1).map((line) => {
    const cells = splitRow(line);
    if (cells.length === columns.length) return cells;
    if (cells.length < columns.length) {
      return [...cells, ...Array(columns.length - cells.length).fill('')];
    }
    return [
      ...cells.slice(0, columns.length - 1),
      cells.slice(columns.length - 1).join(' '),
    ];
  });

  // Require consistent non-empty columns
  if (rows.length === 0) return null;

  return { title, columns, rows };
}

export function cleanTextForSpeech(rawText: string): string {
  const blocks = rawText.split('\n\n');
  const spokenBlocks: string[] = [];

  for (const rawBlock of blocks) {
    const block = rawBlock.trim();
    if (!block) continue;

    // Convert structured tables into clean spoken sentences instead of reading raw pipe characters
    const table = tryParseTableBlock(block);
    if (table) {
      const headerSummary = table.columns.join(', ');
      const rowSummaries = table.rows
        .slice(0, 12)
        .map((row) =>
          table.columns
            .map((col, idx) => (row[idx] ? `${col}: ${row[idx]}` : ''))
            .filter(Boolean)
            .join(', ')
        )
        .join('. ');
      spokenBlocks.push(
        `${table.title ? `${table.title}. ` : ''}Table comparing ${headerSummary}. ${rowSummaries}.`
      );
      continue;
    }

    // Skip ASCII connector characters
    const normalized = block
      .replace(/^\s*•\s*/gm, '')
      .replace(/[│┌┐└┘├┤┬┴┼─═║╔╗╚╝╠╣╦╩╬]/g, ' ')
      .replace(/\s+\|\s+/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();

    if (normalized) {
      spokenBlocks.push(normalized);
    }
  }

  return spokenBlocks.join('\n\n');
}

export interface MinimalPaperForChapters {
  id: string;
  title: string;
  subtitle: string;
  authors: { name: string; affiliation: string }[];
  publishDate: string;
  category: string;
  executiveSummary: string;
  abstract: string;
  methodology: string;
  findings: string[];
  policyRecommendations: string[];
  fullArticleText?: string;
}

export function buildPaperAudioChapters(paper: MinimalPaperForChapters): ArticleChapter[] {
  const estimateSeconds = (text: string) => {
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(20, Math.round((words / 150) * 60));
  };

  const countWords = (text: string) => text.split(/\s+/).filter(Boolean).length;

  const authorNames = paper.authors.map((a) => `${a.name} of ${a.affiliation}`).join(', ');
  const briefScript = [
    `${paper.title}. ${paper.subtitle}. Published ${paper.publishDate} by ${authorNames} in ${paper.category}.`,
    `Executive Summary. ${paper.executiveSummary}`,
    `Methodology. ${paper.methodology}`,
    `Key Empirical Findings. ${paper.findings.map((f, i) => `Finding ${i + 1}: ${f}`).join(' ')}`,
    `Policy Recommendations. ${paper.policyRecommendations.map((r, i) => `Recommendation ${i + 1}: ${r}`).join(' ')}`,
  ].join('\n\n');

  const chapters: ArticleChapter[] = [
    {
      id: 'brief',
      index: 0,
      title: 'Executive Audio Briefing',
      kind: 'brief',
      estimatedSeconds: estimateSeconds(briefScript),
      wordCount: countWords(briefScript),
      spokenText: briefScript,
    },
  ];

  if (!paper.fullArticleText) {
    const abstractText = `Abstract. ${paper.abstract}`;
    chapters.push({
      id: 'abstract',
      index: 1,
      title: 'Full Abstract & Framing',
      kind: 'abstract',
      estimatedSeconds: estimateSeconds(abstractText),
      wordCount: countWords(abstractText),
      spokenText: abstractText,
    });
    return chapters;
  }

  // Parse numbered top-level sections from fullArticleText into balanced audio chapters
  const blocks = paper.fullArticleText.split('\n\n').map((b) => b.trim()).filter(Boolean);
  const sections: { heading: string; blocks: string[] }[] = [];
  let current: { heading: string; blocks: string[] } = {
    heading: 'Overview',
    blocks: [],
  };

  for (const block of blocks) {
    const isTopHeading =
      /^\d+\.\s+[A-Z][^\n]{2,100}$/.test(block) && !block.includes('.  ');
    const isNamedMajor = ['Abstract', 'Conclusion', 'References', 'Acknowledgements'].includes(block);

    if (isTopHeading || isNamedMajor) {
      if (current.blocks.length > 0 && current.heading !== 'Overview') {
        sections.push(current);
      }
      current = { heading: block, blocks: [block] };
    } else {
      current.blocks.push(block);
    }
  }
  if (current.blocks.length > 0) {
    sections.push(current);
  }

  // Group sections into ~450-750 word chapters so TTS generation stays crisp and fast
  let firstHeading = '';
  let lastHeading = '';
  let groupBlocks: string[] = [];
  let groupWords = 0;

  const flushGroup = () => {
    if (groupBlocks.length === 0) return;
    const rawJoined = groupBlocks.join('\n\n');
    const spoken = cleanTextForSpeech(rawJoined);
    const idx = chapters.length;
    const cleanFirst = firstHeading.replace(/^\d+\.\s*/, '');
    const cleanLast = lastHeading.replace(/^\d+\.\s*/, '');
    const title =
      cleanLast && cleanLast !== cleanFirst
        ? `${cleanFirst} — ${cleanLast}`
        : cleanFirst || `Section ${idx}`;

    chapters.push({
      id: `chapter-${idx}`,
      index: idx,
      title,
      kind: idx === 1 ? 'abstract' : 'section',
      estimatedSeconds: estimateSeconds(spoken),
      wordCount: countWords(spoken),
      spokenText: spoken,
    });
    firstHeading = '';
    lastHeading = '';
    groupBlocks = [];
    groupWords = 0;
  };

  for (const sec of sections) {
    // Skip Reference bibliography lists in audio chapters
    if (sec.heading.toLowerCase().startsWith('references')) {
      continue;
    }
    const secText = sec.blocks.join('\n\n');
    const secWords = countWords(secText);

    if (groupBlocks.length > 0 && groupWords + secWords > 750) {
      flushGroup();
    }

    if (!firstHeading) {
      firstHeading = sec.heading;
    }
    lastHeading = sec.heading;

    groupBlocks.push(...sec.blocks);
    groupWords += secWords;

    if (groupWords >= 480) {
      flushGroup();
    }
  }
  flushGroup();

  return chapters;
}

export function extractInlineTablesForPaper(
  paper: Pick<MinimalPaperForChapters, 'fullArticleText'>
): ParsedInlineTable[] {
  if (!paper.fullArticleText) return [];
  const blocks = paper.fullArticleText.split('\n\n');
  const tables: ParsedInlineTable[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const trimmed = blocks[i].trim();
    if (!trimmed) continue;
    const parsed = tryParseTableBlock(trimmed);
    if (parsed) {
      const prev = i > 0 ? blocks[i - 1].trim() : '';
      let derivedTitle = parsed.title;
      if (!derivedTitle && prev && prev.length < 110 && !prev.endsWith('.')) {
        derivedTitle = prev;
      } else if (!derivedTitle && prev && prev.endsWith(':') && prev.length < 120) {
        derivedTitle = prev.slice(0, -1);
      }
      tables.push({
        title: derivedTitle,
        columns: parsed.columns,
        rows: parsed.rows,
      });
    }
  }
  return tables;
}
