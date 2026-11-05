import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  Check,
  Music,
  Megaphone,
  HeartHandshake,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Sliders,
  ChevronRight,
  Info,
} from 'lucide-react';
import { ChurchService, ServiceSegment } from '../types';
import { formatSeconds, parseTimeToSeconds } from '../utils/time';

interface VideoTimelineScrubberProps {
  service: ChurchService;
  currentTime: number;
  isPlaying: boolean;
  onSeek: (seconds: number) => void;
  onTogglePlay: () => void;
  sermonStartSec: number;
  sermonEndSec: number;
  onSetSermonStart: (seconds: number) => void;
  onSetSermonEnd: (seconds: number) => void;
  segments: ServiceSegment[];
  onToggleSegmentExcluded: (id: string) => void;
  onStartTranscription: () => void;
  isTranscribing: boolean;
}

export const VideoTimelineScrubber: React.FC<VideoTimelineScrubberProps> = ({
  service,
  currentTime,
  isPlaying,
  onSeek,
  onTogglePlay,
  sermonStartSec,
  sermonEndSec,
  onSetSermonStart,
  onSetSermonEnd,
  segments,
  onToggleSegmentExcluded,
  onStartTranscription,
  isTranscribing,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [startInputText, setStartInputText] = useState(formatSeconds(sermonStartSec));
  const [endInputText, setEndInputText] = useState(formatSeconds(sermonEndSec));
  const [isDragging, setIsDragging] = useState<'playhead' | 'start' | 'end' | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Sync inputs when props change
  useEffect(() => {
    setStartInputText(formatSeconds(sermonStartSec));
  }, [sermonStartSec]);

  useEffect(() => {
    setEndInputText(formatSeconds(sermonEndSec));
  }, [sermonEndSec]);

  const duration = service.durationSec || 4920;
  const sermonDuration = Math.max(0, sermonEndSec - sermonStartSec);

  // Calculate total excluded time
  const excludedSec = segments
    .filter((s) => s.excluded)
    .reduce((acc, curr) => acc + (curr.endSec - curr.startSec), 0);
  const percentSaved = Math.round((excludedSec / duration) * 100);

  // Dragging / scrubbing calculations
  const calculateSecondsFromEvent = (e: React.MouseEvent | MouseEvent) => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const relativeX = Math.max(0, Math.min(rect.width, clientX - rect.width - rect.left + rect.width));
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.floor(ratio * duration);
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    const targetSec = calculateSecondsFromEvent(e);
    onSeek(targetSec);
  };

  const handleMouseDown = (type: 'playhead' | 'start' | 'end') => (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(type);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const targetSec = calculateSecondsFromEvent(e);

      if (isDragging === 'playhead') {
        onSeek(targetSec);
      } else if (isDragging === 'start') {
        const clampedStart = Math.min(targetSec, sermonEndSec - 10);
        onSetSermonStart(Math.max(0, clampedStart));
      } else if (isDragging === 'end') {
        const clampedEnd = Math.max(targetSec, sermonStartSec + 10);
        onSetSermonEnd(Math.min(duration, clampedEnd));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, duration, sermonStartSec, sermonEndSec, onSeek, onSetSermonStart, onSetSermonEnd]);

  // Handle direct manual timestamp submission
  const handleApplyStart = () => {
    const parsed = parseTimeToSeconds(startInputText);
    if (!isNaN(parsed) && parsed >= 0 && parsed < sermonEndSec) {
      onSetSermonStart(parsed);
    } else {
      setStartInputText(formatSeconds(sermonStartSec));
    }
  };

  const handleApplyEnd = () => {
    const parsed = parseTimeToSeconds(endInputText);
    if (!isNaN(parsed) && parsed > sermonStartSec && parsed <= duration) {
      onSetSermonEnd(parsed);
    } else {
      setEndInputText(formatSeconds(sermonEndSec));
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'worship':
        return <Music className="w-4 h-4 text-amber-400" />;
      case 'announcements':
        return <Megaphone className="w-4 h-4 text-blue-400" />;
      case 'offering':
        return <HeartHandshake className="w-4 h-4 text-purple-400" />;
      case 'sermon':
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Video Viewport & Scrubbing Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Video Player Container (7 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {/* Video Player Display */}
          <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
            {service.videoSourceType === 'youtube' && service.youtubeId ? (
              <iframe
                title={service.title}
                src={`https://www.youtube-nocookie.com/embed/${service.youtubeId}?start=${Math.floor(currentTime)}&autoplay=0&enablejsapi=1&rel=0&modestbranding=1`}
                className="w-full h-full border-0 pointer-events-auto"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={service.thumbnailUrl}
                  alt={service.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-85"
                />
                {/* Simulated playback visual overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                {/* Simulated playhead state banner */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700">
                    <span className="font-semibold text-amber-400">
                      {currentTime >= sermonStartSec && currentTime <= sermonEndSec
                        ? '🟢 SERMON WINDOW (TO TRANSCRIBE)'
                        : '⛔ EXCLUDED PRE-SERMON SEGMENT'}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="font-mono tabular-nums text-slate-200">
                      {formatSeconds(currentTime)}
                    </span>
                  </div>
                  <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 font-mono tabular-nums text-slate-300">
                    Total: {formatSeconds(duration)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Playhead Transport Bar */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={onTogglePlay}
                className="w-9 h-9 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium flex items-center justify-center transition-colors shadow-sm"
                title={isPlaying ? 'Pause Service' : 'Play Service'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => onSeek(Math.max(0, currentTime - 10))}
                className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 border border-slate-700 transition-colors"
                title="Rewind 10 seconds"
              >
                -10s
              </button>
              <button
                onClick={() => onSeek(Math.max(0, currentTime - 1))}
                className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 border border-slate-700 transition-colors"
                title="Rewind 1 second"
              >
                -1s
              </button>
              <button
                onClick={() => onSeek(Math.min(duration, currentTime + 1))}
                className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 border border-slate-700 transition-colors"
                title="Forward 1 second"
              >
                +1s
              </button>
              <button
                onClick={() => onSeek(Math.min(duration, currentTime + 10))}
                className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 border border-slate-700 transition-colors"
                title="Forward 10 seconds"
              >
                +10s
              </button>

              <div className="h-5 w-px bg-slate-800 mx-1" />

              <div className="text-xs font-mono tabular-nums text-slate-300">
                <span className="text-white font-medium">{formatSeconds(currentTime)}</span>
                <span className="text-slate-500 mx-1.5">/</span>
                <span className="text-slate-400">{formatSeconds(duration)}</span>
              </div>
            </div>

            {/* Quick In/Out buttons for scrubbing playhead */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSetSermonStart(currentTime)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-950/80 hover:text-emerald-400 hover:border-emerald-700/60 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 transition-colors flex items-center gap-1.5"
                title="Set current playhead as Sermon Start"
              >
                <span className="text-emerald-400 font-bold">[</span>
                <span>Set Sermon Start</span>
              </button>
              <button
                onClick={() => onSetSermonEnd(currentTime)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-950/80 hover:text-emerald-400 hover:border-emerald-700/60 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 transition-colors flex items-center gap-1.5"
                title="Set current playhead as Sermon End"
              >
                <span>Set Sermon End</span>
                <span className="text-emerald-400 font-bold">]</span>
              </button>
              <button
                onClick={() => onSeek(sermonStartSec)}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-colors"
                title="Jump directly to Sermon Start"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Church Service Context & Exclusion Summary Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
              <span className="font-medium uppercase tracking-wider text-amber-400">Scrubbing Scope</span>
              <span className="font-mono tabular-nums">{service.churchName}</span>
            </div>

            <h2 className="mt-3 text-base font-bold text-white tracking-tight leading-snug">
              {service.title}
            </h2>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <span>{service.preacher}</span>
              <span>·</span>
              <span className="text-amber-400/90 font-medium">{service.scripture}</span>
            </div>

            {/* Quota & AI Efficiency Card */}
            <div className="mt-4 p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Livestream:</span>
                <span className="font-mono tabular-nums text-slate-200">{formatSeconds(duration)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-medium">Target Sermon Window:</span>
                <span className="font-mono tabular-nums font-semibold text-emerald-400">
                  {formatSeconds(sermonDuration)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-400/90">Excluded Non-Sermon:</span>
                <span className="font-mono tabular-nums text-amber-400/90">
                  {formatSeconds(excludedSec)} ({percentSaved}% skipped)
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-start gap-2 text-xs text-slate-400">
                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Worship songs, offering prayers, and announcements are omitted from transcription and token usage.
                </span>
              </div>
            </div>

            {/* Direct Timestamp Scrub Inputs */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
                  <span>Start (HH:MM:SS)</span>
                  <button
                    onClick={() => onSeek(sermonStartSec)}
                    className="text-[11px] text-amber-400 hover:underline"
                  >
                    Seek
                  </button>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={startInputText}
                    onChange={(e) => setStartInputText(e.target.value)}
                    onBlur={handleApplyStart}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyStart()}
                    className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
                  <span>End (HH:MM:SS)</span>
                  <button
                    onClick={() => onSeek(sermonEndSec)}
                    className="text-[11px] text-amber-400 hover:underline"
                  >
                    Seek
                  </button>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={endInputText}
                    onChange={(e) => setEndInputText(e.target.value)}
                    onBlur={handleApplyEnd}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyEnd()}
                    className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-slate-950 border border-slate-700 rounded-md text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Primary Transcription CTA */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <button
              onClick={onStartTranscription}
              disabled={isTranscribing}
              className={`w-full py-2.5 px-4 rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-all ${
                isTranscribing
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10'
              }`}
            >
              {isTranscribing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  <span>Transcribing Scrubbed Window...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Transcribe Sermon ({formatSeconds(sermonDuration)})</span>
                </>
              )}
            </button>
            <p className="mt-2 text-center text-[11px] text-slate-500">
              Only the highlighted window will be sent to AI.
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Track Scrubbing Timeline Bar */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Interactive Church Service Timeline</h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/30 border border-amber-500" />
              <span>Excluded (Worship/Announce)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 border border-emerald-400" />
              <span className="text-emerald-400 font-medium">Target Sermon</span>
            </span>
          </div>
        </div>

        {/* Visual Timeline Bar */}
        <div className="relative pt-6 pb-4 select-none">
          {/* Timeline background track & waveform simulation */}
          <div
            ref={timelineRef}
            onClick={handleTimelineClick}
            className="relative h-14 w-full bg-slate-950 rounded-lg overflow-hidden cursor-pointer border border-slate-800"
          >
            {/* Simulated audio waveform bars */}
            <div className="absolute inset-0 flex items-center justify-between px-2 opacity-25 pointer-events-none">
              {Array.from({ length: 96 }).map((_, i) => {
                const heightPercent = 20 + Math.sin(i * 0.3) * 25 + ((i * 7) % 45);
                return (
                  <div
                    key={i}
                    style={{ height: `${heightPercent}%` }}
                    className="w-1 bg-slate-400 rounded-full"
                  />
                );
              })}
            </div>

            {/* Pre-configured Service Segments Blocks */}
            {segments.map((seg) => {
              const leftPercent = (seg.startSec / duration) * 100;
              const widthPercent = ((seg.endSec - seg.startSec) / duration) * 100;
              const isExcluded = seg.excluded;

              return (
                <div
                  key={seg.id}
                  style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                  className={`absolute top-0 bottom-0 border-r border-slate-900/60 transition-opacity flex flex-col justify-between p-1.5 overflow-hidden text-[10px] ${
                    isExcluded
                      ? 'bg-slate-800/80 opacity-70 border-dashed'
                      : 'bg-emerald-950/60 border-l border-emerald-500/50'
                  }`}
                  title={`${seg.title} (${formatSeconds(seg.startSec)} - ${formatSeconds(seg.endSec)}) - ${
                    isExcluded ? 'Excluded' : 'Included'
                  }`}
                >
                  <div className="flex items-center gap-1 truncate font-medium">
                    {getCategoryIcon(seg.category)}
                    <span className={`truncate ${isExcluded ? 'text-slate-400 line-through' : 'text-emerald-300 font-semibold'}`}>
                      {seg.title}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                    <span>{formatSeconds(seg.startSec, false)}</span>
                    {isExcluded && <span className="text-amber-400/80 font-bold">EXCLUDED</span>}
                    <span>{formatSeconds(seg.endSec, false)}</span>
                  </div>
                </div>
              );
            })}

            {/* Highlighted Sermon Transcription Target Region */}
            <div
              style={{
                left: `${(sermonStartSec / duration) * 100}%`,
                width: `${((sermonEndSec - sermonStartSec) / duration) * 100}%`,
              }}
              className="absolute top-0 bottom-0 bg-emerald-500/15 border-y-2 border-emerald-400 pointer-events-none z-10"
            />

            {/* Draggable Start Handle */}
            <div
              style={{ left: `${(sermonStartSec / duration) * 100}%` }}
              onMouseDown={handleMouseDown('start')}
              className="absolute top-0 bottom-0 w-2.5 -translate-x-1/2 bg-emerald-400 hover:bg-emerald-300 cursor-ew-resize z-20 flex items-center justify-center shadow-lg"
              title="Drag to adjust Sermon Start point"
            >
              <div className="w-0.5 h-6 bg-slate-950 rounded-full" />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-bold font-mono whitespace-nowrap shadow">
                IN: {formatSeconds(sermonStartSec, false)}
              </div>
            </div>

            {/* Draggable End Handle */}
            <div
              style={{ left: `${(sermonEndSec / duration) * 100}%` }}
              onMouseDown={handleMouseDown('end')}
              className="absolute top-0 bottom-0 w-2.5 -translate-x-1/2 bg-emerald-400 hover:bg-emerald-300 cursor-ew-resize z-20 flex items-center justify-center shadow-lg"
              title="Drag to adjust Sermon End point"
            >
              <div className="w-0.5 h-6 bg-slate-950 rounded-full" />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-bold font-mono whitespace-nowrap shadow">
                OUT: {formatSeconds(sermonEndSec, false)}
              </div>
            </div>

            {/* Current Playhead Indicator */}
            <div
              style={{ left: `${(currentTime / duration) * 100}%` }}
              onMouseDown={handleMouseDown('playhead')}
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 cursor-ew-resize z-30 pointer-events-auto"
            >
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-mono font-bold whitespace-nowrap shadow">
                {formatSeconds(currentTime, false)}
              </div>
            </div>
          </div>
        </div>

        {/* Excluded Non-Sermon Segments Toggles */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Service Segments Excluded From AI Transcription
            </span>
            <span className="text-xs text-slate-500">
              Check/uncheck to adjust transcription boundaries
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {segments.map((seg) => {
              const isExcluded = seg.excluded;
              const isSermon = seg.category === 'sermon';

              return (
                <div
                  key={seg.id}
                  onClick={() => {
                    if (isSermon) {
                      onSeek(seg.startSec);
                    } else {
                      onToggleSegmentExcluded(seg.id);
                    }
                  }}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSermon
                      ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500'
                      : isExcluded
                      ? 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-900 border-amber-500/40 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(seg.category)}
                      <span className="text-xs font-semibold text-white truncate">{seg.title}</span>
                    </div>

                    {!isSermon ? (
                      <input
                        type="checkbox"
                        checked={isExcluded}
                        onChange={() => onToggleSegmentExcluded(seg.id)}
                        className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer"
                        title={isExcluded ? 'Marked as EXCLUDED' : 'Included in audio'}
                      />
                    ) : (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        TARGET
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>
                      {formatSeconds(seg.startSec, false)} – {formatSeconds(seg.endSec, false)}
                    </span>
                    <span>{Math.round((seg.endSec - seg.startSec) / 60)} min</span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <span className={isExcluded ? 'text-amber-400/90 font-medium' : isSermon ? 'text-emerald-400' : 'text-slate-400'}>
                      {isSermon ? 'Included in full transcript' : isExcluded ? 'Excluded from AI' : 'Will be transcribed'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSeek(seg.startSec);
                      }}
                      className="text-slate-400 hover:text-white underline text-[10px]"
                    >
                      Seek to start
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
