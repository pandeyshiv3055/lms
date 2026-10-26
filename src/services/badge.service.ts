import confetti from 'canvas-confetti';
import { Badge, LearnerProgress } from '../types';
import { storageService } from './storage.service';

class BadgeService {
  public getAllBadges(): Badge[] {
    return storageService.getBadges();
  }

  public getLearnerBadges(userId: string): { badge: Badge; earnedAt: string; courseId?: string }[] {
    const all = storageService.getAllProgress();
    const userProgress = all[userId];
    if (!userProgress || !userProgress.earnedBadges) return [];

    const badges = this.getAllBadges();
    return userProgress.earnedBadges.map((eb) => {
      const badgeObj = badges.find((b) => b.id === eb.badgeId) || {
        id: eb.badgeId,
        title: 'Security Badge',
        description: 'Earned qualification',
        iconName: 'Shield',
        criteria: '',
        tier: 'bronze' as const,
        category: 'General',
        color: '#B87955',
      };
      return {
        badge: badgeObj,
        earnedAt: eb.earnedAt,
        courseId: eb.courseId,
      };
    });
  }

  public hasBadge(userId: string, badgeId: string): boolean {
    const all = storageService.getAllProgress();
    const userProgress = all[userId];
    if (!userProgress || !userProgress.earnedBadges) return false;
    return userProgress.earnedBadges.some((b) => b.badgeId === badgeId);
  }

  public awardBadge(userId: string, badgeId: string, courseId?: string): boolean {
    if (this.hasBadge(userId, badgeId)) {
      return false; // Prevent duplicate badge awards!
    }

    const all = storageService.getAllProgress();
    const userProgress = all[userId];
    if (!userProgress) return false;

    userProgress.earnedBadges.push({
      badgeId,
      earnedAt: new Date().toISOString(),
      courseId,
    });

    storageService.saveAllProgress(all);

    // Update user's badgeCount in users roster
    const allUsers = storageService.getUsers();
    const u = allUsers.find((usr) => usr.id === userId);
    if (u) {
      u.badgeCount = userProgress.earnedBadges.length;
      storageService.saveUsers(allUsers);
    }

    // Trigger celebratory confetti effect
    this.triggerConfetti();
    return true;
  }

  public triggerConfetti(): void {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#173B3A', '#B87955', '#D49B65', '#387A5A', '#FAF8F3'],
      });
    } catch (e) {
      // safe fallback if canvas is unavailable
    }
  }

  // Automatic evaluation of badge rules based on current progress
  public evaluateAndAwardBadges(userId: string): void {
    const all = storageService.getAllProgress();
    const progress: LearnerProgress | undefined = all[userId];
    if (!progress) return;

    // 1. Junior Officer: Completed at least 1 lesson
    if (progress.completedLessons.length >= 1 && !this.hasBadge(userId, 'badge-junior-officer')) {
      this.awardBadge(userId, 'badge-junior-officer', 'course-nature-role');
    }

    // 2. Safety Observer: Completed room inspection in scenario-facility-04
    const inspection = progress.roomInspectionProgress['scenario-facility-04'];
    if (inspection && inspection.completed && !this.hasBadge(userId, 'badge-safety-observer')) {
      this.awardBadge(userId, 'badge-safety-observer', 'course-nature-role');
    }

    // 3. Course Completion: Flagship course reached 100% or final assessment passed
    const natureCourse = progress.courseProgress['course-nature-role'];
    if (
      (natureCourse?.isCompleted || (natureCourse?.percentage ?? 0) >= 100) &&
      !this.hasBadge(userId, 'badge-course-completion')
    ) {
      this.awardBadge(userId, 'badge-course-completion', 'course-nature-role');
    }
  }
}

export const badgeService = new BadgeService();
