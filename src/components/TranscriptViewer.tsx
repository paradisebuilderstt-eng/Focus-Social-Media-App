import React, { useState } from 'react';
import {
  Search,
  Download,
  Copy,
  Check,
  BookOpen,
  Sparkles,
  Scissors,
  FileText,
  ListOrdered,
  Quote,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { SermonTranscriptData, TranscriptSegment } from '../types';
import { formatSeconds, generateSrtContent, downloadFile } from '../utils/time';

interface TranscriptViewerProps {
  transcriptData: SermonTranscriptData;
  currentTime: number;
  onSeek: (seconds: number) => void;
  onCreateClipFromSegment: (seg: TranscriptSegment) => void;
  onGenerateClips: () => void;
  isGeneratingClips: boolean;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  transcriptData,
  currentTime,
  onSeek,
  onCreateClipFromSegment,
  onGenerateClips,
  isGeneratingClips,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'transcript' | 'outline' | 'quotes'>('transcript');
  const [copied, setCopied] = useState(false);

  // Filtered segments
  const filteredSegments = transcriptData.transcriptSegments.filter((seg) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      seg.text.toLowerCase().includes(q) ||
      seg.speaker.toLowerCase().includes(q) ||
      (seg.scriptureRef && seg.scriptureRef.toLowerCase().includes(q))
    );
  });

  const handleCopyTranscript = () => {
    const fullText = transcriptData.transcriptSegments
      .map((s) => `[${s.timestampFormatted}] ${s.speaker}:\n${s.text}\n`)
      .join('\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const header = `SERMON TRANSCRIPT: ${transcriptData.sermonTitle}\nPreacher: ${transcriptData.preacher}\nScripture: ${transcriptData.scriptureFocus}\nWindow: ${formatSeconds(transcriptData.sermonStartSec)} - ${formatSeconds(transcriptData.sermonEndSec)}\nExcluded: Worship, Announcements, Offering\n\n`;
    const body = transcriptData.transcriptSegments
      .map((s) => `[${s.timestampFormatted}] ${s.speaker}:\n${s.text}\n`)
      .join('\n');
    downloadFile(
      `${transcriptData.sermonTitle.replace(/[^a-zA-Z0-9]/g, '_')}_transcript.txt`,
      header + body
    );
  };

  const handleDownloadSrt = () => {
    const srt = generateSrtContent(
      transcriptData.transcriptSegments.map((s) => ({
        startSec: s.startSec,
        endSec: s.endSec,
        text: s.text,
        speaker: s.speaker,
      }))
    );
    downloadFile(
      `${transcriptData.sermonTitle.replace(/[^a-zA-Z0-9]/g, '_')}_subtitles.srt`,
      srt,
      'application/x-subrip'
    );
  };

  const handleDownloadStudyNotes = () => {
    const md = `# ${transcriptData.sermonTitle}
**Preacher:** ${transcriptData.preacher}
**Scripture Focus:** ${transcriptData.scriptureFocus}
**Duration:** ${transcriptData.sermonDurationFormatted}

## Sermon Outline
${transcriptData.sermonOutline.map((o) => `### ${o.title} (${o.timestamp})\n${o.summary}\n`).join('\n')}

## Memorable Quotes
${transcriptData.keyQuotes.map((q) => `> "${q.quote}"\n> — *${q.timestamp}*\n`).join('\n')}

## Full Sermon Transcript
${transcriptData.transcriptSegments.map((s) => `**[${s.timestampFormatted}] ${s.speaker}:**\n${s.text}\n`).join('\n')}
`;
    downloadFile(
      `${transcriptData.sermonTitle.replace(/[^a-zA-Z0-9]/g, '_')}_study_notes.md`,
      md,
      'text/markdown'
    );
  };

  return (
    <div className="space-y-6">
      {/* Transcript Header & Scope confirmation bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Scrubbed Sermon Transcribed
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {transcriptData.sermonTitle}
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{transcriptData.preacher}</span>
            <span>·</span>
            <span className="text-amber-400/90 font-medium">{transcriptData.scriptureFocus}</span>
            <span>·</span>
            <span className="font-mono tabular-nums text-slate-300">
              {formatSeconds(transcriptData.sermonStartSec)} – {formatSeconds(transcriptData.sermonEndSec)} (
              {transcriptData.sermonDurationFormatted})
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onGenerateClips}
            disabled={isGeneratingClips}
            className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-2 transition-colors shadow-sm"
          >
            {isGeneratingClips ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Finding Viral Clips...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Sermon Shorts & Reels</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopyTranscript}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
            title="Copy plain text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={handleDownloadTxt}
              className="px-2.5 py-1 text-xs text-slate-300 hover:text-white transition-colors"
              title="Download .TXT"
            >
              .TXT
            </button>
            <span className="text-slate-600 text-xs">|</span>
            <button
              onClick={handleDownloadSrt}
              className="px-2.5 py-1 text-xs text-slate-300 hover:text-white transition-colors"
              title="Download .SRT Subtitles"
            >
              .SRT
            </button>
            <span className="text-slate-600 text-xs">|</span>
            <button
              onClick={handleDownloadStudyNotes}
              className="px-2.5 py-1 text-xs text-slate-300 hover:text-white transition-colors"
              title="Download Markdown Study Guide"
            >
              Study Notes (.md)
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Tab Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Sub-tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('transcript')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'transcript'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Full Transcript</span>
          </button>

          <button
            onClick={() => setActiveSubTab('outline')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'outline'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Sermon Outline ({transcriptData.sermonOutline.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('quotes')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'quotes'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Quote className="w-3.5 h-3.5" />
            <span>Key Quotes ({transcriptData.keyQuotes.length})</span>
          </button>
        </div>

        {/* Live Search input */}
        {activeSubTab === 'transcript' && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search sermon words, scriptures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        )}
      </div>

      {/* Tab 1: Full Interactive Timestamped Transcript */}
      {activeSubTab === 'transcript' && (
        <div className="space-y-3">
          {filteredSegments.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800">
              No matching sermon passages found for "{searchQuery}".
            </div>
          ) : (
            filteredSegments.map((seg) => {
              const isActive = currentTime >= seg.startSec && currentTime <= seg.endSec;

              return (
                <div
                  key={seg.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-slate-900/90 border-amber-500/50 shadow-sm'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => onSeek(seg.startSec)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-amber-500 hover:text-slate-950 font-mono tabular-nums text-xs font-semibold text-amber-400 transition-colors flex items-center gap-1"
                        title="Click to seek video to this second"
                      >
                        <Clock className="w-3 h-3" />
                        <span>{seg.timestampFormatted}</span>
                      </button>

                      <span className="text-xs font-semibold text-white">
                        {seg.speaker}
                      </span>

                      {seg.scriptureRef && (
                        <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {seg.scriptureRef}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onCreateClipFromSegment(seg)}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-amber-400 bg-slate-800/80 hover:bg-slate-800 rounded-md border border-slate-700 transition-colors flex items-center gap-1"
                      title="Create a short clip from this moment"
                    >
                      <Scissors className="w-3 h-3" />
                      <span>Clip Segment</span>
                    </button>
                  </div>

                  <p
                    onClick={() => onSeek(seg.startSec)}
                    className="text-sm text-slate-300 leading-relaxed cursor-pointer hover:text-white transition-colors"
                  >
                    {seg.text}
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Sermon Outline */}
      {activeSubTab === 'outline' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {transcriptData.sermonOutline.map((point, idx) => (
            <div
              key={idx}
              className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="text-amber-400 font-bold">POINT 0{idx + 1}</span>
                <span className="tabular-nums">{point.timestamp}</span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">{point.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{point.summary}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Key Quotes */}
      {activeSubTab === 'quotes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {transcriptData.keyQuotes.map((q, idx) => (
            <div
              key={idx}
              className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-400/90 font-medium">{q.theme || 'Key Theme'}</span>
                  <span className="font-mono tabular-nums text-slate-500">{q.timestamp}</span>
                </div>
                <blockquote className="text-sm text-slate-200 font-medium italic border-l-2 border-amber-400 pl-3">
                  "{q.quote}"
                </blockquote>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => onSeek(q.startSec)}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Seek in video
                </button>
                <button
                  onClick={() =>
                    onCreateClipFromSegment({
                      id: `quote-${idx}`,
                      startSec: Math.max(0, q.startSec - 5),
                      endSec: q.startSec + 45,
                      timestampFormatted: q.timestamp,
                      speaker: transcriptData.preacher,
                      text: q.quote,
                    })
                  }
                  className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Create Clip</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
