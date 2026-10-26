import React from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  BookOpen,
  Award,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { authService } from '../../services/auth.service';
import { courseService } from '../../services/course.service';
import { progressService } from '../../services/progress.service';
import { badgeService } from '../../services/badge.service';
import { CourseCover } from '../../assets/illustrations/course-covers';
import { BadgeEmblem } from '../../assets/illustrations/badges';

export const Dashboard: React.FC = () => {
  const user = authService.getCurrentUser();
  const userId = user?.id || 'user-demo-learner';

  const courses = courseService.getPublishedCourses();
  const progress = progressService.getProgress(userId);
  const earnedBadges = badgeService.getLearnerBadges(userId);

  // Compute overall learning metrics derived from shared progress service
  let totalLessonsInSystem = 0;
  let totalCompletedLessons = 0;
  let completedCoursesCount = 0;
  let inProgressCoursesCount = 0;

  courses.forEach((c) => {
    let courseTotal = 0;
    let courseCompleted = 0;

    c.modules.forEach((m) => {
      m.lessons.forEach((l) => {
        courseTotal++;
        totalLessonsInSystem++;
        if (progress.completedLessons.includes(l.id)) {
          courseCompleted++;
          totalCompletedLessons++;
        }
      });
    });

    const pct = courseTotal > 0 ? (courseCompleted / courseTotal) * 100 : 0;
    if (pct >= 100) {
      completedCoursesCount++;
    } else if (pct > 0) {
      inProgressCoursesCount++;
    }
  });

  const overallPercentage =
    totalLessonsInSystem > 0 ? Math.round((totalCompletedLessons / totalLessonsInSystem) * 100) : 0;

  // Flagship course for Continue Learning card
  const flagshipCourse = courses.find((c) => c.id === 'course-nature-role') || courses[0];
  const flagshipPct = progressService.getCourseCompletionPercentage(userId, flagshipCourse.id);
  const lastLessonId =
    progress.courseProgress[flagshipCourse.id]?.lastAccessedLessonId || 'lesson-basic-duties';

  return (
    <div className="container animate-fade-in">
      {/* Welcome Banner */}
      <div
        style={{
          backgroundColor: '#173B3A',
          backgroundImage: 'linear-gradient(135deg, #173B3A 0%, #243E3D 100%)',
          borderRadius: '16px',
          padding: '32px',
          color: '#F5F2EA',
          marginBottom: '32px',
          boxShadow: '0 10px 25px -5px rgba(23, 59, 58, 0.25)',
          border: '1px solid #2A5452',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(212, 155, 101, 0.2)',
              border: '1px solid #D49B65',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#D49B65',
              marginBottom: '12px',
            }}
          >
            <Shield size={13} />
            <span>2026 ACTIVE QUALIFICATION CYCLE</span>
          </div>

          <h1 style={{ fontSize: '28px', color: '#FAF8F3', marginBottom: '8px' }}>
            Welcome back, {user?.name || 'Officer'}
          </h1>
          <p style={{ color: '#DDE5D7', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
            Continue your training in <strong>{flagshipCourse.title}</strong>. Complete the
            Facility 04 building inspection activity and prepare for your final certification exam.
          </p>
        </div>

        {/* Quick Continue Action Button */}
        <Link
          to={`/learner/player/${flagshipCourse.id}/${lastLessonId}`}
          className="btn btn-accent btn-lg"
          style={{
            boxShadow: '0 4px 12px rgba(184, 121, 85, 0.35)',
            textDecoration: 'none',
          }}
        >
          <Play size={18} fill="#FFFFFF" />
          <span>Resume Training</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#68716D' }}>Enrolled Courses</span>
            <BookOpen size={18} color="#173B3A" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#173B3A' }}>{courses.length}</div>
          <div style={{ fontSize: '12px', color: '#8E9995', marginTop: '4px' }}>Active curriculum paths</div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#68716D' }}>Completed Units</span>
            <Layers size={18} color="#387A5A" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#387A5A' }}>
            {totalCompletedLessons} <span style={{ fontSize: '15px', color: '#68716D', fontWeight: 500 }}>/ {totalLessonsInSystem} lessons</span>
          </div>
          <div style={{ fontSize: '12px', color: '#8E9995', marginTop: '4px' }}>Completed across all parts</div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#68716D' }}>Overall Progress</span>
            <Sparkles size={18} color="#B87955" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#B87955' }}>
            {overallPercentage}%
          </div>
          <div className="progress-track" style={{ marginTop: '8px', height: '6px' }}>
            <div className="progress-fill" style={{ width: `${overallPercentage}%` }} />
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#68716D' }}>Earned Badges</span>
            <Award size={18} color="#D49B65" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#173B3A' }}>
            {earnedBadges.length} <span style={{ fontSize: '15px', color: '#68716D', fontWeight: 500 }}>qualifications</span>
          </div>
          <div style={{ fontSize: '12px', color: '#387A5A', fontWeight: 600, marginTop: '4px' }}>
            Verified in ledger
          </div>
        </div>
      </div>

      {/* Flagship Continue Learning Hero Card */}
      <div
        className="card"
        style={{
          padding: 0,
          overflow: 'hidden',
          marginBottom: '36px',
          border: '2px solid #E5E0D5',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {/* Cover on left */}
          <div style={{ flex: '1 1 360px', minWidth: '300px', backgroundColor: '#173B3A' }}>
            <CourseCover courseId={flagshipCourse.id} aspectRatio="16/9" />
          </div>

          {/* Details on right */}
          <div style={{ flex: '2 1 400px', padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-copper">{flagshipCourse.code}</span>
                <span className="badge badge-evergreen">{flagshipCourse.category}</span>
                <span className="badge badge-stone">{flagshipCourse.level}</span>
              </div>

              <h2 style={{ fontSize: '22px', color: '#173B3A', marginBottom: '8px' }}>
                {flagshipCourse.title}
              </h2>
              <p style={{ color: '#68716D', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
                {flagshipCourse.description}
              </p>

              {/* Progress indicator */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  <span>Course Completion</span>
                  <span style={{ color: flagshipPct >= 100 ? '#387A5A' : '#B87955' }}>{flagshipPct}%</span>
                </div>
                <div className="progress-track">
                  <div
                    className={`progress-fill ${flagshipPct >= 100 ? 'progress-fill-success' : ''}`}
                    style={{ width: `${flagshipPct}%` }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#68716D' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={15} />
                  {flagshipCourse.duration}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Layers size={15} />
                  {flagshipCourse.modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link
                  to={`/learner/courses/${flagshipCourse.id}`}
                  className="btn btn-secondary btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  View Outline
                </Link>
                <Link
                  to={`/learner/player/${flagshipCourse.id}/${lastLessonId}`}
                  className="btn btn-primary"
                  style={{ textDecoration: 'none' }}
                >
                  <Play size={16} fill="#FFF" />
                  <span>{flagshipPct > 0 ? 'Continue Lesson' : 'Start Course'}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Catalog Grid */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '20px', color: '#173B3A' }}>All Enrolled Security Modules</h2>
            <p style={{ color: '#68716D', fontSize: '13px', margin: 0 }}>
              Curated compliance courses for professional guard certification
            </p>
          </div>
          <Link
            to="/learner/courses"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#B87955',
            }}
          >
            <span>Browse Full Catalogue</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
          }}
        >
          {courses.map((course) => {
            const coursePct = progressService.getCourseCompletionPercentage(userId, course.id);
            const isDone = coursePct >= 100;
            const targetLesson =
              progress.courseProgress[course.id]?.lastAccessedLessonId ||
              course.modules[0]?.lessons[0]?.id ||
              '';

            return (
              <div
                key={course.id}
                className="card card-interactive"
                style={{
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <CourseCover courseId={course.id} aspectRatio="16/9" />
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <span className="badge badge-copper">{course.code}</span>
                      <span className="badge badge-stone">{course.category}</span>
                      {isDone && <span className="badge badge-success">Completed</span>}
                    </div>

                    <h3 style={{ fontSize: '17px', color: '#173B3A', marginBottom: '6px' }}>
                      {course.title}
                    </h3>
                    <p style={{ color: '#68716D', fontSize: '13px', lineHeight: 1.5, marginBottom: '16px' }}>
                      {course.shortDescription}
                    </p>
                  </div>

                  <div>
                    {/* Course progress */}
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                        <span>Progress</span>
                        <span style={{ color: isDone ? '#387A5A' : '#B87955' }}>{coursePct}%</span>
                      </div>
                      <div className="progress-track" style={{ height: '6px' }}>
                        <div
                          className={`progress-fill ${isDone ? 'progress-fill-success' : ''}`}
                          style={{ width: `${coursePct}%` }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#8E9995', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} />
                        <span>{course.duration}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Link
                          to={`/learner/courses/${course.id}`}
                          className="btn btn-secondary btn-sm"
                          style={{ textDecoration: 'none' }}
                        >
                          Details
                        </Link>
                        <Link
                          to={`/learner/player/${course.id}/${targetLesson}`}
                          className="btn btn-primary btn-sm"
                          style={{ textDecoration: 'none' }}
                        >
                          <Play size={13} fill="#FFF" />
                          <span>{coursePct > 0 ? 'Resume' : 'Start'}</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Earned Badges Strip */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '18px', color: '#173B3A' }}>Recent Qualifications & Badges</h2>
            <p style={{ color: '#68716D', fontSize: '13px', margin: 0 }}>
              Badges earned through interactive inspections and assessment passing scores
            </p>
          </div>
          <Link
            to="/learner/progress"
            style={{ fontSize: '13px', fontWeight: 700, color: '#B87955' }}
          >
            View All Badges
          </Link>
        </div>

        {earnedBadges.length === 0 ? (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              backgroundColor: '#FAF8F3',
              borderRadius: '8px',
              border: '1px dashed #CCC4B4',
              color: '#68716D',
              fontSize: '13px',
            }}
          >
            <Award size={32} color="#A3AFAC" style={{ margin: '0 auto 8px' }} />
            <div>No badges earned yet. Complete Lesson 1.1 or the Facility 04 Inspection to unlock your first qualification!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {earnedBadges.map(({ badge, earnedAt }) => (
              <div
                key={badge.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  backgroundColor: '#FAF8F3',
                  borderRadius: '10px',
                  border: '1px solid #E5E0D5',
                }}
              >
                <BadgeEmblem id={badge.id} size={48} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#173B3A' }}>
                    {badge.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#68716D' }}>
                    Awarded {new Date(earnedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
