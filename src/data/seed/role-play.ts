import { RolePlayScenario } from '../../types';

export const seedRolePlayScenario: RolePlayScenario = {
  id: 'roleplay-alex-morgan',
  title: 'Alex Morgan — Upset Visitor De-escalation',
  objective:
    'De-escalate an upset corporate visitor who demands immediate restricted access without an appointment badge. Maintain professional composure, enforce access control policy, listen empathetically, and guide the visitor toward an approved compromise.',
  defaultPassingScore: 75,
  maxTurns: 6,
  timeLimitSeconds: 300,
  character: {
    id: 'char-alex-morgan',
    name: 'Alex Morgan',
    role: 'Corporate Tech Partner / Visitor',
    avatarUrl: '/assets/avatars/alex-morgan.jpg',
    initialEmotion: 'frustrated',
    personaDescription:
      'A busy partner executive who traveled from out of state for an executive pitch. Stressed about time, feeling disrespected by bureaucratic delay, but rational and cooperative when acknowledged with empathy and practical solutions.',
    initialGreeting:
      'Look officer, I have a multi-million-dollar presentation with your VP of Technology in five minutes! I don\'t care that your system doesn\'t have my name listed—open the turnstile and let me through right now!',
  },
  rubricDimensions: [
    {
      id: 'dim-professionalism',
      label: 'Professional Tone & Composure',
      weight: 25,
      description: 'Maintains polite, calm, and assertive communication without taking emotional bait.',
    },
    {
      id: 'dim-empathy',
      label: 'Empathy & Active Listening',
      weight: 25,
      description: 'Validates the visitor frustration and acknowledges the urgency of their schedule.',
    },
    {
      id: 'dim-compliance',
      label: 'Security Policy Compliance',
      weight: 30,
      description: 'Firmly prevents unbadged access into restricted areas; follows visitor verification protocol.',
    },
    {
      id: 'dim-deescalation',
      label: 'Practical De-escalation & Alternatives',
      weight: 20,
      description: 'Offers constructive alternatives (e.g. calling host, comfortable lounge seating, expedited sign-in).',
    },
  ],
  mockResponses: [
    {
      intent: 'empathy',
      keywords: ['understand', 'hear you', 'apologize', 'frustrat', 'stress', 'sorry', 'urgent', 'patience'],
      characterReply:
        'Thank you... at least someone here understands the pressure I\'m under. But the clock is ticking. What can you actually do to get me into this meeting on time?',
      emotionShift: 'calmer',
      dimensionScores: {
        'dim-professionalism': 95,
        'dim-empathy': 100,
        'dim-compliance': 85,
        'dim-deescalation': 90,
      },
    },
    {
      intent: 'procedure',
      keywords: ['badge', 'appointment', 'host', 'call', 'protocol', 'security policy', 'verify', 'id', 'license'],
      characterReply:
        'My host is Sarah Chen, VP of Technology. If you can call her executive assistant directly or reach her on Teams, she will clear me immediately. I have my government ID right here.',
      emotionShift: 'neutral',
      dimensionScores: {
        'dim-professionalism': 90,
        'dim-empathy': 85,
        'dim-compliance': 100,
        'dim-deescalation': 85,
      },
    },
    {
      intent: 'alternative',
      keywords: ['seat', 'coffee', 'lounge', 'calling now', 'dialing', 'escort', 'assist', 'expedite', 'receptionist'],
      characterReply:
        'Alright, fair enough. I will take a seat in the lounge while you call Sarah\'s desk. Please let her know Alex Morgan is here with the revised architecture slide deck.',
      emotionShift: 'calmer',
      dimensionScores: {
        'dim-professionalism': 100,
        'dim-empathy': 90,
        'dim-compliance': 100,
        'dim-deescalation': 100,
      },
    },
    {
      intent: 'hostility',
      keywords: ['shut up', 'arrest', 'leave', 'get out', 'police', 'trespass', 'force', 'don\'t care', 'my way'],
      characterReply:
        'Are you threatening me?! I am here on business with your executive team! Who is your supervisor? Give me your badge number right now!',
      emotionShift: 'more_agitated',
      dimensionScores: {
        'dim-professionalism': 20,
        'dim-empathy': 10,
        'dim-compliance': 40,
        'dim-deescalation': 15,
      },
    },
    {
      intent: 'passive',
      keywords: ['wait', 'rules are rules', 'not my job', 'cannot help', 'come back', 'reschedule'],
      characterReply:
        'Telling me "rules are rules" doesn\'t solve anything. I traveled four hours for this meeting. Please do your job and call someone who can approve my visit.',
      emotionShift: 'more_agitated',
      dimensionScores: {
        'dim-professionalism': 50,
        'dim-empathy': 30,
        'dim-compliance': 70,
        'dim-deescalation': 40,
      },
    },
    {
      intent: 'default',
      keywords: [],
      characterReply:
        'I hear what you\'re saying, but I need action. Can you contact my host or check if the invitation was sent to the secondary front desk queue?',
      emotionShift: 'neutral',
      dimensionScores: {
        'dim-professionalism': 75,
        'dim-empathy': 70,
        'dim-compliance': 80,
        'dim-deescalation': 70,
      },
    },
  ],
};
