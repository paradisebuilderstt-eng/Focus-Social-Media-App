import React from 'react';
import { Scissors, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: 'scrubber' | 'transcript' | 'clips';
  onTabChange: (tab: 'scrubber' | 'transcript' | 'clips') => void;
  hasTranscript: boolean;
  hasClips: boolean;
  onResetService: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  hasTranscript,
  hasClips,
  onResetService,
}) => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <Scissors className="w-4 h-4" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold tracking-tight text-white">SermonClipper</span>
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">AI</span>
        </div>
      </div>

      {/* Zone 2: Clean single-line workflow tabs */}
      <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
        <button
          onClick={() => onTabChange('scrubber')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 text-xs font-medium ${
            activeTab === 'scrubber'
              ? 'bg-slate-800 text-amber-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>1. Scrub & Exclude Non-Sermon</span>
        </button>

        <span className="text-slate-600 text-xs">/</span>

        <button
          onClick={() => onTabChange('transcript')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 text-xs font-medium ${
            activeTab === 'transcript'
              ? 'bg-slate-800 text-amber-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>2. Sermon Transcript</span>
          {hasTranscript && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
        </button>

        <span className="text-slate-600 text-xs">/</span>

        <button
          onClick={() => onTabChange('clips')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 text-xs font-medium ${
            activeTab === 'clips'
              ? 'bg-slate-800 text-amber-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>3. Viral Sermon Shorts</span>
          {hasClips && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          )}
        </button>
      </nav>

      {/* Zone 3: 1 Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onResetService}
          className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          Load Church Service
        </button>
      </div>
    </header>
  );
};
