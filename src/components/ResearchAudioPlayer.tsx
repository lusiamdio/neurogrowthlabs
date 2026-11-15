import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Download,
  Headphones,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
} from 'lucide-react';
import type { ResearchPaper } from '../data/academyData';
import { buildPaperAudioChapters } from '../utils/tableParser';
import {
  formatAudioTime,
  RESEARCH_VOICES,
  useResearchAudio,
  type ChapterInventoryItem,
  type VoiceOptionId,
} from './ResearchAudioContext';

interface ResearchAudioPlayerProps {
  paper: ResearchPaper;
  autoPlayOnMount?: boolean;
}

const SPEED_OPTIONS = [0.85, 1.0, 1.15, 1.25, 1.5];

export default function ResearchAudioPlayer({
  paper,
  autoPlayOnMount = false,
}: ResearchAudioPlayerProps) {
  const {
    activePaper,
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
    getDownloadUrl,
  } = useResearchAudio();

  const [chapters, setChapters] = useState<ChapterInventoryItem[]>(() =>
    buildPaperAudioChapters(paper)
  );
  const [selectedChapterId, setSelectedChapterId] = useState<string>('brief');

  const isThisPaperActive = activePaper?.id === paper.id;

  useEffect(() => {
    let cancelled = false;
    const initial = buildPaperAudioChapters(paper);
    setChapters(initial);
    setSelectedChapterId(
      isThisPaperActive ? activeChapterId : initial[0]?.id || 'brief'
    );

    loadChaptersForPaper(paper, voice).then((loaded) => {
      if (!cancelled && loaded.length > 0) {
        setChapters(loaded);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [paper, voice, loadChaptersForPaper, isThisPaperActive, activeChapterId]);

  useEffect(() => {
    if (autoPlayOnMount && !isThisPaperActive) {
      void playPaperChapter(paper, 'brief', voice);
    }
  }, [autoPlayOnMount, isThisPaperActive, paper, playPaperChapter, voice]);

  useEffect(() => {
    if (isThisPaperActive) {
      setSelectedChapterId(activeChapterId);
    }
  }, [activeChapterId, isThisPaperActive]);

  const currentChapter = useMemo(
    () => chapters.find((c) => c.id === selectedChapterId) || chapters[0],
    [chapters, selectedChapterId]
  );

  const effectiveDuration = isThisPaperActive
    ? duration || currentChapter?.estimatedSeconds || 60
    : currentChapter?.estimatedSeconds || 60;

  const effectiveTime = isThisPaperActive ? currentTime : 0;

  const totalMinutes = useMemo(() => {
    const totalSecs = chapters.reduce((sum, ch) => sum + ch.estimatedSeconds, 0);
    return Math.max(1, Math.round(totalSecs / 60));
  }, [chapters]);

  const handlePrimaryPlayClick = () => {
    if (isThisPaperActive && activeChapterId === selectedChapterId) {
      togglePlayPause();
    } else {
      void playPaperChapter(paper, selectedChapterId, voice);
    }
  };

  const handleSelectChapter = (chId: string) => {
    setSelectedChapterId(chId);
    void playPaperChapter(paper, chId, voice);
  };

  const cycleSpeed = () => {
    const idx = SPEED_OPTIONS.indexOf(playbackRate);
    const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
    setPlaybackRate(next);
  };

  return (
    <section
      aria-label="Audio Edition of Research Paper"
      className="rounded-xl bg-[#0d121d] light:bg-[#F7F4EE] p-5 sm:p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] light:shadow-[inset_0_0_0_1px_rgba(28,25,23,0.12)] space-y-5"
    >
      {/* Masthead Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-400 light:text-stone-600">
            <Headphones className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
            <span className="font-medium text-[#c5a059] light:text-[#78350F]">Audio Edition</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{chapters.length} Chapters</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">~{totalMinutes} min total</span>
          </div>
          <h2 className="font-serif text-lg sm:text-xl font-medium text-white light:text-stone-900 truncate">
            {currentChapter?.title || 'Executive Audio Briefing'}
          </h2>
        </div>

        {/* Voice & Speed Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <label className="sr-only" htmlFor={`voice-select-${paper.id}`}>
            Narrator voice
          </label>
          <select
            id={`voice-select-${paper.id}`}
            value={voice}
            onChange={(e) => setVoice(e.target.value as VoiceOptionId)}
            className="h-10 px-3 rounded-lg bg-white/[0.05] light:bg-white text-xs font-medium text-slate-200 light:text-stone-800 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] light:shadow-[inset_0_0_0_1px_rgba(28,25,23,0.15)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a059] cursor-pointer"
          >
            {RESEARCH_VOICES.map((v) => (
              <option key={v.id} value={v.id} className="bg-[#0d121d] text-white light:bg-white light:text-stone-900">
                {v.label} · {v.tone}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={cycleSpeed}
            title="Adjust playback speed"
            className="h-10 px-3 rounded-lg bg-white/[0.05] light:bg-white hover:bg-white/10 light:hover:bg-stone-100 text-xs font-mono tabular-nums font-medium text-slate-200 light:text-stone-800 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] light:shadow-[inset_0_0_0_1px_rgba(28,25,23,0.15)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {playbackRate.toFixed(2).replace(/\.00$/, '.0')}×
          </button>

          <a
            href={getDownloadUrl(paper, selectedChapterId, voice)}
            className="h-10 px-3.5 rounded-lg bg-white/[0.05] light:bg-white hover:bg-white/10 light:hover:bg-stone-100 text-xs font-medium text-slate-200 light:text-stone-800 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] light:shadow-[inset_0_0_0_1px_rgba(28,25,23,0.15)] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            title="Download WAV audio for offline listening"
          >
            <Download className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>WAV</span>
          </a>
        </div>
      </div>

      {/* Main Transport Bar */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={handlePrimaryPlayClick}
          disabled={isSynthesizing && isThisPaperActive}
          aria-label={isThisPaperActive && isPlaying ? 'Pause narration' : 'Play narration'}
          className="w-11 h-11 rounded-full bg-[#c5a059] hover:bg-white light:hover:bg-stone-900 light:hover:text-white text-[#080b11] flex items-center justify-center shrink-0 transition-colors shadow-sm cursor-pointer disabled:opacity-60"
        >
          {isSynthesizing && isThisPaperActive ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isThisPaperActive && isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => skipBy(-15)}
          disabled={!isThisPaperActive}
          aria-label="Rewind 15 seconds"
          className="w-10 h-10 rounded-lg hover:bg-white/[0.06] light:hover:bg-stone-200/60 text-slate-300 light:text-stone-700 flex items-center justify-center shrink-0 transition-colors disabled:opacity-40 cursor-pointer"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <div className="flex-1 flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono tabular-nums text-slate-400 light:text-stone-600 w-11 text-right shrink-0">
            {formatAudioTime(effectiveTime)}
          </span>

          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min={0}
              max={Math.max(1, effectiveDuration)}
              value={Math.min(effectiveTime, Math.max(1, effectiveDuration))}
              onChange={(e) => {
                if (isThisPaperActive) {
                  seekTo(Number(e.target.value));
                }
              }}
              disabled={!isThisPaperActive}
              aria-label="Audio chapter timeline"
              className="w-full accent-[#c5a059] cursor-pointer h-1.5 rounded-full bg-white/10 light:bg-stone-300 disabled:cursor-default"
            />
          </div>

          <span className="text-xs font-mono tabular-nums text-slate-400 light:text-stone-600 w-11 shrink-0">
            {formatAudioTime(effectiveDuration)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => skipBy(15)}
          disabled={!isThisPaperActive}
          aria-label="Forward 15 seconds"
          className="w-10 h-10 rounded-lg hover:bg-white/[0.06] light:hover:bg-stone-200/60 text-slate-300 light:text-stone-700 flex items-center justify-center shrink-0 transition-colors disabled:opacity-40 cursor-pointer"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Status / Error Banner */}
      {isThisPaperActive && isSynthesizing && (
        <div className="flex items-center gap-2.5 text-xs text-slate-300 light:text-stone-700 bg-white/[0.03] light:bg-stone-200/60 px-3.5 py-2.5 rounded-lg">
          <Volume2 className="w-4 h-4 text-[#c5a059] shrink-0" />
          <span>Synthesizing chapter audio via Gemini Speech Engine. First synthesis is cached for instant replay.</span>
        </div>
      )}

      {isThisPaperActive && error && !isSynthesizing && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-rose-300 light:text-rose-800 bg-rose-500/10 px-3.5 py-2.5 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => void playPaperChapter(paper, selectedChapterId, voice)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-white light:text-rose-900 font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Chapter Switcher Rail */}
      <div className="pt-1">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {chapters.map((ch) => {
            const isSelected = ch.id === selectedChapterId;
            const isChapterPlaying = isThisPaperActive && activeChapterId === ch.id && isPlaying;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => handleSelectChapter(ch.id)}
                className={`px-3.5 py-2 rounded-lg text-xs transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#c5a059]/20 text-[#e7c888] light:bg-stone-900 light:text-white font-semibold shadow-[inset_0_0_0_1px_rgba(197,160,89,0.45)]'
                    : 'bg-white/[0.03] light:bg-white hover:bg-white/[0.07] light:hover:bg-stone-100 text-slate-300 light:text-stone-700'
                }`}
              >
                <span className="font-mono tabular-nums text-[11px] opacity-75">
                  {String(ch.index + 1).padStart(2, '0')}
                </span>
                <span className="max-w-[190px] truncate">{ch.title}</span>
                <span className="font-mono tabular-nums text-[11px] opacity-65">
                  {isChapterPlaying ? 'Playing' : formatAudioTime(ch.estimatedSeconds)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
