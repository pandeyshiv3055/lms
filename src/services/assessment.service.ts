import { Assessment, QuizAttempt } from '../types';
import { storageService } from './storage.service';
import { badgeService } from './badge.service';
import { progressService } from './progress.service';

class AssessmentService {
  public getAllAssessments(): Assessment[] {
    return storageService.getAssessments();
  }

  public getAssessmentById(id: string): Assessment | null {
    const list = storageService.getAssessments();
    return list.find((a) => a.id === id) || null;
  }

  public getAssessmentByCourseId(courseId: string): Assessment | null {
    const list = storageService.getAssessments();
    return list.find((a) => a.courseId === courseId) || null;
  }

  public saveAssessment(updated: Assessment): Assessment {
    const list = storageService.getAssessments();
    const idx = list.findIndex((a) => a.id === updated.id);
    if (idx >= 0) {
      list[idx] = updated;
    } else {
      list.push(updated);
    }
    storageService.saveAssessments(list);
    return updated;
  }

  public getAttempts(assessmentId: string, learnerId: string): QuizAttempt[] {
    const all = storageService.getAllProgress();
    const userProgress = all[learnerId];
    if (!userProgress || !userProgress.quizAttempts[assessmentId]) return [];
    return userProgress.quizAttempts[assessmentId];
  }

  public submitAttempt(
    assessmentId: string,
    learnerId: string,
    answers: Record<string, string | string[]>
  ): QuizAttempt {
    const assessment = this.getAssessmentById(assessmentId);
    if (!assessment) {
      throw new Error(`Assessment not found: ${assessmentId}`);
    }

    let totalPoints = 0;
    let earnedPoints = 0;

    for (const q of assessment.questions) {
      totalPoints += q.points;
      const userAns = answers[q.id];

      if (!userAns) continue;

      if (Array.isArray(q.correctAnswer)) {
        // Multiple-select match
        const userArr = Array.isArray(userAns) ? userAns : [userAns];
        const isMatch =
          userArr.length === q.correctAnswer.length &&
          userArr.every((item) => (q.correctAnswer as string[]).includes(item));
        if (isMatch) earnedPoints += q.points;
      } else {
        // Single choice or True/False match
        if (userAns === q.correctAnswer) {
          earnedPoints += q.points;
        }
      }
    }

    const scorePercentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = scorePercentage >= assessment.passingScore;

    const attempt: QuizAttempt = {
      id: `attempt-${Date.now()}`,
      assessmentId,
      learnerId,
      timestamp: new Date().toISOString(),
      scorePercentage,
      passed,
      answers,
      earnedPoints,
      totalPoints,
      feedbackSummary: passed
        ? `Passed with ${scorePercentage}%. Passing requirement was ${assessment.passingScore}%.`
        : `Score: ${scorePercentage}%. Minimum required is ${assessment.passingScore}%. Please review incorrect items and retry.`,
    };

    // Persist attempt
    const all = storageService.getAllProgress();
    const userProgress = all[learnerId];
    if (userProgress) {
      if (!userProgress.quizAttempts[assessmentId]) {
        userProgress.quizAttempts[assessmentId] = [];
      }
      userProgress.quizAttempts[assessmentId].push(attempt);
      storageService.saveAllProgress(all);
    }

    // If passed, mark exam lesson complete and award certification badge
    if (passed) {
      progressService.markLessonCompleted(learnerId, assessment.courseId, 'lesson-final-exam');
      badgeService.awardBadge(learnerId, 'badge-course-completion', assessment.courseId);
    }

    return attempt;
  }
}

export const assessmentService = new AssessmentService();
