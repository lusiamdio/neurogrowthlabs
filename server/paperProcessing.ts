import { RESEARCH_PAPERS, type ResearchPaper } from '../src/data/academyData.ts';
import {
  buildPaperAudioChapters,
  tryParseTableBlock,
  type ArticleChapter,
  type ParsedInlineTable,
} from '../src/utils/tableParser.ts';

export function getPaperById(paperId: string): ResearchPaper | undefined {
  return RESEARCH_PAPERS.find((p) => p.id === paperId);
}

export function getChaptersForPaper(paper: ResearchPaper): ArticleChapter[] {
  return buildPaperAudioChapters(paper);
}

export function extractInlineTablesForPaper(paper: ResearchPaper): ParsedInlineTable[] {
  if (!paper.fullArticleText) return [];
  const blocks = paper.fullArticleText.split('\n\n');
  const tables: ParsedInlineTable[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const trimmed = blocks[i].trim();
    if (!trimmed) continue;
    const parsed = tryParseTableBlock(trimmed);
    if (parsed) {
      // Check preceding heading/lead block to label inline tables cleanly
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

export function buildPaperContextDigest(paper: ResearchPaper): string {
  const sections = [
    `Title: ${paper.title}`,
    `Subtitle: ${paper.subtitle}`,
    `Category: ${paper.category}`,
    `Publish Date: ${paper.publishDate}`,
    `DOI: ${paper.doi}`,
    `Authors: ${paper.authors.map((a) => `${a.name} (${a.affiliation})`).join(', ')}`,
    `Executive Summary:\n${paper.executiveSummary}`,
    `Abstract:\n${paper.abstract}`,
    `Methodology:\n${paper.methodology}`,
    `Key Findings:\n${paper.findings.map((f, i) => `${i + 1}. ${f}`).join('\n')}`,
    `Policy Recommendations:\n${paper.policyRecommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}`,
  ];

  if (paper.fullArticleText) {
    // Include up to ~18,000 chars of full text excluding bibliography tail for grounded detail
    const refIdx = paper.fullArticleText.lastIndexOf('\n\nReferences\n');
    const bodyText =
      refIdx > 1000 ? paper.fullArticleText.slice(0, refIdx) : paper.fullArticleText;
    sections.push(`Full Technical Content:\n${bodyText.slice(0, 18000)}`);
  }

  return sections.join('\n\n');
}
