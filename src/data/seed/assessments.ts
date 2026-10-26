import { Assessment } from '../../types';

export const seedAssessments: Assessment[] = [
  {
    id: 'assessment-nature-role',
    courseId: 'course-nature-role',
    title: 'Final Certification Exam — The Nature & Role of Private Security',
    instructions:
      'This comprehensive assessment certifies your understanding of legal jurisdiction, observation methodologies, facility defense, and ethical responsibilities. An 80% passing threshold is required to unlock your AEGIS Professional Certification.',
    passingScore: 80,
    timeLimitMinutes: 20,
    maxAttempts: 3,
    randomize: false,
    reviewAllowed: true,
    questions: [
      {
        id: 'q1',
        text: 'What is the primary legal distinction between the powers of a licensed private security officer and a sworn law enforcement officer?',
        type: 'single-choice',
        points: 10,
        options: [
          { id: 'opt-a', text: 'Private security officers possess state-wide search and seizure jurisdiction on any public sidewalk.' },
          { id: 'opt-b', text: 'Private security derives authority primarily from property owner consent and contract law on private property, rather than statutory police powers.' },
          { id: 'opt-c', text: 'Private security officers can issue criminal citations and execute formal arrest warrants without probable cause.' },
          { id: 'opt-d', text: 'There is no legal difference between private security and sworn police officers.' },
        ],
        correctAnswer: 'opt-b',
        explanation:
          'Private security operates on private premises under delegated property owner authority. Security officers generally do not possess statutory police powers beyond standard citizen rights or specific state security licensing statutes.',
      },
      {
        id: 'q2',
        text: 'During a routine interior patrol, you notice an unattended executive laptop logged in with a VIP credential badge beside it. What is the immediate standard operating procedure?',
        type: 'single-choice',
        points: 10,
        options: [
          { id: 'opt-a', text: 'Take the laptop home to safeguard it overnight.' },
          { id: 'opt-b', text: 'Leave it untouched since executive suites are exempt from security policies.' },
          { id: 'opt-c', text: 'Log the time and location, secure the badge and workstation in accordance with Clean Desk policy, and file a security anomaly report.' },
          { id: 'opt-d', text: 'Post a public memo on the bulletin board with the employee name.' },
        ],
        correctAnswer: 'opt-c',
        explanation:
          'Unattended credentials and open workstations must be logged, secured per protocol, and reported to the Information Security / Facilities team to prevent physical data breaches.',
      },
      {
        id: 'q3',
        text: 'Which of the following elements must ALWAYS be included in a professional incident report? (Select all that apply)',
        type: 'multiple-select',
        points: 10,
        options: [
          { id: 'opt-a', text: 'Exact date, timestamp, and specific physical location' },
          { id: 'opt-b', text: 'Personal emotional speculation on what the suspect was thinking' },
          { id: 'opt-c', text: 'Objective factual observations (who, what, when, where, how)' },
          { id: 'opt-d', text: 'Names and contact information of identified witnesses' },
        ],
        correctAnswer: ['opt-a', 'opt-c', 'opt-d'],
        explanation:
          'Professional incident reports must be strictly objective, containing exact dates/times, locations, factual observations, and witness details. Personal speculation or subjective emotional guesses should never be included.',
      },
      {
        id: 'q4',
        text: 'True or False: A security officer may routinely search the personal backpack of any visitor walking on a public street adjacent to a corporate facility without their consent.',
        type: 'true-false',
        points: 10,
        options: [
          { id: 'true', text: 'True' },
          { id: 'false', text: 'False' },
        ],
        correctAnswer: 'false',
        explanation:
          'False. Private security authority does not extend to public sidewalks or non-contracted public areas, and involuntary searches without consent violate constitutional rights.',
      },
      {
        id: 'q5',
        text: 'When conducting facility inspections, what is the minimum clearance distance required in front of emergency fire exit doors under standard OSHA/NFPA regulations?',
        type: 'single-choice',
        points: 10,
        options: [
          { id: 'opt-a', text: '12 inches' },
          { id: 'opt-b', text: '24 inches' },
          { id: 'opt-c', text: '36 inches (3 feet) unobstructed width along the entire exit path' },
          { id: 'opt-d', text: 'Storage is permitted if crates are labeled non-flammable' },
        ],
        correctAnswer: 'opt-c',
        explanation:
          'OSHA and NFPA fire safety standards require at least 36 inches of unobstructed, clear exit pathway to prevent crushing or fatal delays during an emergency evacuation.',
      },
      {
        id: 'q6',
        text: 'You discover an unidentifiable duffel bag left unattended near the main reception desk. Which initial action is strictly PROHIBITED?',
        type: 'single-choice',
        points: 10,
        options: [
          { id: 'opt-a', text: 'Vigorously shaking or opening the package to examine its contents' },
          { id: 'opt-b', text: 'Attempting to locate the owner among current visitors in the lobby' },
          { id: 'opt-c', text: 'Notifying the security supervisor and facility management' },
          { id: 'opt-d', text: 'Establishing a safety perimeter around the item' },
        ],
        correctAnswer: 'opt-a',
        explanation:
          'Never shake, handle, open, or kick a suspicious unattended package. Treat potential explosive or hazardous items with extreme caution by isolating the area and alerting supervisors/specialists.',
      },
      {
        id: 'q7',
        text: 'What is the primary role of a private security officer during an active building fire alarm?',
        type: 'single-choice',
        points: 10,
        options: [
          { id: 'opt-a', text: 'Enter burning rooms with standard uniforms to extinguish structural fires' },
          { id: 'opt-b', text: 'Assist with orderly evacuation, verify clear exit paths, direct occupants to assembly points, and guide arriving emergency responders' },
          { id: 'opt-c', text: 'Lock all perimeter doors to trap visitors inside until an inventory count is completed' },
          { id: 'opt-d', text: 'Immediately abandon the post without alerting colleagues or dispatch' },
        ],
        correctAnswer: 'opt-b',
        explanation:
          'Security officers facilitate orderly evacuation, ensure egress routes are open, prevent re-entry, and liaise with the municipal fire department upon arrival.',
      },
      {
        id: 'q8',
        text: 'Which patrol method is most effective at preventing predictable security bypass by adversaries?',
        type: 'single-choice',
        points: 10,
        options: [
          { id: 'opt-a', text: 'Walking the exact same route at precisely the same minute every hour' },
          { id: 'opt-b', text: 'Remaining stationary behind a partition with eyes closed' },
          { id: 'opt-c', text: 'Irregular, randomized patrol routes varying in direction, timing, and checkpoint sequencing' },
          { id: 'opt-d', text: 'Announcing patrol timings over the facility loudspeaker' },
        ],
        correctAnswer: 'opt-c',
        explanation:
          'Randomized and irregular patrols eliminate predictable timing gaps that intruders or trespassers might otherwise exploit.',
      },
      {
        id: 'q9',
        text: 'True or False: If a trespasser refuses a polite request to leave private property, a security officer should escalate to physical violence before contacting supervisory or police backup.',
        type: 'true-false',
        points: 10,
        options: [
          { id: 'true', text: 'True' },
          { id: 'false', text: 'False' },
        ],
        correctAnswer: 'false',
        explanation:
          'False. De-escalation techniques, verbal conflict resolution, and contacting police backup must always take precedence over physical altercation, which is strictly a measure of last resort for self-defense.',
      },
      {
        id: 'q10',
        text: 'Scenario: An employee approaches the security turnstile without their corporate access badge, stating they left it at home and are late for a critical meeting. What is the compliant procedure?',
        type: 'single-choice',
        points: 10,
        options: [
          { id: 'opt-a', text: 'Wave them through immediately because you recognize their face' },
          { id: 'opt-b', text: 'Verify their identity using government-issued photo ID against the HR active employee roster, issue a logged temporary day badge, and record the transaction' },
          { id: 'opt-c', text: 'Lend them your own master security officer access card for the day' },
          { id: 'opt-d', text: 'Refuse all entry and bar them from contacting their supervisor' },
        ],
        correctAnswer: 'opt-b',
        explanation:
          'Strict access control mandates verified identity against authorized personnel rosters, temporary badge issuance, and auditable transaction logging. Never bypass turnstiles or share officer master badges.',
      },
    ],
  },
];
