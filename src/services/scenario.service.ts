import { BuildingScenario, Room, InspectionObject, Irregularity, HotspotCoordinates, Slide } from '../types';
import { storageService } from './storage.service';
import { courseService } from './course.service';

class ScenarioService {
  /**
   * Normalize scenarios from storage ensuring backward-compatibility:
   * Maps scenario-facility-04 to SEC-101 (course-nature-role) / Lesson 1.1 (lesson-basic-duties)
   * and links any course/lesson slides referencing scenario IDs.
   */
  private normalizeScenarios(): BuildingScenario[] {
    const list = storageService.getScenarios();
    let hasChanges = false;

    // 1. Ensure Facility 04 is associated with SEC-101 / Lesson 1.1
    const facility04 = list.find((s) => s.id === 'scenario-facility-04');
    if (facility04 && (!facility04.courseId || !facility04.lessonId)) {
      facility04.courseId = 'course-nature-role';
      facility04.lessonId = 'lesson-basic-duties';
      hasChanges = true;
    }

    // 2. Discover slide relationships across all courses
    try {
      const allLessons = courseService.getAllLessons();
      for (const item of allLessons) {
        for (const slide of item.lesson.slides) {
          if (slide.type === 'room-inspection' && slide.content?.buildingScenarioId) {
            const sc = list.find((s) => s.id === slide.content.buildingScenarioId);
            if (sc && (!sc.courseId || !sc.lessonId)) {
              sc.courseId = item.courseId;
              sc.lessonId = item.lesson.id;
              hasChanges = true;
            }
          }
        }
      }
    } catch {
      // Non-critical background association discovery
    }

    if (hasChanges) {
      storageService.saveScenarios(list);
    }

    return list;
  }

  public getScenarios(): BuildingScenario[] {
    return this.normalizeScenarios();
  }

  public getScenarioById(id: string): BuildingScenario | null {
    const list = this.getScenarios();
    const found = list.find((s) => s.id === id);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  /**
   * Validate that a given courseId and lessonId relationship is authentic
   */
  public validateCourseLesson(courseId: string, lessonId: string): boolean {
    if (!courseId || !lessonId) return false;
    const context = courseService.getLesson(courseId, lessonId);
    return context !== null;
  }

  /**
   * Retrieve the specific inspection scenario configured for a course and lesson
   */
  public getScenarioForLesson(courseId: string, lessonId: string): BuildingScenario | null {
    if (!courseId || !lessonId) return null;
    const list = this.getScenarios();
    const course = courseService.getCourseById(courseId);

    // Check direct courseId / lessonId match
    const directMatch = list.find(
      (s) =>
        (s.courseId === courseId || (course && (s.courseId === course.id || s.courseId === course.code))) &&
        s.lessonId === lessonId
    );
    if (directMatch) {
      return JSON.parse(JSON.stringify(directMatch));
    }

    // Legacy baseline check: Facility 04 belongs to SEC-101 / Lesson 1.1
    if (
      (courseId === 'course-nature-role' || courseId === 'SEC-101') &&
      lessonId === 'lesson-basic-duties'
    ) {
      const fac04 = list.find((s) => s.id === 'scenario-facility-04');
      if (fac04) {
        fac04.courseId = 'course-nature-role';
        fac04.lessonId = 'lesson-basic-duties';
        this.saveScenario(fac04);
        return JSON.parse(JSON.stringify(fac04));
      }
    }

    // Check if the lesson has a slide referencing a scenarioId
    const context = courseService.getLesson(courseId, lessonId);
    if (context) {
      const inspectionSlide = context.lesson.slides.find(
        (sl) => sl.type === 'room-inspection' && sl.content?.buildingScenarioId
      );
      if (inspectionSlide) {
        const scenarioId = inspectionSlide.content.buildingScenarioId;
        const matchingScenario = list.find((s) => s.id === scenarioId);
        if (matchingScenario) {
          matchingScenario.courseId = courseId;
          matchingScenario.lessonId = lessonId;
          this.saveScenario(matchingScenario);
          return JSON.parse(JSON.stringify(matchingScenario));
        }
      }
    }

    return null;
  }

  /**
   * Get existing scenario or initialize a new course/lesson-specific scenario
   */
  public getOrCreateScenarioForLesson(
    courseId: string,
    lessonId: string,
    customTitle?: string
  ): BuildingScenario {
    const existing = this.getScenarioForLesson(courseId, lessonId);
    if (existing) {
      return existing;
    }

    const context = courseService.getLesson(courseId, lessonId);
    const lessonTitle = context?.lesson.title || 'Facility Inspection';
    const scenarioId = `scenario-${courseId}-${lessonId}`;

    const newScenario: BuildingScenario = {
      id: scenarioId,
      courseId,
      lessonId,
      title: customTitle || `${lessonTitle} — Realistic Inspection Simulator`,
      description: `Active facility inspection and irregularity reporting simulation for ${lessonTitle}. Navigate through configured zones, examine security standards, and report operational discrepancies.`,
      buildingImage: '/assets/facility-inspection/facility-exterior.jpg',
      instructions:
        'Select each room hotspot on the facility exterior to enter and inspect the scene. Answer whether irregularities are present, pinpoint the exact faulty object, file an official incident report, and certify all required zones to advance.',
      minimumRoomsRequired: 0,
      rooms: [],
    };

    this.saveScenario(newScenario);

    // Synchronize or create room-inspection slide in lesson
    this.syncLessonSlide(courseId, lessonId, newScenario.id, lessonTitle);

    return newScenario;
  }

  /**
   * Synchronize room-inspection slide with lesson in courseService
   */
  private syncLessonSlide(courseId: string, lessonId: string, scenarioId: string, lessonTitle: string): void {
    const context = courseService.getLesson(courseId, lessonId);
    if (!context) return;

    let modified = false;
    const existingSlide = context.lesson.slides.find((s) => s.type === 'room-inspection');

    if (existingSlide) {
      if (existingSlide.content.buildingScenarioId !== scenarioId) {
        existingSlide.content.buildingScenarioId = scenarioId;
        modified = true;
      }
    } else {
      // Add inspection slide before summary if exists, else append
      const newSlide: Slide = {
        id: `slide-${Date.now()}-room-inspection`,
        lessonId: lessonId,
        title: `${lessonTitle} — Building & Room Inspection`,
        type: 'room-inspection',
        narrationText:
          'This is your practical facility inspection. Select each room on the building exterior, inspect the scene for security and safety irregularities, and report all issues found.',
        completionRule: 'all-rooms',
        content: {
          headline: `${lessonTitle} — Facility Inspection Activity`,
          subtitle: 'Inspect all configured rooms, report irregularities, and certify the building.',
          buildingScenarioId: scenarioId,
        },
      };

      const summaryIdx = context.lesson.slides.findIndex((s) => s.type === 'summary');
      if (summaryIdx >= 0) {
        context.lesson.slides.splice(summaryIdx, 0, newSlide);
      } else {
        context.lesson.slides.push(newSlide);
      }
      modified = true;
    }

    if (modified) {
      courseService.saveCourse(context.course);
    }
  }

  public saveScenario(updated: BuildingScenario): BuildingScenario {
    const cloned: BuildingScenario = JSON.parse(JSON.stringify(updated));
    const list = storageService.getScenarios();
    const idx = list.findIndex((s) => s.id === cloned.id);
    if (idx >= 0) {
      list[idx] = cloned;
    } else {
      list.push(cloned);
    }
    storageService.saveScenarios(list);

    // Sync lesson slide if courseId and lessonId are defined
    if (cloned.courseId && cloned.lessonId) {
      this.syncLessonSlide(cloned.courseId, cloned.lessonId, cloned.id, cloned.title);
    }

    return cloned;
  }

  public updateRoom(scenarioId: string, updatedRoom: Room): BuildingScenario | null {
    const scenario = this.getScenarioById(scenarioId);
    if (!scenario) return null;

    const idx = scenario.rooms.findIndex((r) => r.id === updatedRoom.id);
    if (idx >= 0) {
      scenario.rooms[idx] = JSON.parse(JSON.stringify(updatedRoom));
      return this.saveScenario(scenario);
    }
    return null;
  }

  public addRoom(scenarioId: string, newRoom: Room): BuildingScenario | null {
    const scenario = this.getScenarioById(scenarioId);
    if (!scenario) return null;

    scenario.rooms.push(JSON.parse(JSON.stringify(newRoom)));
    scenario.minimumRoomsRequired = scenario.rooms.length;
    return this.saveScenario(scenario);
  }

  public createRoom(
    scenarioId: string,
    data: {
      name: string;
      code: string;
      promptQuestion?: string;
      explanation: string;
      hasIrregularities: boolean;
      roomImage?: string;
      required?: boolean;
      buildingCoordinates?: HotspotCoordinates;
      correctFeedback?: string;
      incorrectFeedback?: string;
    }
  ): { success: boolean; room?: Room; error?: string } {
    const scenario = this.getScenarioById(scenarioId);
    if (!scenario) {
      return { success: false, error: 'The selected building scenario could not be found.' };
    }

    const trimmedName = data.name?.trim();
    if (!trimmedName) {
      return { success: false, error: 'Please enter a room or zone name.' };
    }

    const trimmedCode = data.code?.trim();
    if (!trimmedCode) {
      return { success: false, error: 'Please enter a zone code.' };
    }

    // Duplicate zone code validation (case-insensitive) within this scenario
    const duplicate = scenario.rooms.some(
      (r) => r.code.toLowerCase().trim() === trimmedCode.toLowerCase()
    );
    if (duplicate) {
      return {
        success: false,
        error: `This zone code (${trimmedCode}) already exists in this scenario. Please choose a unique code.`,
      };
    }

    const trimmedExplanation = data.explanation?.trim();
    if (!trimmedExplanation) {
      return { success: false, error: 'Please enter a correct feedback explanation.' };
    }

    const newId = `room-${Date.now()}`;

    // Calculate smart hotspot placement on the facility facade (coordinates 15-85% x, 35-70% y)
    const existingCount = scenario.rooms.length;
    const defaultX = Math.min(84, Math.max(16, 20 + ((existingCount * 22) % 68)));
    const defaultY = existingCount % 2 === 0 ? 56 : 38;

    const buildingCoordinates: HotspotCoordinates = data.buildingCoordinates || {
      x: defaultX,
      y: defaultY,
      label: `${trimmedCode} — ${trimmedName}`,
    };

    let objects: InspectionObject[] = [];
    let irregularities: Irregularity[] = [];

    if (data.hasIrregularities) {
      const objId = `obj-${Date.now()}`;
      const irregId = `irreg-${Date.now()}`;

      objects = [
        {
          id: objId,
          label: `${trimmedName} Anomaly`,
          hotspot: { x: 50, y: 55, width: 15, height: 15, label: 'Reported Anomaly' },
          objectType: 'hazard',
          isExpectedTarget: true,
          acceptedIncidentCategories: ['security', 'safety', 'physical-security', 'maintenance', 'compliance'],
          incidentType: 'physical-security',
          incidentDetails: trimmedExplanation,
          feedbackCorrect: data.correctFeedback?.trim() || trimmedExplanation,
          feedbackWhyItMatters: trimmedExplanation,
          severity: 'high',
        },
      ];

      irregularities = [
        {
          id: irregId,
          name: `${trimmedName} Security Hazard`,
          description: trimmedExplanation,
          category: 'security',
          hotspot: { x: 50, y: 55, width: 15, height: 15 },
          feedbackCorrect: data.correctFeedback?.trim() || trimmedExplanation,
          feedbackWhyItMatters: trimmedExplanation,
          severity: 'high',
        },
      ];
    }

    const newRoom: Room = {
      id: newId,
      name: trimmedName,
      code: trimmedCode,
      buildingCoordinates,
      roomImage: data.roomImage || '/assets/facility-inspection/rooms/conference-room.jpg',
      required: data.required !== false,
      hasIrregularities: Boolean(data.hasIrregularities),
      promptQuestion:
        data.promptQuestion?.trim() || 'Are there any security or safety irregularities in this room?',
      correctAnswerHasIrregularity: Boolean(data.hasIrregularities),
      explanation: trimmedExplanation,
      correctFeedback:
        data.correctFeedback?.trim() ||
        (data.hasIrregularities
          ? trimmedExplanation
          : 'Correct observation! This zone is fully compliant with all security, life-safety, and operational standards.'),
      incorrectFeedback:
        data.incorrectFeedback?.trim() ||
        (data.hasIrregularities
          ? 'An irregularity in this zone was overlooked. Please inspect again.'
          : 'Zone marked as irregular, but no issues were present. This area is fully compliant.'),
      objects,
      irregularities,
    };

    scenario.rooms.push(newRoom);
    scenario.minimumRoomsRequired = scenario.rooms.length;
    this.saveScenario(scenario);

    return { success: true, room: newRoom };
  }

  public deleteRoom(scenarioId: string, roomId: string): BuildingScenario | null {
    const scenario = this.getScenarioById(scenarioId);
    if (!scenario) return null;

    scenario.rooms = scenario.rooms.filter((r) => r.id !== roomId);
    scenario.minimumRoomsRequired = scenario.rooms.length;
    return this.saveScenario(scenario);
  }
}

export const scenarioService = new ScenarioService();
