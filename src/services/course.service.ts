import { Course, Lesson, Slide, Module, LessonType } from '../types';
import { storageService } from './storage.service';

class CourseService {
  public getCourses(filter?: { category?: string; status?: string; search?: string }): Course[] {
    let courses = storageService.getCourses();

    if (filter) {
      if (filter.status && filter.status !== 'all') {
        courses = courses.filter((c) => c.status === filter.status);
      }
      if (filter.category && filter.category !== 'all') {
        courses = courses.filter((c) => c.category.toLowerCase() === filter.category?.toLowerCase());
      }
      if (filter.search && filter.search.trim()) {
        const q = filter.search.toLowerCase().trim();
        courses = courses.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.code.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            c.category.toLowerCase().includes(q)
        );
      }
    }

    return courses;
  }

  public getPublishedCourses(): Course[] {
    return this.getCourses({ status: 'published' });
  }

  public getCourseById(courseId: string): Course | null {
    const courses = storageService.getCourses();
    return courses.find((c) => c.id === courseId) || null;
  }

  public saveCourse(updatedCourse: Course): Course {
    const courses = storageService.getCourses();
    const index = courses.findIndex((c) => c.id === updatedCourse.id);
    if (index >= 0) {
      courses[index] = updatedCourse;
    } else {
      courses.unshift(updatedCourse);
    }
    storageService.saveCourses(courses);
    return updatedCourse;
  }

  public createCourse(data: Partial<Course>): Course {
    const newId = `course-${Date.now()}`;
    const newCourse: Course = {
      id: newId,
      code: data.code || `SEC-${Math.floor(100 + Math.random() * 900)}`,
      title: data.title || 'Untitled Security Course',
      category: data.category || 'Foundations',
      description: data.description || 'Comprehensive security training module.',
      shortDescription: data.shortDescription || 'Professional security training.',
      coverImage: data.coverImage || 'course-nature-role',
      duration: data.duration || '1h 30m',
      estimatedMinutes: data.estimatedMinutes || 90,
      level: data.level || 'Foundational',
      objectives: data.objectives || ['Master operational security protocols.'],
      targetAudience: data.targetAudience || 'Security personnel and trainees.',
      prerequisites: data.prerequisites || [],
      modules: data.modules || [
        {
          id: `mod-${Date.now()}`,
          title: 'Module 1: General Orientation',
          order: 1,
          lessons: [
            {
              id: `lesson-${Date.now()}`,
              title: 'Lesson 1.1: Introduction to Standards',
              description: 'Initial orientation slides.',
              type: 'instructor',
              estimatedMinutes: 20,
              requiresAllSlides: true,
              slides: [
                {
                  id: `slide-${Date.now()}`,
                  lessonId: `lesson-${Date.now()}`,
                  title: 'Welcome to the Course',
                  type: 'intro',
                  durationSeconds: 15,
                  completionRule: 'manual',
                  content: {
                    headline: 'Course Overview',
                    bodyParagraphs: ['Welcome to this instructional unit.'],
                  },
                },
              ],
            },
          ],
        },
      ],
      status: 'draft',
      passingScore: 80,
    };

    return this.saveCourse(newCourse);
  }

  public duplicateCourse(courseId: string): Course | null {
    const original = this.getCourseById(courseId);
    if (!original) return null;

    const cloned: Course = JSON.parse(JSON.stringify(original));
    cloned.id = `course-copy-${Date.now()}`;
    cloned.title = `${original.title} (Copy)`;
    cloned.code = `${original.code}-C`;
    cloned.status = 'draft';

    return this.saveCourse(cloned);
  }

  public togglePublish(courseId: string): Course | null {
    const course = this.getCourseById(courseId);
    if (!course) return null;

    course.status = course.status === 'published' ? 'draft' : 'published';
    return this.saveCourse(course);
  }

  public archiveCourse(courseId: string): Course | null {
    const course = this.getCourseById(courseId);
    if (!course) return null;

    course.status = 'archived';
    return this.saveCourse(course);
  }

  public deleteCourse(courseId: string): boolean {
    const courses = storageService.getCourses();
    const filtered = courses.filter((c) => c.id !== courseId);
    if (filtered.length !== courses.length) {
      storageService.saveCourses(filtered);
      return true;
    }
    return false;
  }

  public getLesson(courseId: string, lessonId: string): { course: Course; module: Module; lesson: Lesson } | null {
    const course = this.getCourseById(courseId);
    if (!course) return null;

    for (const mod of course.modules) {
      const lesson = mod.lessons.find((l) => l.id === lessonId);
      if (lesson) {
        return { course, module: mod, lesson };
      }
    }
    return null;
  }

  public getAllLessons(): { courseId: string; courseTitle: string; lesson: Lesson }[] {
    const courses = storageService.getCourses();
    const results: { courseId: string; courseTitle: string; lesson: Lesson }[] = [];

    for (const c of courses) {
      for (const m of c.modules) {
        for (const l of m.lessons) {
          results.push({ courseId: c.id, courseTitle: c.title, lesson: l });
        }
      }
    }
    return results;
  }

  // Lesson unit creation
  public addLesson(
    courseId: string,
    lessonData: {
      title: string;
      description?: string;
      type?: LessonType;
      estimatedMinutes?: number;
      moduleId?: string;
    }
  ): Lesson | null {
    const course = this.getCourseById(courseId);
    if (!course) {
      throw new Error(`Course not found: ${courseId}`);
    }

    const trimmedTitle = lessonData.title?.trim();
    if (!trimmedTitle) {
      throw new Error('Lesson title is required.');
    }

    // Ensure course has at least one module
    if (!course.modules || course.modules.length === 0) {
      course.modules = [
        {
          id: `mod-${Date.now()}`,
          title: 'Module 1: General Curriculum',
          order: 1,
          lessons: [],
        },
      ];
    }

    // Target designated module or default to first module
    let targetModule = lessonData.moduleId
      ? course.modules.find((m) => m.id === lessonData.moduleId)
      : course.modules[0];

    if (!targetModule) {
      targetModule = course.modules[0];
    }

    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: trimmedTitle,
      description: (lessonData.description || '').trim(),
      type: lessonData.type || 'instructor',
      estimatedMinutes: lessonData.estimatedMinutes || 20,
      slides: [],
      requiresAllSlides: true,
    };

    targetModule.lessons.push(newLesson);
    this.saveCourse(course);
    return newLesson;
  }

  public deleteLesson(courseId: string, lessonId: string): boolean {
    const course = this.getCourseById(courseId);
    if (!course) return false;

    let removed = false;
    for (const mod of course.modules) {
      const initialLen = mod.lessons.length;
      mod.lessons = mod.lessons.filter((l) => l.id !== lessonId);
      if (mod.lessons.length !== initialLen) {
        removed = true;
        break;
      }
    }

    if (removed) {
      this.saveCourse(course);
      return true;
    }
    return false;
  }

  // Slide Builder operations
  public addSlide(courseId: string, lessonId: string, slideData: Partial<Slide>): Slide | null {
    const context = this.getLesson(courseId, lessonId);
    if (!context) return null;

    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      lessonId,
      title: slideData.title || 'New Training Slide',
      type: slideData.type || 'instructor',
      durationSeconds: slideData.durationSeconds || 15,
      completionRule: slideData.completionRule || 'manual',
      narrationText: slideData.narrationText || '',
      content: slideData.content || {
        headline: slideData.title || 'Slide Title',
        bodyParagraphs: ['Instructional content here.'],
      },
    };

    context.lesson.slides.push(newSlide);
    this.saveCourse(context.course);
    return newSlide;
  }

  public updateSlide(courseId: string, lessonId: string, slideId: string, updated: Partial<Slide>): Slide | null {
    const context = this.getLesson(courseId, lessonId);
    if (!context) return null;

    const idx = context.lesson.slides.findIndex((s) => s.id === slideId);
    if (idx === -1) return null;

    context.lesson.slides[idx] = {
      ...context.lesson.slides[idx],
      ...updated,
    };

    this.saveCourse(context.course);
    return context.lesson.slides[idx];
  }

  public deleteSlide(courseId: string, lessonId: string, slideId: string): boolean {
    const context = this.getLesson(courseId, lessonId);
    if (!context) return false;

    const initialLen = context.lesson.slides.length;
    context.lesson.slides = context.lesson.slides.filter((s) => s.id !== slideId);
    if (context.lesson.slides.length !== initialLen) {
      this.saveCourse(context.course);
      return true;
    }
    return false;
  }

  public reorderSlides(courseId: string, lessonId: string, slideIds: string[]): boolean {
    const context = this.getLesson(courseId, lessonId);
    if (!context) return false;

    const reordered: Slide[] = [];
    for (const id of slideIds) {
      const found = context.lesson.slides.find((s) => s.id === id);
      if (found) reordered.push(found);
    }
    context.lesson.slides = reordered;
    this.saveCourse(context.course);
    return true;
  }
}

export const courseService = new CourseService();
