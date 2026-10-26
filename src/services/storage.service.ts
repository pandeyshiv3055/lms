import {
  Course,
  BuildingScenario,
  Assessment,
  Badge,
  User,
  LearnerProgress,
  MediaAsset,
  AppSettings,
  AuthSession,
} from '../types';
import { seedCourses } from '../data/seed/courses';
import { seedBuildingScenario } from '../data/seed/scenario';
import { seedAssessments } from '../data/seed/assessments';
import { seedBadges } from '../data/seed/badges';
import { seedUsers } from '../data/seed/users';
import { seedMediaAssets } from '../data/seed/media';
import { defaultSettings } from '../data/seed/settings';

const STORAGE_KEYS = {
  COURSES: 'aegis_lms_v1_courses',
  SCENARIOS: 'aegis_lms_v1_scenarios',
  ASSESSMENTS: 'aegis_lms_v1_assessments',
  BADGES: 'aegis_lms_v1_badges',
  USERS: 'aegis_lms_v1_users',
  MEDIA: 'aegis_lms_v1_media',
  SETTINGS: 'aegis_lms_v1_settings',
  SESSION: 'aegis_lms_v1_session',
  PROGRESS: 'aegis_lms_v1_progress',
};

class StorageService {
  private safeGet<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return fallback;
      return JSON.parse(data) as T;
    } catch (e) {
      console.warn(`[StorageService] Failed to read ${key}, using fallback:`, e);
      return fallback;
    }
  }

  private safeSet<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`[StorageService] Failed to persist ${key}:`, e);
    }
  }

  // Initialize seed data on first launch without clobbering user edits
  public initialize(): void {
    const storedCourses = this.safeGet<Course[]>(STORAGE_KEYS.COURSES, []);
    const hasPilotLesson = storedCourses.some((c) =>
      c.modules?.some((m) => m.lessons?.some((l) => l.id === 'lesson-incident-deescalation'))
    );
    if (!storedCourses.length || !hasPilotLesson) {
      this.safeSet(STORAGE_KEYS.COURSES, seedCourses);
    }
    const storedScenarios = this.safeGet<BuildingScenario[]>(STORAGE_KEYS.SCENARIOS, []);
    const scenariosOutdated =
      !storedScenarios.length ||
      !storedScenarios[0]?.rooms[0]?.objects ||
      storedScenarios[0]?.buildingImage === 'building-facade';

    if (scenariosOutdated) {
      this.safeSet(STORAGE_KEYS.SCENARIOS, [seedBuildingScenario]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ASSESSMENTS)) {
      this.safeSet(STORAGE_KEYS.ASSESSMENTS, seedAssessments);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BADGES)) {
      this.safeSet(STORAGE_KEYS.BADGES, seedBadges);
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.safeSet(STORAGE_KEYS.USERS, seedUsers);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEDIA)) {
      this.safeSet(STORAGE_KEYS.MEDIA, seedMediaAssets);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.safeSet(STORAGE_KEYS.SETTINGS, defaultSettings);
    }

    // Initialize initial learner progress for demo learner
    const existingProgress = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (!existingProgress) {
      const initialProgress: Record<string, LearnerProgress> = {
        'user-demo-learner': {
          userId: 'user-demo-learner',
          courseProgress: {
            'course-nature-role': {
              courseId: 'course-nature-role',
              percentage: 0,
              isCompleted: false,
              startedAt: new Date().toISOString(),
              lastAccessedLessonId: 'lesson-basic-duties',
            },
          },
          completedLessons: [],
          completedSlides: {},
          activeLessonPosition: {},
          quizAttempts: {},
          roomInspectionProgress: {},
          earnedBadges: [],
        },
      };
      this.safeSet(STORAGE_KEYS.PROGRESS, initialProgress);
    }
  }

  // Full Reset Demo Data
  public resetDemoData(): void {
    localStorage.removeItem(STORAGE_KEYS.COURSES);
    localStorage.removeItem(STORAGE_KEYS.SCENARIOS);
    localStorage.removeItem(STORAGE_KEYS.ASSESSMENTS);
    localStorage.removeItem(STORAGE_KEYS.BADGES);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.MEDIA);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    // Keep session or default to learner session
    this.initialize();
  }

  // Courses
  public getCourses(): Course[] {
    return this.safeGet<Course[]>(STORAGE_KEYS.COURSES, seedCourses);
  }
  public saveCourses(courses: Course[]): void {
    this.safeSet(STORAGE_KEYS.COURSES, courses);
  }

  // Scenarios
  public getScenarios(): BuildingScenario[] {
    return this.safeGet<BuildingScenario[]>(STORAGE_KEYS.SCENARIOS, [seedBuildingScenario]);
  }
  public saveScenarios(scenarios: BuildingScenario[]): void {
    this.safeSet(STORAGE_KEYS.SCENARIOS, scenarios);
  }

  // Assessments
  public getAssessments(): Assessment[] {
    return this.safeGet<Assessment[]>(STORAGE_KEYS.ASSESSMENTS, seedAssessments);
  }
  public saveAssessments(assessments: Assessment[]): void {
    this.safeSet(STORAGE_KEYS.ASSESSMENTS, assessments);
  }

  // Badges
  public getBadges(): Badge[] {
    return this.safeGet<Badge[]>(STORAGE_KEYS.BADGES, seedBadges);
  }
  public saveBadges(badges: Badge[]): void {
    this.safeSet(STORAGE_KEYS.BADGES, badges);
  }

  // Users
  public getUsers(): User[] {
    return this.safeGet<User[]>(STORAGE_KEYS.USERS, seedUsers);
  }
  public saveUsers(users: User[]): void {
    this.safeSet(STORAGE_KEYS.USERS, users);
  }

  // Media
  public getMedia(): MediaAsset[] {
    return this.safeGet<MediaAsset[]>(STORAGE_KEYS.MEDIA, seedMediaAssets);
  }
  public saveMedia(media: MediaAsset[]): void {
    this.safeSet(STORAGE_KEYS.MEDIA, media);
  }

  // Settings
  public getSettings(): AppSettings {
    return this.safeGet<AppSettings>(STORAGE_KEYS.SETTINGS, defaultSettings);
  }
  public saveSettings(settings: AppSettings): void {
    this.safeSet(STORAGE_KEYS.SETTINGS, settings);
  }

  // Progress
  public getAllProgress(): Record<string, LearnerProgress> {
    return this.safeGet<Record<string, LearnerProgress>>(STORAGE_KEYS.PROGRESS, {});
  }
  public saveAllProgress(progress: Record<string, LearnerProgress>): void {
    this.safeSet(STORAGE_KEYS.PROGRESS, progress);
  }

  // Auth Session
  public getSession(): AuthSession | null {
    return this.safeGet<AuthSession | null>(STORAGE_KEYS.SESSION, null);
  }
  public saveSession(session: AuthSession | null): void {
    if (session === null) {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    } else {
      this.safeSet(STORAGE_KEYS.SESSION, session);
    }
  }
}

export const storageService = new StorageService();
// Initialize storage eagerly
storageService.initialize();
