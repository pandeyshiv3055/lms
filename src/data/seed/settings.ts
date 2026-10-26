import { AppSettings } from '../../types';

export const defaultSettings: AppSettings = {
  general: {
    productName: 'AEGIS Defense & Security Interactive LMS',
    wordmark: 'AEGIS SEC-TRAIN',
    defaultLanguage: 'en-US',
    timeFormat: '24h',
    defaultCategory: 'Foundations',
  },
  player: {
    autoAdvance: false,
    defaultNarration: true,
    allowReplay: true,
    allowRevisitCompleted: true,
    requireNarrationFinish: false,
    requireCardsExploration: true,
    requireAllRoomsInspection: true,
  },
  assessment: {
    defaultPassingScore: 80,
    defaultMaxAttempts: 3,
    immediateFeedback: true,
    allowReview: true,
  },
  gamification: {
    badgesEnabled: true,
    confettiOnPass: true,
  },
  learnerAnnouncement:
    'Mandatory Compliance Period: Complete SEC-101 and the Facility 04 Room Inspection activity to certify your operational readiness badge.',
};
