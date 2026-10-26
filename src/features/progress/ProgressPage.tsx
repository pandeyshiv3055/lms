import React from 'react';
import { Link } from 'react-router-dom';
import { Award, CheckCircle2, Clock, Play } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { courseService } from '../../services/course.service';
import { progressService } from '../../services/progress.service';
import { badgeService } from '../../services/badge.service';
import { BadgeEmblem } from '../../assets/illustrations/badges';

export const ProgressPage: React.FC = () => {
  const user = authService.getCurrentUser();
  const userId = user?.id || 'user-demo-learner';

  const courses = courseService.getPublishedCourses();
  const progress = progressService.getProgress(userId);
  const allBadges = badgeService.getAllBadges();
  const earnedBadges = badgeService.getLearnerBadges(userId);

  // Derive course parts completion
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
  const overallCurriculumPct = Math.round(
    courseParts.reduce((acc, curr) => acc + curr.percentage, 0) / totalCourseParts
  );

  // Room inspection status for Course 101
  const inspection = progress.roomInspectionProgress['scenario-facility-04'];
  const inspectionDone = inspection?.completed || false;
  const reportedCount = inspection?.reportedIrregularityIds?.length || 0;

  // Final exam attempt status
  const examAttempts = progress.quizAttempts['assessment-nature-role'] || [];
  const latestAttempt = examAttempts.length > 0 ? examAttempts[examAttempts.length - 1] : null;

  return (
    <div className="container animate-fade-in">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '28px' }}>
        <h1 className="page-title">Curriculum Progression & Credentials</h1>
        <p className="page-subtitle">
          Real-time compliance ledger tracking course completion percentages, inspection simulation outcomes, and verified badge awards.
        </p>
      </div>

      {/* Top Credentials Showcase Hero */}
      <div
        className="card"
        style={{
          backgroundColor: '#173B3A',
          backgroundImage: 'linear-gradient(135deg, #173B3A 0%, #102928 100%)',
          color: '#FAF8F3',
          border: '1px solid #215150',
          padding: '28px',
          marginBottom: '32px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(212, 155, 101, 0.2)',
                border: '1px solid #D49B65',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#D49B65',
                marginBottom: '8px',
              }}
            >
              <Award size={14} />
              <span>SECURITY QUALIFICATION CREDENTIALS</span>
            </div>
            <h2 style={{ fontSize: '24px', color: '#FAF8F3', margin: '0 0 6px' }}>
              Officer {user?.name}
            </h2>
            <p style={{ color: '#DDE5D7', fontSize: '14px', margin: 0, maxWidth: '600px' }}>
              Your operational qualification is determined by passing all 5 curriculum parts and earning the AEGIS Certified Security Professional accreditation.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              backgroundColor: 'rgba(0,0,0,0.25)',
              padding: '16px 24px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#D49B65' }}>
                {overallCurriculumPct}%
              </div>
              <div style={{ fontSize: '11px', color: '#DDE5D7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Curriculum Total
              </div>
            </div>

            <div style={{ width: '1px', height: '40px', backgroundColor: 'rgba(255,255,255,0.2)' }} />

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#387A5A' }}>
                {completedPartsCount} / {totalCourseParts}
              </div>
              <div style={{ fontSize: '11px', color: '#DDE5D7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Parts Certified
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Parts Breakdown (Inspired by the Reference Screenshot) */}
      <div className="card" style={{ padding: '28px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', color: '#173B3A', marginBottom: '6px' }}>
          Course Parts & Modular Completion
        </h2>
        <p style={{ color: '#68716D', fontSize: '14px', marginBottom: '24px' }}>
          Progress across all 5 accredited training modules. Each unit must reach 100% to satisfy regulatory audit requirements.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {courseParts.map((cp) => (
            <div
              key={cp.course.id}
              style={{
                backgroundColor: '#FAF8F3',
                border: '1px solid #E5E0D5',
                borderRadius: '10px',
                padding: '18px 22px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div style={{ flex: '1 1 320px' }}>
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

                <div style={{ fontWeight: 700, fontSize: '16px', color: '#173B3A' }}>
                  {cp.course.title}
                </div>
                <div style={{ fontSize: '12px', color: '#68716D', marginTop: '2px' }}>
                  {cp.course.category} • {cp.course.duration} • Passing Threshold: {cp.course.passingScore}%
                </div>
              </div>

              {/* Progress bar container */}
              <div style={{ flex: '1 1 260px', minWidth: '200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  <span style={{ color: '#68716D' }}>Completion</span>
                  <span style={{ color: cp.isCompleted ? '#387A5A' : '#B87955' }}>
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
                  style={{ textDecoration: 'none', minWidth: '120px' }}
                >
                  <Play size={14} fill={cp.isCompleted ? 'transparent' : '#FFF'} />
                  <span>{cp.isCompleted ? 'Review Unit' : cp.percentage > 0 ? 'Resume' : 'Start Part'}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Practical Activity & Assessment Ledger */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Room Inspection Simulation Status */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
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
              <CheckCircle2 size={18} color={inspectionDone ? '#387A5A' : '#C9882B'} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', color: '#173B3A', margin: 0 }}>
                Facility 04 Room Inspection Activity
              </h3>
              <div style={{ fontSize: '11px', color: '#68716D' }}>
                Practical Environmental Inspection Simulation
              </div>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: '#68716D', lineHeight: 1.5, marginBottom: '16px' }}>
            Interactive simulation requiring inspection of 6 building zones, anomaly detection, and formal irregularity logging.
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
              <div style={{ fontWeight: 600, color: '#173B3A' }}>
                Status: {inspectionDone ? 'Completed & Certified' : 'Incomplete / Pending'}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: latestAttempt?.passed ? '#EAF3EE' : '#FCF5E9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Award size={18} color={latestAttempt?.passed ? '#387A5A' : '#C9882B'} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', color: '#173B3A', margin: 0 }}>
                Final Certification Assessment
              </h3>
              <div style={{ fontSize: '11px', color: '#68716D' }}>
                10 Comprehensive Evaluative Questions • 80% Threshold
              </div>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: '#68716D', lineHeight: 1.5, marginBottom: '16px' }}>
            Formal evaluative exam testing statutory limits, observation ethics, incident reporting, and safety protocols.
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
              <div style={{ fontWeight: 600, color: '#173B3A' }}>
                {latestAttempt
                  ? `Latest Score: ${latestAttempt.scorePercentage}% (${latestAttempt.passed ? 'PASSED' : 'FAILED'})`
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
              {latestAttempt ? 'Retake Exam' : 'Take Exam'}
            </Link>
          </div>
        </div>
      </div>

      {/* Complete Badge Collection Grid */}
      <div className="card" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#173B3A', marginBottom: '6px' }}>
          Official AEGIS Badge Collection
        </h2>
        <p style={{ color: '#68716D', fontSize: '14px', marginBottom: '24px' }}>
          Verifiable security accreditations automatically awarded upon meeting strict performance criteria.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {allBadges.map((badge) => {
            const isEarned = badgeService.hasBadge(userId, badge.id);
            const earnedRecord = earnedBadges.find((eb) => eb.badge.id === badge.id);

            return (
              <div
                key={badge.id}
                style={{
                  backgroundColor: isEarned ? '#FFFFFF' : '#FAF8F3',
                  border: isEarned ? '1.5px solid #D49B65' : '1px dashed #D6CFBF',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  boxShadow: isEarned ? '0 4px 12px rgba(212, 155, 101, 0.15)' : 'none',
                  opacity: isEarned ? 1 : 0.7,
                }}
              >
                <BadgeEmblem id={badge.id} size={56} unlocked={isEarned} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span className={`badge ${isEarned ? 'badge-copper' : 'badge-stone'}`}>
                      {badge.tier.toUpperCase()}
                    </span>
                    {isEarned && (
                      <span className="badge badge-success" style={{ fontSize: '10px' }}>
                        UNLOCKED
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '15px', color: '#173B3A', margin: '0 0 4px' }}>
                    {badge.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#68716D', lineHeight: 1.4, margin: '0 0 8px' }}>
                    {badge.description}
                  </p>
                  <div style={{ fontSize: '11px', color: '#8E9995', fontStyle: 'italic' }}>
                    Criteria: {badge.criteria}
                  </div>
                  {isEarned && earnedRecord && (
                    <div style={{ fontSize: '11px', color: '#387A5A', fontWeight: 600, marginTop: '6px' }}>
                      Earned on {new Date(earnedRecord.earnedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
