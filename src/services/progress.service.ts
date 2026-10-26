import { LearnerProgress, ActivePosition, RoomInspectionProgress } from '../types';
import { storageService } from './storage.service';
import { courseService } from './course.service';
import { badgeService } from './badge.service';
import { scenarioService } from './scenario.service';
import { authService } from './auth.service';

class ProgressService {
  private getOrCreateLearnerProgress(userId: string): LearnerProgress {
    const all = storageService.getAllProgress();
    if (!all[userId]) {
      all[userId] = {
        userId,
        courseProgress: {},
        completedLessons: [],
        completedSlides: {},
        activeLessonPosition: {},
        quizAttempts: {},
        roomInspectionProgress: {},
        earnedBadges: [],
      };
      storageService.saveAllProgress(all);
    }
    return all[userId];
  }

  public getProgress(userId: string): LearnerProgress {
    return this.getOrCreateLearnerProgress(userId);
  }

  // Check if a lesson can be accessed (Anti-skip prerequisite enforcement)
  public canAccessLesson(userId: string, courseId: string, targetLessonId: string): boolean {
    const course = courseService.getCourseById(courseId);
    if (!course) return false;

    // Collect all lessons in sequential order
    const orderedLessons: string[] = [];
    for (const mod of course.modules) {
      for (const les of mod.lessons) {
        orderedLessons.push(les.id);
      }
    }

    const targetIndex = orderedLessons.indexOf(targetLessonId);
    if (targetIndex === -1) return false;

    // First lesson is always accessible
    if (targetIndex === 0) return true;

    // Highlighted pilot lesson is directly accessible in demo mode
    if (targetLessonId === 'lesson-incident-deescalation') return true;

    // Administrators can access any lesson directly
    if (authService.isAdmin()) return true;

    const progress = this.getProgress(userId);

    // If target lesson is already completed, allow replay
    if (progress.completedLessons.includes(targetLessonId)) {
      return true;
    }

    // Otherwise, all prior lessons in the sequence MUST be completed
    for (let i = 0; i < targetIndex; i++) {
      const priorId = orderedLessons[i];
      if (!progress.completedLessons.includes(priorId)) {
        return false;
      }
    }

    return true;
  }

  // Check if a slide is completed
  public isSlideCompleted(userId: string, lessonId: string, slideId: string): boolean {
    const progress = this.getProgress(userId);
    const completedInLesson = progress.completedSlides[lessonId] || [];

    // If this is a room inspection slide, check authoritative activity completion
    if (slideId === 'slide-8-room-inspection' || slideId.includes('room-inspection')) {
      const isComplete = this.isRoomInspectionComplete(userId, 'scenario-facility-04');
      // If not actually complete, clean up false-completion in stored slides
      if (!isComplete && completedInLesson.includes(slideId)) {
        progress.completedSlides[lessonId] = completedInLesson.filter((id) => id !== slideId);
        const all = storageService.getAllProgress();
        all[userId] = progress;
        storageService.saveAllProgress(all);
        return false;
      }
      return isComplete;
    }

    return completedInLesson.includes(slideId);
  }

  // Mark slide complete
  public markSlideCompleted(userId: string, courseId: string, lessonId: string, slideId: string): void {
    const all = storageService.getAllProgress();
    const progress = this.getOrCreateLearnerProgress(userId);

    if (!progress.completedSlides[lessonId]) {
      progress.completedSlides[lessonId] = [];
    }

    if (!progress.completedSlides[lessonId].includes(slideId)) {
      progress.completedSlides[lessonId].push(slideId);
      all[userId] = progress;
      storageService.saveAllProgress(all);
    }

    // Check if all required slides in the lesson are now completed
    const context = courseService.getLesson(courseId, lessonId);
    if (context) {
      const totalSlides = context.lesson.slides.length;
      const completedCount = progress.completedSlides[lessonId].length;

      if (completedCount >= totalSlides) {
        this.markLessonCompleted(userId, courseId, lessonId);
      }
    }
  }

  // Mark lesson complete and update course completion percentage
  public markLessonCompleted(userId: string, courseId: string, lessonId: string): void {
    const all = storageService.getAllProgress();
    const progress = this.getOrCreateLearnerProgress(userId);

    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }

    // Update course progress state
    const course = courseService.getCourseById(courseId);
    if (course) {
      let totalLessons = 0;
      let completedInCourse = 0;

      for (const m of course.modules) {
        for (const l of m.lessons) {
          totalLessons++;
          if (progress.completedLessons.includes(l.id)) {
            completedInCourse++;
          }
        }
      }

      const percentage = totalLessons > 0 ? Math.round((completedInCourse / totalLessons) * 100) : 0;
      const isCompleted = percentage >= 100;

      progress.courseProgress[courseId] = {
        courseId,
        percentage,
        isCompleted,
        startedAt: progress.courseProgress[courseId]?.startedAt || new Date().toISOString(),
        completedAt: isCompleted ? new Date().toISOString() : undefined,
        lastAccessedLessonId: lessonId,
      };

      all[userId] = progress;
      storageService.saveAllProgress(all);

      // Evaluate badges upon lesson or course completion
      badgeService.evaluateAndAwardBadges(userId);
    }
  }

  // Course percentage calculation
  public getCourseCompletionPercentage(userId: string, courseId: string): number {
    const course = courseService.getCourseById(courseId);
    if (!course) return 0;

    const progress = this.getProgress(userId);
    let totalLessons = 0;
    let completedLessons = 0;

    for (const m of course.modules) {
      for (const l of m.lessons) {
        totalLessons++;
        if (progress.completedLessons.includes(l.id)) {
          completedLessons++;
        }
      }
    }

    if (totalLessons === 0) return 0;
    return Math.min(100, Math.round((completedLessons / totalLessons) * 100));
  }

  // Module completion percentage
  public getModuleCompletionPercentage(userId: string, courseId: string, moduleId: string): number {
    const course = courseService.getCourseById(courseId);
    if (!course) return 0;

    const module = course.modules.find((m) => m.id === moduleId);
    if (!module || module.lessons.length === 0) return 0;

    const progress = this.getProgress(userId);
    let completed = 0;
    for (const l of module.lessons) {
      if (progress.completedLessons.includes(l.id)) {
        completed++;
      }
    }

    return Math.round((completed / module.lessons.length) * 100);
  }

  // Save active playback state for resumption (slide index, elapsed time, scroll pos, interactions)
  public saveActivePosition(
    userId: string,
    lessonId: string,
    position: {
      slideIndex: number;
      elapsedSeconds: number;
      interactions: Record<string, any>;
      scrollPosition?: number;
    }
  ): void {
    const all = storageService.getAllProgress();
    const progress = this.getOrCreateLearnerProgress(userId);

    const existing = progress.activeLessonPosition[lessonId] || {
      slideIndex: 0,
      elapsedSeconds: 0,
      interactions: {},
      lastUpdated: new Date().toISOString(),
    };

    progress.activeLessonPosition[lessonId] = {
      slideIndex: position.slideIndex,
      elapsedSeconds: position.elapsedSeconds,
      interactions: {
        ...existing.interactions,
        ...position.interactions,
      },
      scrollPosition: position.scrollPosition ?? existing.scrollPosition,
      lastUpdated: new Date().toISOString(),
    };

    all[userId] = progress;
    storageService.saveAllProgress(all);
  }

  // Retrieve active playback state for resumption
  public getActivePosition(userId: string, lessonId: string): ActivePosition | null {
    const progress = this.getProgress(userId);
    return progress.activeLessonPosition[lessonId] || null;
  }

  // Reset active position to restart lesson
  public restartLesson(userId: string, lessonId: string): void {
    const all = storageService.getAllProgress();
    const progress = this.getOrCreateLearnerProgress(userId);

    progress.activeLessonPosition[lessonId] = {
      slideIndex: 0,
      elapsedSeconds: 0,
      interactions: {},
      scrollPosition: 0,
      lastUpdated: new Date().toISOString(),
    };

    all[userId] = progress;
    storageService.saveAllProgress(all);
  }

  // Authoritative check: whether all required rooms in a scenario are complete
  public isRoomInspectionComplete(userId: string, scenarioId: string): boolean {
    const progress = this.getProgress(userId);
    const rip = progress.roomInspectionProgress[scenarioId];
    if (!rip) return false;

    const scenario = scenarioService.getScenarioById(scenarioId) || scenarioService.getScenarios()[0];
    if (!scenario || !scenario.rooms.length) return false;

    const requiredRooms = scenario.rooms.filter((r) => r.required !== false);
    if (!requiredRooms.length) return false;

    const states = rip.roomStates || {};
    return requiredRooms.every((r) => {
      const state = states[r.id];
      if (!state) return false;
      if (state.status !== 'complete' || !state.isCorrect) return false;

      if (r.hasIrregularities) {
        // Must have identified the irregularity, selected an expected target object, and submitted a correct report
        if (!state.observedIrregularity) return false;
        if (!state.selectedObjectId || !state.report || !state.report.isCorrect) return false;
      } else {
        // Must have answered No and have confirmed compliance
        if (state.observedIrregularity !== false) return false;
      }
      return true;
    });
  }

  // Save room inspection progress with state validation
  public saveRoomInspectionProgress(
    userId: string,
    scenarioId: string,
    data: Partial<RoomInspectionProgress>
  ): RoomInspectionProgress {
    const all = storageService.getAllProgress();
    const progress = this.getOrCreateLearnerProgress(userId);

    const existing = progress.roomInspectionProgress[scenarioId] || {
      inspectedRoomIds: [],
      reportedIrregularityIds: [],
      score: 0,
      completed: false,
      roomAnswers: {},
      roomStates: {},
      submittedReports: {},
    };

    const mergedStates = {
      ...(existing.roomStates || {}),
      ...(data.roomStates || {}),
    };

    const mergedReports = {
      ...(existing.submittedReports || {}),
      ...(data.submittedReports || {}),
    };

    // Calculate completed rooms strictly based on verified room states
    const scenario = scenarioService.getScenarioById(scenarioId) || scenarioService.getScenarios()[0];
    const completedRoomIds = scenario.rooms
      .filter((r) => {
        const s = mergedStates[r.id];
        return s && s.status === 'complete' && s.isCorrect;
      })
      .map((r) => r.id);

    const requiredRooms = scenario.rooms.filter((r) => r.required !== false);
    const isAllRequiredDone =
      requiredRooms.length > 0 &&
      requiredRooms.every((r) => completedRoomIds.includes(r.id));

    const updated: RoomInspectionProgress = {
      inspectedRoomIds: completedRoomIds,
      reportedIrregularityIds: Array.from(
        new Set([...(existing.reportedIrregularityIds || []), ...(data.reportedIrregularityIds || [])])
      ),
      score: data.score !== undefined ? data.score : Math.round((completedRoomIds.length / scenario.rooms.length) * 100),
      completed: isAllRequiredDone,
      roomAnswers: {
        ...existing.roomAnswers,
        ...(data.roomAnswers || {}),
      },
      roomStates: mergedStates,
      submittedReports: mergedReports,
    };

    progress.roomInspectionProgress[scenarioId] = updated;
    all[userId] = progress;
    storageService.saveAllProgress(all);

    // If inspection completed, evaluate badge
    if (updated.completed) {
      badgeService.evaluateAndAwardBadges(userId);
    }

    return updated;
  }

  // Reset progress for a scenario
  public resetRoomInspectionProgress(userId: string, scenarioId: string): void {
    const all = storageService.getAllProgress();
    const progress = this.getOrCreateLearnerProgress(userId);

    progress.roomInspectionProgress[scenarioId] = {
      inspectedRoomIds: [],
      reportedIrregularityIds: [],
      score: 0,
      completed: false,
      roomAnswers: {},
      roomStates: {},
      submittedReports: {},
    };

    // If slide was marked complete in completedSlides, clear it
    for (const lessonId in progress.completedSlides) {
      progress.completedSlides[lessonId] = progress.completedSlides[lessonId].filter(
        (id) => id !== 'slide-8-room-inspection' && !id.includes('room-inspection')
      );
    }

    all[userId] = progress;
    storageService.saveAllProgress(all);
  }

  public getRoomInspectionProgress(userId: string, scenarioId: string): RoomInspectionProgress | null {
    const progress = this.getProgress(userId);
    return progress.roomInspectionProgress[scenarioId] || null;
  }
}

export const progressService = new ProgressService();
