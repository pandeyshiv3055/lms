import { BranchingScenarioData } from '../../types';

export const seedBranchingScenario: BranchingScenarioData = {
  id: 'scenario-upset-visitor-branching',
  title: 'De-escalating an Upset Visitor at Reception',
  description:
    'A real-world interactive branching scenario. An unannounced visitor becomes aggressive at the facility turnstiles. Choose your operational response and experience the realistic consequences of your tactical communication.',
  initialNodeId: 'node-opening',
  passingScore: 80,
  rubric: {
    professional: 'Maintains composure, uses de-escalation phrasing, adheres to access control protocol without confrontation.',
    confrontational: 'Escalates hostility, issues aggressive ultimatums, compromises public trust and safety.',
    neglect: 'Abandons security post, leaves facility vulnerable, fails to document or assist.',
  },
  nodes: {
    'node-opening': {
      id: 'node-opening',
      type: 'intro',
      title: 'Situation: Upset Visitor Demands Restricted Access',
      description:
        'A visitor arrives at corporate reception demanding immediate entry to the executive suite. They do not possess an active visitor badge and are not listed on the day log. The visitor is speaking loudly and pacing aggressively.',
      videoUrl: '/assets/videos/scenario-opening-visitor.mp4',
      posterUrl: '/assets/videos/upset-visitor-poster.jpg',
      nextDefaultNodeId: 'node-decision-1',
    },
    'node-decision-1': {
      id: 'node-decision-1',
      type: 'decision',
      title: 'Decision Point 1: Operational Tactical Choice',
      description: 'The visitor raises their voice: "I have an urgent meeting right now! Let me through or I will walk past you!" How do you respond?',
      posterUrl: '/assets/videos/upset-visitor-poster.jpg',
      choices: [
        {
          id: 'choice-a-professional',
          label: 'Option A: Professional De-escalation & Verification Protocol',
          description:
            'Maintain a calm tone and 6-foot reactionary gap. Say: "I understand this is urgent for you, sir. Let me contact the department host immediately to confirm your visit while we complete your guest badge."',
          nextNodeId: 'node-consequence-calm',
          score: 100,
          behaviorTag: 'professional',
          feedback:
            'Excellent tactical communication! You validated the visitor emotional state without compromising physical security or bypassing visitor badging protocol.',
        },
        {
          id: 'choice-b-confrontational',
          label: 'Option B: Confrontational Ultimatum & Immediate Threat',
          description:
            'Step forward into the visitor personal space, raise your voice, and state: "You are not going anywhere! Sit down right now or I am having you arrested for trespassing!"',
          nextNodeId: 'node-consequence-escalation',
          score: 25,
          behaviorTag: 'confrontational',
          feedback:
            'Dangerous escalation! Aggressive posture and premature threats of arrest trigger defensive fight-or-flight reactions, increasing the risk of physical violence.',
        },
        {
          id: 'choice-c-neglect',
          label: 'Option C: Avoidance & Post Abandonment',
          description:
            'Refuse eye contact, say nothing, turn around, and walk into the back office hoping the visitor calms down on their own.',
          nextNodeId: 'node-consequence-ignored',
          score: 10,
          behaviorTag: 'neglect',
          feedback:
            'Critical dereliction of duty! Turning your back and abandoning the post leaves the turnstiles unguarded, creating an immediate breach opportunity.',
        },
      ],
    },
    'node-consequence-calm': {
      id: 'node-consequence-calm',
      type: 'consequence',
      title: 'Consequence: Tension Reduced & Host Contacted',
      description:
        'Seeing your calm, respectful posture and proactive assistance, the visitor takes a deep breath and steps back from the counter. The receptionist contacts the executive host, who confirms the appointment.',
      videoUrl: '/assets/videos/scenario-branch-calm.mp4',
      posterUrl: '/assets/videos/upset-visitor-poster.jpg',
      score: 100,
      consequenceSummary:
        'De-escalation successful. Visitor cooperates with badge issuance and awaits their escort.',
      feedback:
        'Tactical mastery demonstrated. By pairing verbal empathy with procedural firmness, you resolved the crisis safely.',
      nextDefaultNodeId: 'node-ending-success',
    },
    'node-consequence-escalation': {
      id: 'node-consequence-escalation',
      type: 'consequence',
      title: 'Consequence: Physical Agitation & Security Alarm',
      description:
        'Your confrontational ultimatum causes the visitor to shout louder, slam their hand on the desk, and attempt to shove through the optical turnstiles, triggering an audible intrusion alarm.',
      videoUrl: '/assets/videos/scenario-branch-escalation.mp4',
      posterUrl: '/assets/videos/upset-visitor-poster.jpg',
      score: 25,
      consequenceSummary:
        'Escalation occurred. Emergency dispatch required; lobby operations disrupted.',
      feedback:
        'Escalation failure. Hostile language converted a minor badging dispute into a high-liability physical confrontation.',
      nextDefaultNodeId: 'node-ending-failure',
    },
    'node-consequence-ignored': {
      id: 'node-consequence-ignored',
      type: 'consequence',
      title: 'Consequence: Security Breach & Unauthorized Entry',
      description:
        'With the security desk abandoned, the frustrated visitor pushes past the unmonitored barrier and enters the elevator bank unescorted, violating facility security perimeter.',
      videoUrl: '/assets/videos/scenario-branch-ignored.mp4',
      posterUrl: '/assets/videos/upset-visitor-poster.jpg',
      score: 10,
      consequenceSummary:
        'Perimeter breach. Lock-down initiated due to unbadged individual roaming corporate floors.',
      feedback:
        'Failure to maintain physical security post. Officers must never leave access barriers unattended during active disputes.',
      nextDefaultNodeId: 'node-ending-failure',
    },
    'node-ending-success': {
      id: 'node-ending-success',
      type: 'ending',
      title: 'Scenario Outcome: Commendable Resolution',
      description:
        'You successfully defended facility integrity, protected company personnel, and demonstrated the gold standard of professional private security de-escalation.',
      score: 100,
      consequenceSummary: 'Passed with Distinction: 100% Behavioral Compliance Score.',
    },
    'node-ending-failure': {
      id: 'node-ending-failure',
      type: 'ending',
      title: 'Scenario Outcome: Remediation Required',
      description:
        'The scenario concluded with an operational compromise or avoidable escalation. Review the tactical de-escalation directives and re-attempt the decision sequence.',
      score: 25,
      consequenceSummary: 'Unsuccessful Outcome: Below 80% Certification Threshold.',
    },
  },
};
