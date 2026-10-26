import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  Lock,
  Play,
  ArrowLeft,
  Target,
  Users,
  ShieldCheck,
  Award,
  Layers,
} from 'lucide-react';
import { courseService } from '../../services/course.service';
import { progressService } from '../../services/progress.service';
import { authService } from '../../services/auth.service';
import { CourseCover } from '../../assets/illustrations/course-covers';

export const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const userId = user?.id || 'user-demo-learner';

  const course = courseService.getCourseById(courseId || '');

  if (!course) {
    return (
      <div className="container" style={{ padding: '48px 0', textAlign: 'center' }}>
        <h2>Course Not Found</h2>
        <p>The requested course is not currently available.</p>
        <Link to="/learner/courses" className="btn btn-secondary">
          Return to Course Catalog
        </Link>
      </div>
    );
  }

  const coursePct = progressService.getCourseCompletionPercentage(userId, course.id);
  const progress = progressService.getProgress(userId);
  const lastLessonId =
    progress.courseProgress[course.id]?.lastAccessedLessonId ||
    course.modules[0]?.lessons[0]?.id ||
    '';

  return (
    <div className="container animate-fade-in">
      {/* Back button */}
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => navigate('/learner/courses')}
          className="btn btn-ghost btn-sm"
          style={{ padding: '4px 8px', color: '#68716D' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Catalogue</span>
        </button>
      </div>

      {/* Main Course Header Hero Card */}
      <div
        className="card"
        style={{
          padding: 0,
          overflow: 'hidden',
          marginBottom: '32px',
          border: '2px solid #E5E0D5',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 380px', minWidth: '320px', backgroundColor: '#173B3A' }}>
            <CourseCover courseId={course.id} aspectRatio="16/9" />
          </div>

          <div
            style={{
              flex: '2 1 440px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span className="badge badge-copper">{course.code}</span>
                <span className="badge badge-evergreen">{course.category}</span>
                <span className="badge badge-stone">{course.level}</span>
                {coursePct >= 100 && <span className="badge badge-success">Completed</span>}
              </div>

              <h1 style={{ fontSize: '26px', color: '#173B3A', marginBottom: '10px' }}>
                {course.title}
              </h1>
              <p style={{ color: '#68716D', fontSize: '15px', lineHeight: 1.6, marginBottom: '20px' }}>
                {course.description}
              </p>

              {/* Progress Bar */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  <span>Your Completion</span>
                  <span style={{ color: coursePct >= 100 ? '#387A5A' : '#B87955' }}>{coursePct}%</span>
                </div>
                <div className="progress-track" style={{ height: '8px' }}>
                  <div
                    className={`progress-fill ${coursePct >= 100 ? 'progress-fill-success' : ''}`}
                    style={{ width: `${coursePct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Metadata & Start Action */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #E5E0D5',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '13px', color: '#68716D' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} />
                  <span>{course.duration}</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={16} />
                  <span>Passing Score: {course.passingScore}%</span>
                </span>
              </div>

              <Link
                to={`/learner/player/${course.id}/${lastLessonId}`}
                className="btn btn-accent btn-lg"
                style={{ textDecoration: 'none' }}
              >
                <Play size={18} fill="#FFF" />
                <span>{coursePct > 0 ? 'Continue Training' : 'Start Course'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Layout: Details on left, Syllabus outline on right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '28px', alignItems: 'start' }}>
        {/* Left Column: Objectives, Target Audience & Prerequisites */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Objectives Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Target size={18} color="#B87955" />
              <h3 style={{ fontSize: '16px', color: '#173B3A', margin: 0 }}>Learning Objectives</h3>
            </div>
            <ul style={{ paddingLeft: '20px', margin: 0, color: '#242C2D', fontSize: '14px', lineHeight: 1.6 }}>
              {course.objectives.map((obj, i) => (
                <li key={i} style={{ marginBottom: '8px' }}>{obj}</li>
              ))}
            </ul>
          </div>

          {/* Target Audience & Prerequisites */}
          <div className="card">
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Users size={18} color="#173B3A" />
                <h3 style={{ fontSize: '16px', color: '#173B3A', margin: 0 }}>Target Audience</h3>
              </div>
              <p style={{ color: '#68716D', fontSize: '14px', margin: 0 }}>
                {course.targetAudience}
              </p>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShieldCheck size={18} color="#387A5A" />
                <h3 style={{ fontSize: '16px', color: '#173B3A', margin: 0 }}>Prerequisites</h3>
              </div>
              {course.prerequisites.length === 0 ? (
                <p style={{ color: '#68716D', fontSize: '14px', margin: 0 }}>None. Open enrollment.</p>
              ) : (
                <ul style={{ paddingLeft: '20px', margin: 0, color: '#68716D', fontSize: '14px' }}>
                  {course.prerequisites.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Module & Lesson Syllabus Outline */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="#173B3A" />
              <h2 style={{ fontSize: '18px', color: '#173B3A', margin: 0 }}>Course Syllabus Outline</h2>
            </div>
            <span style={{ fontSize: '12px', color: '#8E9995' }}>Sequential Progression Enforced</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {course.modules.map((module) => {
              const modPct = progressService.getModuleCompletionPercentage(userId, course.id, module.id);
              return (
                <div
                  key={module.id}
                  style={{
                    backgroundColor: '#FAF8F3',
                    borderRadius: '8px',
                    border: '1px solid #E5E0D5',
                    overflow: 'hidden',
                  }}
                >
                  {/* Module Header */}
                  <div
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#ECE7DE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid #D6CFBF',
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '14px', color: '#173B3A' }}>
                      {module.title}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: modPct >= 100 ? '#387A5A' : '#68716D' }}>
                      {modPct}% Completed
                    </span>
                  </div>

                  {/* Lessons in Module */}
                  <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {module.lessons.map((lesson) => {
                      const isCompleted = progress.completedLessons.includes(lesson.id);
                      const isAccessible = progressService.canAccessLesson(userId, course.id, lesson.id);

                      return (
                        <div
                          key={lesson.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '6px',
                            border: '1px solid #E5E0D5',
                            opacity: isAccessible ? 1 : 0.65,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {isCompleted ? (
                              <CheckCircle2 size={18} color="#387A5A" />
                            ) : isAccessible ? (
                              <div
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '50%',
                                  border: '2px solid #D49B65',
                                }}
                              />
                            ) : (
                              <Lock size={16} color="#8E9995" />
                            )}

                            <div>
                              <div style={{ fontWeight: 600, fontSize: '13px', color: '#242C2D' }}>
                                {lesson.title}
                              </div>
                              <div style={{ fontSize: '11px', color: '#68716D' }}>
                                {lesson.slides.length} slides • {lesson.type} • ~{lesson.estimatedMinutes} min
                              </div>
                            </div>
                          </div>

                          <div>
                            {isAccessible ? (
                              <Link
                                to={`/learner/player/${course.id}/${lesson.id}`}
                                className="btn btn-primary btn-sm"
                                style={{ textDecoration: 'none', padding: '4px 10px', fontSize: '12px' }}
                              >
                                {isCompleted ? 'Replay' : 'Launch'}
                              </Link>
                            ) : (
                              <span style={{ fontSize: '11px', color: '#8E9995', fontWeight: 600 }}>
                                Locked
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
