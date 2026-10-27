import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Slide, Assessment, QuizAttempt } from '../../../types';
import { assessmentService } from '../../../services/assessment.service';
import { authService } from '../../../services/auth.service';
import { courseService } from '../../../services/course.service';
import { badgeService } from '../../../services/badge.service';
import { BadgeEmblem } from '../../../assets/illustrations/badges';
import { CertificationResultView } from '../../certification/CertificationResultView';
import { CertificateView } from '../../certification/CertificateView';

interface QuizSlideRendererProps {
  slide: Slide;
  courseId: string;
  onInteractionComplete?: () => void;
}

export const QuizSlideRenderer: React.FC<QuizSlideRendererProps> = ({
  slide,
  courseId,
  onInteractionComplete,
}) => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const userId = user?.id || 'user-demo-learner';
  const course = courseService.getCourseById(courseId);

  const assessment: Assessment | null =
    assessmentService.getAssessmentByCourseId(courseId) ||
    assessmentService.getAllAssessments()[0];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | string[]>>({});
  const [attemptResult, setAttemptResult] = useState<QuizAttempt | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  // Load existing attempts on mount
  useEffect(() => {
    if (assessment) {
      const priorAttempts = assessmentService.getAttempts(assessment.id, userId);
      if (priorAttempts.length > 0) {
        const latest = priorAttempts[priorAttempts.length - 1];
        setAttemptResult(latest);
        if (latest.passed && onInteractionComplete) {
          onInteractionComplete();
        }
      }
    }
  }, [assessment, userId, onInteractionComplete]);

  if (!assessment) {
    return <div>No assessment configured for this course.</div>;
  }

  const questions = assessment.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const maxAttempts = assessment.maxAttempts || 3;
  const existingAttempts = assessmentService.getAttempts(assessment.id, userId);

  const handleSelectOption = (questionId: string, optionId: string, type: string) => {
    if (attemptResult && !isReviewMode) return;

    if (type === 'multiple-select') {
      const prev = (userAnswers[questionId] as string[]) || [];
      if (prev.includes(optionId)) {
        setUserAnswers({
          ...userAnswers,
          [questionId]: prev.filter((id) => id !== optionId),
        });
      } else {
        setUserAnswers({
          ...userAnswers,
          [questionId]: [...prev, optionId],
        });
      }
    } else {
      // Single choice or True/False
      setUserAnswers({
        ...userAnswers,
        [questionId]: optionId,
      });
    }
  };

  const handleSubmitQuiz = () => {
    const attempt = assessmentService.submitAttempt(assessment.id, userId, userAnswers);
    setAttemptResult(attempt);

    if (attempt.passed && onInteractionComplete) {
      onInteractionComplete();
    }
  };

  const handleRetry = () => {
    setAttemptResult(null);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setIsReviewMode(false);
  };

  const allQuestionsAnswered = questions.every((q) => {
    const ans = userAnswers[q.id];
    return ans !== undefined && (Array.isArray(ans) ? ans.length > 0 : Boolean(ans));
  });

  /* ==========================================================================
     EXAMINATION RESULTS & OUTCOME SCREEN
     ========================================================================== */
  if (attemptResult && !isReviewMode) {
    const isAlreadyEarned = badgeService.hasBadge(userId, 'badge-course-completion');

    return (
      <>
        <CertificationResultView
          attempt={attemptResult}
          assessment={assessment}
          courseTitle={course?.title || 'The Nature and Role of Private Security'}
          courseCode={course?.code || 'SEC-101'}
          learnerName={user?.name || 'Officer'}
          onReviewAnswers={() => setIsReviewMode(true)}
          onRetry={handleRetry}
          canRetry={existingAttempts.length < maxAttempts}
          attemptsRemaining={Math.max(0, maxAttempts - existingAttempts.length)}
          isAlreadyEarned={isAlreadyEarned}
          onAdvanceToNext={() => {
            if (onInteractionComplete) onInteractionComplete();
          }}
          onViewCertification={() => {
            if (onInteractionComplete) onInteractionComplete();
            navigate('/learner/progress');
          }}
          onOpenCertificateModal={() => setShowCertModal(true)}
        />

        {showCertModal && (
          <CertificateView
            isModal={true}
            courseIdProp={courseId}
            onClose={() => setShowCertModal(false)}
          />
        )}
      </>
    );
  }

  /* ==========================================================================
     ACTIVE ASSESSMENT QUESTIONS / REVIEW ENGINE
     ========================================================================== */
  const answeredCount = Object.keys(userAnswers).length;
  const currentAnswer = userAnswers[currentQuestion.id];

  return (
    <div
      style={{
        padding: '24px 36px',
        maxWidth: '860px',
        margin: '0 auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      className="animate-fade-in"
    >
      {/* Quiz Top Status Bar */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-copper">
              QUESTION {currentQuestionIndex + 1} OF {questions.length}
            </span>
            <span style={{ fontSize: '12px', color: '#68716D' }}>
              Passing Threshold: {assessment.passingScore}%
            </span>
          </div>

          <div style={{ fontSize: '12px', fontWeight: 600, color: '#173B3A' }}>
            {answeredCount} of {questions.length} Answered
          </div>
        </div>

        {/* Question Progress Dots */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
          {questions.map((q, idx) => {
            const hasAns = userAnswers[q.id] !== undefined;
            const isCurr = idx === currentQuestionIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                style={{
                  flex: 1,
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: isCurr
                    ? '#B87955'
                    : hasAns
                      ? '#387A5A'
                      : '#E5E0D5',
                  transition: 'background-color 0.2s ease',
                  border: 'none',
                  cursor: 'pointer',
                }}
                aria-label={`Jump to question ${idx + 1}`}
              />
            );
          })}
        </div>

        {/* Question Text */}
        <h2 style={{ fontSize: '19px', color: '#173B3A', marginBottom: '18px', lineHeight: 1.45 }}>
          {currentQuestion.text}
        </h2>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {currentQuestion.options.map((opt) => {
            const isSelected = Array.isArray(currentAnswer)
              ? currentAnswer.includes(opt.id)
              : currentAnswer === opt.id;

            let borderColor = '#E5E0D5';
            let bgColor = '#FFFFFF';

            if (isReviewMode) {
              const isCorrectOpt = Array.isArray(currentQuestion.correctAnswer)
                ? (currentQuestion.correctAnswer as string[]).includes(opt.id)
                : currentQuestion.correctAnswer === opt.id;

              if (isCorrectOpt) {
                borderColor = '#387A5A';
                bgColor = '#EAF3EE';
              } else if (isSelected && !isCorrectOpt) {
                borderColor = '#B44D45';
                bgColor = '#FAEEEC';
              }
            } else if (isSelected) {
              borderColor = '#B87955';
              bgColor = 'rgba(184, 121, 85, 0.08)';
            }

            return (
              <div
                key={opt.id}
                onClick={() => handleSelectOption(currentQuestion.id, opt.id, currentQuestion.type)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: `2px solid ${borderColor}`,
                  backgroundColor: bgColor,
                  cursor: isReviewMode ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: currentQuestion.type === 'multiple-select' ? '4px' : '50%',
                    border: isSelected ? '5px solid #B87955' : '2px solid #CCC4B4',
                    backgroundColor: '#FFFFFF',
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: '14px', color: '#1C2424', lineHeight: 1.4 }}>
                  {opt.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Explanation in Review Mode */}
        {isReviewMode && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px 16px',
              backgroundColor: '#FAF8F3',
              border: '1px solid #DDE5D7',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#242C2D',
              lineHeight: 1.5,
            }}
          >
            <strong>Official Rationale:</strong> {currentQuestion.explanation}
          </div>
        )}
      </div>

      {/* Question Navigation & Submit Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '20px',
          borderTop: '1px solid #E5E0D5',
        }}
      >
        <button
          onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
          className="btn btn-secondary btn-sm"
        >
          <ChevronLeft size={16} />
          <span>Previous Question</span>
        </button>

        {isReviewMode ? (
          <button
            onClick={() => setIsReviewMode(false)}
            className="btn btn-primary btn-sm"
          >
            Back to Scorecard
          </button>
        ) : currentQuestionIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            className="btn btn-secondary btn-sm"
          >
            <span>Next Question</span>
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmitQuiz}
            disabled={!allQuestionsAnswered}
            className="btn btn-accent"
            style={{ fontWeight: 700 }}
          >
            <ShieldCheck size={16} />
            <span>Submit Final Examination</span>
          </button>
        )}
      </div>
    </div>
  );
};

export const SummarySlideRenderer: React.FC<{ slide: Slide; onInteractionComplete?: () => void }> = ({
  slide,
  onInteractionComplete,
}) => {
  useEffect(() => {
    if (onInteractionComplete) {
      onInteractionComplete();
    }
  }, [onInteractionComplete]);

  return (
    <div
      style={{
        padding: '36px 40px',
        maxWidth: '780px',
        margin: '0 auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
      className="animate-fade-in"
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          backgroundColor: '#EAF3EE',
          border: '2px solid #387A5A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '18px',
        }}
      >
        <CheckCircle2 size={36} color="#387A5A" />
      </div>

      <h2 style={{ fontSize: '28px', color: '#173B3A', marginBottom: '12px' }}>
        {slide.content.headline || slide.title}
      </h2>

      <div style={{ color: '#68716D', fontSize: '15px', lineHeight: 1.6, maxWidth: '620px', marginBottom: '24px' }}>
        {slide.content.bodyParagraphs?.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {slide.content.takeawayMessage && (
        <div
          style={{
            backgroundColor: '#FAF8F3',
            border: '1px solid #B87955',
            borderRadius: '8px',
            padding: '12px 24px',
            fontWeight: 700,
            color: '#173B3A',
            fontSize: '14px',
          }}
        >
          {slide.content.takeawayMessage}
        </div>
      )}
    </div>
  );
};
