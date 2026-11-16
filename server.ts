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

function normalizeSupabaseUrl(raw?: string): string {
  const fallback = 'https://jyvwrdibocdiicaurfrj.supabase.co';
  if (!raw) return fallback;
  let candidate = raw.trim().replace(/^['"]|['"]$/g, '');
  if (!candidate) return fallback;
  try {
    let parsed = new URL(candidate);
    if (parsed.hostname.endsWith('google.com') && parsed.pathname === '/url') {
      const inner = parsed.searchParams.get('q') || parsed.searchParams.get('url');
      if (inner) {
        parsed = new URL(inner);
      }
    }
    if (parsed.protocol === 'https:' && !parsed.hostname.endsWith('google.com')) {
      return parsed.origin;
    }
  } catch {
    // Fall back to canonical project URL
  }
  return fallback;
}

const PORT = 3000;
const VALID_LENSES: TableLens[] = ['comprehensive', 'technical', 'governance', 'implementation'];
const SUPABASE_PROXY_TARGET = normalizeSupabaseUrl(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
);

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
  const message = err instanceof Error ? err.message : String(err);
  const statusCode =
    typeof err === 'object' && err !== null && 'statusCode' in err
      ? Number((err as { statusCode?: unknown }).statusCode)
      : typeof err === 'object' && err !== null && 'status' in err
        ? Number((err as { status?: unknown }).status)
        : 500;

  if (message.includes('GEMINI_API_KEY')) {
    console.warn('[Research Gemini API] GEMINI_API_KEY is not configured in environment.');
    return {
      status: 503,
      error: 'Gemini API key is not configured in environment secrets.',
    };
  }
  if (statusCode === 429 || message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
    console.warn('[Research Gemini API] Rate limit reached across configured keys.');
    return {
      status: 429,
      error: 'Gemini API rate limit reached across configured keys. Please retry shortly.',
    };
  }
  if (statusCode === 403 || statusCode === 401 || message.includes('PERMISSION_DENIED')) {
    console.warn('[Research Gemini API] Access denied (403/401) for configured API key.');
    return {
      status: statusCode === 401 ? 401 : 403,
      error:
        'Gemini API access was denied for the active key. Please check or update your GEMINI_API_KEY in Settings > Secrets.',
    };
  }
  console.error('[Research Gemini API Error]', err);
  return {
    status: Number.isFinite(statusCode) && statusCode >= 400 && statusCode < 600 ? statusCode : 500,
    error: message || 'Research synthesis request failed.',
  };
}

async function startServer() {
  const app = express();

  // Same-origin Supabase proxy so browser clients avoid cross-origin blocks/network failures
  app.use('/api/supabase', express.raw({ type: '*/*', limit: '5mb' }), async (req, res) => {
    const targetUrl = `${SUPABASE_PROXY_TARGET}${req.url || ''}`;
    const forwardHeaders = new Headers();
    const headerWhitelist = [
      'apikey',
      'authorization',
      'content-type',
      'accept',
      'prefer',
      'range',
      'x-client-info',
      'x-supabase-api-version',
      'accept-profile',
      'content-profile',
    ];

    for (const name of headerWhitelist) {
      const value = req.headers[name];
      if (typeof value === 'string' && value.length > 0) {
        forwardHeaders.set(name, value);
      } else if (Array.isArray(value) && value.length > 0) {
        forwardHeaders.set(name, value.join(', '));
      }
    }

    const hasBody =
      req.method !== 'GET' &&
      req.method !== 'HEAD' &&
      Buffer.isBuffer(req.body) &&
      req.body.length > 0;

    try {
      const upstream = await fetch(targetUrl, {
        method: req.method,
        headers: forwardHeaders,
        body: hasBody ? new Uint8Array(req.body) : undefined,
        signal: AbortSignal.timeout(15000),
      });

      res.setHeader('x-supabase-proxy', '1');
      const passHeaders = ['content-type', 'content-range', 'x-sb-error-code', 'sb-gateway-version'];
      for (const name of passHeaders) {
        const val = upstream.headers.get(name);
        if (val) {
          res.setHeader(name, val);
        }
      }

      const payload = Buffer.from(await upstream.arrayBuffer());
      res.status(upstream.status).send(payload);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upstream Supabase request failed.';
      console.warn('[Supabase Proxy] Upstream unreachable:', msg);
      res.setHeader('x-supabase-proxy', '1');
      res.status(503).json({
        error: 'Authentication service temporarily unreachable.',
        code: 'upstream_unreachable',
        msg,
      });
    }
  });

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

  // Ensure unmatched /api/* endpoints always return JSON rather than SPA HTML
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
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
