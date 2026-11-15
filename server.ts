import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import {
  extractInlineTablesForPaper,
  getChaptersForPaper,
  getPaperById,
} from './server/paperProcessing.ts';
import {
  SUPPORTED_VOICES,
  generateOrGetChapterAudio,
  generateStructuredTablesForPaper,
  getApiKeyPool,
  getCachedTables,
  hasCachedAudio,
  type TableLens,
  type VoiceName,
} from './server/geminiRotator.ts';

const PORT = 3000;
const VALID_LENSES: TableLens[] = ['comprehensive', 'technical', 'governance', 'implementation'];

function parseVoice(raw: unknown): VoiceName {
  if (typeof raw === 'string' && SUPPORTED_VOICES.includes(raw as VoiceName)) {
    return raw as VoiceName;
  }
  return 'Kore';
}

function parseLens(raw: unknown): TableLens {
  if (typeof raw === 'string' && VALID_LENSES.includes(raw as TableLens)) {
    return raw as TableLens;
  }
  return 'comprehensive';
}

function formatApiError(err: unknown): { status: number; error: string } {
  console.error('[Research Gemini API Error]', err);
  const message = err instanceof Error ? err.message : String(err);
  const statusCode =
    typeof err === 'object' && err !== null && 'statusCode' in err
      ? Number((err as { statusCode?: unknown }).statusCode)
      : typeof err === 'object' && err !== null && 'status' in err
        ? Number((err as { status?: unknown }).status)
        : 500;

  if (message.includes('GEMINI_API_KEY')) {
    return {
      status: 503,
      error: 'Gemini API key is not configured in environment secrets.',
    };
  }
  if (statusCode === 429 || message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      error: 'Gemini API rate limit reached across configured keys. Please retry shortly.',
    };
  }
  if (statusCode === 403 || statusCode === 401 || message.includes('PERMISSION_DENIED')) {
    return {
      status: statusCode === 401 ? 401 : 403,
      error:
        'Gemini API access was denied for the active key. Please check or update your GEMINI_API_KEY in Settings > Secrets.',
    };
  }
  return {
    status: Number.isFinite(statusCode) && statusCode >= 400 && statusCode < 600 ? statusCode : 500,
    error: message || 'Research synthesis request failed.',
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Research chapters & cached asset inventory
  app.get('/api/research/:paperId/chapters', (req, res) => {
    const paper = getPaperById(req.params.paperId);
    if (!paper) {
      res.status(404).json({ error: 'Research paper not found.' });
      return;
    }

    const voice = parseVoice(req.query.voice);
    const chapters = getChaptersForPaper(paper).map((ch) => ({
      id: ch.id,
      index: ch.index,
      title: ch.title,
      kind: ch.kind,
      estimatedSeconds: ch.estimatedSeconds,
      wordCount: ch.wordCount,
      cached: hasCachedAudio(paper.id, ch.id, voice),
    }));

    const inlineTables = extractInlineTablesForPaper(paper);
    const cachedTableLenses = VALID_LENSES.filter((l) => Boolean(getCachedTables(paper.id, l)));

    res.json({
      paperId: paper.id,
      voice,
      keyPoolConfigured: getApiKeyPool().length > 0,
      chapters,
      inlineTableCount: inlineTables.length,
      cachedTableLenses,
    });
  });

  // Get inline + cached generated tables (without triggering fresh Gemini generation)
  app.get('/api/research/:paperId/tables', (req, res) => {
    const paper = getPaperById(req.params.paperId);
    if (!paper) {
      res.status(404).json({ error: 'Research paper not found.' });
      return;
    }

    const lens = parseLens(req.query.lens);
    const inlineTables = extractInlineTablesForPaper(paper);
    const cached = getCachedTables(paper.id, lens);

    res.json({
      paperId: paper.id,
      lens,
      inlineTables,
      generated: cached,
      cached: Boolean(cached),
    });
  });

  // Rotate Gemini API to synthesize structured research tables for any paper & analytical lens
  app.post('/api/research/:paperId/tables', async (req, res) => {
    const paper = getPaperById(req.params.paperId);
    if (!paper) {
      res.status(404).json({ error: 'Research paper not found.' });
      return;
    }

    const lens = parseLens(req.body?.lens ?? req.query.lens);
    const force = Boolean(req.body?.force);

    try {
      const inlineTables = extractInlineTablesForPaper(paper);
      const { payload, fromCache } = await generateStructuredTablesForPaper(paper, lens, force);
      res.json({
        paperId: paper.id,
        lens,
        inlineTables,
        generated: payload,
        cached: fromCache,
      });
    } catch (err) {
      const formatted = formatApiError(err);
      res.status(formatted.status).json({ error: formatted.error });
    }
  });

  // Pre-synthesize audio & return WAV URL + chapter metadata
  app.post('/api/research/:paperId/audio', async (req, res) => {
    const paper = getPaperById(req.params.paperId);
    if (!paper) {
      res.status(404).json({ error: 'Research paper not found.' });
      return;
    }

    const chapterId = typeof req.body?.chapterId === 'string' ? req.body.chapterId : 'brief';
    const voice = parseVoice(req.body?.voice);
    const chapters = getChaptersForPaper(paper);
    const chapter = chapters.find((c) => c.id === chapterId) || chapters[0];

    try {
      const result = await generateOrGetChapterAudio({
        paperId: paper.id,
        chapterId: chapter.id,
        spokenText: chapter.spokenText,
        voiceName: voice,
      });

      res.json({
        paperId: paper.id,
        chapterId: chapter.id,
        title: chapter.title,
        voice,
        audioUrl: `/api/research/${encodeURIComponent(paper.id)}/audio/${encodeURIComponent(chapter.id)}?voice=${encodeURIComponent(voice)}`,
        estimatedSeconds: chapter.estimatedSeconds,
        byteLength: result.byteLength,
        cached: result.fromCache,
      });
    } catch (err) {
      const formatted = formatApiError(err);
      res.status(formatted.status).json({ error: formatted.error });
    }
  });

  // Stream cached or on-demand synthesized WAV with byte-range support for scrubbing
  app.get('/api/research/:paperId/audio/:chapterId', async (req, res) => {
    const paper = getPaperById(req.params.paperId);
    if (!paper) {
      res.status(404).json({ error: 'Research paper not found.' });
      return;
    }

    const chapters = getChaptersForPaper(paper);
    const chapter = chapters.find((c) => c.id === req.params.chapterId) || chapters[0];
    const voice = parseVoice(req.query.voice);

    try {
      const { filePath, byteLength } = await generateOrGetChapterAudio({
        paperId: paper.id,
        chapterId: chapter.id,
        spokenText: chapter.spokenText,
        voiceName: voice,
      });

      const download = req.query.download === '1';
      if (download) {
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${paper.id}-${chapter.id}-${voice.toLowerCase()}.wav"`
        );
      }

      const range = req.headers.range;
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Accept-Ranges', 'bytes');

      if (range) {
        const match = /^bytes=(\d+)-(\d*)$/.exec(range);
        if (match) {
          const start = Number(match[1]);
          const end = match[2] ? Math.min(Number(match[2]), byteLength - 1) : byteLength - 1;
          if (start >= byteLength || start > end) {
            res.status(416).setHeader('Content-Range', `bytes */${byteLength}`).end();
            return;
          }
          res.status(206);
          res.setHeader('Content-Range', `bytes ${start}-${end}/${byteLength}`);
          res.setHeader('Content-Length', String(end - start + 1));
          fs.createReadStream(filePath, { start, end }).pipe(res);
          return;
        }
      }

      res.setHeader('Content-Length', String(byteLength));
      fs.createReadStream(filePath).pipe(res);
    } catch (err) {
      const formatted = formatApiError(err);
      res.status(formatted.status).json({ error: formatted.error });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NeuroGrowth Labs full-stack server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
