import React, { useState, useRef, useEffect } from 'react';
import {
  Scissors,
  Sparkles,
  Download,
  Copy,
  Check,
  Play,
  Pause,
  Smartphone,
  Square,
  Tv,
  Share2,
  Clock,
  RotateCcw,
  Sliders,
  Type,
  Maximize2,
  ExternalLink,
} from 'lucide-react';
import { ChurchService, SermonClip, ClipStyleConfig } from '../types';
import { formatSeconds, generateSrtContent, downloadFile } from '../utils/time';

interface SermonClipsStudioProps {
  service: ChurchService;
  clips: SermonClip[];
  onOpenClipPreview: (clip: SermonClip) => void;
  onGenerateMoreClips: () => void;
  isGenerating: boolean;
  sermonStartSec: number;
  sermonEndSec: number;
  onSeek: (seconds: number) => void;
}

export const SermonClipsStudio: React.FC<SermonClipsStudioProps> = ({
  service,
  clips,
  onGenerateMoreClips,
  isGenerating,
  sermonStartSec,
  sermonEndSec,
  onSeek,
}) => {
  const [selectedClip, setSelectedClip] = useState<SermonClip | null>(clips[0] || null);
  const [isPlayingClip, setIsPlayingClip] = useState(false);
  const [clipCurrentSec, setClipCurrentSec] = useState<number>(clips[0]?.startSec || sermonStartSec);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Clip styling config
  const [styleConfig, setStyleConfig] = useState<ClipStyleConfig>({
    aspectRatio: '9:16',
    captionStyle: 'kinetic',
    fontSize: 22,
    captionColor: '#FFFFFF',
    highlightColor: '#F59E0B', // Amber
    showChurchWatermark: true,
    watermarkText: `${service.churchName || 'Sunday Service'}`,
    speakerOffsetPercent: 0,
  });

  // Sync selected clip if list updates
  useEffect(() => {
    if (!selectedClip && clips.length > 0) {
      setSelectedClip(clips[0]);
      setClipCurrentSec(clips[0].startSec);
    }
  }, [clips, selectedClip]);

  // Simulated clip playback timer
  useEffect(() => {
    let interval: any;
    if (isPlayingClip && selectedClip) {
      interval = setInterval(() => {
        setClipCurrentSec((prev) => {
          if (prev >= selectedClip.endSec) {
            return selectedClip.startSec; // Loop clip
          }
          return prev + 0.25;
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isPlayingClip, selectedClip]);

  const handleSelectClip = (clip: SermonClip) => {
    setSelectedClip(clip);
    setClipCurrentSec(clip.startSec);
    setIsPlayingClip(false);
    onSeek(clip.startSec);
  };

  const handleCopyCaption = (clip: SermonClip) => {
    const textToCopy = `${clip.caption}\n\n${clip.hashtags.join(' ')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(clip.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadClipSrt = (clip: SermonClip) => {
    const duration = clip.endSec - clip.startSec;
    const sub = [
      {
        startSec: 0,
        endSec: duration,
        text: clip.primaryQuote,
        speaker: service.preacher,
      },
    ];
    downloadFile(
      `${clip.hookTitle.slice(0, 25).replace(/[^a-zA-Z0-9]/g, '_')}_clip.srt`,
      generateSrtContent(sub),
      'application/x-subrip'
    );
  };

  // Video Export simulation with real downloadable file
  const handleExportClipVideo = () => {
    if (!selectedClip) return;
    setIsExportingVideo(true);
    setExportProgress(10);

    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExportingVideo(false);

          // Trigger download of formatted clip package
          const exportSummary = `=== SERMON SHORT EXPORT COMPLETE ===
Title: ${selectedClip.hookTitle}
Duration: ${selectedClip.durationSec}s (${selectedClip.startFormatted} - ${selectedClip.endFormatted})
Church: ${service.churchName}
Preacher: ${service.preacher}
Scripture: ${selectedClip.scriptureRef || service.scripture}
Aspect Ratio: ${styleConfig.aspectRatio} (Vertical 9:16 Shorts/Reels/TikTok ready)

Burned-in Caption:
"${selectedClip.primaryQuote}"

Social Caption & Hashtags:
${selectedClip.caption}
${selectedClip.hashtags.join(' ')}
`;
          downloadFile(
            `${selectedClip.hookTitle.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}_9x16_clip_package.txt`,
            exportSummary
          );
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Short Sermon Video Clips Studio
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Vertical Shorts, Reels & TikTok Clips
          </h2>
          <p className="text-xs text-slate-400">
            AI-extracted high-engagement clips from the scrubbed sermon window ({formatSeconds(sermonStartSec)} – {formatSeconds(sermonEndSec)}).
          </p>
        </div>

        <button
          onClick={onGenerateMoreClips}
          disabled={isGenerating}
          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-2 transition-colors shadow-sm"
        >
          {isGenerating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Scanning Sermon...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Regenerate Viral Highlights</span>
            </>
          )}
        </button>
      </div>

      {/* Main Studio Deck: Clips Gallery + Interactive Clip Customizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Clips List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Generated Sermon Moments ({clips.length})
          </h3>

          <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
            {clips.map((clip) => {
              const isSelected = selectedClip?.id === clip.id;

              return (
                <div
                  key={clip.id}
                  onClick={() => handleSelectClip(clip)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
                      {clip.hookTitle}
                    </h4>
                    <span className="shrink-0 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[11px] font-semibold">
                      {clip.durationSec}s
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-300 line-clamp-2 italic border-l-2 border-slate-700 pl-2">
                    "{clip.primaryQuote}"
                  </p>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono tabular-nums text-slate-300">
                      {clip.startFormatted} – {clip.endFormatted}
                    </span>
                    {clip.scriptureRef && (
                      <span className="text-[11px] font-medium text-emerald-400">
                        {clip.scriptureRef}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyCaption(clip);
                      }}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
                      title="Copy Instagram / TikTok caption"
                    >
                      {copiedId === clip.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">Copied Post</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Caption</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectClip(clip);
                      }}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <span>Open in Studio</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Live Interactive Clip Canvas & Social Formatter (7 cols) */}
        {selectedClip && (
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
            {/* Aspect Ratio & Styling Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-medium mr-1">Format:</span>
                <button
                  onClick={() => setStyleConfig((prev) => ({ ...prev, aspectRatio: '9:16' }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    styleConfig.aspectRatio === '9:16'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>9:16 Reel / Shorts</span>
                </button>

                <button
                  onClick={() => setStyleConfig((prev) => ({ ...prev, aspectRatio: '1:1' }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    styleConfig.aspectRatio === '1:1'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>1:1 Square</span>
                </button>

                <button
                  onClick={() => setStyleConfig((prev) => ({ ...prev, aspectRatio: '16:9' }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    styleConfig.aspectRatio === '16:9'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>16:9 Wide</span>
                </button>
              </div>

              {/* Watermark toggle */}
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={styleConfig.showChurchWatermark}
                  onChange={(e) =>
                    setStyleConfig((prev) => ({ ...prev, showChurchWatermark: e.target.checked }))
                  }
                  className="rounded border-slate-700 bg-slate-800 text-amber-500"
                />
                <span>Church Watermark</span>
              </label>
            </div>

            {/* Live Video Canvas with Dynamic Captions Overlay */}
            <div className="flex justify-center bg-black/80 rounded-xl p-4 overflow-hidden border border-slate-850">
              <div
                style={{
                  aspectRatio:
                    styleConfig.aspectRatio === '9:16'
                      ? '9 / 16'
                      : styleConfig.aspectRatio === '1:1'
                      ? '1 / 1'
                      : '16 / 9',
                  maxWidth: styleConfig.aspectRatio === '9:16' ? '320px' : '480px',
                }}
                className="relative w-full rounded-lg overflow-hidden bg-slate-950 shadow-2xl border border-slate-700 flex flex-col justify-between"
              >
                {/* Background Video Frame */}
                <img
                  src={service.thumbnailUrl}
                  alt={selectedClip.hookTitle}
                  referrerPolicy="no-referrer"
                  style={{
                    transform: `scale(1.4) translateX(${styleConfig.speakerOffsetPercent}%)`,
                  }}
                  className="absolute inset-0 w-full h-full object-cover opacity-85 transition-transform"
                />

                {/* Subtle vignette/contrast scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 pointer-events-none" />

                {/* Top: Church Branding & Preacher Tag */}
                {styleConfig.showChurchWatermark && (
                  <div className="relative z-10 p-3 flex items-center justify-between text-xs text-white">
                    <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 font-medium text-[11px] text-amber-400">
                      {styleConfig.watermarkText}
                    </div>
                    <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-slate-300 border border-white/10">
                      {service.preacher}
                    </div>
                  </div>
                )}

                {/* Center: Play/Pause overlay toggle */}
                <div className="relative z-10 my-auto flex justify-center">
                  <button
                    onClick={() => setIsPlayingClip(!isPlayingClip)}
                    className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 border border-amber-400/60 text-amber-400 flex items-center justify-center transition-transform hover:scale-110 shadow-lg backdrop-blur-sm"
                  >
                    {isPlayingClip ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </button>
                </div>

                {/* Bottom: Dynamic Animated Captions */}
                <div className="relative z-10 p-4 space-y-2 text-center">
                  <div
                    style={{ fontSize: `${styleConfig.fontSize}px` }}
                    className="font-extrabold text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-tight px-1"
                  >
                    <span className="text-amber-400 bg-black/60 px-1 py-0.5 rounded">
                      "{selectedClip.primaryQuote.slice(0, 45)}
                    </span>
                    <span className="bg-black/50 px-1 py-0.5 rounded ml-1">
                      {selectedClip.primaryQuote.slice(45, 95)}..."
                    </span>
                  </div>

                  {selectedClip.scriptureRef && (
                    <div className="inline-block mx-auto bg-emerald-500/90 text-slate-950 font-bold text-[10px] uppercase px-2 py-0.5 rounded shadow">
                      {selectedClip.scriptureRef}
                    </div>
                  )}

                  <div className="text-[10px] font-mono text-slate-300">
                    {formatSeconds(clipCurrentSec)} / {selectedClip.endFormatted}
                  </div>
                </div>
              </div>
            </div>

            {/* Trimmer & Speaker Framing Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-medium">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Speaker Crop Framing</span>
                  </span>
                  <span className="font-mono">{styleConfig.speakerOffsetPercent}%</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={styleConfig.speakerOffsetPercent}
                  onChange={(e) =>
                    setStyleConfig((prev) => ({
                      ...prev,
                      speakerOffsetPercent: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-medium">
                    <Type className="w-3.5 h-3.5 text-amber-400" />
                    <span>Caption Font Size</span>
                  </span>
                  <span className="font-mono">{styleConfig.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="32"
                  value={styleConfig.fontSize}
                  onChange={(e) =>
                    setStyleConfig((prev) => ({
                      ...prev,
                      fontSize: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Clip Social Meta Box */}
            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Social Media Caption & Tags</span>
                <button
                  onClick={() => handleCopyCaption(selectedClip)}
                  className="text-amber-400 hover:text-amber-300 font-medium text-xs flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Text</span>
                </button>
              </div>
              <p className="text-xs text-slate-300 whitespace-pre-line bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                {selectedClip.caption}
              </p>
              <div className="flex flex-wrap gap-1 text-[11px] text-amber-400/90 font-mono">
                {selectedClip.hashtags.map((tag, i) => (
                  <span key={i}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Export Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleExportClipVideo}
                disabled={isExportingVideo}
                className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/10"
              >
                {isExportingVideo ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Rendering Short Video ({exportProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Export 9:16 Short Video ({selectedClip.durationSec}s)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleDownloadClipSrt(selectedClip)}
                className="py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                title="Download .SRT for this clip"
              >
                <span>Clip .SRT</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
