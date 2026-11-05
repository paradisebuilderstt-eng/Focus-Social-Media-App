/**
 * Time formatting and export utilities for church service media
 */

export function formatSeconds(seconds: number, includeHours = true): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const s = Math.floor(seconds);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  if (includeHours || hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function parseTimeToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':').map((p) => parseInt(p, 10) || 0);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 1) {
    return parts[0];
  }
  return 0;
}

export function formatSrtTimestamp(seconds: number): string {
  const s = Math.floor(seconds);
  const ms = Math.floor((seconds - s) * 1000);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

export function generateSrtContent(segments: { startSec: number; endSec: number; text: string; speaker?: string }[]): string {
  return segments
    .map((seg, idx) => {
      const index = idx + 1;
      const startTime = formatSrtTimestamp(seg.startSec);
      const endTime = formatSrtTimestamp(seg.endSec);
      const speakerPrefix = seg.speaker ? `${seg.speaker}: ` : '';
      return `${index}\n${startTime} --> ${endTime}\n${speakerPrefix}${seg.text}\n`;
    })
    .join('\n');
}

export function downloadFile(filename: string, content: string, mimeType = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
