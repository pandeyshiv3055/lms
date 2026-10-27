import {
  InteractiveVideoData,
  BranchingScenarioData,
  RolePlayScenario,
  LessonInteractiveConfig,
  InteractiveConfigStatus,
} from '../types';
import { seedInteractiveVideo } from '../data/seed/interactive-video';
import { seedBranchingScenario } from '../data/seed/branching-scenario';
import { seedRolePlayScenario } from '../data/seed/role-play';
import { storageService } from './storage.service';
import { courseService } from './course.service';

class InteractiveService {
  private configs: Record<string, LessonInteractiveConfig> = {};

  constructor() {
    this.initialize();
  }

  private makeKey(courseId: string, lessonId: string): string {
    return `${courseId}:${lessonId}`;
  }

  public initialize(): void {
    const raw = storageService.getInteractiveModules();
    this.configs = { ...raw };

    // Migration / Baseline Association:
    // Ensure the known seed interactive modules are registered to course SEC-101 / lesson-incident-deescalation
    const allCourses = courseService.getCourses();
    const sec101 = allCourses.find((c) => c.code === 'SEC-101' || c.id === 'course-nature-role');
    const courseId = sec101 ? sec101.id : 'course-nature-role';
    const pilotLessonId = 'lesson-incident-deescalation';

    const pilotKey = this.makeKey(courseId, pilotLessonId);
    if (!this.configs[pilotKey] || !this.configs[pilotKey].level1?.checkpoints?.[0]?.title) {
      const seededVideo = JSON.parse(JSON.stringify(seedInteractiveVideo));
      if (seededVideo.checkpoints?.[0]) seededVideo.checkpoints[0].title = 'Unattended Item Recognition';
      if (seededVideo.checkpoints?.[1]) seededVideo.checkpoints[1].title = 'Incident Report Documentation';

      this.configs[pilotKey] = {
        id: pilotKey,
        courseId,
        lessonId: pilotLessonId,
        level1: seededVideo,
        level2: JSON.parse(JSON.stringify(seedBranchingScenario)),
        level3: JSON.parse(JSON.stringify(seedRolePlayScenario)),
        level1Status: 'validated',
        level2Status: 'validated',
        level3Status: 'validated',
        updatedAt: new Date().toISOString(),
      };
    }

    // Also support code-based key lookup for SEC-101
    const sec101Key = this.makeKey('SEC-101', pilotLessonId);
    if (!this.configs[sec101Key]) {
      this.configs[sec101Key] = this.configs[pilotKey];
    }

    // Auto-discover any interactive slides already configured in courses
    for (const c of allCourses) {
      for (const m of c.modules || []) {
        for (const l of m.lessons || []) {
          const key = this.makeKey(c.id, l.id);
          const existing = this.configs[key];

          let l1 = existing?.level1 || null;
          let l2 = existing?.level2 || null;
          let l3 = existing?.level3 || null;

          for (const s of l.slides || []) {
            if (s.type === 'interactive-video' && (s.content.interactiveVideoData || s.content.interactiveVideo)) {
              l1 = l1 || s.content.interactiveVideoData || s.content.interactiveVideo || null;
            }
            if (s.type === 'branching-scenario' && (s.content.branchingScenarioData || s.content.branchingScenario)) {
              l2 = l2 || s.content.branchingScenarioData || s.content.branchingScenario || null;
            }
            if (s.type === 'role-play' && s.content.rolePlayScenario) {
              l3 = l3 || s.content.rolePlayScenario || null;
            }
          }

          if (l1 || l2 || l3) {
            this.configs[key] = {
              id: key,
              courseId: c.id,
              lessonId: l.id,
              level1: l1,
              level2: l2,
              level3: l3,
              level1Status: l1 ? (existing?.level1Status || 'validated') : 'not-configured',
              level2Status: l2 ? (existing?.level2Status || 'validated') : 'not-configured',
              level3Status: l3 ? (existing?.level3Status || 'validated') : 'not-configured',
              updatedAt: existing?.updatedAt || new Date().toISOString(),
            };
          }
        }
      }
    }

    storageService.saveInteractiveModules(this.configs);
  }

  public getAllConfigs(): Record<string, LessonInteractiveConfig> {
    return { ...this.configs };
  }

  public getConfig(courseId: string, lessonId: string): LessonInteractiveConfig | null {
    if (!courseId || !lessonId) return null;
    const key = this.makeKey(courseId, lessonId);
    if (this.configs[key]) return this.configs[key];

    // Try resolving if courseId is course code (e.g. SEC-101)
    const courses = courseService.getCourses();
    const courseObj = courses.find((c) => c.id === courseId || c.code === courseId);
    if (courseObj) {
      const altKey = this.makeKey(courseObj.id, lessonId);
      if (this.configs[altKey]) return this.configs[altKey];
    }
    return null;
  }

  public validateCourseLesson(courseId: string, lessonId: string): { valid: boolean; error?: string } {
    if (!courseId) return { valid: false, error: 'Course identifier is required.' };
    if (!lessonId) return { valid: false, error: 'Lesson identifier is required.' };

    const context = courseService.getLesson(courseId, lessonId);
    if (!context) {
      // Check if courseId was passed as course code
      const allCourses = courseService.getCourses();
      const byCode = allCourses.find((c) => c.code === courseId);
      if (byCode) {
        const altContext = courseService.getLesson(byCode.id, lessonId);
        if (altContext) return { valid: true };
      }
      return {
        valid: false,
        error: `Lesson "${lessonId}" does not belong to course "${courseId}". Cross-course assignment rejected.`,
      };
    }
    return { valid: true };
  }

  // Level 1 Validation
  public validateLevel1(data: InteractiveVideoData): { valid: boolean; error?: string } {
    if (!data.title?.trim()) {
      return { valid: false, error: 'Interactive video title cannot be empty.' };
    }
    if (!data.videoUrl?.trim()) {
      return { valid: false, error: 'Video asset URL is required.' };
    }
    if (data.durationSeconds <= 0) {
      return { valid: false, error: 'Video duration must be greater than 0 seconds.' };
    }
    if (!data.checkpoints || data.checkpoints.length === 0) {
      return { valid: false, error: 'At least one video checkpoint is required.' };
    }

    for (let i = 0; i < data.checkpoints.length; i++) {
      const cp = data.checkpoints[i];
      if (!cp.title?.trim()) {
        cp.title =
          cp.id === 'ckpt-1-unattended-item'
            ? 'Unattended Item Recognition'
            : cp.id === 'ckpt-2-incident-report'
            ? 'Incident Report Documentation'
            : `Checkpoint #${i + 1}`;
      }
      if (cp.timestampSeconds < 0 || cp.timestampSeconds > data.durationSeconds) {
        return {
          valid: false,
          error: `Checkpoint #${i + 1} trigger (${cp.timestampSeconds}s) must fall within 0 to ${data.durationSeconds}s.`,
        };
      }
      if (cp.reviewStartSeconds < 0 || cp.reviewStartSeconds >= cp.reviewEndSeconds) {
        return {
          valid: false,
          error: `Checkpoint #${i + 1} mandatory review start must be less than review end (${cp.reviewStartSeconds}s to ${cp.reviewEndSeconds}s).`,
        };
      }
      if (!cp.question?.prompt?.trim()) {
        return { valid: false, error: `Checkpoint #${i + 1} question prompt cannot be empty.` };
      }
      if (!cp.question?.options || cp.question.options.length < 2) {
        return { valid: false, error: `Checkpoint #${i + 1} must have at least two answer options.` };
      }
      const match = cp.question.options.some((o) => o.id === cp.question.correctAnswer);
      if (!match) {
        return {
          valid: false,
          error: `Checkpoint #${i + 1} correct answer "${cp.question.correctAnswer}" does not match any available option ID.`,
        };
      }
    }

    return { valid: true };
  }

  // Level 2 Validation
  public validateLevel2(data: BranchingScenarioData): { valid: boolean; error?: string } {
    if (!data.title?.trim()) {
      return { valid: false, error: 'Branching scenario title cannot be empty.' };
    }
    if (!data.nodes || Object.keys(data.nodes).length === 0) {
      return { valid: false, error: 'Branching scenario must contain nodes.' };
    }
    if (!data.initialNodeId || !data.nodes[data.initialNodeId]) {
      return { valid: false, error: `Initial node "${data.initialNodeId}" does not exist in the graph.` };
    }

    const nodeIds = new Set(Object.keys(data.nodes));
    const missingReferences: string[] = [];
    let hasEndingOrConsequence = false;

    Object.values(data.nodes).forEach((node) => {
      if (node.type === 'consequence' || node.type === 'ending') {
        hasEndingOrConsequence = true;
      }
      if (node.choices) {
        node.choices.forEach((choice) => {
          if (!choice.nextNodeId || !nodeIds.has(choice.nextNodeId)) {
            missingReferences.push(
              `Choice "${choice.label}" in node "${node.id}" references non-existent node "${choice.nextNodeId}"`
            );
          }
        });
      }
      const defaultNext = node.defaultNextNodeId || node.nextDefaultNodeId;
      if (defaultNext && !nodeIds.has(defaultNext)) {
        missingReferences.push(`Node "${node.id}" references non-existent default next node "${defaultNext}"`);
      }
    });

    if (missingReferences.length > 0) {
      return { valid: false, error: `Graph Validation Failed: ${missingReferences.join('; ')}` };
    }

    if (!hasEndingOrConsequence) {
      return {
        valid: false,
        error: 'Graph must contain at least one consequence or ending destination node.',
      };
    }

    return { valid: true };
  }

  // Level 3 Validation
  public validateLevel3(data: RolePlayScenario): { valid: boolean; error?: string } {
    if (!data.character?.name?.trim()) {
      return { valid: false, error: 'Character name cannot be empty.' };
    }
    if (!data.character?.initialGreeting?.trim()) {
      return { valid: false, error: 'Character initial greeting cannot be empty.' };
    }
    if (data.defaultPassingScore < 1 || data.defaultPassingScore > 100) {
      return { valid: false, error: 'Passing threshold must be between 1% and 100%.' };
    }
    if (data.maxTurns < 1 || data.maxTurns > 50) {
      return { valid: false, error: 'Maximum conversation turns must be between 1 and 50.' };
    }
    if (!data.rubricDimensions || data.rubricDimensions.length === 0) {
      return { valid: false, error: 'Competency rubric must contain at least one dimension.' };
    }

    const totalWeight = data.rubricDimensions.reduce((sum, d) => sum + (Number(d.weight) || 0), 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      return {
        valid: false,
        error: `Competency rubric weights must sum to exactly 100% (current total: ${totalWeight}%).`,
      };
    }

    return { valid: true };
  }

  // Save Level 1
  public saveLevel1(
    courseId: string,
    lessonId: string,
    data: InteractiveVideoData
  ): { success: boolean; config?: LessonInteractiveConfig; error?: string } {
    const relCheck = this.validateCourseLesson(courseId, lessonId);
    if (!relCheck.valid) return { success: false, error: relCheck.error };

    const valCheck = this.validateLevel1(data);
    if (!valCheck.valid) return { success: false, error: valCheck.error };

    const key = this.makeKey(courseId, lessonId);
    const existing = this.getConfig(courseId, lessonId);

    const updatedConfig: LessonInteractiveConfig = {
      id: key,
      courseId,
      lessonId,
      level1: { ...data },
      level2: existing?.level2 || null,
      level3: existing?.level3 || null,
      level1Status: 'validated',
      level2Status: existing?.level2Status || 'not-configured',
      level3Status: existing?.level3Status || 'not-configured',
      updatedAt: new Date().toISOString(),
    };

    this.configs[key] = updatedConfig;
    storageService.saveInteractiveModules(this.configs);

    // Synchronize to Course Slides in courseService
    this.syncSlideToCourse(courseId, lessonId, 'interactive-video', data);

    return { success: true, config: updatedConfig };
  }

  // Save Level 2
  public saveLevel2(
    courseId: string,
    lessonId: string,
    data: BranchingScenarioData
  ): { success: boolean; config?: LessonInteractiveConfig; error?: string } {
    const relCheck = this.validateCourseLesson(courseId, lessonId);
    if (!relCheck.valid) return { success: false, error: relCheck.error };

    const valCheck = this.validateLevel2(data);
    if (!valCheck.valid) return { success: false, error: valCheck.error };

    const key = this.makeKey(courseId, lessonId);
    const existing = this.getConfig(courseId, lessonId);

    const updatedConfig: LessonInteractiveConfig = {
      id: key,
      courseId,
      lessonId,
      level1: existing?.level1 || null,
      level2: { ...data },
      level3: existing?.level3 || null,
      level1Status: existing?.level1Status || 'not-configured',
      level2Status: 'validated',
      level3Status: existing?.level3Status || 'not-configured',
      updatedAt: new Date().toISOString(),
    };

    this.configs[key] = updatedConfig;
    storageService.saveInteractiveModules(this.configs);

    // Synchronize to Course Slides
    this.syncSlideToCourse(courseId, lessonId, 'branching-scenario', data);

    return { success: true, config: updatedConfig };
  }

  // Save Level 3
  public saveLevel3(
    courseId: string,
    lessonId: string,
    data: RolePlayScenario
  ): { success: boolean; config?: LessonInteractiveConfig; error?: string } {
    const relCheck = this.validateCourseLesson(courseId, lessonId);
    if (!relCheck.valid) return { success: false, error: relCheck.error };

    const valCheck = this.validateLevel3(data);
    if (!valCheck.valid) return { success: false, error: valCheck.error };

    const key = this.makeKey(courseId, lessonId);
    const existing = this.getConfig(courseId, lessonId);

    const updatedConfig: LessonInteractiveConfig = {
      id: key,
      courseId,
      lessonId,
      level1: existing?.level1 || null,
      level2: existing?.level2 || null,
      level3: { ...data },
      level1Status: existing?.level1Status || 'not-configured',
      level2Status: existing?.level2Status || 'not-configured',
      level3Status: 'validated',
      updatedAt: new Date().toISOString(),
    };

    this.configs[key] = updatedConfig;
    storageService.saveInteractiveModules(this.configs);

    // Synchronize to Course Slides
    this.syncSlideToCourse(courseId, lessonId, 'role-play', data);

    return { success: true, config: updatedConfig };
  }

  // Synchronize to Course Slide in courseService
  private syncSlideToCourse(
    courseId: string,
    lessonId: string,
    type: 'interactive-video' | 'branching-scenario' | 'role-play',
    payload: any
  ): void {
    try {
      const context = courseService.getLesson(courseId, lessonId);
      if (!context) return;

      const { course, lesson } = context;
      const existingSlide = lesson.slides.find((s) => s.type === type);

      if (existingSlide) {
        if (type === 'interactive-video') {
          existingSlide.title = payload.title || existingSlide.title;
          existingSlide.content.interactiveVideoData = payload;
          existingSlide.content.interactiveVideo = payload;
        } else if (type === 'branching-scenario') {
          existingSlide.title = payload.title || existingSlide.title;
          existingSlide.content.branchingScenarioData = payload;
          existingSlide.content.branchingScenario = payload;
        } else if (type === 'role-play') {
          existingSlide.title = `Simulated Role-Play: ${payload.character.name}`;
          existingSlide.content.rolePlayScenario = payload;
        }
      } else {
        // Create matching interactive slide in the lesson
        if (type === 'interactive-video') {
          lesson.slides.push({
            id: `slide-interactive-video-${Date.now()}`,
            lessonId,
            title: payload.title || 'Interactive Video Checkpoints',
            type: 'interactive-video',
            completionRule: 'video-checkpoints',
            durationSeconds: payload.durationSeconds || 30,
            content: {
              headline: payload.title || 'Interactive Video Knowledge Check',
              subtitle: 'Mandatory Checkpoint Enforcement with Replay Protection',
              interactiveVideoData: payload,
            },
          });
        } else if (type === 'branching-scenario') {
          lesson.slides.push({
            id: `slide-branching-scenario-${Date.now()}`,
            lessonId,
            title: payload.title || 'Branching Decision Lab',
            type: 'branching-scenario',
            completionRule: 'branching-complete',
            content: {
              headline: payload.title || 'Branching Scenario Decision Lab',
              subtitle: 'Real-Time Consequence Video Engine',
              branchingScenarioData: payload,
            },
          });
        } else if (type === 'role-play') {
          lesson.slides.push({
            id: `slide-role-play-${Date.now()}`,
            lessonId,
            title: `Level 3: Simulated Role-Play with ${payload.character.name}`,
            type: 'role-play',
            completionRule: 'roleplay-complete',
            content: {
              headline: 'Adaptive Communication Role-Play',
              subtitle: `Frontline Practice with ${payload.character.name}`,
              rolePlayScenario: payload,
            },
          });
        }
      }

      courseService.saveCourse(course);
    } catch (e) {
      console.warn('[InteractiveService] Failed to sync slide to course:', e);
    }
  }

  // Deletion methods
  public deleteLevel1(courseId: string, lessonId: string): boolean {
    const key = this.makeKey(courseId, lessonId);
    if (!this.configs[key]) return false;
    this.configs[key].level1 = null;
    this.configs[key].level1Status = 'not-configured';
    this.configs[key].updatedAt = new Date().toISOString();
    storageService.saveInteractiveModules(this.configs);
    return true;
  }

  public deleteLevel2(courseId: string, lessonId: string): boolean {
    const key = this.makeKey(courseId, lessonId);
    if (!this.configs[key]) return false;
    this.configs[key].level2 = null;
    this.configs[key].level2Status = 'not-configured';
    this.configs[key].updatedAt = new Date().toISOString();
    storageService.saveInteractiveModules(this.configs);
    return true;
  }

  public deleteLevel3(courseId: string, lessonId: string): boolean {
    const key = this.makeKey(courseId, lessonId);
    if (!this.configs[key]) return false;
    this.configs[key].level3 = null;
    this.configs[key].level3Status = 'not-configured';
    this.configs[key].updatedAt = new Date().toISOString();
    storageService.saveInteractiveModules(this.configs);
    return true;
  }

  // Default Template Generators
  public createDefaultLevel1(title: string = 'Interactive Video Checkpoints'): InteractiveVideoData {
    return {
      id: `video-${Date.now()}`,
      title,
      videoUrl: '/assets/videos/security-incident-patrol.mp4',
      posterUrl: '/assets/videos/security-patrol-poster.jpg',
      durationSeconds: 30,
      transcriptText: 'Operational patrol procedures and security incident observation video.',
      preventFastForward: true,
      requireFullReviewSegment: true,
      checkpoints: [
        {
          id: `cp-${Date.now()}-1`,
          title: 'Initial Incident Assessment',
          timestampSeconds: 12,
          reviewStartSeconds: 4,
          reviewEndSeconds: 12,
          required: true,
          scoreWeight: 10,
          retryLimit: 3,
          autoResumeOnCorrect: true,
          question: {
            id: `q-${Date.now()}-1`,
            prompt: 'A security officer notices an unattended item near a restricted corridor. What is the most appropriate initial response?',
            type: 'single-choice',
            options: [
              { id: 'opt-a', text: 'Open the item immediately to inspect its contents.' },
              { id: 'opt-b', text: 'Maintain a safe distance, follow site procedures, and report the suspicious item to dispatch.' },
              { id: 'opt-c', text: 'Carry the item to the main public reception desk.' },
            ],
            correctAnswer: 'opt-b',
            explanation: 'Protocol mandates never handling or opening suspicious or unattended items. Officers must maintain perimeter distance and report.',
          },
        },
      ],
    };
  }

  public createDefaultLevel2(title: string = 'Branching Scenario Decision Lab'): BranchingScenarioData {
    return {
      id: `scenario-${Date.now()}`,
      title,
      description: 'Interactive branching scenario decision exercise. Choose operational responses and experience consequences.',
      initialNodeId: 'node-opening',
      passingScore: 80,
      rubric: {
        professional: 'Maintains composure, uses de-escalation phrasing, adheres to access control protocol.',
        confrontational: 'Escalates hostility, issues aggressive ultimatums.',
      },
      nodes: {
        'node-opening': {
          id: 'node-opening',
          type: 'intro',
          title: 'Situation: Access Dispute at Facility Entry',
          description: 'A visitor insists on entering a restricted area without valid credentials.',
          videoUrl: '/assets/videos/scenario-opening-visitor.mp4',
          posterUrl: '/assets/videos/upset-visitor-poster.jpg',
          nextDefaultNodeId: 'node-decision-1',
        },
        'node-decision-1': {
          id: 'node-decision-1',
          type: 'decision',
          title: 'Decision Point 1: Tactical Response',
          description: 'The visitor demands: "Let me through right now or I will walk past you!" What do you do?',
          posterUrl: '/assets/videos/upset-visitor-poster.jpg',
          choices: [
            {
              id: 'choice-1-a',
              label: 'Option A: Professional De-escalation & Verification',
              text: 'Calmly acknowledge the frustration, explain security requirements, and contact the host.',
              nextNodeId: 'node-consequence-pro',
              score: 10,
              scoreReward: 10,
              behaviorTag: 'professional',
              feedback: 'Tension reduced. The host is contacted and escort arranged.',
            },
            {
              id: 'choice-1-b',
              label: 'Option B: Aggressive Confrontation',
              text: 'Issue a harsh ultimatum and physically block without explanation.',
              nextNodeId: 'node-consequence-escalated',
              score: 0,
              scoreReward: 0,
              behaviorTag: 'confrontational',
              feedback: 'Situation escalated unnecessarily. Supervisor intervention required.',
            },
          ],
        },
        'node-consequence-pro': {
          id: 'node-consequence-pro',
          type: 'consequence',
          title: 'Consequence: Professional Resolution',
          description: 'You effectively de-escalated the situation while upholding site access security standards.',
          feedback: 'Excellent work. Standard operating procedures followed successfully.',
          score: 10,
          consequenceSummary: 'The visitor cooperated, credentials were confirmed, and access granted legitimately.',
        },
        'node-consequence-escalated': {
          id: 'node-consequence-escalated',
          type: 'consequence',
          title: 'Consequence: Incident Escalated',
          description: 'Hostile confrontation disrupted the reception area and created a compliance violation.',
          feedback: 'Review frontline de-escalation protocol to avoid aggressive confrontation.',
          score: 0,
          consequenceSummary: 'Incident required formal escalation report and supervisory debrief.',
        },
      },
    };
  }

  public createDefaultLevel3(title: string = 'Adaptive Communication Role-Play'): RolePlayScenario {
    return {
      id: `roleplay-${Date.now()}`,
      title,
      objective: 'De-escalate an upset visitor while maintaining full security policy compliance.',
      defaultPassingScore: 75,
      maxTurns: 6,
      timeLimitSeconds: 300,
      character: {
        id: `char-${Date.now()}`,
        name: 'Alex Morgan',
        role: 'Corporate Tech Partner / Visitor',
        avatarUrl: '/assets/avatars/alex-morgan.jpg',
        initialEmotion: 'frustrated',
        personaDescription: 'A partner executive stressed about time, demanding immediate access without an appointment badge.',
        initialGreeting:
          'Look officer, I have a multi-million-dollar presentation with your VP of Technology in five minutes! Open the turnstile and let me through right now!',
      },
      rubricDimensions: [
        {
          id: 'dim-prof',
          label: 'Professional Tone & Composure',
          weight: 25,
          description: 'Maintains polite, calm, and assertive communication without taking emotional bait.',
        },
        {
          id: 'dim-emp',
          label: 'Empathy & Active Listening',
          weight: 25,
          description: 'Validates visitor frustration and acknowledges the urgency of their schedule.',
        },
        {
          id: 'dim-comp',
          label: 'Security Policy Compliance',
          weight: 30,
          description: 'Firmly prevents unbadged access into restricted areas; follows verification protocol.',
        },
        {
          id: 'dim-alt',
          label: 'Practical De-escalation & Alternatives',
          weight: 20,
          description: 'Offers constructive alternatives (e.g., calling the executive host directly).',
        },
      ],
      mockResponses: [
        {
          intent: 'empathy',
          keywords: ['understand', 'apologize', 'frustrating', 'hear you', 'calm'],
          characterReply: 'I appreciate you understanding, but this meeting is crucial. Can you call the host right away?',
          emotionShift: 'calmer',
          dimensionScores: { 'dim-prof': 90, 'dim-emp': 95, 'dim-comp': 85, 'dim-alt': 80 },
        },
        {
          intent: 'procedure',
          keywords: ['policy', 'badge', 'security', 'require', 'unauthorized', 'procedure'],
          characterReply: 'I know you have your rules, but I can show you my ID and email confirmation.',
          emotionShift: 'neutral',
          dimensionScores: { 'dim-prof': 85, 'dim-emp': 70, 'dim-comp': 95, 'dim-alt': 75 },
        },
        {
          intent: 'alternative',
          keywords: ['call', 'host', 'phone', 'reach out', 'contact', 'escort', 'waiting'],
          characterReply: 'Yes, please call Sarah in Technology right now. She will vouch for me.',
          emotionShift: 'calmer',
          dimensionScores: { 'dim-prof': 95, 'dim-emp': 90, 'dim-comp': 90, 'dim-alt': 95 },
        },
        {
          intent: 'default',
          keywords: [],
          characterReply: 'We are running out of time! What are you going to do about this?',
          emotionShift: 'more_agitated',
          dimensionScores: { 'dim-prof': 60, 'dim-emp': 50, 'dim-comp': 80, 'dim-alt': 50 },
        },
      ],
    };
  }
}

export const interactiveService = new InteractiveService();
