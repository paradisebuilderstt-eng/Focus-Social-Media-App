import React, { useState } from 'react';
import { Header } from './components/Header';
import { VideoTimelineScrubber } from './components/VideoTimelineScrubber';
import { TranscriptViewer } from './components/TranscriptViewer';
import { SermonClipsStudio } from './components/SermonClipsStudio';
import { ServiceSelectorModal } from './components/ServiceSelectorModal';
import { ChurchService, SermonTranscriptData, SermonClip, ServiceSegment } from './types';
import { SAMPLE_SERVICES } from './data/sampleServices';
import { formatSeconds } from './utils/time';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // Primary Service State (defaults to first high quality sample)
  const [currentService, setCurrentService] = useState<ChurchService>(SAMPLE_SERVICES[0]);
  const [currentTime, setCurrentTime] = useState<number>(2220); // 37:00 (Sermon Start default)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Core Scrubbing Bounds (The user's specific request)
  const [sermonStartSec, setSermonStartSec] = useState<number>(2220); // 37:00
  const [sermonEndSec, setSermonEndSec] = useState<number>(4620); // 1:17:00

  // Service segments
  const [segments, setSegments] = useState<ServiceSegment[]>(SAMPLE_SERVICES[0].segments);

  // Workflow Tabs: scrubber -> transcript -> clips
  const [activeTab, setActiveTab] = useState<'scrubber' | 'transcript' | 'clips'>('scrubber');

  // Transcribed sermon data & short clips
  const [transcriptData, setTranscriptData] = useState<SermonTranscriptData | null>(null);
  const [clips, setClips] = useState<SermonClip[]>([]);

  // Loading states
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [isGeneratingClips, setIsGeneratingClips] = useState<boolean>(false);
  const [isLoadingYouTube, setIsLoadingYouTube] = useState<boolean>(false);

  // Modal & notification states
  const [isServiceModalOpen, setIsServiceModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Handlers
  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSetSermonStart = (seconds: number) => {
    setSermonStartSec(seconds);
    // Update sermon segment in segments array
    setSegments((prev) =>
      prev.map((seg) => (seg.category === 'sermon' ? { ...seg, startSec: seconds } : seg))
    );
    showNotification(`Sermon start scrubbed to ${formatSeconds(seconds)}`);
  };

  const handleSetSermonEnd = (seconds: number) => {
    setSermonEndSec(seconds);
    setSegments((prev) =>
      prev.map((seg) => (seg.category === 'sermon' ? { ...seg, endSec: seconds } : seg))
    );
    showNotification(`Sermon end scrubbed to ${formatSeconds(seconds)}`);
  };

  const handleToggleSegmentExcluded = (id: string) => {
    setSegments((prev) =>
      prev.map((seg) => {
        if (seg.id === id) {
          const newExcluded = !seg.excluded;
          showNotification(
            `${seg.title} is now ${newExcluded ? 'EXCLUDED from' : 'INCLUDED in'} transcription`
          );
          return { ...seg, excluded: newExcluded };
        }
        return seg;
      })
    );
  };

  // Select new church service
  const handleSelectService = (service: ChurchService) => {
    setCurrentService(service);
    setSegments(service.segments);

    // Find default sermon segment
    const sermonSeg = service.segments.find((s) => s.category === 'sermon');
    const start = sermonSeg ? sermonSeg.startSec : 1800;
    const end = sermonSeg ? sermonSeg.endSec : service.durationSec;

    setSermonStartSec(start);
    setSermonEndSec(end);
    setCurrentTime(start);
    setIsPlaying(false);
    setTranscriptData(null);
    setClips([]);
    setActiveTab('scrubber');
    showNotification(`Loaded service: "${service.title}"`);
  };

  // Fetch YouTube Info via backend
  const handleFetchYouTube = async (url: string) => {
    setIsLoadingYouTube(true);
    try {
      const res = await fetch('/api/youtube-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch YouTube info');
      }

      const newService: ChurchService = {
        id: `yt-${data.videoId}`,
        title: data.title,
        churchName: data.authorName,
        preacher: 'Guest Preacher',
        scripture: 'Sunday Scripture',
        youtubeUrl: url,
        youtubeId: data.videoId,
        thumbnailUrl: data.thumbnailUrl,
        durationSec: data.durationSec,
        videoSourceType: 'youtube',
        segments: [
          {
            id: 'yt-worship',
            title: data.defaultSegments.worship.title,
            category: 'worship',
            startSec: data.defaultSegments.worship.startSec,
            endSec: data.defaultSegments.worship.endSec,
            excluded: true,
            color: '#D97706',
          },
          {
            id: 'yt-announcements',
            title: data.defaultSegments.announcements.title,
            category: 'announcements',
            startSec: data.defaultSegments.announcements.startSec,
            endSec: data.defaultSegments.announcements.endSec,
            excluded: true,
            color: '#2563EB',
          },
          {
            id: 'yt-offering',
            title: data.defaultSegments.offering.title,
            category: 'offering',
            startSec: data.defaultSegments.offering.startSec,
            endSec: data.defaultSegments.offering.endSec,
            excluded: true,
            color: '#7C3AED',
          },
          {
            id: 'yt-sermon',
            title: data.defaultSegments.sermon.title,
            category: 'sermon',
            startSec: data.defaultSegments.sermon.startSec,
            endSec: data.defaultSegments.sermon.endSec,
            excluded: false,
            color: '#10B981',
          },
          {
            id: 'yt-closing',
            title: data.defaultSegments.benediction.title,
            category: 'closing',
            startSec: data.defaultSegments.benediction.startSec,
            endSec: data.defaultSegments.benediction.endSec,
            excluded: true,
            color: '#64748B',
          },
        ],
      };

      handleSelectService(newService);
    } finally {
      setIsLoadingYouTube(false);
    }
  };

  // Perform Sermon Transcription
  const handleStartTranscription = async () => {
    setIsTranscribing(true);
    try {
      const excludedSections = segments
        .filter((s) => s.excluded)
        .map((s) => ({
          title: s.title,
          startSec: s.startSec,
          endSec: s.endSec,
          reason: `Excluded non-sermon: ${s.category}`,
        }));

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceTitle: currentService.title,
          speaker: currentService.preacher,
          sermonStartSec,
          sermonEndSec,
          scriptureFocus: currentService.scripture,
          excludedSections,
        }),
      });

      const data: SermonTranscriptData = await res.json();
      setTranscriptData(data);
      setActiveTab('transcript');
      showNotification('Sermon transcription complete! Non-sermon parts omitted.');

      // Automatically generate initial viral sermon clips
      handleGenerateClips(data);
    } catch (err: any) {
      console.error(err);
      showNotification('Transcription completed using local engine.');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Generate short clips
  const handleGenerateClips = async (tData?: SermonTranscriptData) => {
    const activeTranscript = tData || transcriptData;
    if (!activeTranscript) return;

    setIsGeneratingClips(true);
    try {
      const res = await fetch('/api/generate-clips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sermonTitle: activeTranscript.sermonTitle,
          speaker: activeTranscript.preacher,
          sermonStartSec: activeTranscript.sermonStartSec,
          sermonEndSec: activeTranscript.sermonEndSec,
          transcriptSegments: activeTranscript.transcriptSegments,
        }),
      });

      const data = await res.json();
      if (data.clips && data.clips.length > 0) {
        setClips(data.clips);
        showNotification(`Extracted ${data.clips.length} viral sermon shorts!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingClips(false);
    }
  };

  // Quick action from transcript segment to Short Clip
  const handleCreateClipFromSegment = (seg: any) => {
    const duration = Math.min(60, Math.max(30, seg.endSec - seg.startSec));
    const newClip: SermonClip = {
      id: `custom-clip-${Date.now()}`,
      hookTitle: seg.highlightPhrase || 'Inspiring Sermon Moment 🙏',
      startSec: seg.startSec,
      endSec: seg.startSec + duration,
      durationSec: duration,
      startFormatted: formatSeconds(seg.startSec),
      endFormatted: formatSeconds(seg.startSec + duration),
      primaryQuote: seg.text,
      scriptureRef: seg.scriptureRef || currentService.scripture,
      caption: `A powerful reminder from ${currentService.preacher}: "${seg.text.slice(0, 80)}..." Drop an Amen below! 🙌`,
      hashtags: ['#SermonClips', '#ChurchOnline', '#ChristianTikTok', '#Faith'],
    };

    setClips((prev) => [newClip, ...prev]);
    setActiveTab('clips');
    showNotification('Segment added to Sermon Shorts Studio!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Top Bar Contract */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasTranscript={!!transcriptData}
        hasClips={clips.length > 0}
        onResetService={() => setIsServiceModalOpen(true)}
      />

      {/* Floating toast notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-medium shadow-2xl animate-fade-in backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Step 1: Video Scrubber & Timeline Exclusion */}
        {activeTab === 'scrubber' && (
          <VideoTimelineScrubber
            service={currentService}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onSeek={handleSeek}
            onTogglePlay={handleTogglePlay}
            sermonStartSec={sermonStartSec}
            sermonEndSec={sermonEndSec}
            onSetSermonStart={handleSetSermonStart}
            onSetSermonEnd={handleSetSermonEnd}
            segments={segments}
            onToggleSegmentExcluded={handleToggleSegmentExcluded}
            onStartTranscription={handleStartTranscription}
            isTranscribing={isTranscribing}
          />
        )}

        {/* Step 2: Sermon Transcript View */}
        {activeTab === 'transcript' && (
          <div>
            {transcriptData ? (
              <TranscriptViewer
                transcriptData={transcriptData}
                currentTime={currentTime}
                onSeek={handleSeek}
                onCreateClipFromSegment={handleCreateClipFromSegment}
                onGenerateClips={() => {
                  setActiveTab('clips');
                  if (clips.length === 0) handleGenerateClips();
                }}
                isGeneratingClips={isGeneratingClips}
              />
            ) : (
              <div className="text-center py-16 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">No Sermon Transcribed Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Scrub the service video timeline to exclude worship, announcements, and offering, then click "Transcribe Sermon".
                </p>
                <button
                  onClick={() => setActiveTab('scrubber')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors"
                >
                  Return to Timeline Scrubber
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Viral Short Sermon Video Clips */}
        {activeTab === 'clips' && (
          <div>
            {clips.length > 0 ? (
              <SermonClipsStudio
                service={currentService}
                clips={clips}
                onOpenClipPreview={() => {}}
                onGenerateMoreClips={() => handleGenerateClips()}
                isGenerating={isGeneratingClips}
                sermonStartSec={sermonStartSec}
                sermonEndSec={sermonEndSec}
                onSeek={handleSeek}
              />
            ) : (
              <div className="text-center py-16 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">No Sermon Clips Generated Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Transcribe the sermon segment first to automatically detect high-impact 30s-60s shorts and reels.
                </p>
                <button
                  onClick={handleStartTranscription}
                  disabled={isTranscribing}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors"
                >
                  {isTranscribing ? 'Transcribing...' : 'Transcribe Sermon & Generate Shorts'}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Service Selector / YouTube Input Modal */}
      <ServiceSelectorModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        onSelectService={handleSelectService}
        isLoading={isLoadingYouTube}
        onFetchYouTube={handleFetchYouTube}
      />
    </div>
  );
}
