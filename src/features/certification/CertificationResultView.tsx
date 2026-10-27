import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  ChevronRight,
  ExternalLink,
  Printer,
} from 'lucide-react';
import { QuizAttempt, Assessment } from '../../types';
import { SecurityOfficerIllustration } from '../../assets/illustrations/SecurityOfficerIllustration';
import { AwardShieldBadge } from '../../assets/illustrations/AwardShieldBadge';
import { tenantService } from '../../services/tenant.service';

interface CertificationResultViewProps {
  attempt: QuizAttempt;
  assessment: Assessment;
  courseTitle: string;
  courseCode: string;
  learnerName?: string;
  onReviewAnswers: () => void;
  onAdvanceToNext?: () => void;
  onRetry?: () => void;
  canRetry?: boolean;
  attemptsRemaining?: number;
  badgeId?: string;
  badgeTitle?: string;
  isAlreadyEarned?: boolean;
  onViewCertification?: () => void;
  onOpenCertificateModal?: () => void;
}

export const CertificationResultView: React.FC<CertificationResultViewProps> = ({
  attempt,
  assessment,
  courseTitle,
  courseCode,
  learnerName = 'Officer',
  onReviewAnswers,
  onAdvanceToNext,
  onRetry,
  canRetry = false,
  attemptsRemaining = 0,
  badgeId = 'badge-course-completion',
  badgeTitle = 'AEGIS Certified Security Professional',
  isAlreadyEarned = false,
  onViewCertification,
  onOpenCertificateModal,
}) => {
  const activeTenant = tenantService.getActiveTenant();
  const passed = attempt.passed;
  const score = attempt.scorePercentage;
  const passingScore = assessment.passingScore;

  // Single-celebration guard: prevent re-firing confetti on re-renders or repeated visits
  const celebrationFiredRef = useRef<boolean>(false);

  useEffect(() => {
    if (!passed) return;

    // Check if celebration has already run in this session for this specific attempt
    const sessionKey = `aegis_celebrated_attempt_${attempt.id}`;
    const alreadyCelebrated = sessionStorage.getItem(sessionKey);

    // Respect reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!alreadyCelebrated && !celebrationFiredRef.current && !prefersReducedMotion) {
      celebrationFiredRef.current = true;
      sessionStorage.setItem(sessionKey, 'true');

      // Controlled, brief celebratory burst of gold, bronze, and evergreen
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.62 },
          colors: ['#E0B84C', '#D49B65', '#B87955', '#173B3A', '#34845F', '#FAF8F3'],
          disableForReducedMotion: true,
        });

        // Secondary subtle shimmer burst 400ms later
        const timer = setTimeout(() => {
          confetti({
            particleCount: 45,
            spread: 90,
            origin: { y: 0.55 },
            colors: ['#E0B84C', '#F9E08B', '#B87955'],
            disableForReducedMotion: true,
          });
        }, 400);

        return () => clearTimeout(timer);
      } catch (e) {
        // Fallback gracefully if canvas is blocked
      }
    }
  }, [passed, attempt.id]);

  // Derived tenant branding for badge title if applicable
  const resolvedBadgeTitle =
    badgeId === 'badge-course-completion'
      ? activeTenant.id === 'tenant-ranucle'
        ? 'Ranucle Certified Security Professional'
        : activeTenant.id === 'tenant-apex'
          ? 'Apex Certified Security Professional'
          : badgeTitle
      : badgeTitle;

  /* ==========================================================================
     UNSUCCESSFUL / FAILED RESULT STATE
     ========================================================================== */
  if (!passed) {
    return (
      <div
        className="certification-result-scene unsuccessful animate-fade-in"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 32px',
          backgroundColor: '#FAF8F3',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            maxWidth: '820px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            border: '2px solid #E5E0D5',
            borderRadius: '16px',
            boxShadow: '0 12px 32px rgba(24, 30, 31, 0.08)',
            padding: '32px 40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Header Status Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              borderBottom: '1px solid #E5E0D5',
              paddingBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#FAEEEC',
                  color: '#B44D45',
                  border: '1px solid #E8ABA7',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                <AlertTriangle size={13} />
                <span>ASSESSMENT INCOMPLETE • THRESHOLD NOT MET</span>
              </span>
              <span style={{ fontSize: '12px', color: '#68716D', fontWeight: 600 }}>
                {courseCode}
              </span>
            </div>

            <div style={{ fontSize: '12px', color: '#8E9995' }}>
              Attempt Date: {new Date(attempt.timestamp).toLocaleDateString()}
            </div>
          </div>

          {/* Main Content: Officer on left, Score and Guidance on right */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(180px, 220px) 1fr',
              gap: '32px',
              alignItems: 'center',
            }}
            className="result-unsuccessful-grid"
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SecurityOfficerIllustration
                pose="standing"
                size={220}
                badgeLabel={activeTenant.brandTitle.split(' ')[0]}
              />
              <div
                style={{
                  fontSize: '11px',
                  color: '#68716D',
                  textAlign: 'center',
                  marginTop: '8px',
                  fontStyle: 'italic',
                }}
              >
                Review mistakes and re-attempt to qualify
              </div>
            </div>

            <div>
              <h2
                style={{
                  fontSize: '24px',
                  color: '#173B3A',
                  margin: '0 0 8px',
                  lineHeight: 1.3,
                }}
              >
                Certification Pass Mark Not Reached
              </h2>
              <p
                style={{
                  color: '#68716D',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  margin: '0 0 20px',
                }}
              >
                Officer {learnerName}, your submission scored below the required{' '}
                <strong>{passingScore}%</strong> benchmark for the{' '}
                <strong>{courseTitle}</strong> examination. Please review the official
                rationale for missed questions and re-attempt the assessment when ready.
              </p>

              {/* Exact Score Hierarchy Box */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '12px',
                  backgroundColor: '#FAF8F3',
                  border: '1.5px solid #E5E0D5',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px',
                  textAlign: 'center',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#68716D',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    YOUR SCORE
                  </div>
                  <div
                    style={{
                      fontSize: '28px',
                      fontWeight: 800,
                      color: '#B44D45',
                      marginTop: '2px',
                    }}
                  >
                    {score}%
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid #E5E0D5', borderRight: '1px solid #E5E0D5' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#68716D',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    PASSING REQUIREMENT
                  </div>
                  <div
                    style={{
                      fontSize: '28px',
                      fontWeight: 800,
                      color: '#173B3A',
                      marginTop: '2px',
                    }}
                  >
                    {passingScore}%
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#68716D',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    RESULT
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      color: '#B44D45',
                      marginTop: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <XCircle size={18} />
                    <span>NOT PASSED</span>
                  </div>
                </div>
              </div>

              {/* Specific Feedback */}
              <div
                style={{
                  fontSize: '13px',
                  color: '#20343A',
                  backgroundColor: '#FAEEEC',
                  borderLeft: '4px solid #B44D45',
                  padding: '10px 14px',
                  borderRadius: '0 8px 8px 0',
                  lineHeight: 1.5,
                }}
              >
                <strong>Remediation Note:</strong> {attempt.feedbackSummary}
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              borderTop: '1px solid #E5E0D5',
              paddingTop: '20px',
              flexWrap: 'wrap',
            }}
          >
            {assessment.reviewAllowed && (
              <button
                type="button"
                onClick={onReviewAnswers}
                className="btn btn-secondary"
                id="btn-review-exam-answers"
              >
                <HelpCircle size={16} />
                <span>Review Exam Answers</span>
              </button>
            )}

            {canRetry && onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="btn btn-accent"
                id="btn-retry-assessment"
                style={{ fontWeight: 700 }}
              >
                <RotateCcw size={16} />
                <span>Retry Assessment ({attemptsRemaining} remaining)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     SUCCESSFUL / PASSING CERTIFICATION CEREMONY (SCREEN A)
     ========================================================================== */
  return (
    <div
      className="certification-result-scene successful animate-fade-in"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 28px',
        backgroundColor: '#F5F7F8',
        backgroundImage:
          'radial-gradient(circle at 50% 15%, rgba(224, 184, 76, 0.08) 0%, transparent 60%)',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
    >
      {/* Grand Achievement Card */}
      <div
        className="certification-card"
        style={{
          maxWidth: '1040px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          border: '2px solid #E0B84C',
          borderRadius: '16px',
          boxShadow: '0 20px 45px -10px rgba(23, 59, 58, 0.18), 0 0 0 1px rgba(224, 184, 76, 0.3)',
          padding: '28px 36px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle decorative gold sheen stripe across top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #173B3A 0%, #E0B84C 50%, #B87955 100%)',
          }}
        />

        {/* 1. TOP HEADER MILESTONE BADGE & COURSE CONTEXT */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            borderBottom: '1px solid #E5E0D5',
            paddingBottom: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(224, 184, 76, 0.15)',
                color: '#8A5328',
                border: '1.5px solid #E0B84C',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              <Award size={13} color="#B87955" />
              <span>TRAINING MILESTONE ACHIEVED</span>
            </span>

            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#173B3A',
                backgroundColor: '#FAF8F3',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid #E5E0D5',
              }}
            >
              {courseCode}
            </span>
          </div>

          <div
            style={{
              fontSize: '12px',
              color: '#68777D',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Tenant Accreditation:</span>
            <strong style={{ color: '#17365D' }}>{activeTenant.name}</strong>
          </div>
        </div>

        {/* 2. THREE-PANEL SPACIOUS DESKTOP COMPOSITION */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.25fr 0.95fr 1fr',
            gap: '24px',
            alignItems: 'center',
          }}
          className="ceremony-three-col-layout"
        >
          {/* AREA 1: LEFT / CONGRATULATORY & SCORE PRESENTATION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <h1
                style={{
                  fontSize: '27px',
                  fontWeight: 800,
                  color: '#17365D',
                  lineHeight: 1.25,
                  margin: '0 0 8px',
                  letterSpacing: '-0.02em',
                }}
              >
                Congratulations, Officer {learnerName}!
              </h1>
              <p
                style={{
                  fontSize: '14px',
                  color: '#68777D',
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                You have successfully completed the <strong>{courseTitle}</strong> certification
                examination and satisfied all evaluative security performance criteria.
              </p>
            </div>

            {/* Score Breakdown Hierarchy Ring / Meter */}
            <div
              style={{
                backgroundColor: '#FAF8F3',
                border: '1.5px solid #E5E0D5',
                borderRadius: '14px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              {/* Circular Score Meter */}
              <div style={{ position: 'relative', width: '84px', height: '84px', flexShrink: 0 }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  {/* Track */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E5E0D5"
                    strokeWidth="3.2"
                  />
                  {/* Progress Fill */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#34845F"
                    strokeWidth="3.6"
                    strokeDasharray={`${score}, 100`}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dasharray 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  />
                </svg>

                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#34845F' }}>
                    {score}%
                  </span>
                </div>
              </div>

              {/* Exact Score Metrics */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#68777D', fontWeight: 600 }}>YOUR SCORE</span>
                  <strong style={{ color: '#34845F', fontSize: '13px' }}>{score}%</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#68777D', fontWeight: 600 }}>PASSING REQUIREMENT</span>
                  <strong style={{ color: '#20343A', fontSize: '13px' }}>{passingScore}%</strong>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    paddingTop: '6px',
                    borderTop: '1px solid #E5E0D5',
                  }}
                >
                  <span style={{ color: '#68777D', fontWeight: 600 }}>RESULT</span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#34845F',
                      fontWeight: 800,
                      fontSize: '12px',
                    }}
                  >
                    <CheckCircle2 size={14} />
                    <span>PASSED</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AREA 2: CENTER / ILLUSTRATION AREA (Confederate Security Officer) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
            className="ceremony-officer-col"
          >
            <SecurityOfficerIllustration
              pose="celebrating"
              size={240}
              badgeLabel={activeTenant.brandTitle.split(' ')[0]}
            />
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#17365D',
                letterSpacing: '0.04em',
                backgroundColor: 'rgba(23, 54, 93, 0.08)',
                padding: '2px 10px',
                borderRadius: '999px',
                marginTop: '4px',
              }}
            >
              Certified Security Officer
            </div>
          </div>

          {/* AREA 3: RIGHT / DETAILED SHIELD-SHAPED AWARD PRESENTATION */}
          <div
            style={{
              backgroundColor: '#FAF8F3',
              border: '2px solid #E0B84C',
              borderRadius: '14px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 8px 20px rgba(224, 184, 76, 0.15)',
              position: 'relative',
            }}
            className="ceremony-award-col"
          >
            <div
              style={{
                fontSize: '10px',
                fontWeight: 800,
                color: '#B87955',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              OFFICIAL ACCREDITATION
            </div>

            {/* Large Prominent Shield Badge */}
            <div style={{ marginBottom: '12px' }}>
              <AwardShieldBadge
                id={badgeId}
                size={115}
                status="earned"
                showGlow={true}
              />
            </div>

            <div
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: '#17365D',
                lineHeight: 1.3,
                marginBottom: '4px',
              }}
            >
              {resolvedBadgeTitle}
            </div>

            <div
              style={{
                fontSize: '12px',
                color: '#68777D',
                lineHeight: 1.4,
                marginBottom: '12px',
              }}
            >
              {courseTitle}
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#EAF3EE',
                color: '#34845F',
                border: '1px solid #9DC7B0',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.05em',
              }}
            >
              <ShieldCheck size={13} />
              <span>{isAlreadyEarned ? 'AWARD PREVIOUSLY EARNED' : 'CERTIFICATION ACHIEVED'}</span>
            </div>
          </div>
        </div>

        {/* 3. PRIMARY ACTIONS FOOTER */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #E5E0D5',
            paddingTop: '18px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Left Action: Review Exam Answers */}
          <div>
            {assessment.reviewAllowed && (
              <button
                type="button"
                onClick={onReviewAnswers}
                className="btn btn-secondary"
                id="btn-review-answers"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <HelpCircle size={16} />
                <span>Review Exam Answers</span>
              </button>
            )}
          </div>

          {/* Right Actions: View Certificate & View Certification / Next */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {onOpenCertificateModal && (
              <button
                type="button"
                onClick={onOpenCertificateModal}
                className="btn btn-secondary"
                id="btn-view-certificate"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderColor: '#E0B84C',
                  color: '#8A5328',
                }}
              >
                <Printer size={15} />
                <span>View Official Certificate</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (onViewCertification) {
                  onViewCertification();
                } else if (onAdvanceToNext) {
                  onAdvanceToNext();
                }
              }}
              className="btn btn-accent btn-lg"
              id="btn-view-certification-progress"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(184, 121, 85, 0.35)',
              }}
            >
              <span>View Certification & Progress</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
