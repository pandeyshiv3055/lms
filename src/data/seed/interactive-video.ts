import { InteractiveVideoData } from '../../types';

export const seedInteractiveVideo: InteractiveVideoData = {
  id: 'video-sec101-incident',
  title: 'Recognizing and Reporting a Security Incident',
  videoUrl: '/assets/videos/security-incident-patrol.mp4',
  posterUrl: '/assets/videos/security-patrol-poster.jpg',
  durationSeconds: 30,
  transcriptText:
    '00:00 - Introduction to proactive observation protocols. 00:06 - Officer conducts patrol along the secondary restricted corridor. 00:12 - Observation of unattended item in restricted zone. Checkpoint 1 assessment. 00:18 - Establishment of safety perimeter and notification of dispatch. 00:24 - Mandatory incident logging standards. Checkpoint 2 assessment. 00:30 - Operational wrap-up and post orders confirmation.',
  preventFastForward: true,
  requireFullReviewSegment: true,
  checkpoints: [
    {
      id: 'ckpt-1-unattended-item',
      title: 'Unattended Item Recognition',
      timestampSeconds: 12,
      required: true,
      scoreWeight: 10,
      reviewStartSeconds: 4,
      reviewEndSeconds: 12,
      retryLimit: 3,
      autoResumeOnCorrect: true,
      question: {
        id: 'q-ckpt-1',
        prompt:
          'A security officer notices an unattended item near a restricted corridor. What is the most appropriate initial response?',
        type: 'single-choice',
        options: [
          { id: 'opt-1a', text: 'Open the item immediately to inspect its contents.' },
          {
            id: 'opt-1b',
            text: 'Maintain a safe distance, follow site procedures, and report the suspicious item to dispatch.',
          },
          { id: 'opt-1c', text: 'Carry the item to the main public reception desk.' },
          { id: 'opt-1d', text: 'Ignore the item if nobody in the corridor appears alarmed.' },
        ],
        correctAnswer: 'opt-1b',
        explanation:
          'Correct! Protocol mandates never handling or opening suspicious or unattended items. Officers must maintain safe perimeter distance, avoid radio interference in immediate proximity if explosive risk exists, and contact supervisory dispatch.',
        hint: 'Prioritize life safety, perimeter establishment, and reporting over physical tampering.',
      },
    },
    {
      id: 'ckpt-2-incident-report',
      title: 'Incident Report Documentation',
      timestampSeconds: 24,
      required: true,
      scoreWeight: 10,
      reviewStartSeconds: 16,
      reviewEndSeconds: 24,
      retryLimit: 3,
      autoResumeOnCorrect: false,
      question: {
        id: 'q-ckpt-2',
        prompt:
          'The suspicious situation has been stabilized. What essential information must be documented in the official incident report?',
        type: 'single-choice',
        options: [
          {
            id: 'opt-2a',
            text: 'Speculative theories and personal assumptions about the suspect motives.',
          },
          {
            id: 'opt-2b',
            text: 'Accurate date/time, exact location, observable physical facts, actions taken, and witness statements.',
          },
          {
            id: 'opt-2c',
            text: 'Only a high-level note stating that nothing catastrophic occurred.',
          },
          {
            id: 'opt-2d',
            text: 'Informal text message to colleagues without logging a formal report.',
          },
        ],
        correctAnswer: 'opt-2b',
        explanation:
          'Correct! Formal security incident reports are legal documents. They must record factual, verifiable information: date, time, exact coordinates/location, concrete observations, actions initiated, and corroborating witnesses.',
        hint: 'Security reports must remain objective, factual, and complete.',
      },
    },
  ],
};
