import fs from 'node:fs';
import path from 'node:path';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import type { ResearchPaper } from '../src/data/academyData.ts';
import {
  buildPaperContextDigest,
  getAllPapers,
  getChaptersForPaper,
} from './paperProcessing.ts';

export type TableLens = 'comprehensive' | 'technical' | 'governance' | 'implementation';

export interface GeneratedResearchTable {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  columns: string[];
  rows: string[][];
  keyTakeaway: string;
}

export interface CachedTablesPayload {
  paperId: string;
  lens: TableLens;
  modelUsed: string;
  generatedAt: string;
  tables: GeneratedResearchTable[];
}

export const SUPPORTED_VOICES = ['Kore', 'Charon', 'Zephyr', 'Puck', 'Fenrir'] as const;
export type VoiceName = (typeof SUPPORTED_VOICES)[number];

export const TTS_MODELS_TO_ROTATE = [
  'gemini-3.8-flash-lite-tts',
  'gemini-3.8-flash-tts',
] as const;

const CACHE_ROOT = path.resolve(process.cwd(), '.cache');
const TABLES_CACHE_DIR = path.join(CACHE_ROOT, 'research-tables');
const AUDIO_CACHE_DIR = path.join(CACHE_ROOT, 'research-audio');

fs.mkdirSync(TABLES_CACHE_DIR, { recursive: true });
fs.mkdirSync(AUDIO_CACHE_DIR, { recursive: true });

// Round-robin key rotation state & per-key cooldown tracking
let keyCursor = 0;
let totalRotatedCalls = 0;
const keyCooldownUntil = new Map<string, number>();

export function getApiKeyPool(): string[] {
  const candidates: string[] = [];
  if (process.env.GEMINI_API_KEY) {
    candidates.push(process.env.GEMINI_API_KEY);
  }
  if (process.env.GEMINI_API_KEYS) {
    for (const part of process.env.GEMINI_API_KEYS.split(/[,;\s]+/)) {
      if (part.trim()) candidates.push(part.trim());
    }
  }
  for (let i = 1; i <= 20; i++) {
    const val = process.env[`GEMINI_API_KEY_${i}`];
    if (val && val.trim()) candidates.push(val.trim());
  }
  const unique = Array.from(
    new Set(
      candidates
        .map((k) => k.trim())
        .filter((k) => k.length > 0 && k !== 'MY_GEMINI_API_KEY')
    )
  );
  return unique;
}

export function getRotationPoolStatus() {
  const keys = getApiKeyPool();
  const now = Date.now();
  const availableCount = keys.filter((k) => (keyCooldownUntil.get(k) ?? 0) <= now).length;
  return {
    keyPoolConfigured: keys.length > 0,
    keyCount: keys.length,
    availableKeyCount: availableCount,
    rotationEnabled: keys.length > 1,
    rotatedCalls: totalRotatedCalls,
  };
}

function createClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey,
    apiVersion: 'v1beta',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function classifyGeminiError(err: unknown): {
  retryable: boolean;
  shouldRotateKey: boolean;
  isQuota: boolean;
  isPermissionDenied: boolean;
  status?: number;
  message: string;
} {
  const message = err instanceof Error ? err.message : String(err);
  const status =
    typeof err === 'object' && err !== null && 'status' in err
      ? Number((err as { status?: unknown }).status)
      : undefined;

  const lower = message.toLowerCase();
  const isPermissionDenied =
    status === 401 ||
    status === 403 ||
    lower.includes('permission_denied') ||
    lower.includes('access_denied') ||
    lower.includes('api_key_invalid') ||
    lower.includes('api key not valid');

  const isQuota =
    status === 429 ||
    lower.includes('429') ||
    lower.includes('resource_exhausted') ||
    lower.includes('quota') ||
    lower.includes('rate limit');

  const isTransient =
    isQuota ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    lower.includes('unavailable') ||
    lower.includes('timeout') ||
    lower.includes('overloaded');

  return {
    retryable: isTransient,
    shouldRotateKey: isTransient || isPermissionDenied,
    isQuota,
    isPermissionDenied,
    status,
    message,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function executeWithKeyRotation<T>(
  operation: (ai: GoogleGenAI, keySlot: number) => Promise<T>,
  maxRounds = 2
): Promise<{ result: T; keySlotUsed: number }> {
  const keys = getApiKeyPool();
  if (keys.length === 0) {
    const err = new Error(
      'GEMINI_API_KEY is not configured. Please ensure the server API key secret is set.'
    );
    (err as Error & { statusCode?: number }).statusCode = 503;
    throw err;
  }

  let lastError: unknown;
  const triedKeys = new Set<string>();
  const totalAttempts = Math.max(keys.length, keys.length * maxRounds);

  for (let attempt = 0; attempt < totalAttempts; attempt++) {
    const now = Date.now();
    let selectedKey: string | null = null;
    let selectedIdx = 0;

    // Prefer a key not yet tried in this call and not in cooldown
    for (let offset = 0; offset < keys.length; offset++) {
      const idx = (keyCursor + offset) % keys.length;
      const candidate = keys[idx];
      const cooldown = keyCooldownUntil.get(candidate) ?? 0;
      if (!triedKeys.has(candidate) && cooldown <= now) {
        selectedKey = candidate;
        selectedIdx = idx;
        keyCursor = (idx + 1) % keys.length;
        break;
      }
    }

    // Next, try any untried key even if previously cooled down
    if (!selectedKey) {
      for (let offset = 0; offset < keys.length; offset++) {
        const idx = (keyCursor + offset) % keys.length;
        const candidate = keys[idx];
        if (!triedKeys.has(candidate)) {
          selectedKey = candidate;
          selectedIdx = idx;
          keyCursor = (idx + 1) % keys.length;
          break;
        }
      }
    }

    // All distinct keys tried once; if none are healthy due to rate limits, wait briefly for round 2
    if (!selectedKey) {
      const lastInfo = lastError ? classifyGeminiError(lastError) : null;
      if (lastInfo?.isPermissionDenied && !lastInfo.isQuota) {
        break;
      }
      const idx = keyCursor % keys.length;
      selectedKey = keys[idx];
      selectedIdx = idx;
      keyCursor = (idx + 1) % keys.length;
      const waitMs = Math.min(3500, Math.max(400, (keyCooldownUntil.get(selectedKey) ?? now) - now));
      await sleep(waitMs);
    }

    triedKeys.add(selectedKey);
    totalRotatedCalls += 1;

    try {
      const ai = createClient(selectedKey);
      const result = await operation(ai, selectedIdx + 1);
      return { result, keySlotUsed: selectedIdx + 1 };
    } catch (err) {
      lastError = err;
      const info = classifyGeminiError(err);

      if (info.isPermissionDenied) {
        keyCooldownUntil.set(selectedKey, Date.now() + 300_000);
        // Move immediately to the next distinct untried key if available
        if (triedKeys.size < keys.length) {
          continue;
        }
        throw err;
      }

      if (!info.retryable) {
        throw err;
      }

      const backoffMs = info.isQuota ? 15_000 : 2500 * Math.pow(1.5, Math.min(attempt, 4));
      keyCooldownUntil.set(selectedKey, Date.now() + backoffMs);
      if (attempt < totalAttempts - 1) {
        await sleep(Math.min(1800, 300 * (attempt + 1)));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Gemini API request failed after rotation');
}

function safeCacheSlug(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_');
}

export function getCachedTables(
  paperId: string,
  lens: TableLens = 'comprehensive'
): CachedTablesPayload | null {
  const filePath = path.join(TABLES_CACHE_DIR, `${safeCacheSlug(paperId)}--${lens}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as CachedTablesPayload;
  } catch {
    return null;
  }
}

const LENS_DIRECTIVES: Record<TableLens, string> = {
  comprehensive:
    'Generate 3 distinct analytical tables covering: (1) Core Technical Architecture & System Layers, (2) Risk Governance, Safeguards & Policy Controls, and (3) Quantitative Targets, Evaluation Metrics & Phased Roadmap milestones explicitly cited in the paper.',
  technical:
    'Generate 3 deeply technical specification tables covering: (1) System Components, Models & Inference Constraints, (2) Data Pipelines, Privacy & Security Controls, and (3) Quantitative Performance, Calibration & Resilience Metrics from the paper.',
  governance:
    'Generate 3 governance and accountability tables covering: (1) Stakeholder Roles, Rights & Accountability Matrix, (2) Algorithmic Risk Classification, Failure Modes & Mitigations, and (3) Regulatory, Audit & Policy Alignment Requirements from the paper.',
  implementation:
    'Generate 3 actionable deployment tables covering: (1) Phased Execution Roadmap & Deliverables, (2) Resource, Infrastructure & Low-Connectivity Adaptation Matrix, and (3) Outcome KPIs, Adoption Gates & Evaluation Thresholds from the paper.',
};

const TABLES_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    tables: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description: 'Short kebab-case slug identifying the table.',
          },
          title: {
            type: Type.STRING,
            description: 'Publication-ready concise table title.',
          },
          subtitle: {
            type: Type.STRING,
            description: 'Single-sentence description of what the table captures.',
          },
          category: {
            type: Type.STRING,
            description: 'Short category label such as Architecture, Governance, Benchmarks, or Roadmap.',
          },
          columns: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '3 to 5 clear column headers.',
          },
          rows: {
            type: Type.ARRAY,
            items: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            description: '5 to 8 rows matching the exact length of columns.',
          },
          keyTakeaway: {
            type: Type.STRING,
            description: 'One concise analytical sentence summarizing the key pattern in this table.',
          },
        },
        required: ['id', 'title', 'subtitle', 'category', 'columns', 'rows', 'keyTakeaway'],
      },
    },
  },
  required: ['tables'],
};

export async function generateStructuredTablesForPaper(
  paper: ResearchPaper,
  lens: TableLens = 'comprehensive',
  force = false
): Promise<{ payload: CachedTablesPayload; fromCache: boolean }> {
  if (!force) {
    const existing = getCachedTables(paper.id, lens);
    if (existing) {
      return { payload: existing, fromCache: true };
    }
  }

  const digest = buildPaperContextDigest(paper);
  const modelsToRotate = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'] as const;

  let generatedTables: GeneratedResearchTable[] | null = null;
  let modelUsed = 'gemini-4-hydrogen';
  let lastModelError: unknown;

  for (const modelName of modelsToRotate) {
    try {
      const { result: response } = await executeWithKeyRotation(async (ai) => {
        const config: Record<string, unknown> = {
          systemInstruction:
            'You are a senior research editor at an African AI policy & engineering journal. Synthesize clear, structured comparative tables grounded strictly in the provided research paper. Never invent numbers, acronyms, or benchmarks not present in the source paper. Keep every cell crisp, scannable, and accurately aligned to columns.',
          responseMimeType: 'application/json',
          responseSchema: TABLES_RESPONSE_SCHEMA,
        };
        if (modelName === 'gemini-4-hydrogen') {
          config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
        }
        return ai.models.generateContent({
          model: modelName,
          contents: `${LENS_DIRECTIVES[lens]}\n\nSOURCE RESEARCH PAPER:\n${digest}`,
          config,
        });
      });

      const rawJson = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawJson) as { tables?: GeneratedResearchTable[] };
      if (Array.isArray(parsed.tables) && parsed.tables.length > 0) {
        generatedTables = parsed.tables.map((t, idx) => {
          const colCount = Math.max(2, t.columns?.length || 3);
          const safeCols = (t.columns || ['Dimension', 'Specification', 'Target']).slice(0, 6);
          const safeRows = (t.rows || []).map((row) => {
            if (row.length === colCount) return row;
            if (row.length < colCount) return [...row, ...Array(colCount - row.length).fill('—')];
            return row.slice(0, colCount);
          });
          return {
            id: t.id || `table-${idx + 1}`,
            title: t.title || `Analytical Matrix ${idx + 1}`,
            subtitle: t.subtitle || '',
            category: t.category || 'Research Synthesis',
            columns: safeCols,
            rows: safeRows,
            keyTakeaway: t.keyTakeaway || '',
          };
        });
        modelUsed = modelName;
        break;
      }
    } catch (err) {
      lastModelError = err;
    }
  }

  if (!generatedTables) {
    throw lastModelError instanceof Error
      ? lastModelError
      : new Error('Unable to synthesize structured tables for this research paper.');
  }

  const payload: CachedTablesPayload = {
    paperId: paper.id,
    lens,
    modelUsed,
    generatedAt: new Date().toISOString(),
    tables: generatedTables,
  };

  const filePath = path.join(TABLES_CACHE_DIR, `${safeCacheSlug(paper.id)}--${lens}.json`);
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');

  return { payload, fromCache: false };
}

function splitSpeechScriptIntoChunks(text: string, maxChars = 1550): string[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let buffer = '';

  const flush = () => {
    if (buffer.trim()) {
      chunks.push(buffer.trim());
      buffer = '';
    }
  };

  for (const para of paragraphs) {
    if (para.length > maxChars) {
      flush();
      const sentences = para.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [para];
      for (const s of sentences) {
        if (buffer.length + s.length > maxChars && buffer.length > 0) {
          flush();
        }
        if (s.length > maxChars) {
          // Hard split extraordinarily long sentence safely
          for (let i = 0; i < s.length; i += maxChars) {
            chunks.push(s.slice(i, i + maxChars).trim());
          }
        } else {
          buffer += (buffer ? ' ' : '') + s.trim();
        }
      }
      flush();
      continue;
    }

    if (buffer.length + para.length + 2 > maxChars) {
      flush();
    }
    buffer += (buffer ? '\n\n' : '') + para;
  }

  flush();
  return chunks.length > 0 ? chunks : [text.slice(0, maxChars)];
}

function extractWavParts(wavBuffer: Buffer): { header: Buffer; pcm: Buffer } {
  const dataMarkerIndex = wavBuffer.indexOf('data', 12, 'ascii');
  if (dataMarkerIndex === -1 || wavBuffer.length < dataMarkerIndex + 8) {
    // Fallback assuming standard 44-byte RIFF PCM WAV header
    const headerLen = Math.min(44, wavBuffer.length);
    return {
      header: Buffer.from(wavBuffer.subarray(0, headerLen)),
      pcm: wavBuffer.subarray(headerLen),
    };
  }
  const headerLen = dataMarkerIndex + 8;
  return {
    header: Buffer.from(wavBuffer.subarray(0, headerLen)),
    pcm: wavBuffer.subarray(headerLen),
  };
}

function concatenateWavBuffers(clips: Buffer[]): Buffer {
  if (clips.length === 0) return Buffer.alloc(0);
  if (clips.length === 1) return clips[0];

  const first = extractWavParts(clips[0]);
  const pcmSegments: Buffer[] = [first.pcm];
  let totalPcmBytes = first.pcm.length;

  for (let i = 1; i < clips.length; i++) {
    const next = extractWavParts(clips[i]);
    pcmSegments.push(next.pcm);
    totalPcmBytes += next.pcm.length;
  }

  const header = Buffer.from(first.header);
  if (header.length >= 44) {
    // RIFF chunk size at bytes 4..7 = (header length - 8) + total PCM data bytes
    header.writeUInt32LE(header.length - 8 + totalPcmBytes, 4);
    // data subchunk size in the final 4 bytes of the header before PCM starts
    header.writeUInt32LE(totalPcmBytes, header.length - 4);
  }

  return Buffer.concat([header, ...pcmSegments]);
}

export function getAudioCachePath(
  paperId: string,
  chapterId: string,
  voiceName: VoiceName
): string {
  return path.join(
    AUDIO_CACHE_DIR,
    `${safeCacheSlug(paperId)}--${safeCacheSlug(chapterId)}--${safeCacheSlug(voiceName)}.wav`
  );
}

export function hasCachedAudio(
  paperId: string,
  chapterId: string,
  voiceName: VoiceName
): boolean {
  return fs.existsSync(getAudioCachePath(paperId, chapterId, voiceName));
}

export async function generateOrGetChapterAudio(options: {
  paperId: string;
  chapterId: string;
  spokenText: string;
  voiceName: VoiceName;
}): Promise<{
  filePath: string;
  fromCache: boolean;
  byteLength: number;
  modelUsed: string;
  keySlotUsed?: number;
}> {
  const { paperId, chapterId, spokenText, voiceName } = options;
  const cachePath = getAudioCachePath(paperId, chapterId, voiceName);

  if (fs.existsSync(cachePath)) {
    const stat = fs.statSync(cachePath);
    if (stat.size > 44) {
      return {
        filePath: cachePath,
        fromCache: true,
        byteLength: stat.size,
        modelUsed: 'cache',
      };
    }
  }

  const chunks = splitSpeechScriptIntoChunks(spokenText, 1550);
  const clipBuffers: Buffer[] = [];
  let lastModelUsed: string = TTS_MODELS_TO_ROTATE[0];
  let lastKeySlotUsed: number | undefined;

  for (const chunkText of chunks) {
    let chunkBase64: string | undefined;
    let lastTtsErr: unknown;

    for (const ttsModel of TTS_MODELS_TO_ROTATE) {
      try {
        const { result: response, keySlotUsed } = await executeWithKeyRotation(async (ai) => {
          try {
            return await ai.models.generateContent({
              model: ttsModel,
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: chunkText,
                      speechMetadata: {
                        style:
                          'Clear, measured, authoritative academic research narrator delivering a technical policy briefing.',
                      },
                    },
                  ],
                },
              ],
              config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName },
                  },
                },
              },
            });
          } catch (innerErr) {
            const msg = innerErr instanceof Error ? innerErr.message : String(innerErr);
            if (msg.includes('speechMetadata')) {
              return ai.models.generateContent({
                model: ttsModel,
                contents: [
                  {
                    role: 'user',
                    parts: [
                      {
                        text: `Read aloud in a clear, measured, authoritative academic voice: ${chunkText}`,
                      },
                    ],
                  },
                ],
                config: {
                  responseModalities: ['AUDIO'],
                  speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName },
                    },
                  },
                },
              });
            }
            throw innerErr;
          }
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
          throw new Error('TTS model returned an empty audio payload.');
        }

        chunkBase64 = base64Audio;
        lastModelUsed = ttsModel;
        lastKeySlotUsed = keySlotUsed;
        break;
      } catch (err) {
        lastTtsErr = err;
        const info = classifyGeminiError(err);
        // If every configured key lacks API permission (403/401), do not spam another model
        if (info.isPermissionDenied) {
          throw err;
        }
      }
    }

    if (!chunkBase64) {
      throw lastTtsErr instanceof Error
        ? lastTtsErr
        : new Error('Unable to synthesize audio across configured TTS models.');
    }

    clipBuffers.push(Buffer.from(chunkBase64, 'base64'));
  }

  const finalWav = concatenateWavBuffers(clipBuffers);
  fs.writeFileSync(cachePath, finalWav);

  return {
    filePath: cachePath,
    fromCache: false,
    byteLength: finalWav.length,
    modelUsed: lastModelUsed,
    keySlotUsed: lastKeySlotUsed,
  };
}

export interface PaperAudioStatusItem {
  paperId: string;
  title: string;
  category: string;
  publishDate: string;
  briefCached: boolean;
  allChaptersCached: boolean;
  cachedChapters: number;
  totalChapters: number;
  briefEstimatedSeconds: number;
  totalEstimatedSeconds: number;
  briefAudioUrl: string;
}

export function getAudioLibraryInventory(voiceName: VoiceName) {
  const papers = getAllPapers();
  let totalChapters = 0;
  let cachedChapters = 0;
  let convertedBriefCount = 0;
  let fullyConvertedCount = 0;

  const items: PaperAudioStatusItem[] = papers.map((paper) => {
    const chapters = getChaptersForPaper(paper);
    const cachedList = chapters.filter((ch) => hasCachedAudio(paper.id, ch.id, voiceName));
    const briefCached = hasCachedAudio(paper.id, 'brief', voiceName);
    const allChaptersCached = chapters.length > 0 && cachedList.length === chapters.length;

    totalChapters += chapters.length;
    cachedChapters += cachedList.length;
    if (briefCached) convertedBriefCount += 1;
    if (allChaptersCached) fullyConvertedCount += 1;

    const briefChapter = chapters.find((ch) => ch.id === 'brief') || chapters[0];
    const totalEstimatedSeconds = chapters.reduce((sum, ch) => sum + ch.estimatedSeconds, 0);

    return {
      paperId: paper.id,
      title: paper.title,
      category: paper.category,
      publishDate: paper.publishDate,
      briefCached,
      allChaptersCached,
      cachedChapters: cachedList.length,
      totalChapters: chapters.length,
      briefEstimatedSeconds: briefChapter?.estimatedSeconds || 90,
      totalEstimatedSeconds,
      briefAudioUrl: `/api/research/${encodeURIComponent(paper.id)}/audio/brief?voice=${encodeURIComponent(voiceName)}`,
    };
  });

  const pool = getRotationPoolStatus();

  return {
    voice: voiceName,
    models: TTS_MODELS_TO_ROTATE,
    ...pool,
    totalPapers: papers.length,
    convertedBriefCount,
    fullyConvertedCount,
    totalChapters,
    cachedChapters,
    items,
  };
}

export async function convertPaperAudioScope(options: {
  paper: ResearchPaper;
  voiceName: VoiceName;
  scope: 'brief' | 'all';
}): Promise<{
  paperId: string;
  voice: VoiceName;
  scope: 'brief' | 'all';
  chaptersSynthesized: number;
  chaptersFromCache: number;
  totalChapters: number;
  totalBytes: number;
  modelUsed: string;
  keySlotUsed?: number;
  briefAudioUrl: string;
}> {
  const { paper, voiceName, scope } = options;
  const allChapters = getChaptersForPaper(paper);
  const targetChapters =
    scope === 'all'
      ? allChapters
      : [allChapters.find((ch) => ch.id === 'brief') || allChapters[0]].filter(Boolean);

  let chaptersSynthesized = 0;
  let chaptersFromCache = 0;
  let totalBytes = 0;
  let modelUsed = 'cache';
  let keySlotUsed: number | undefined;

  for (const chapter of targetChapters) {
    const result = await generateOrGetChapterAudio({
      paperId: paper.id,
      chapterId: chapter.id,
      spokenText: chapter.spokenText,
      voiceName,
    });
    if (result.fromCache) {
      chaptersFromCache += 1;
    } else {
      chaptersSynthesized += 1;
      modelUsed = result.modelUsed;
      if (result.keySlotUsed) keySlotUsed = result.keySlotUsed;
    }
    totalBytes += result.byteLength;
  }

  return {
    paperId: paper.id,
    voice: voiceName,
    scope,
    chaptersSynthesized,
    chaptersFromCache,
    totalChapters: targetChapters.length,
    totalBytes,
    modelUsed,
    keySlotUsed,
    briefAudioUrl: `/api/research/${encodeURIComponent(paper.id)}/audio/brief?voice=${encodeURIComponent(voiceName)}`,
  };
}
