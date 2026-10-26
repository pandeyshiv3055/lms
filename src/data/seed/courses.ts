import { Course } from '../../types';
import { seedInteractiveVideo } from './interactive-video';
import { seedBranchingScenario } from './branching-scenario';
import { seedRolePlayScenario } from './role-play';

export const seedCourses: Course[] = [
  {
    id: 'course-nature-role',
    code: 'SEC-101',
    title: 'The Nature and Role of Private Security',
    category: 'Foundations',
    shortDescription: 'Master the legal authorities, ethical responsibilities, and operational duties of professional security personnel.',
    description:
      'The foundational certification course for private security professionals. Explores legal boundaries, observation methodologies, facility defense, access control, room hazard inspections, and professional incident escalation standards.',
    coverImage: 'course-nature-role',
    duration: '2h 45m',
    estimatedMinutes: 165,
    level: 'Foundational',
    objectives: [
      'Differentiate between private security authority and statutory police powers.',
      'Operate interactive facility security controls and report environmental irregularities.',
      'Execute access control and patrol observation in commercial facilities.',
      'Draft objective, compliant incident documentation.',
      'Attain 80%+ passing score on the AEGIS Certification Examination.',
    ],
    targetAudience: 'New security officers, corporate facility guards, patrol specialists, and compliance personnel.',
    prerequisites: ['Valid government photo identification', 'AEGIS Onboarding Induction'],
    status: 'published',
    badgeRewardId: 'badge-course-completion',
    passingScore: 80,
    assessmentId: 'assessment-nature-role',
    modules: [
      {
        id: 'mod-1-foundations',
        title: 'Module 1: Foundational Principles & Operational Duties',
        order: 1,
        lessons: [
          {
            id: 'lesson-basic-duties',
            title: 'Lesson 1.1: Basic Duties & Facility Inspection',
            description: 'Comprehensive interactive lesson with presenter carousel, scrollable legal panel, core duties cards, knowledge checks, and multi-room facility inspection.',
            type: 'instructor',
            estimatedMinutes: 45,
            requiresAllSlides: true,
            slides: [
              {
                id: 'slide-1-intro',
                lessonId: 'lesson-basic-duties',
                title: 'Welcome to Basic Duties & Professional Standards',
                type: 'intro',
                narrationText:
                  'Welcome to AEGIS Security Training. In this foundational module, you will master the legal authorities, core duties, and active inspection skills that define modern security operations.',
                durationSeconds: 15,
                requiredDurationSeconds: 6,
                completionRule: 'timer',
                content: {
                  headline: 'The Nature and Role of Private Security',
                  subtitle: 'AEGIS Certified Training — Course 101 • Part 1',
                  bodyParagraphs: [
                    'As a private security officer, you serve as the first line of defense for corporate personnel, proprietary assets, and critical infrastructure.',
                    'Throughout this interactive training module, you will explore instructional presentations, examine real-world legal boundaries, and conduct a simulated inspection of Facility 04.',
                  ],
                  instructorName: 'Chief Inspector Evelyn Cross',
                  instructorRole: 'Director of Training & Standards',
                },
              },
              {
                id: 'slide-2-instructor',
                lessonId: 'lesson-basic-duties',
                title: 'Authority & Legal Boundaries of Private Security',
                type: 'instructor',
                narrationText:
                  'Unlike sworn police officers who enforce criminal code across public jurisdictions, private security officers derive authority from property ownership and contract terms. Your powers are protective, preventative, and property-specific.',
                durationSeconds: 20,
                requiredDurationSeconds: 10,
                completionRule: 'timer',
                content: {
                  headline: 'Private Authority vs. Police Powers',
                  bodyParagraphs: [
                    'A critical distinction in modern security law is understanding where your authority begins and ends. Private security officers are hired to protect specified private premises.',
                    'Your primary tools are high-visibility deterrence, verbal de-escalation, access screening, observation, and formal reporting. You must never assume police powers without statutory warrant.',
                  ],
                  bulletPoints: [
                    'Authorized on contracted client premises and designated perimeter zones.',
                    'Empowered to enforce owner rules, deny entry, and request trespassers to depart.',
                    'Must respect constitutional rights and avoid unlawful detainment or searches.',
                  ],
                  instructorName: 'Senior Instructor Marcus Vance',
                  instructorRole: 'Tactical Operations Lead',
                },
              },
              {
                id: 'slide-3-carousel',
                lessonId: 'lesson-basic-duties',
                title: 'Security Operations & Response Framework',
                type: 'carousel',
                narrationText:
                  'Use the interactive arrows on the presentation board to review the four phases of the AEGIS Security Response Framework. Ensure you explore every phase before continuing.',
                durationSeconds: 25,
                completionRule: 'explore-all',
                content: {
                  headline: 'Interactive Operations Board',
                  subtitle: 'Explore each phase using the left and right navigation arrows.',
                  carouselItems: [
                    {
                      id: 'phase-deter',
                      title: 'Phase 1: Deterrence & Perimeter Visibility',
                      description:
                        'A sharp uniform, disciplined posture, and proactive patrol presence discourage unauthorized trespassers, potential burglars, and opportunists before an incident occurs.',
                      badgeText: 'Preventative',
                      keyPoints: [
                        'Maintain high visibility at primary facility access choke-points.',
                        'Conduct randomized exterior rounds to eliminate predictable gaps.',
                        'Ensure all perimeter fencing and security illumination are operational.',
                      ],
                    },
                    {
                      id: 'phase-detect',
                      title: 'Phase 2: Detection & Environmental Observation',
                      description:
                        'Vigilant officers use all senses to detect anomalies: unusual noises, chemical odors, open doors, bypassed card readers, and suspicious unattended packages.',
                      badgeText: 'Active Sensing',
                      keyPoints: [
                        'Log all irregularities immediately upon sensory detection.',
                        'Cross-verify electronic alarms against physical scene verification.',
                        'Never overlook small discrepancies—they often precede larger breaches.',
                      ],
                    },
                    {
                      id: 'phase-deescalate',
                      title: 'Phase 3: Verbal De-escalation & Conflict Resolution',
                      description:
                        'When addressing non-compliant individuals or trespassers, employ professional command presence combined with calm, non-confrontational verbal direction.',
                      badgeText: 'Communication',
                      keyPoints: [
                        'Maintain a safe reactionary distance of at least 6 to 8 feet.',
                        'State facility rules calmly, clearly, and without personal insults.',
                        'Request supervisory or municipal police assistance when resistance persists.',
                      ],
                    },
                    {
                      id: 'phase-document',
                      title: 'Phase 4: Document & Evidence Escalation',
                      description:
                        'Every observation, irregularity, and response action must be committed to an objective, timestamped official incident report before end of shift.',
                      badgeText: 'Audit Trail',
                      keyPoints: [
                        'Include exact timestamps, zone codes, and full witness details.',
                        'Strictly record observable facts rather than personal assumptions.',
                        'Maintain continuous chain-of-custody for physical evidence or CCTV clips.',
                      ],
                    },
                  ],
                },
              },
              {
                id: 'slide-4-scrollable',
                lessonId: 'lesson-basic-duties',
                title: 'Legal Jurisdictions & Property Rights Directives',
                type: 'scrollable-panel',
                narrationText:
                  'Review the complete legal rights and statutory directives inside the scrollable panel. Ensure you review all sections to satisfy the reading requirement.',
                durationSeconds: 30,
                completionRule: 'interaction',
                content: {
                  headline: 'Statutory Directives & Property Rights',
                  scrollablePanel: {
                    panelTitle: 'Official AEGIS Operational Directives (Ref: SEC-REG-2026)',
                    requiresFullScroll: true,
                    imageOnLeft: 'legal-seal',
                    paragraphs: [
                      'Section 101.1 — Scope of Delegated Authority: A licensed security officer acts as an agent of the property owner. On private premises, the officer may verify identification, inspect bags where conditions of entry are clearly posted, and enforce facility rules.',
                      'Section 101.2 — Public Sidewalks and Boundaries: The security officer’s authority terminates at the legal property boundary. Officers cannot stop, question, or search members of the public traveling along municipal sidewalks or public roadways, even if adjacent to the property.',
                      'Section 101.3 — Use of Restraint and Detention: Detention of an individual is permitted only under strict citizen arrest statutes when a felony or misdemeanor breach of the peace is committed directly in the officer’s presence. In all ordinary trespass disputes, contacting local law enforcement is required.',
                      'Section 101.4 — Confidentiality & Information Security: All floor plans, access card numbers, employee schedules, and security camera placements are classified corporate trade secrets. Disclosing these details to unauthorized persons constitutes gross misconduct and grounds for legal prosecution.',
                      'Section 101.5 — Health and Environmental Safety: Security officers are designated as safety observers under OSHA general duty provisions. You are legally required to report open flame hazards, chemical spills, blocked fire exit doors, and non-functioning emergency lights during every shift tour.',
                    ],
                    keyDirectives: [
                      'Never cross onto public property to conduct enforcement actions.',
                      'Ensure all condition-of-entry signs are prominently posted and visible.',
                      'Safety hazards must be cordoned and reported immediately.',
                    ],
                  },
                },
              },
              {
                id: 'slide-5-card-grid',
                lessonId: 'lesson-basic-duties',
                title: 'Four Core Duties of the Professional Officer',
                type: 'card-grid',
                narrationText:
                  'Examine the four primary duty classifications of an AEGIS security officer. Click Learn More on each card to review detailed operational procedures.',
                durationSeconds: 30,
                completionRule: 'explore-all',
                content: {
                  headline: 'Primary Duty Classifications',
                  subtitle: 'Click "Learn More" on all four cards to explore detailed duty protocols.',
                  cards: [
                    {
                      id: 'card-access-control',
                      title: 'Access Control',
                      iconName: 'Key',
                      description: 'Regulating entry, screening visitors, checking badges, and enforcing biometric security barriers.',
                      actionLabel: 'Learn More',
                      detailedContent: [
                        'Verify all employee photo IDs and electronic RFID credentials before granting turnstile access.',
                        'Require all visitors, contractors, and delivery personnel to sign the digital visitor log and display guest lanyards at all times.',
                        'Escort unbadged individuals back to the reception area; do not allow unauthorized tailgating through secure doors.',
                        'Maintain constant operational readiness of turnstiles, metal detectors, and barrier gate hardware.',
                      ],
                    },
                    {
                      id: 'card-potential-hazards',
                      title: 'Responding to Potential Hazards',
                      iconName: 'AlertTriangle',
                      description: 'Identifying structural, chemical, electrical, and slip-and-fall hazards across the facility.',
                      actionLabel: 'Learn More',
                      detailedContent: [
                        'Conduct proactive visual scans for liquid spills, dangling electrical wires, and damaged lighting fixtures.',
                        'Verify that all emergency fire exit corridors, push bars, and extinguishers maintain a 36-inch clear zone.',
                        'Deploy high-visibility warning cones immediately upon discovering water or oil puddles on designated walkways.',
                        'Notify Facilities Management and dispatch official repair work orders through the AEGIS ticket system.',
                      ],
                    },
                    {
                      id: 'card-foot-patrols',
                      title: 'Foot & Mobile Patrols',
                      iconName: 'Compass',
                      description: 'Conducting randomized perimeter rounds and verifying physical door latches and window locks.',
                      actionLabel: 'Learn More',
                      detailedContent: [
                        'Vary the patrol route and time intervals to prevent adversarial reconnaissance and pattern recognition.',
                        'Physically test door latches, exterior gates, padlocks, and emergency exit doors to confirm positive latching.',
                        'Check low-light alleys, loading docks, trash compactors, and blind spots using approved high-lumen flashlights.',
                        'Scan electronic patrol checkpoint wands at designated checkpoints across all assigned facility sectors.',
                      ],
                    },
                    {
                      id: 'card-other-duties',
                      title: 'Other Critical Duties',
                      iconName: 'Shield',
                      description: 'Customer service, lost-and-found management, executive escorts, and emergency evacuations.',
                      actionLabel: 'Learn More',
                      detailedContent: [
                        'Deliver courteous, professional customer service to tenants, clients, and VIP guests without compromising security.',
                        'Safeguard unattended property and manage the chain of custody for items logged into the lost-and-found repository.',
                        'Provide safe physical escorts for employees traveling to parking garages or public transit after dark.',
                        'Direct building occupants to designated muster points during fire, active shooter, or severe weather alarms.',
                      ],
                    },
                  ],
                },
              },
              {
                id: 'slide-6-knowledge-check-1',
                lessonId: 'lesson-basic-duties',
                title: 'Knowledge Check: Legal Limits of Authority',
                type: 'knowledge-check',
                narrationText:
                  'Test your comprehension of private security authority. Select your answer and submit to receive immediate feedback.',
                completionRule: 'pass-check',
                content: {
                  headline: 'Knowledge Check — Authority Assessment',
                  knowledgeCheck: {
                    question:
                      'A security officer on duty at a corporate office observes a pedestrian drop litter on the public sidewalk 20 feet beyond the property gate. Can the officer physically detain the person?',
                    type: 'single-choice',
                    options: [
                      { id: 'kc1-opt1', text: 'Yes, security officers have state-wide police powers to enforce sanitation laws everywhere.' },
                      { id: 'kc1-opt2', text: 'No, private security authority terminates at the private property boundary and does not include detaining pedestrians on public sidewalks for minor infractions.' },
                      { id: 'kc1-opt3', text: 'Yes, provided the officer is wearing a badge and uniform.' },
                      { id: 'kc1-opt4', text: 'Only if the litter was dropped within sight of the building.' },
                    ],
                    correctAnswer: 'kc1-opt2',
                    explanation:
                      'Correct! Private security officers have no jurisdiction on public sidewalks to detain citizens for municipal code violations such as littering. Your powers are strictly limited to the private contracted property.',
                    hint: 'Remember where private property authority begins and ends relative to public roadways.',
                  },
                },
              },
              {
                id: 'slide-7-knowledge-check-2',
                lessonId: 'lesson-basic-duties',
                title: 'Knowledge Check: Core Duties & Reporting',
                type: 'knowledge-check',
                narrationText:
                  'Select all compliant responses to verify your understanding of incident reporting and duty execution.',
                completionRule: 'pass-check',
                content: {
                  headline: 'Knowledge Check — Duty Protocols',
                  knowledgeCheck: {
                    question:
                      'Which of the following actions align with the core duties of a professional security officer? (Select all that apply)',
                    type: 'multiple-select',
                    options: [
                      { id: 'kc2-opt1', text: 'Reporting a chemical puddle on a warehouse walkway and deploying caution cones' },
                      { id: 'kc2-opt2', text: 'Leaving the post early without telling anyone if nothing seems to be happening' },
                      { id: 'kc2-opt3', text: 'Physically verifying that perimeter fire escape doors are latched and unobstructed' },
                      { id: 'kc2-opt4', text: 'Logging the discovery of an unattended corporate laptop and notifying Information Security' },
                    ],
                    correctAnswer: ['kc2-opt1', 'kc2-opt3', 'kc2-opt4'],
                    explanation:
                      'Excellent! Proactive hazard reporting, verifying emergency exit doors, and securing unattended equipment are all core duties. Abandoning a post without authorization is a critical violation of duty.',
                    hint: 'Consider which actions demonstrate diligence, life safety, and asset protection.',
                  },
                },
              },
              {
                id: 'slide-8-room-inspection',
                lessonId: 'lesson-basic-duties',
                title: 'Facility 04 Building & Multi-Room Inspection',
                type: 'room-inspection',
                narrationText:
                  'This is your practical facility inspection. Select each room on the building exterior, inspect the scene for security and safety irregularities, and report all issues found.',
                completionRule: 'all-rooms',
                content: {
                  headline: 'Basic Duties — Facility Inspection Activity',
                  subtitle: 'Inspect all 6 rooms in Facility 04, report irregularities, and certify the building.',
                  buildingScenarioId: 'scenario-facility-04',
                },
              },
              {
                id: 'slide-9-summary',
                lessonId: 'lesson-basic-duties',
                title: 'Lesson Summary & Qualification Complete',
                type: 'summary',
                narrationText:
                  'Congratulations! You have completed Lesson 1.1: Basic Duties & Facility Inspection. You are now prepared to advance to Ethics & Public Interaction and the Final Certification Exam.',
                durationSeconds: 15,
                requiredDurationSeconds: 5,
                completionRule: 'manual',
                content: {
                  headline: 'Lesson 1.1 Complete: Outstanding Work, Officer!',
                  subtitle: 'Foundational Knowledge & Inspection Qualification Achieved',
                  bodyParagraphs: [
                    'You have successfully demonstrated comprehension of private security jurisdiction, completed the operations carousel, examined the legal directives, and inspected all 6 facility zones.',
                    'Your progress has been recorded. Continue to the next lesson or proceed to the Final Assessment when ready to claim your certification badge.',
                  ],
                  takeawayMessage: 'Always remain vigilant: Deter, Detect, De-escalate, and Document.',
                },
              },
            ],
          },
          {
            id: 'lesson-ethics-conduct',
            title: 'Lesson 1.2: Ethics, Conduct & Public Interaction',
            description: 'Professional officer conduct, diversity, de-escalation methods, and customer service in high-stress situations.',
            type: 'presentation',
            estimatedMinutes: 30,
            requiresAllSlides: true,
            slides: [
              {
                id: 'slide-ethics-intro',
                lessonId: 'lesson-ethics-conduct',
                title: 'Ethics and Professional Integrity',
                type: 'instructor',
                narrationText:
                  'Ethical conduct is the cornerstone of effective security. In this lesson, we examine standards of integrity, bias-free policing, and conflict de-escalation.',
                durationSeconds: 15,
                completionRule: 'timer',
                content: {
                  headline: 'Professional Ethics in Private Security',
                  bodyParagraphs: [
                    'Security officers possess significant responsibility over life safety and sensitive corporate property. Maintaining public trust demands adherence to an unshakeable ethical code.',
                    'Officers must never accept personal gratuities, abuse authority, or treat individuals disparately based on race, gender, nationality, or socio-economic background.',
                  ],
                  instructorName: 'Chief Inspector Evelyn Cross',
                  instructorRole: 'Director of Standards',
                },
              },
              {
                id: 'slide-ethics-tf',
                lessonId: 'lesson-ethics-conduct',
                title: 'Knowledge Check: Ethical Conflict Resolution',
                type: 'knowledge-check',
                completionRule: 'pass-check',
                content: {
                  headline: 'Ethics Knowledge Check',
                  knowledgeCheck: {
                    question:
                      'True or False: If an upset tenant yells insults at a security officer during a fire drill, the officer is ethically justified in yelling back and threatening physical violence.',
                    type: 'true-false',
                    options: [
                      { id: 'true', text: 'True' },
                      { id: 'false', text: 'False' },
                    ],
                    correctAnswer: 'false',
                    explanation:
                      'False. Professional security officers must maintain emotional control and emotional intelligence. Verbal insults must never be met with retaliatory hostility or physical threats.',
                  },
                },
              },
              {
                id: 'slide-ethics-summary',
                lessonId: 'lesson-ethics-conduct',
                title: 'Ethics Lesson Summary',
                type: 'summary',
                completionRule: 'manual',
                content: {
                  headline: 'Ethics Module Completed',
                  bodyParagraphs: [
                    'You have reinforced the fundamental commitment to integrity, dignity, and professional de-escalation that embodies AEGIS security professionals.',
                  ],
                },
              },
            ],
          },
          {
            id: 'lesson-incident-deescalation',
            title: 'Lesson 1.3: Incident Reporting & De-escalation (Interactive Pilot)',
            description:
              'Advanced hands-on training combining Level 1 Interactive Video Knowledge Checks, Level 2 Branching Scenario Decisions, and Level 3 AI Role-Play Simulation.',
            type: 'presentation',
            estimatedMinutes: 35,
            requiresAllSlides: true,
            slides: [
              {
                id: 'slide-pilot-intro',
                lessonId: 'lesson-incident-deescalation',
                title: 'Module Overview: Interactive Security Scenarios',
                type: 'intro',
                narrationText:
                  'Welcome to the AEGIS Interactive Training Pilot. In this lesson, you will master real-world incident response through three tiers of experiential learning: interactive video checkpoints, branching scenario choices, and AI-simulated visitor role-play.',
                durationSeconds: 15,
                requiredDurationSeconds: 5,
                completionRule: 'timer',
                content: {
                  headline: 'Level 1–3 Interactive Training Pilot',
                  subtitle: 'Incident Recognition, Decision Branching & Adaptive Role-Play',
                  bodyParagraphs: [
                    'Traditional passive video training fails to build muscle memory for critical security incidents. In this pilot module, your active participation is required at every stage.',
                    'First, you will watch an operational patrol video with strict timestamp checkpoints and review replays. Next, you will navigate an escalating visitor dispute where every decision determines the operational outcome. Finally, you will engage in adaptive dialogue with a simulated corporate visitor.',
                  ],
                  instructorName: 'Chief Inspector Evelyn Cross',
                  instructorRole: 'Director of Training & Standards',
                },
              },
              {
                id: 'slide-interactive-video-1',
                lessonId: 'lesson-incident-deescalation',
                title: 'Level 1: Recognizing and Reporting a Security Incident',
                type: 'interactive-video',
                completionRule: 'video-checkpoints',
                content: {
                  headline: 'Interactive Video Knowledge Check',
                  subtitle: 'Mandatory Checkpoint Enforcement with Replay Protection',
                  interactiveVideoData: seedInteractiveVideo,
                },
              },
              {
                id: 'slide-branching-scenario-1',
                lessonId: 'lesson-incident-deescalation',
                title: 'Level 2: Handling an Upset Visitor at Reception',
                type: 'branching-scenario',
                completionRule: 'branching-complete',
                content: {
                  headline: 'Branching Scenario Decision Lab',
                  subtitle: 'Real-Time Consequence Video Engine',
                  branchingScenarioData: seedBranchingScenario,
                },
              },
              {
                id: 'slide-ai-roleplay-1',
                lessonId: 'lesson-incident-deescalation',
                title: 'Level 3: Simulated Role-Play with Alex Morgan',
                type: 'role-play',
                completionRule: 'roleplay-complete',
                content: {
                  headline: 'Adaptive Communication Role-Play',
                  subtitle: 'Text & Voice Frontline De-escalation Practice',
                  rolePlayScenario: seedRolePlayScenario,
                },
              },
              {
                id: 'slide-pilot-summary',
                lessonId: 'lesson-incident-deescalation',
                title: 'Interactive Pilot Mastery Summary',
                type: 'summary',
                completionRule: 'manual',
                content: {
                  headline: 'Interactive Training Pilot Complete',
                  bodyParagraphs: [
                    'Outstanding performance. You have successfully demonstrated critical incident recognition under checkpoint gating, resolved access disputes across branching consequence pathways, and applied de-escalation communication in the interactive role-play simulation.',
                    'Your activity scores and SCORM/xAPI statement streams have been recorded to the learning management record store.',
                  ],
                  takeawayMessage: 'Security excellence is defined by active observation, sound judgment, and calm de-escalation.',
                },
              },
            ],
          },
        ],
      },
      {
        id: 'mod-2-assessment',
        title: 'Module 2: Comprehensive Assessment & Certification',
        order: 2,
        lessons: [
          {
            id: 'lesson-final-exam',
            title: 'Lesson 2.1: Final Certification Examination',
            description: '10-question comprehensive certification exam. Requires an 80% passing score to earn your AEGIS Security Certification.',
            type: 'quiz',
            estimatedMinutes: 30,
            requiresAllSlides: true,
            slides: [
              {
                id: 'slide-quiz-intro',
                lessonId: 'lesson-final-exam',
                title: 'Certification Examination Instructions',
                type: 'quiz-intro',
                completionRule: 'manual',
                content: {
                  headline: 'AEGIS Final Certification Examination',
                  subtitle: '10 Comprehensive Questions • 80% Passing Threshold',
                  bodyParagraphs: [
                    'You are about to begin the final certification exam for Course 101: The Nature and Role of Private Security.',
                    'This assessment evaluates your grasp of legal boundaries, incident reporting, facility inspection, access control, and ethical standards.',
                    'A score of 80% or greater is required to pass. Upon passing, your official certification badge will be automatically unlocked.',
                  ],
                },
              },
              {
                id: 'slide-quiz-engine',
                lessonId: 'lesson-final-exam',
                title: 'Examination Questions',
                type: 'quiz-question',
                completionRule: 'pass-check',
                content: {
                  headline: 'Final Certification Exam',
                },
              },
              {
                id: 'slide-quiz-results',
                lessonId: 'lesson-final-exam',
                title: 'Official Certification Results',
                type: 'results',
                completionRule: 'manual',
                content: {
                  headline: 'Examination Outcomes',
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'course-patrol-observation',
    code: 'SEC-102',
    title: 'Patrol Techniques and Observation',
    category: 'Field Operations',
    shortDescription: 'Master mobile, foot, and low-light sensory observation methodologies to detect perimeter vulnerabilities.',
    description:
      'Learn the tactical principles of conducting effective foot and vehicular security patrols. Covers patrol pacing, pattern randomization, night vision adaptation, checkpoint logging, and threat detection.',
    coverImage: 'course-patrol-observation',
    duration: '2h 15m',
    estimatedMinutes: 135,
    level: 'Intermediate',
    objectives: [
      'Implement randomized patrol routes to counter criminal observation.',
      'Operate digital checkpoint confirmation wands and perimeter sensors.',
      'Employ night vision and low-light sensory techniques.',
    ],
    targetAudience: 'Mobile security officers, night shift guards, perimeter inspectors.',
    prerequisites: ['SEC-101 The Nature and Role of Private Security'],
    status: 'published',
    badgeRewardId: 'badge-patrol-specialist',
    passingScore: 80,
    modules: [
      {
        id: 'mod-patrol-1',
        title: 'Module 1: Patrol Tactics & Route Randomization',
        order: 1,
        lessons: [
          {
            id: 'lesson-patrol-tactics',
            title: 'Lesson 1.1: Mobile and Foot Patrol Systems',
            description: 'Foot patrol pacing, checking mechanical latches, and avoiding stationary blind spots.',
            type: 'presentation',
            estimatedMinutes: 40,
            requiresAllSlides: true,
            slides: [
              {
                id: 'slide-patrol-1',
                lessonId: 'lesson-patrol-tactics',
                title: 'Tactical Patrol Principles',
                type: 'instructor',
                narrationText: 'A security patrol is not simply a walk around the building. It is an active sensory search for physical and operational vulnerabilities.',
                durationSeconds: 15,
                completionRule: 'timer',
                content: {
                  headline: 'Proactive Sensory Patrols',
                  bodyParagraphs: [
                    'Maintain a deliberate, scanning pace. Look high, low, and behind corners. Listen for running water, hiss of gas leaks, or low hum of unauthorized electrical equipment.',
                    'Check every ground-floor window and perimeter latch physically with your hand to verify that locking pins are fully engaged.',
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'course-access-control',
    code: 'SEC-103',
    title: 'Access Control and Visitor Management',
    category: 'Perimeter Defense',
    shortDescription: 'Implement visitor verification, electronic keycard turnstiles, contraband screening, and escort procedures.',
    description:
      'A comprehensive guide to managing access control choke points in high-security environments. Covers visitor screening, photo badging, temporary pass issuance, package inspections, and anti-tailgating enforcement.',
    coverImage: 'course-access-control',
    duration: '1h 50m',
    estimatedMinutes: 110,
    level: 'Intermediate',
    objectives: [
      'Manage electronic access control consoles and turnstiles.',
      'Enforce visitor badging and escort mandates.',
      'Mitigate tailgating and unauthorized piggybacking.',
    ],
    targetAudience: 'Lobby officers, concierge security staff, gatehouse guards.',
    prerequisites: ['SEC-101 The Nature and Role of Private Security'],
    status: 'published',
    badgeRewardId: 'badge-junior-officer',
    passingScore: 80,
    modules: [
      {
        id: 'mod-access-1',
        title: 'Module 1: Visitor Screening & Identity Verification',
        order: 1,
        lessons: [
          {
            id: 'lesson-access-screening',
            title: 'Lesson 1.1: Access Turnstiles and Credential Screening',
            description: 'Operating access control doors and identifying counterfeit or expired badges.',
            type: 'presentation',
            estimatedMinutes: 35,
            requiresAllSlides: true,
            slides: [
              {
                id: 'slide-access-1',
                lessonId: 'lesson-access-screening',
                title: 'Credential Verification Protocols',
                type: 'instructor',
                narrationText: 'Access control is only as strong as its strictest enforcement. Never grant bypass access without formal identity verification.',
                durationSeconds: 15,
                completionRule: 'timer',
                content: {
                  headline: 'Zero-Trust Physical Access',
                  bodyParagraphs: [
                    'All employees, contractors, and visitors must be authenticated before crossing the security threshold.',
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'course-incident-emergency',
    code: 'SEC-104',
    title: 'Incident Reporting and Emergency Response',
    category: 'Documentation & Crisis',
    shortDescription: 'Produce professional, legally defensible incident reports and coordinate building emergency evacuations.',
    description:
      'Learn the standard for objective incident documentation and crisis response. Covers chronological fact logging, evidence preservation, witness interviews, bomb threat management, and fire evacuation protocols.',
    coverImage: 'course-incident-emergency',
    duration: '2h 10m',
    estimatedMinutes: 130,
    level: 'Advanced',
    objectives: [
      'Draft objective incident reports conforming to legal evidentiary standards.',
      'Coordinate building evacuations during fire or active threats.',
      'Maintain unbroken chain-of-custody for physical and video evidence.',
    ],
    targetAudience: 'Shift supervisors, dispatchers, senior corporate security personnel.',
    prerequisites: ['SEC-101 The Nature and Role of Private Security'],
    status: 'published',
    badgeRewardId: 'badge-incident-reporter',
    passingScore: 80,
    modules: [
      {
        id: 'mod-incident-1',
        title: 'Module 1: The Anatomy of an Incident Report',
        order: 1,
        lessons: [
          {
            id: 'lesson-report-writing',
            title: 'Lesson 1.1: The Five Ws of Objective Security Documentation',
            description: 'Writing clear, chronological reports that withstand courtroom scrutiny.',
            type: 'presentation',
            estimatedMinutes: 45,
            requiresAllSlides: true,
            slides: [
              {
                id: 'slide-incident-1',
                lessonId: 'lesson-report-writing',
                title: 'Objective Fact Documentation',
                type: 'instructor',
                narrationText: 'In security operations, if it was not documented, it did not happen. Accuracy and objectivity are paramount.',
                durationSeconds: 15,
                completionRule: 'timer',
                content: {
                  headline: 'Professional Incident Reporting',
                  bodyParagraphs: [
                    'Ensure every entry clearly states who, what, when, where, why, and how with exact timestamps and verifiable witness testimony.',
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'course-workplace-safety',
    code: 'SEC-105',
    title: 'Workplace Safety and Hazard Recognition',
    category: 'Safety & Compliance',
    shortDescription: 'Identify OSHA hazards, maintain clear emergency egress, manage chemical safety, and respond to industrial accidents.',
    description:
      'Comprehensive occupational safety training for security officers. Covers fire protection systems, electrical hazards, chemical spill containment, slip/trip prevention, and personal protective equipment (PPE) guidelines.',
    coverImage: 'course-workplace-safety',
    duration: '1h 45m',
    estimatedMinutes: 105,
    level: 'Foundational',
    objectives: [
      'Detect physical and chemical hazards before injuries occur.',
      'Verify fire egress routes and extinguisher inspection tags.',
      'Deploy emergency spill containment kits and caution signage.',
    ],
    targetAudience: 'Industrial guards, warehouse security staff, safety wardens.',
    prerequisites: ['SEC-101 The Nature and Role of Private Security'],
    status: 'published',
    badgeRewardId: 'badge-safety-observer',
    passingScore: 80,
    modules: [
      {
        id: 'mod-safety-1',
        title: 'Module 1: Environmental Hazard Detection',
        order: 1,
        lessons: [
          {
            id: 'lesson-hazard-detection',
            title: 'Lesson 1.1: Slip, Trip and Fall Prevention in Industrial Facilities',
            description: 'Recognizing floor hazards, poor illumination, and improper material storage.',
            type: 'presentation',
            estimatedMinutes: 35,
            requiresAllSlides: true,
            slides: [
              {
                id: 'slide-safety-1',
                lessonId: 'lesson-hazard-detection',
                title: 'Hazard Recognition Protocol',
                type: 'instructor',
                narrationText: 'Safety observation is an ongoing duty. Every round is an opportunity to prevent a serious workplace accident.',
                durationSeconds: 15,
                completionRule: 'timer',
                content: {
                  headline: 'Workplace Hazard Identification',
                  bodyParagraphs: [
                    'Identify and cordon slip hazards, verify emergency egress clearances, and report broken luminaires immediately.',
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  },
];
