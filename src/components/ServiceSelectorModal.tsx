import React, { useState } from 'react';
import {
  Youtube,
  Upload,
  X,
  Sparkles,
  Link,
  Church,
  ArrowRight,
  Clock,
  Check,
} from 'lucide-react';
import { ChurchService } from '../types';
import { SAMPLE_SERVICES } from '../data/sampleServices';
import { formatSeconds } from '../utils/time';

interface ServiceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectService: (service: ChurchService) => void;
  isLoading: boolean;
  onFetchYouTube: (url: string) => Promise<void>;
}

export const ServiceSelectorModal: React.FC<ServiceSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectService,
  isLoading,
  onFetchYouTube,
}) => {
  const [youtubeUrlInput, setYoutubeUrlInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleFetchUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!youtubeUrlInput.trim()) {
      setErrorMessage('Please enter a YouTube video URL or ID.');
      return;
    }
    try {
      await onFetchYouTube(youtubeUrlInput.trim());
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not fetch YouTube video. Check URL.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const customService: ChurchService = {
      id: `local-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      churchName: 'Local Church Recording',
      preacher: 'Guest Preacher',
      scripture: 'Scripture Reading',
      youtubeUrl: '',
      youtubeId: '',
      thumbnailUrl: '/src/assets/images/church_service_stage_1793846274815.jpg',
      durationSec: 4800, // estimated 80 mins
      videoSourceType: 'upload',
      localVideoUrl: fileUrl,
      segments: [
        {
          id: 'worship-up',
          title: 'Opening Praise & Worship',
          category: 'worship',
          startSec: 0,
          endSec: 1200,
          excluded: true,
          color: '#D97706',
        },
        {
          id: 'announcements-up',
          title: 'Announcements & Welcome',
          category: 'announcements',
          startSec: 1200,
          endSec: 1680,
          excluded: true,
          color: '#2563EB',
        },
        {
          id: 'offering-up',
          title: 'Tithes & Offering',
          category: 'offering',
          startSec: 1680,
          endSec: 2040,
          excluded: true,
          color: '#7C3AED',
        },
        {
          id: 'sermon-up',
          title: 'The Message (Sermon)',
          category: 'sermon',
          startSec: 2040,
          endSec: 4500,
          excluded: false,
          color: '#10B981',
        },
        {
          id: 'closing-up',
          title: 'Benediction',
          category: 'closing',
          startSec: 4500,
          endSec: 4800,
          excluded: true,
          color: '#64748B',
        },
      ],
    };
    onSelectService(customService);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Church className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Load Church Service Video
              </h3>
              <p className="text-xs text-slate-400">
                Paste a YouTube livestream, choose a church sample, or upload a local file.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Option 1: YouTube Downloader / URL Fetcher */}
          <form onSubmit={handleFetchUrl} className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Youtube className="w-4 h-4 text-red-500" />
              <span>Paste YouTube Livestream or Service URL</span>
            </label>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Link className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrlInput}
                  onChange={(e) => setYoutubeUrlInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Fetching...</span>
                  </>
                ) : (
                  <>
                    <span>Load YouTube</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {errorMessage && (
              <p className="text-xs text-red-400">{errorMessage}</p>
            )}
          </form>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-800" />
            <span className="absolute bg-slate-900 px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Or Choose Pre-Loaded Service
            </span>
          </div>

          {/* Option 2: Curated Church Service Presets */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              {SAMPLE_SERVICES.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    onSelectService(s);
                    onClose();
                  }}
                  className="p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={s.thumbnailUrl}
                      alt={s.title}
                      referrerPolicy="no-referrer"
                      className="w-16 h-11 object-cover rounded-md border border-slate-700 shrink-0"
                    />
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                        {s.title}
                      </h4>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{s.churchName}</span>
                        <span>·</span>
                        <span>{s.preacher}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div className="font-mono text-[11px] text-slate-400">
                      <div>{formatSeconds(s.durationSec)}</div>
                      <div className="text-emerald-400 text-[10px] font-semibold">Ready to scrub</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-800" />
            <span className="absolute bg-slate-900 px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Or Local Media
            </span>
          </div>

          {/* Option 3: Local Church File Upload */}
          <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 text-center hover:bg-slate-950 transition-colors">
            <input
              type="file"
              id="church-video-upload"
              accept="video/mp4,video/webm,audio/mp3,audio/wav"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="church-video-upload"
              className="cursor-pointer flex flex-col items-center gap-1.5"
            >
              <Upload className="w-6 h-6 text-slate-400" />
              <span className="text-xs font-semibold text-white">
                Upload Church Livestream (MP4, WebM, MP3)
              </span>
              <span className="text-[11px] text-slate-500">
                Ideal for recordings exported directly from OBS, vMix, or ATEM switcher
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
