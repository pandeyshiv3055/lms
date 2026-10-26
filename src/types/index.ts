/* ==========================================================================
   AEGIS DEFENSE & SECURITY — CORE TYPE DEFINITIONS
   ========================================================================== */

export type UserRole = 'learner' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  jobTitle: string;
  department: string;
  badgeCount?: number;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}

/* ==========================================================================
   Slide Content & Player Schema
   ========================================================================== */

export type SlideType =
  | 'intro'
  | 'instructor'
  | 'title'
  | 'summary'
  | 'text-image'
  | 'image-text'
  | 'bullet-list'
  | 'carousel'
  | 'card-grid'
  | 'scrollable-panel'
  | 'knowledge-check'
  | 'true-false'
  | 'multiple-choice'
  | 'hotspot'
  | 'room-inspection'
  | 'interactive-video'
  | 'branching-scenario'
  | 'role-play'
  | 'interactive-scenario'
  | 'quiz-intro'
  | 'quiz-question'
  | 'results'
  | 'completion';

export type CompletionRule =
  | 'manual'          // Learner clicks next when available
  | 'timer'           // Must wait for slide timer to elapse
  | 'interaction'     // Must interact with designated element
  | 'explore-all'     // Must open all tabs/cards/carousel items
  | 'pass-check'      // Must answer knowledge check correctly
  | 'all-rooms'       // Must complete room inspection activity
  | 'video-checkpoints' // Must complete interactive video & all checkpoints
  | 'branching-complete' // Must complete branching scenario pathway
  | 'roleplay-complete'; // Must complete AI roleplay session

export interface CarouselItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  badgeText?: string;
  keyPoints?: string[];
}

export interface CardGridItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  imageUrl?: string;
  detailedContent: string[];
  actionLabel?: string;
}

export interface ScrollablePanelData {
  panelTitle: string;
  paragraphs: string[];
  keyDirectives?: string[];
  imageOnLeft?: string;
  caption?: string;
  requiresFullScroll?: boolean;
}

export interface KnowledgeCheckOption {
  id: string;
  text: string;
}

export interface KnowledgeCheckData {
  question: string;
  type: 'single-choice' | 'multiple-select' | 'true-false';
  options: KnowledgeCheckOption[];
  correctAnswer: string | string[];
  explanation: string;
  hint?: string;
  maxAttempts?: number;
}

export interface SlideContent {
  headline?: string;
  subtitle?: string;
  bodyParagraphs?: string[];
  bulletPoints?: string[];
  instructorName?: string;
  instructorRole?: string;
  instructorAvatar?: string;
  carouselItems?: CarouselItem[];
  cards?: CardGridItem[];
  scrollablePanel?: ScrollablePanelData;
  knowledgeCheck?: KnowledgeCheckData;
  buildingScenarioId?: string;
  interactiveVideo?: InteractiveVideoData;
  interactiveVideoData?: InteractiveVideoData;
  branchingScenario?: BranchingScenarioData;
  branchingScenarioData?: BranchingScenarioData;
  rolePlayScenario?: RolePlayScenario;
  takeawayMessage?: string;
}

export interface Slide {
  id: string;
  lessonId: string;
  title: string;
  type: SlideType;
  narrationText?: string;
  audioUrl?: string;
  durationSeconds?: number;
  requiredDurationSeconds?: number;
  mediaUrl?: string;
  mediaCaption?: string;
  content: SlideContent;
  completionRule: CompletionRule;
}

/* ==========================================================================
   Interactive Room & Building Inspection Simulation
   ========================================================================== */

export interface HotspotCoordinates {
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  width?: number; // percentage
  height?: number; // percentage
  label?: string;
}

export interface InspectionObject {
  id: string;
  label: string;
  hotspot: HotspotCoordinates;
  objectType: 'equipment' | 'furniture' | 'hazard' | 'access' | 'safety' | 'document' | 'other';
  isExpectedTarget: boolean;
  acceptedIncidentCategories?: string[];
  incidentType?: string;
  incidentDetails?: string;
  feedbackCorrect?: string;
  feedbackWhyItMatters?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface Irregularity {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'safety' | 'maintenance' | 'compliance';
  hotspot: HotspotCoordinates;
  feedbackCorrect: string;
  feedbackWhyItMatters: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface Room {
  id: string;
  name: string;
  code: string;
  buildingCoordinates: HotspotCoordinates;
  roomImage: string;
  required: boolean;
  hasIrregularities: boolean;
  promptQuestion: string; // e.g. "Are there any irregularities in this room?"
  correctAnswerHasIrregularity: boolean;
  explanation: string;
  objects: InspectionObject[];
  correctFeedback?: string;
  incorrectFeedback?: string;
  irregularities: Irregularity[];
}

export interface BuildingScenario {
  id: string;
  title: string;
  description: string;
  buildingImage: string;
  instructions: string;
  rooms: Room[];
  minimumRoomsRequired: number;
}

/* ==========================================================================
   Course & Syllabus Schema
   ========================================================================== */

export type LessonType =
  | 'instructor'
  | 'presentation'
  | 'knowledge-check'
  | 'inspection'
  | 'scenario'
  | 'quiz';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: LessonType;
  estimatedMinutes: number;
  slides: Slide[];
  requiresAllSlides: boolean;
}

export interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export type CourseStatus = 'published' | 'draft' | 'archived';

export interface Course {
  id: string;
  code: string;
  title: string;
  category: string;
  description: string;
  shortDescription: string;
  coverImage: string;
  duration: string;
  estimatedMinutes: number;
  level: 'Foundational' | 'Intermediate' | 'Advanced';
  objectives: string[];
  targetAudience: string;
  prerequisites: string[];
  modules: Module[];
  status: CourseStatus;
  badgeRewardId?: string;
  passingScore: number;
  assessmentId?: string;
}

/* ==========================================================================
   Quiz & Assessment Engine
   ========================================================================== */

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  type: 'single-choice' | 'multiple-select' | 'true-false' | 'scenario';
  options: QuizOption[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
  category?: string;
  scenarioContext?: string;
}

export interface Assessment {
  id: string;
  courseId: string;
  title: string;
  instructions: string;
  passingScore: number; // percentage, e.g. 80
  timeLimitMinutes?: number;
  maxAttempts: number;
  randomize: boolean;
  reviewAllowed: boolean;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  id: string;
  assessmentId: string;
  learnerId: string;
  timestamp: string;
  scorePercentage: number;
  passed: boolean;
  answers: Record<string, string | string[]>;
  feedbackSummary: string;
  earnedPoints: number;
  totalPoints: number;
}

/* ==========================================================================
   Badges, Gamification & Learner Progress
   ========================================================================== */

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  criteria: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  category: string;
  color: string;
}

export interface ActivePosition {
  slideIndex: number;
  elapsedSeconds: number;
  interactions: Record<string, any>;
  scrollPosition?: number;
  lastUpdated: string;
}

export interface SubmittedReport {
  roomId: string;
  objectId: string;
  objectLabel: string;
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isCorrect: boolean;
  submittedAt: string;
  feedbackText: string;
  whyItMatters?: string;
}

export interface RoomInspectionState {
  roomId: string;
  opened: boolean;
  yesNoAnswered: boolean;
  observedIrregularity?: boolean; // user chose Yes (true) or No (false)
  selectedObjectId?: string;
  report?: SubmittedReport;
  isCorrect: boolean;
  status: 'unvisited' | 'in_progress' | 'complete' | 'failed';
  attempts: number;
}

export interface RoomInspectionProgress {
  inspectedRoomIds: string[]; // completed room IDs for backward compat
  reportedIrregularityIds: string[];
  score: number;
  completed: boolean;
  roomAnswers: Record<string, boolean>; // roomId -> answer choice
  roomStates?: Record<string, RoomInspectionState>;
  submittedReports?: Record<string, SubmittedReport>;
}

export interface CourseProgressState {
  courseId: string;
  percentage: number;
  isCompleted: boolean;
  startedAt: string;
  completedAt?: string;
  lastAccessedLessonId?: string;
}

export interface LearnerProgress {
  userId: string;
  courseProgress: Record<string, CourseProgressState>;
  completedLessons: string[];
  completedSlides: Record<string, string[]>; // lessonId -> slideIds
  activeLessonPosition: Record<string, ActivePosition>; // lessonId -> state
  quizAttempts: Record<string, QuizAttempt[]>; // assessmentId -> attempts
  roomInspectionProgress: Record<string, RoomInspectionProgress>; // scenarioId -> progress
  videoProgress?: Record<string, InteractiveVideoProgress>; // videoId -> progress
  branchingProgress?: Record<string, BranchingScenarioProgress>; // scenarioId -> progress
  rolePlayProgress?: Record<string, RolePlayProgress>; // scenarioId -> progress
  activityResults?: Record<string, LearningActivityResult>; // activityId -> result
  earnedBadges: {
    badgeId: string;
    earnedAt: string;
    courseId?: string;
  }[];
}

/* ==========================================================================
   Level 1: Interactive Video Knowledge Checks
   ========================================================================== */

export interface CheckpointOption {
  id: string;
  text: string;
}

export interface CheckpointQuestion {
  id: string;
  prompt: string;
  type: 'single-choice' | 'multiple-select' | 'true-false' | 'short-text' | 'multiple-choice';
  options: CheckpointOption[];
  correctAnswer: string | string[]; // option id, array of ids, or accepted text string
  explanation: string;
  hint?: string;
}

export interface VideoCheckpoint {
  id: string;
  title?: string;
  timestampSeconds: number; // e.g. 15
  question: CheckpointQuestion;
  reviewStartSeconds: number; // e.g. 5
  reviewEndSeconds: number; // e.g. 15
  required: boolean;
  retryLimit?: number;
  maxRetries?: number;
  scoreWeight?: number; // points e.g. 10
  autoResumeOnCorrect?: boolean;
}

export interface InteractiveVideoData {
  id: string;
  title: string;
  videoUrl: string;
  posterUrl?: string;
  durationSeconds: number;
  transcriptText?: string;
  checkpoints: VideoCheckpoint[];
  preventFastForward?: boolean;
  requireFullReviewSegment?: boolean;
}

export interface InteractiveVideoProgress {
  currentCheckpointId?: string | null;
  completedCheckpointIds: string[];
  checkpointAnswers: Record<string, string | string[]>;
  checkpointAttempts: Record<string, number>;
  maxWatchedTimeSeconds: number;
  isComplete: boolean;
  score: number;
}

/* ==========================================================================
   Level 2: Branching Scenario Decisions
   ========================================================================== */

export interface ScenarioChoice {
  id: string;
  label: string;
  text?: string;
  description?: string;
  nextNodeId: string;
  score: number;
  scoreReward?: number;
  behaviorTag: 'professional' | 'confrontational' | 'neglect' | 'submissive';
  feedback: string;
}

export interface ScenarioNode {
  id: string;
  type: 'intro' | 'decision' | 'consequence' | 'ending';
  title: string;
  description?: string;
  videoUrl?: string;
  posterUrl?: string;
  choices?: ScenarioChoice[];
  feedback?: string;
  score?: number;
  consequenceSummary?: string;
  nextDefaultNodeId?: string;
  defaultNextNodeId?: string;
}

export interface BranchingScenarioData {
  id: string;
  title: string;
  description: string;
  initialNodeId: string;
  nodes: Record<string, ScenarioNode>;
  passingScore: number;
  rubric: Record<string, string>;
}

export interface BranchingScenarioProgress {
  currentNodeId: string;
  history: string[];
  choicesMade: Record<string, string>; // nodeId -> choiceId
  totalScore: number;
  completed: boolean;
}

/* ==========================================================================
   Level 3: AI Role-Play Foundation
   ========================================================================== */

export interface RolePlayCharacter {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  initialEmotion: 'frustrated' | 'agitated' | 'neutral' | 'calm';
  personaDescription: string;
  initialGreeting: string;
}

export interface RubricDimension {
  id: string;
  label: string;
  weight: number;
  description: string;
}

export interface MockDialogueRule {
  intent: 'empathy' | 'procedure' | 'alternative' | 'hostility' | 'passive' | 'default';
  keywords: string[];
  characterReply: string;
  emotionShift: 'calmer' | 'neutral' | 'more_agitated';
  dimensionScores: Record<string, number>; // dimensionId -> score 0-100
}

export interface RolePlayScenario {
  id: string;
  title: string;
  objective: string;
  character: RolePlayCharacter;
  maxTurns: number;
  timeLimitSeconds?: number;
  rubricDimensions: RubricDimension[];
  mockResponses: MockDialogueRule[];
  defaultPassingScore: number;
}

export interface ChatMessage {
  id: string;
  sender: 'learner' | 'character' | 'system';
  text: string;
  timestamp: string;
  emotionState?: 'frustrated' | 'agitated' | 'neutral' | 'calm';
  emotion?: 'frustrated' | 'agitated' | 'neutral' | 'calm' | 'calmer' | 'more_agitated';
  intentCategory?: string;
  intentMatched?: string;
}

export interface RolePlayEvaluation {
  overallScore: number;
  passed: boolean;
  dimensionScores: Record<string, number>;
  strengths: string[];
  improvements: string[];
  sampleAlternativePhrasing?: string;
  remediationAdvice?: string;
  completionTimestamp?: string;
  evaluatedAt?: string;
}

export interface RolePlayProgress {
  scenarioId: string;
  messages: ChatMessage[];
  completed: boolean;
  evaluation?: RolePlayEvaluation;
  turnsCount?: number;
  turnsCompleted?: number;
  score?: number;
}

/* ==========================================================================
   Unified Activity Contract & Tracking / Multi-Tenancy
   ========================================================================== */

export interface LearningActivityResult {
  activityId: string;
  activityType: 'interactive_video' | 'branching_scenario' | 'role_play' | 'room_inspection' | 'quiz';
  completed: boolean;
  score?: number;
  attempts: number;
  completedAt?: string;
  details?: Record<string, any>;
}

export interface TenantConfig {
  id: string;
  name: string;
  brandTitle: string;
  logoUrl?: string;
  primaryColor: string;
  accentColor: string;
  tagline: string;
  domain: string;
  allowedCourseIds?: string[];
}

export interface ScormDataModel {
  'cmi.core.lesson_status': 'passed' | 'completed' | 'failed' | 'incomplete' | 'not attempted';
  'cmi.core.score.raw'?: number;
  'cmi.core.score.min'?: number;
  'cmi.core.score.max'?: number;
  'cmi.core.session_time'?: string;
  'cmi.suspend_data'?: string;
}

export interface XApiStatement {
  id: string;
  timestamp: string;
  actor: {
    name: string;
    mbox: string;
  };
  verb: {
    id: string;
    display: string;
  };
  object: {
    id: string;
    definition: {
      name: string;
      description?: string;
      type: string;
    };
  };
  result?: {
    score?: { raw: number; min: number; max: number; scaled: number };
    success?: boolean;
    completion?: boolean;
    response?: string;
  };
}

/* ==========================================================================
   Media Library & Assets
   ========================================================================== */

export interface MediaAsset {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'illustration' | 'badge';
  url: string;
  thumbnailUrl?: string;
  sizeBytes?: number;
  uploadedAt: string;
  category: string;
  isDemoUploaded?: boolean;
}

/* ==========================================================================
   Application Settings
   ========================================================================== */

export interface AppSettings {
  general: {
    productName: string;
    wordmark: string;
    defaultLanguage: string;
    timeFormat: '12h' | '24h';
    defaultCategory: string;
  };
  player: {
    autoAdvance: boolean;
    defaultNarration: boolean;
    allowReplay: boolean;
    allowRevisitCompleted: boolean;
    requireNarrationFinish: boolean;
    requireCardsExploration: boolean;
    requireAllRoomsInspection: boolean;
  };
  assessment: {
    defaultPassingScore: number;
    defaultMaxAttempts: number;
    immediateFeedback: boolean;
    allowReview: boolean;
  };
  gamification: {
    badgesEnabled: boolean;
    confettiOnPass: boolean;
  };
  learnerAnnouncement?: string;
}
