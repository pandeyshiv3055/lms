import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  Lock,
  Play,
  Printer,
  ChevronRight,
  Shield,
  Clock,
  HelpCircle,
  X,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { authService } from '../../services/auth.service';
import { courseService } from '../../services/course.service';
import { progressService } from '../../services/progress.service';
import { badgeService } from '../../services/badge.service';
import { tenantService } from '../../services/tenant.service';
import { Badge, TenantConfig } from '../../types';
import { AwardShieldBadge } from '../../assets/illustrations/AwardShieldBadge';
import { SecurityOfficerIllustration } from '../../assets/illustrations/SecurityOfficerIllustration';
import { CertificateView } from '../certification/CertificateView';

export const ProgressPage: React.FC = () => {
  const user = authService.getCurrentUser();
  const userId = user?.id || 'user-demo-learner';

  const [activeTenant, setActiveTenant] = useState<TenantConfig>(tenantService.getActiveTenant());
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);

  // Synchronize tenant changes dynamically
  useEffect(() => {
    const handleTenantChange = (e: Event) => {
      const customEvent = e as CustomEvent<TenantConfig>;
      if (customEvent.detail) {
        setActiveTenant(customEvent.detail);
      }
    };
    window.addEventListener('aegis-tenant-changed', handleTenantChange);
    return () => window.removeEventListener('aegis-tenant-changed', handleTenantChange);
  }, []);

  const courses = courseService.getPublishedCourses();
  const progress = progressService.getProgress(userId);
  const allBadges = badgeService.getAllBadges();
  const earnedBadges = badgeService.getLearnerBadges(userId);
  const earnedBadgeMap = new Map(earnedBadges.map((eb) => [eb.badge.id, eb]));

  // 1. Five Configured Award Ranks Progression
  const rankProgressionIds = [
    'badge-junior-officer',
    'badge-patrol-specialist',
    'badge-safety-observer',
    'badge-incident-reporter',
    'badge-course-completion',
  ];

  const rankProgression = rankProgressionIds
    .map((id) => allBadges.find((b) => b.id === id))
    .filter((b): b is Badge => Boolean(b));

  // Determine current earned rank and next milestone
  let highestEarnedBadge: Badge | null = null;
  let highestEarnedRecord: { badge: Badge; earnedAt: string; courseId?: string } | null = null;
  let nextMilestoneBadge: Badge | null = null;

  for (const b of rankProgression) {
    if (earnedBadgeMap.has(b.id)) {
      highestEarnedBadge = b;
      highestEarnedRecord = earnedBadgeMap.get(b.id) || null;
    } else if (!nextMilestoneBadge) {
      nextMilestoneBadge = b;
    }
  }

  // Flagship Course & Module Progress (Course 101)
  const flagshipCourse = courses.find((c) => c.id === 'course-nature-role') || courses[0];
  const mod1Completion = flagshipCourse
    ? progressService.getModuleCompletionPercentage(userId, flagshipCourse.id, 'mod-1-foundations')
    : 0;
  const mod2Completion = flagshipCourse
    ? progressService.getModuleCompletionPercentage(userId, flagshipCourse.id, 'mod-2-assessment')
    : 0;

  // Curriculum parts calculation across all 5 courses
  const courseParts = courses.map((course, index) => {
    const percentage = progressService.getCourseCompletionPercentage(userId, course.id);
    const isCompleted = percentage >= 100;
    const targetLesson =
      progress.courseProgress[course.id]?.lastAccessedLessonId ||
      course.modules[0]?.lessons[0]?.id ||
      '';

    return {
      partNumber: index + 1,
      course,
      percentage,
      isCompleted,
      targetLesson,
    };
  });

  const totalCourseParts = courseParts.length;
  const completedPartsCount = courseParts.filter((cp) => cp.isCompleted).length;
  const overallCurriculumPct =
    totalCourseParts > 0
      ? Math.round(courseParts.reduce((acc, curr) => acc + curr.percentage, 0) / totalCourseParts)
      : 0;

  // Find next sequential incomplete lesson in Flagship course for "Continue Learning"
  let nextIncompleteLessonId = '';
  if (flagshipCourse) {
    for (const m of flagshipCourse.modules) {
      for (const l of m.lessons) {
        if (!progress.completedLessons.includes(l.id)) {
          nextIncompleteLessonId = l.id;
          break;
        }
      }
      if (nextIncompleteLessonId) break;
    }
  }

  const continueLearningUrl = nextIncompleteLessonId
    ? `/learner/player/${flagshipCourse?.id || 'course-nature-role'}/${nextIncompleteLessonId}`
    : `/learner/courses/${flagshipCourse?.id || 'course-nature-role'}`;

  // Practical Simulations & Assessments
  const inspection = progress.roomInspectionProgress['scenario-facility-04'];
  const inspectionDone = inspection?.completed || false;
  const reportedCount = inspection?.reportedIrregularityIds?.length || 0;

  const examAttempts = progress.quizAttempts['assessment-nature-role'] || [];
  const latestAttempt = examAttempts.length > 0 ? examAttempts[examAttempts.length - 1] : null;
  const examPassed = latestAttempt?.passed || false;

  // Resolved Current Rank Name (respect tenant branding for top badge)
  const resolvedCurrentRankTitle = highestEarnedBadge
    ? highestEarnedBadge.id === 'badge-course-completion'
      ? activeTenant.id === 'tenant-ranucle'
        ? 'Ranucle Certified Security Professional'
        : activeTenant.id === 'tenant-apex'
        ? 'Apex Certified Security Professional'
        : highestEarnedBadge.title
      : highestEarnedBadge.title
    : 'Security Trainee Candidate';

  const resolvedCurrentRankCourse = highestEarnedBadge
    ? flagshipCourse?.title || 'The Nature and Role of Private Security'
    : 'Enrolled in SEC-101 Foundational Security Guard Accreditation';

  const formattedAwardDate = highestEarnedRecord?.earnedAt
    ? new Date(highestEarnedRecord.earnedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '48px' }}>
      {/* ========================================================================
          A. HEADER SECTION
          ======================================================================== */}
      <div
        className="page-header"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(23, 54, 93, 0.08)',
              color: '#17365D',
              border: '1px solid rgba(23, 54, 93, 0.2)',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            <Shield size={12} color="#17365D" />
            <span>{activeTenant.brandTitle} • VERIFIED LEARNER RECORD</span>
          </div>

          <h1 className="page-title" style={{ fontSize: '28px', color: '#17365D', margin: 0 }}>
            My Certification Progress
          </h1>
          <p className="page-subtitle" style={{ color: '#68777D', margin: '4px 0 0' }}>
            Track your training milestones, earned ranks, and progress toward certification.
          </p>
        </div>

        {/* Top Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {(examPassed || (flagshipCourse && progressService.getCourseCompletionPercentage(userId, flagshipCourse.id) >= 100)) && (
            <button
              type="button"
              onClick={() => setShowCertificateModal(true)}
              className="btn btn-secondary btn-sm"
              id="btn-open-certificate-top"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderColor: '#E0B84C',
                color: '#8A5328',
              }}
            >
              <Printer size={15} />
              <span>View Official Certificate</span>
            </button>
          )}

          <Link
            to={continueLearningUrl}
            className="btn btn-accent btn-sm"
            id="btn-continue-learning-top"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            <Play size={14} fill="#FFFFFF" />
            <span>Continue Learning</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================
          B & C. CURRENT RANK SECTION & OFFICER ILLUSTRATION HERO
          ======================================================================== */}
      <div
        className="card current-rank-hero-card"
        style={{
          backgroundColor: '#17365D',
          backgroundImage:
            'radial-gradient(circle at 80% 20%, rgba(224, 184, 76, 0.15) 0%, transparent 60%), linear-gradient(135deg, #17365D 0%, #0F223D 100%)',
          color: '#FAF8F3',
          border: '2px solid #234D7D',
          borderRadius: '16px',
          padding: '28px 32px',
          marginBottom: '32px',
          boxShadow: '0 16px 36px rgba(15, 34, 61, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 1.4fr) minmax(180px, 0.75fr) minmax(200px, 0.85fr)',
            gap: '28px',
            alignItems: 'center',
          }}
          className="ceremony-three-col-layout"
        >
          {/* Column 1: Rank Identity & Metadata */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(224, 184, 76, 0.18)',
                border: '1px solid #E0B84C',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 800,
                color: '#E0B84C',
                letterSpacing: '0.06em',
                marginBottom: '10px',
              }}
            >
              <Award size={13} color="#E0B84C" />
              <span>CURRENT QUALIFICATION RANK</span>
            </div>

            <div style={{ fontSize: '13px', color: '#DDE5D7', fontWeight: 600, textTransform: 'uppercase' }}>
              Officer {user?.name || 'Alex Taylor'}
            </div>

            <h2
              style={{
                fontSize: '26px',
                fontWeight: 800,
                color: '#FFFFFF',
                margin: '4px 0 8px',
                lineHeight: 1.25,
              }}
            >
              {resolvedCurrentRankTitle}
            </h2>

            <div style={{ fontSize: '13px', color: '#DDE5D7', marginBottom: '14px', lineHeight: 1.5 }}>
              {resolvedCurrentRankCourse}
            </div>

            {/* Awarded Date (rendered ONLY if actually stored!) */}
            {formattedAwardDate && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#FAF8F3',
                  marginBottom: '16px',
                }}
              >
                <Clock size={13} color="#E0B84C" />
                <span>Awarded: {formattedAwardDate}</span>
              </div>
            )}

            <p style={{ color: '#BAC7D5', fontSize: '13px', lineHeight: 1.5, margin: 0, maxWidth: '520px' }}>
              {highestEarnedBadge
                ? highestEarnedBadge.description
                : 'Complete the foundational duties curriculum, safety inspections, and the final assessment to achieve accredited officer rank.'}
            </p>
          </div>

          {/* Column 2: Large Shield Badge Feature */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '16px',
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '14px',
              border: '1px solid rgba(224, 184, 76, 0.3)',
            }}
          >
            <div style={{ marginBottom: '8px' }}>
              <AwardShieldBadge
                id={highestEarnedBadge ? highestEarnedBadge.id : 'badge-junior-officer'}
                tier={highestEarnedBadge?.tier || 'bronze'}
                size={110}
                status={highestEarnedBadge ? 'earned' : 'in_progress'}
                showGlow={Boolean(highestEarnedBadge)}
              />
            </div>

            <div
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#E0B84C',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {highestEarnedBadge ? 'VERIFIED BADGE' : 'IN PROGRESS'}
            </div>
            <div style={{ fontSize: '11px', color: '#DDE5D7', marginTop: '2px' }}>
              {highestEarnedBadge ? `${highestEarnedBadge.tier.toUpperCase()} TIER` : 'FOUNDATIONAL MILESTONE'}
            </div>
          </div>

          {/* Column 3: Officer Illustration */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SecurityOfficerIllustration
              pose={highestEarnedBadge ? 'celebrating' : 'standing'}
              size={210}
              badgeLabel={activeTenant.brandTitle.split(' ')[0]}
            />
          </div>
        </div>
      </div>

      {/* ========================================================================
          D. RANK PROGRESSION SECTION (5 Acredited Ranks)
          ======================================================================== */}
      <div className="card" style={{ padding: '28px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '20px', color: '#17365D', margin: 0 }}>
              Official Security Rank Progression
            </h2>
            <p style={{ color: '#68716D', fontSize: '14px', margin: '4px 0 0' }}>
              Sequential training milestones required for field security qualification and statutory licensing.
            </p>
          </div>

          <div style={{ fontSize: '12px', fontWeight: 700, color: '#17365D' }}>
            {earnedBadges.length} of {rankProgression.length} Ranks Earned
          </div>
        </div>

        {/* 5-Rank Progression Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '16px',
            marginTop: '20px',
          }}
        >
          {rankProgression.map((badge, idx) => {
            const isEarned = earnedBadgeMap.has(badge.id);
            const isInProgress = !isEarned && nextMilestoneBadge?.id === badge.id;
            const isLocked = !isEarned && !isInProgress;
            const earnedRecord = earnedBadgeMap.get(badge.id);

            // Respect tenant branding on top badge
            const displayTitle =
              badge.id === 'badge-course-completion'
                ? activeTenant.id === 'tenant-ranucle'
                  ? 'Ranucle Certified Security Professional'
                  : activeTenant.id === 'tenant-apex'
                  ? 'Apex Certified Security Professional'
                  : badge.title
                : badge.title;

            return (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                style={{
                  backgroundColor: isEarned ? '#FFFFFF' : isInProgress ? '#FAF8F3' : '#F7F8F9',
                  border: isEarned
                    ? '1.5px solid #E0B84C'
                    : isInProgress
                    ? '1.5px dashed #B87955'
                    : '1px solid #E5E0D5',
                  borderRadius: '12px',
                  padding: '20px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  boxShadow: isEarned
                    ? '0 6px 16px rgba(224, 184, 76, 0.15)'
                    : isInProgress
                    ? '0 4px 12px rgba(184, 121, 85, 0.08)'
                    : 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                }}
                className="rank-card-hover"
                title="Click for full rank requirements"
              >
                {/* Step Index Number */}
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '12px',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: isEarned ? '#8A5328' : '#8E9995',
                  }}
                >
                  RANK {idx + 1}
                </div>

                {/* Badge Status Pill */}
                <div style={{ position: 'absolute', top: '10px', right: '12px' }}>
                  {isEarned ? (
                    <span
                      style={{
                        backgroundColor: '#EAF3EE',
                        color: '#34845F',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <CheckCircle2 size={11} />
                      <span>EARNED</span>
                    </span>
                  ) : isInProgress ? (
                    <span
                      style={{
                        backgroundColor: 'rgba(184, 121, 85, 0.12)',
                        color: '#B87955',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '999px',
                      }}
                    >
                      IN PROGRESS
                    </span>
                  ) : (
                    <span
                      style={{
                        backgroundColor: '#E5E0D5',
                        color: '#68716D',
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <Lock size={10} />
                      <span>LOCKED</span>
                    </span>
                  )}
                </div>

                {/* Shield Badge Artwork */}
                <div style={{ marginTop: '18px', marginBottom: '12px' }}>
                  <AwardShieldBadge
                    id={badge.id}
                    tier={badge.tier}
                    size={78}
                    status={isEarned ? 'earned' : isInProgress ? 'in_progress' : 'locked'}
                    showGlow={isEarned}
                  />
                </div>

                {/* Badge Title */}
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: isEarned ? '#17365D' : '#333D3F',
                    marginBottom: '4px',
                    lineHeight: 1.3,
                  }}
                >
                  {displayTitle}
                </div>

                {/* Tier and Category */}
                <div style={{ fontSize: '11px', color: '#8E9995', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>
                  {badge.tier} • {badge.category}
                </div>

                {/* Criteria Snippet */}
                <p
                  style={{
                    fontSize: '11px',
                    color: '#68716D',
                    lineHeight: 1.4,
                    margin: '0 0 10px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {badge.criteria}
                </p>

                {/* Earned Date or Lock Explanation */}
                <div style={{ fontSize: '10px', fontWeight: 600, marginTop: 'auto' }}>
                  {isEarned && earnedRecord ? (
                    <span style={{ color: '#34845F' }}>
                      Earned {new Date(earnedRecord.earnedAt).toLocaleDateString()}
                    </span>
                  ) : isInProgress ? (
                    <span style={{ color: '#B87955' }}>Active milestone requirement</span>
                  ) : (
                    <span style={{ color: '#8E9995' }}>Prerequisite locked</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================
          F. NEXT MILESTONE SECTION (OR COMPLETION CELEBRATION)
          ======================================================================== */}
      {nextMilestoneBadge ? (
        <div
          className="card"
          style={{
            backgroundColor: '#FAF8F3',
            border: '2px solid #E0B84C',
            borderRadius: '14px',
            padding: '24px 28px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: '1 1 400px' }}>
              <div style={{ flexShrink: 0 }}>
                <AwardShieldBadge
                  id={nextMilestoneBadge.id}
                  tier={nextMilestoneBadge.tier}
                  size={72}
                  status="in_progress"
                  showGlow={false}
                />
              </div>

              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#B87955',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}
                >
                  <Sparkles size={12} />
                  <span>NEXT ACHIEVABLE MILESTONE</span>
                </div>
                <h3 style={{ fontSize: '18px', color: '#17365D', margin: '0 0 4px' }}>
                  {nextMilestoneBadge.title}
                </h3>
                <p style={{ color: '#68716D', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                  {nextMilestoneBadge.criteria}
                </p>
              </div>
            </div>

            <div>
              <Link
                to={continueLearningUrl}
                className="btn btn-accent btn-md"
                id="btn-continue-next-milestone"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(184, 121, 85, 0.25)',
                }}
              >
                <span>Continue Learning</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* All Milestones Complete Celebration Banner */
        <div
          className="card"
          style={{
            backgroundColor: '#EAF3EE',
            border: '2px solid #34845F',
            borderRadius: '14px',
            padding: '24px 28px',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <AwardShieldBadge id="badge-course-completion" size={64} status="earned" showGlow={true} />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#34845F', letterSpacing: '0.06em' }}>
                OUTSTANDING ACADEMIC RECORD
              </div>
              <h3 style={{ fontSize: '18px', color: '#173B3A', margin: '2px 0 4px' }}>
                All 5 Training Milestones Completed!
              </h3>
              <p style={{ fontSize: '13px', color: '#333D3F', margin: 0 }}>
                You have fulfilled all curriculum criteria and unlocked elite security clearance credentials.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCertificateModal(true)}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Printer size={16} />
            <span>View & Print Certificate</span>
          </button>
        </div>
      )}

      {/* ========================================================================
          E. COURSE PROGRESS SECTION (Modules & Curriculum Parts)
          ======================================================================== */}
      <div className="card" style={{ padding: '28px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', color: '#17365D', marginBottom: '6px' }}>
          Course Progress & Modular Completion
        </h2>
        <p style={{ color: '#68716D', fontSize: '14px', marginBottom: '24px' }}>
          Real-time completion percentage calculated across flagship lessons, interactive simulations, and certification units.
        </p>

        {/* Flagship Course Module Breakdown */}
        {flagshipCourse && (
          <div
            style={{
              backgroundColor: '#FAF8F3',
              border: '1.5px solid #E5E0D5',
              borderRadius: '12px',
              padding: '20px 24px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span className="badge badge-copper">{flagshipCourse.code}</span>
              <strong style={{ fontSize: '15px', color: '#17365D' }}>{flagshipCourse.title} (Flagship)</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Module 1 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  <span style={{ color: '#20343A' }}>Module 1: Foundational Principles & Operational Duties</span>
                  <span style={{ color: mod1Completion >= 100 ? '#34845F' : '#B87955' }}>{mod1Completion}% complete</span>
                </div>
                <div className="progress-track" style={{ height: '8px' }}>
                  <div
                    className={`progress-fill ${mod1Completion >= 100 ? 'progress-fill-success' : ''}`}
                    style={{ width: `${mod1Completion}%` }}
                  />
                </div>
              </div>

              {/* Module 2 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  <span style={{ color: '#20343A' }}>Module 2: Comprehensive Assessment & Certification</span>
                  <span style={{ color: mod2Completion >= 100 ? '#34845F' : '#B87955' }}>{mod2Completion}% complete</span>
                </div>
                <div className="progress-track" style={{ height: '8px' }}>
                  <div
                    className={`progress-fill ${mod2Completion >= 100 ? 'progress-fill-success' : ''}`}
                    style={{ width: `${mod2Completion}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5 Curriculum Parts Ledger */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {courseParts.map((cp) => (
            <div
              key={cp.course.id}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E0D5',
                borderRadius: '10px',
                padding: '16px 20px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div style={{ flex: '1 1 300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge badge-stone">PART {cp.partNumber}</span>
                  <span className="badge badge-copper">{cp.course.code}</span>
                  {cp.isCompleted && (
                    <span className="badge badge-success">
                      <CheckCircle2 size={12} />
                      <span>Certified</span>
                    </span>
                  )}
                </div>

                <div style={{ fontWeight: 700, fontSize: '15px', color: '#17365D' }}>
                  {cp.course.title}
                </div>
                <div style={{ fontSize: '12px', color: '#68716D', marginTop: '2px' }}>
                  {cp.course.category} • {cp.course.duration} • Passing Score: {cp.course.passingScore}%
                </div>
              </div>

              {/* Progress bar container */}
              <div style={{ flex: '1 1 240px', minWidth: '180px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  <span style={{ color: '#68716D' }}>Completion</span>
                  <span style={{ color: cp.isCompleted ? '#34845F' : '#B87955' }}>
                    {cp.percentage}%
                  </span>
                </div>
                <div className="progress-track" style={{ height: '8px' }}>
                  <div
                    className={`progress-fill ${cp.isCompleted ? 'progress-fill-success' : ''}`}
                    style={{ width: `${cp.percentage}%` }}
                  />
                </div>
              </div>

              {/* Action Button */}
              <div>
                <Link
                  to={`/learner/player/${cp.course.id}/${cp.targetLesson}`}
                  className={`btn btn-sm ${cp.isCompleted ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ textDecoration: 'none', minWidth: '115px' }}
                >
                  <Play size={13} fill={cp.isCompleted ? 'transparent' : '#FFF'} />
                  <span>{cp.isCompleted ? 'Review Unit' : cp.percentage > 0 ? 'Resume' : 'Start Part'}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================
          PRACTICAL SIMULATION & ASSESSMENT LEDGER
          ======================================================================== */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Facility Inspection Activity Status */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: inspectionDone ? '#EAF3EE' : '#FCF5E9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={18} color={inspectionDone ? '#34845F' : '#C9882B'} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', color: '#17365D', margin: 0 }}>
                Facility 04 Room Inspection Simulation
              </h3>
              <div style={{ fontSize: '11px', color: '#68716D' }}>
                Practical Anomaly Detection Activity
              </div>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: '#68716D', lineHeight: 1.5, marginBottom: '14px' }}>
            Requires full 6-zone physical patrol, detection of security irregularities, and formal report filing.
          </p>

          <div
            style={{
              padding: '12px 14px',
              backgroundColor: '#FAF8F3',
              borderRadius: '8px',
              border: '1px solid #E5E0D5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: '#17365D' }}>
                Status: {inspectionDone ? 'Completed & Certified' : 'Pending Inspection'}
              </div>
              <div style={{ fontSize: '11px', color: '#8E9995', marginTop: '2px' }}>
                {reportedCount} reportable irregularity items logged
              </div>
            </div>

            <Link
              to="/learner/player/course-nature-role/lesson-basic-duties"
              className="btn btn-secondary btn-sm"
              style={{ textDecoration: 'none' }}
            >
              {inspectionDone ? 'Re-inspect' : 'Launch Activity'}
            </Link>
          </div>
        </div>

        {/* Final Exam Status */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: examPassed ? '#EAF3EE' : '#FCF5E9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Award size={18} color={examPassed ? '#34845F' : '#C9882B'} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', color: '#17365D', margin: 0 }}>
                Final Certification Examination
              </h3>
              <div style={{ fontSize: '11px', color: '#68716D' }}>
                10 Comprehensive Evaluative Questions • 80% Threshold
              </div>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: '#68716D', lineHeight: 1.5, marginBottom: '14px' }}>
            Evaluates statutory powers, observation ethics, incident reporting, and security compliance.
          </p>

          <div
            style={{
              padding: '12px 14px',
              backgroundColor: '#FAF8F3',
              borderRadius: '8px',
              border: '1px solid #E5E0D5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: '#17365D' }}>
                {latestAttempt
                  ? `Latest Score: ${latestAttempt.scorePercentage}% (${latestAttempt.passed ? 'PASSED' : 'NOT PASSED'})`
                  : 'Status: Not Yet Attempted'}
              </div>
              <div style={{ fontSize: '11px', color: '#8E9995', marginTop: '2px' }}>
                {examAttempts.length} of 3 attempts logged
              </div>
            </div>

            <Link
              to="/learner/player/course-nature-role/lesson-final-exam"
              className="btn btn-secondary btn-sm"
              style={{ textDecoration: 'none' }}
            >
              {latestAttempt ? (examPassed ? 'Review Exam' : 'Retake Exam') : 'Take Exam'}
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================
          MODAL 1: INTERACTIVE BADGE DETAIL MODAL
          ======================================================================== */}
      {selectedBadge && (
        <div
          className="badge-detail-modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 22, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 9999,
          }}
          onClick={() => setSelectedBadge(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '28px',
              border: '2px solid #E0B84C',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              textAlign: 'center',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedBadge(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#8E9995',
              }}
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>

            {/* Badge Artwork */}
            <div style={{ marginBottom: '16px' }}>
              <AwardShieldBadge
                id={selectedBadge.id}
                tier={selectedBadge.tier}
                size={110}
                status={earnedBadgeMap.has(selectedBadge.id) ? 'earned' : 'locked'}
                showGlow={earnedBadgeMap.has(selectedBadge.id)}
              />
            </div>

            <div
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#B87955',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}
            >
              {selectedBadge.tier} TIER • {selectedBadge.category}
            </div>

            <h3 style={{ fontSize: '20px', color: '#17365D', margin: '0 0 10px' }}>
              {selectedBadge.title}
            </h3>

            <p style={{ fontSize: '13px', color: '#68716D', lineHeight: 1.5, margin: '0 0 16px' }}>
              {selectedBadge.description}
            </p>

            {/* Prerequisite & Unlock Criteria */}
            <div
              style={{
                backgroundColor: '#FAF8F3',
                border: '1px solid #E5E0D5',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '12px',
                color: '#20343A',
                textAlign: 'left',
                lineHeight: 1.5,
                marginBottom: '20px',
              }}
            >
              <strong>Qualification Requirement:</strong>
              <div style={{ marginTop: '4px', color: '#68716D' }}>{selectedBadge.criteria}</div>
            </div>

            {/* Status Information */}
            {earnedBadgeMap.has(selectedBadge.id) ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  color: '#34845F',
                  fontWeight: 700,
                  fontSize: '13px',
                }}
              >
                <CheckCircle2 size={16} />
                <span>
                  Awarded on{' '}
                  {new Date(earnedBadgeMap.get(selectedBadge.id)!.earnedAt).toLocaleDateString()}
                </span>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  color: '#B87955',
                  fontWeight: 700,
                  fontSize: '13px',
                }}
              >
                <Lock size={15} />
                <span>Locked — Fulfill requirements to claim</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================
          MODAL 2: PRINTABLE CERTIFICATE MODAL
          ======================================================================== */}
      {showCertificateModal && (
        <CertificateView
          isModal={true}
          courseIdProp={flagshipCourse?.id || 'course-nature-role'}
          onClose={() => setShowCertificateModal(false)}
        />
      )}
    </div>
  );
};
