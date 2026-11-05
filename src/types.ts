export interface ServiceSegment {
  id: string;
  title: string;
  category: 'worship' | 'announcements' | 'offering' | 'sermon' | 'closing' | 'custom';
  startSec: number;
  endSec: number;
  excluded: boolean;
  color: string;
  description?: string;
}

export interface ChurchService {
  id: string;
  title: string;
  churchName: string;
  preacher: string;
  scripture: string;
  youtubeUrl: string;
  youtubeId: string;
  thumbnailUrl: string;
  durationSec: number;
  videoSourceType: 'youtube' | 'sample' | 'upload';
  localVideoUrl?: string;
  segments: ServiceSegment[];
}

export interface TranscriptSegment {
  id: string;
  startSec: number;
  endSec: number;
  timestampFormatted: string;
  speaker: string;
  text: string;
  scriptureRef?: string;
  highlightPhrase?: string;
}

export interface SermonOutlinePoint {
  timestamp: string;
  pointNumber?: number;
  title: string;
  summary: string;
}

export interface KeyQuote {
  quote: string;
  timestamp: string;
  startSec: number;
  theme?: string;
}

export interface SermonTranscriptData {
  sermonTitle: string;
  preacher: string;
  scriptureFocus: string;
  sermonStartSec: number;
  sermonEndSec: number;
  sermonDurationFormatted: string;
  excludedPortionsSummary: {
    worshipSkippedMin?: number;
    announcementsSkippedMin?: number;
    offeringSkippedMin?: number;
    totalExcludedDuration: string;
    efficiencyGain: string;
  };
  sermonOutline: SermonOutlinePoint[];
  keyQuotes: KeyQuote[];
  transcriptSegments: TranscriptSegment[];
}

export interface SermonClip {
  id: string;
  hookTitle: string;
  startSec: number;
  endSec: number;
  durationSec: number;
  startFormatted: string;
  endFormatted: string;
  primaryQuote: string;
  scriptureRef?: string;
  viralityHook?: string;
  recommendedAspectRatio?: string;
  caption: string;
  hashtags: string[];
}

export interface ClipStyleConfig {
  aspectRatio: '9:16' | '1:1' | '16:9';
  captionStyle: 'kinetic' | 'minimal' | 'bold_banner';
  fontSize: number;
  captionColor: string;
  highlightColor: string;
  showChurchWatermark: boolean;
  watermarkText: string;
  speakerOffsetPercent: number; // -50% to +50% for framing
}
