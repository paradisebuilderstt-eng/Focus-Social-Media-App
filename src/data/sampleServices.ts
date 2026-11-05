import { ChurchService } from '../types';

export const SAMPLE_SERVICES: ChurchService[] = [
  {
    id: 'service-grace-1',
    title: 'Sunday Worship & The Word: Living With Purpose in the Storm',
    churchName: 'Grace Fellowship Church',
    preacher: 'Pastor Marcus Reid',
    scripture: 'Romans 8:28-39 & Psalm 46',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Default fallback or custom URL
    youtubeId: '3pZ_8pWk9dE',
    thumbnailUrl: '/src/assets/images/church_service_stage_1793846274815.jpg',
    durationSec: 4920, // 1h 22m 00s
    videoSourceType: 'sample',
    segments: [
      {
        id: 'seg-worship',
        title: 'Opening Praise & Worship (Song Set)',
        category: 'worship',
        startSec: 0,
        endSec: 1380, // 00:00 - 23:00 (23 mins)
        excluded: true,
        color: '#D97706', // Amber warning tone
        description: 'Band & choir musical set. Exclude lyrics & band interludes from sermon transcript.',
      },
      {
        id: 'seg-announcements',
        title: 'Welcome & Weekly Announcements',
        category: 'announcements',
        startSec: 1380,
        endSec: 1860, // 23:00 - 31:00 (8 mins)
        excluded: true,
        color: '#2563EB', // Blue tone
        description: 'Church life events, volunteer signups & upcoming conferences.',
      },
      {
        id: 'seg-offering',
        title: 'Tithes, Offering & Pastoral Prayer',
        category: 'offering',
        startSec: 1860,
        endSec: 2220, // 31:00 - 37:00 (6 mins)
        excluded: true,
        color: '#7C3AED', // Violet tone
        description: 'Giving instructions, offertory prayer & quiet reflection.',
      },
      {
        id: 'seg-sermon',
        title: 'The Message: Standing Firm in the Storm',
        category: 'sermon',
        startSec: 2220, // 37:00
        endSec: 4620, // 1:17:00 (40 mins)
        excluded: false,
        color: '#10B981', // Emerald highlight target
        description: 'Scripture reading and pastoral sermon. TARGET FOR TRANSCRIPTION & CLIPS.',
      },
      {
        id: 'seg-closing',
        title: 'Altar Call & Closing Benediction',
        category: 'closing',
        startSec: 4620, // 1:17:00
        endSec: 4920, // 1:22:00 (5 mins)
        excluded: true,
        color: '#64748B', // Slate
        description: 'Closing invitation, final blessing & fellowship dismissal.',
      },
    ],
  },
  {
    id: 'service-city-2',
    title: 'Midweek Believers Service: Faith That Moves Mountains',
    churchName: 'City Harvest Community',
    preacher: 'Pastor John Adebayo',
    scripture: 'Hebrews 11:1-6 & Mark 11:22-24',
    youtubeUrl: 'https://www.youtube.com/watch?v=sermon-faith-midweek',
    youtubeId: 'L_LUpnjgPso',
    thumbnailUrl: '/src/assets/images/pastor_speaking_1793846274958.jpg',
    durationSec: 4200, // 1h 10m
    videoSourceType: 'sample',
    segments: [
      {
        id: 'seg-worship-2',
        title: 'Acoustic Worship & Devotion',
        category: 'worship',
        startSec: 0,
        endSec: 1080, // 00:00 - 18:00
        excluded: true,
        color: '#D97706',
        description: 'Opening acoustic worship and congregation prayer.',
      },
      {
        id: 'seg-announcements-2',
        title: 'Ministry Updates & Welcome',
        category: 'announcements',
        startSec: 1080,
        endSec: 1440, // 18:00 - 24:00
        excluded: true,
        color: '#2563EB',
        description: 'Small group notices and outreach updates.',
      },
      {
        id: 'seg-offering-2',
        title: 'Tithes & Thanksgiving Prayer',
        category: 'offering',
        startSec: 1440,
        endSec: 1740, // 24:00 - 29:00
        excluded: true,
        color: '#7C3AED',
        description: 'Offertory scripture and giving.',
      },
      {
        id: 'seg-sermon-2',
        title: 'Teaching: Mountain-Moving Faith',
        category: 'sermon',
        startSec: 1740, // 29:00
        endSec: 3900, // 1:05:00 (36 mins)
        excluded: false,
        color: '#10B981',
        description: 'Deep exegetical bible study on active faith.',
      },
      {
        id: 'seg-closing-2',
        title: 'Ministry Time & Dismissal',
        category: 'closing',
        startSec: 3900,
        endSec: 4200,
        excluded: true,
        color: '#64748B',
        description: 'Personal ministry at the altar and closing prayer.',
      },
    ],
  },
  {
    id: 'service-youth-3',
    title: 'Encounter Night: Identity & Divine Calling',
    churchName: 'Awaken Youth Ministry',
    preacher: 'Pastor Sarah Jenkins',
    scripture: '1 Timothy 4:12 & Jeremiah 29:11',
    youtubeUrl: 'https://www.youtube.com/watch?v=encounter-night-youth',
    youtubeId: 'kJQP7kiw5Fk',
    thumbnailUrl: '/src/assets/images/church_worship_congregation_1793846275700.jpg',
    durationSec: 5400, // 1h 30m
    videoSourceType: 'sample',
    segments: [
      {
        id: 'seg-worship-3',
        title: 'High-Energy Praise & Deep Worship',
        category: 'worship',
        startSec: 0,
        endSec: 1800, // 00:00 - 30:00 (30 mins)
        excluded: true,
        color: '#D97706',
        description: 'Extended youth band worship set with crowd participation.',
      },
      {
        id: 'seg-announcements-3',
        title: 'Camp Announcements & Testimonies',
        category: 'announcements',
        startSec: 1800,
        endSec: 2280, // 30:00 - 38:00
        excluded: true,
        color: '#2563EB',
        description: 'Summer youth retreat hype and student testimonies.',
      },
      {
        id: 'seg-offering-3',
        title: 'Kingdom Builders Offering',
        category: 'offering',
        startSec: 2280,
        endSec: 2580, // 38:00 - 43:00
        excluded: true,
        color: '#7C3AED',
        description: 'Missions offering and prayer.',
      },
      {
        id: 'seg-sermon-3',
        title: 'Message: Unapologetic Identity',
        category: 'sermon',
        startSec: 2580, // 43:00
        endSec: 4980, // 1:23:00 (40 mins)
        excluded: false,
        color: '#10B981',
        description: 'Relevant sermon addressing cultural pressures and Christ-centered purpose.',
      },
      {
        id: 'seg-closing-3',
        title: 'Response Time & Prayer Ministry',
        category: 'closing',
        startSec: 4980,
        endSec: 5400,
        excluded: true,
        color: '#64748B',
        description: 'Worship response and small group breakout.',
      },
    ],
  },
];
