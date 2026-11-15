import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Download,
  Loader2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  X,
} from 'lucide-react';
import type { ResearchPaper } from '../data/academyData';
import { buildPaperAudioChapters, type ArticleChapter } from '../utils/tableParser';

export const RESEARCH_VOICES = [
  { id: 'Kore', label: 'Kore', tone: 'Crisp Editorial' },
  { id: 'Charon', label: 'Charon', tone: 'Deep Authoritative' },
  { id: 'Zephyr', label: 'Zephyr', tone: 'Warm Narrative' },
  { id: 'Puck', label: 'Puck', tone: 'Clear Analytical' },
  { id: 'Fenrir', label: 'Fenrir', tone: 'Studio Documentary' },
] as const;

export type VoiceOptionId = (typeof RESEARCH_VOICES)[number]['id'];

export interface ChapterInventoryItem {
  id: string;
  index: number;
  title: string;
  kind: 'brief' | 'abstract' | 'section';
  estimatedSeconds: number;
  wordCount: number;
  cached?: boolean;
}

interface ResearchAudioContextValue {
  activePaper: ResearchPaper | null;
  chapters: ChapterInventoryItem[];
  activeChapterId: string;
  voice: VoiceOptionId;
  playbackRate: number;
  isPlaying: boolean;
  isSynthesizing: boolean;
  currentTime: number;
  duration: number;
  error: string | null;
  loadChaptersForPaper: (paper: ResearchPaper, voiceOverride?: VoiceOptionId) => Promise<ChapterInventoryItem[]>;
  playPaperChapter: (
    paper: ResearchPaper,
    chapterId?: string,
    voiceOverride?: VoiceOptionId
  ) => Promise<void>;
  togglePlayPause: () => void;
  seekTo: (seconds: number) => void;
  skipBy: (deltaSeconds: number) => void;
  setVoice: (voice: VoiceOptionId) => void;
  setPlaybackRate: (rate: number) => void;
  stopAudio: () => void;
  getDownloadUrl: (paper: ResearchPaper, chapterId: string, voiceOverride?: VoiceOptionId) => string;
}

const ResearchAudioContext = createContext<ResearchAudioContextValue | undefined>(undefined);

export function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function ResearchAudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const location = useLocation();

  const [activePaper, setActivePaper] = useState<ResearchPaper | null>(null);
  const [chaptersByPaper, setChaptersByPaper] = useState<Record<string, ChapterInventoryItem[]>>({});
  const [activeChapterId, setActiveChapterId] = useState<string>('brief');
  const [voice, setVoiceState] = useState<VoiceOptionId>('Kore');
  const [playbackRate, setPlaybackRateState] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Maintain single browser audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    const onAudioError = () => {
      setIsPlaying(false);
      setIsSynthesizing(false);
      setError('Unable to decode audio stream. Please try again.');
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onAudioError);

    return () => {
      audio.pause();
      audio.src = '';
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onAudioError);
    };
  }, []);

  const loadChaptersForPaper = useCallback(
    async (paper: ResearchPaper, voiceOverride?: VoiceOptionId): Promise<ChapterInventoryItem[]> => {
      const localFallback: ArticleChapter[] = buildPaperAudioChapters(paper);
      const v = voiceOverride || voice;

      setChaptersByPaper((prev) =>
        prev[paper.id] ? prev : { ...prev, [paper.id]: localFallback }
      );

      try {
        const res = await fetch(
          `/api/research/${encodeURIComponent(paper.id)}/chapters?voice=${encodeURIComponent(v)}`
        );
        if (res.ok) {
          const data = (await res.json()) as { chapters?: ChapterInventoryItem[] };
          if (Array.isArray(data.chapters) && data.chapters.length > 0) {
            setChaptersByPaper((prev) => ({ ...prev, [paper.id]: data.chapters! }));
            return data.chapters;
          }
        }
      } catch {
        // Fallback to local chapter segmentation if server probe fails
      }
      return localFallback;
    },
    [voice]
  );

  const playPaperChapter = useCallback(
    async (paper: ResearchPaper, chapterId = 'brief', voiceOverride?: VoiceOptionId) => {
      const targetVoice = voiceOverride || voice;
      setActivePaper(paper);
      setActiveChapterId(chapterId);
      setError(null);
      setIsSynthesizing(true);

      const audio = audioRef.current;
      if (audio) {
        audio.pause();
      }

      try {
        // Ensure chapters are populated
        void loadChaptersForPaper(paper, targetVoice);

        const res = await fetch(`/api/research/${encodeURIComponent(paper.id)}/audio`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chapterId, voice: targetVoice }),
        });

        const data = (await res.json()) as {
          audioUrl?: string;
          estimatedSeconds?: number;
          error?: string;
        };

        if (!res.ok || !data.audioUrl) {
          throw new Error(data.error || 'Failed to generate audio edition.');
        }

        // Update cached indicator on this chapter
        setChaptersByPaper((prev) => {
          const existing = prev[paper.id];
          if (!existing) return prev;
          return {
            ...prev,
            [paper.id]: existing.map((c) => (c.id === chapterId ? { ...c, cached: true } : c)),
          };
        });

        if (audioRef.current) {
          audioRef.current.src = data.audioUrl;
          audioRef.current.playbackRate = playbackRate;
          setCurrentTime(0);
          setDuration(data.estimatedSeconds || 0);
          await audioRef.current.play();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to generate audio edition.');
        setIsPlaying(false);
      } finally {
        setIsSynthesizing(false);
      }
    },
    [loadChaptersForPaper, playbackRate, voice]
  );

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else if (audio.src) {
      audio.play().catch((err) => {
        setError(err instanceof Error ? err.message : 'Playback interrupted.');
      });
    } else if (activePaper) {
      void playPaperChapter(activePaper, activeChapterId, voice);
    }
  }, [activeChapterId, activePaper, isPlaying, playPaperChapter, voice]);

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(seconds)) return;
    const clamped = Math.max(0, Math.min(seconds, audio.duration || seconds));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
  }, []);

  const skipBy = useCallback(
    (deltaSeconds: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      seekTo((audio.currentTime || 0) + deltaSeconds);
    },
    [seekTo]
  );

  const setVoice = useCallback(
    (newVoice: VoiceOptionId) => {
      setVoiceState(newVoice);
      if (activePaper && (isPlaying || audioRef.current?.src)) {
        void playPaperChapter(activePaper, activeChapterId, newVoice);
      }
    },
    [activeChapterId, activePaper, isPlaying, playPaperChapter]
  );

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setActivePaper(null);
    setIsPlaying(false);
    setIsSynthesizing(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
  }, []);

  const getDownloadUrl = useCallback(
    (paper: ResearchPaper, chapterId: string, voiceOverride?: VoiceOptionId) => {
      const v = voiceOverride || voice;
      return `/api/research/${encodeURIComponent(paper.id)}/audio/${encodeURIComponent(chapterId)}?voice=${encodeURIComponent(v)}&download=1`;
    },
    [voice]
  );

  const chapters = useMemo(() => {
    if (!activePaper) return [];
    return chaptersByPaper[activePaper.id] || buildPaperAudioChapters(activePaper);
  }, [activePaper, chaptersByPaper]);

  const activeChapter = useMemo(
    () => chapters.find((c) => c.id === activeChapterId) || chapters[0],
    [activeChapterId, chapters]
  );

  // Show compact docked player on catalog pages when actively listening/loading
  const isOnSameArticlePage =
    activePaper &&
    (location.pathname === `/research/${activePaper.id}` ||
      location.pathname === `/academy/research/${activePaper.id}`);

  const showFloatingDock = Boolean(activePaper && !isOnSameArticlePage);

  const value: ResearchAudioContextValue = {
    activePaper,
    chapters,
    activeChapterId,
    voice,
    playbackRate,
    isPlaying,
    isSynthesizing,
    currentTime,
    duration,
    error,
    loadChaptersForPaper,
    playPaperChapter,
    togglePlayPause,
    seekTo,
    skipBy,
    setVoice,
    setPlaybackRate,
    stopAudio,
    getDownloadUrl,
  };

  return (
    <ResearchAudioContext.Provider value={value}>
      {children}

      {showFloatingDock && activePaper && (
        <div
          role="region"
          aria-label="Active research paper audio player"
          className="fixed bottom-0 inset-x-0 z-40 bg-[#0b101b]/95 light:bg-white/95 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] light:shadow-[0_-8px_24px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(15,23,42,0.08)]"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                onClick={togglePlayPause}
                disabled={isSynthesizing}
                aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
                className="w-10 h-10 rounded-full bg-[#c5a059] hover:bg-white light:hover:bg-stone-900 light:hover:text-white text-[#080b11] flex items-center justify-center shrink-0 transition-colors cursor-pointer disabled:opacity-60"
              >
                {isSynthesizing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs font-medium text-white light:text-stone-900 truncate">
                  <Link
                    to={`/research/${activePaper.id}`}
                    className="hover:text-[#c5a059] transition-colors truncate font-semibold"
                  >
                    {activePaper.title}
                  </Link>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 light:text-stone-600 truncate">
                  <Volume2 className="w-3 h-3 text-[#c5a059] shrink-0" />
                  <span className="truncate">
                    {isSynthesizing
                      ? 'Synthesizing spoken edition...'
                      : error
                        ? error
                        : `${activeChapter?.title || 'Executive Audio Briefing'} · ${voice}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3 w-72">
              <span className="text-[11px] font-mono tabular-nums text-slate-400 light:text-stone-600 w-10 text-right">
                {formatAudioTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={Math.max(1, duration || activeChapter?.estimatedSeconds || 60)}
                value={Math.min(currentTime, Math.max(1, duration || activeChapter?.estimatedSeconds || 60))}
                onChange={(e) => seekTo(Number(e.target.value))}
                aria-label="Seek audio position"
                className="flex-1 accent-[#c5a059] cursor-pointer h-1"
              />
              <span className="text-[11px] font-mono tabular-nums text-slate-400 light:text-stone-600 w-10">
                {formatAudioTime(duration || activeChapter?.estimatedSeconds || 0)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => skipBy(-15)}
                aria-label="Rewind 15 seconds"
                className="hidden sm:flex w-9 h-9 rounded-lg hover:bg-white/10 light:hover:bg-stone-100 text-slate-300 light:text-stone-700 items-center justify-center transition-colors cursor-pointer"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={() => skipBy(15)}
                aria-label="Forward 15 seconds"
                className="hidden sm:flex w-9 h-9 rounded-lg hover:bg-white/10 light:hover:bg-stone-100 text-slate-300 light:text-stone-700 items-center justify-center transition-colors cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
              </button>
              <a
                href={getDownloadUrl(activePaper, activeChapterId)}
                aria-label="Download chapter WAV audio"
                className="w-9 h-9 rounded-lg hover:bg-white/10 light:hover:bg-stone-100 text-slate-300 light:text-stone-700 flex items-center justify-center transition-colors"
                title="Download WAV"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={stopAudio}
                aria-label="Close audio bar"
                className="w-9 h-9 rounded-lg hover:bg-white/10 light:hover:bg-stone-100 text-slate-400 light:text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </ResearchAudioContext.Provider>
  );
}

export function useResearchAudio(): ResearchAudioContextValue {
  const ctx = useContext(ResearchAudioContext);
  if (!ctx) {
    throw new Error('useResearchAudio must be used inside ResearchAudioProvider');
  }
  return ctx;
}
