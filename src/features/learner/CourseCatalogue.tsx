import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, Layers, Play } from 'lucide-react';
import { courseService } from '../../services/course.service';
import { progressService } from '../../services/progress.service';
import { authService } from '../../services/auth.service';
import { CourseCover } from '../../assets/illustrations/course-covers';

export const CourseCatalogue: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const user = authService.getCurrentUser();
  const userId = user?.id || 'user-demo-learner';

  const categories = [
    { id: 'all', label: 'All Modules' },
    { id: 'Foundations', label: 'Foundations' },
    { id: 'Field Operations', label: 'Field Operations' },
    { id: 'Perimeter Defense', label: 'Perimeter Defense' },
    { id: 'Documentation & Crisis', label: 'Documentation' },
    { id: 'Safety & Compliance', label: 'Safety' },
  ];

  const courses = courseService.getCourses({
    category: selectedCategory,
    search,
    status: 'published',
  });

  return (
    <div className="container animate-fade-in">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '28px' }}>
        <h1 className="page-title">Curriculum Catalogue</h1>
        <p className="page-subtitle">
          Accredited interactive security courses covering statutory powers, patrol operations, access control, and hazard inspection.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Search input */}
        <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '240px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#8E9995',
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses by title, code, or topic..."
            className="form-input"
            style={{ paddingLeft: '36px' }}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: active ? '#173B3A' : '#FAF8F3',
                  color: active ? '#FFFFFF' : '#68716D',
                  border: active ? '1px solid #173B3A' : '1px solid #E5E0D5',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            color: '#68716D',
          }}
        >
          <Search size={36} color="#A3AFAC" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '18px', color: '#173B3A', marginBottom: '6px' }}>No training courses found</h3>
          <p style={{ margin: 0 }}>Try clearing your search term or selecting another category filter.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {courses.map((course) => {
            const pct = progressService.getCourseCompletionPercentage(userId, course.id);
            const isCompleted = pct >= 100;
            const progress = progressService.getProgress(userId);
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
                      <span className="badge badge-evergreen">{course.category}</span>
                      <span className="badge badge-stone">{course.level}</span>
                      {isCompleted && <span className="badge badge-success">Completed</span>}
                    </div>

                    <h3 style={{ fontSize: '18px', color: '#173B3A', marginBottom: '8px' }}>
                      {course.title}
                    </h3>
                    <p style={{ color: '#68716D', fontSize: '13px', lineHeight: 1.5, marginBottom: '16px' }}>
                      {course.description}
                    </p>
                  </div>

                  <div>
                    {/* Course progress */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                        <span>Completion Rate</span>
                        <span style={{ color: isCompleted ? '#387A5A' : '#B87955' }}>{pct}%</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className={`progress-fill ${isCompleted ? 'progress-fill-success' : ''}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '12px', color: '#8E9995', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} />
                        <span>{course.duration}</span>
                        <span style={{ margin: '0 4px' }}>•</span>
                        <Layers size={14} />
                        <span>{course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} units</span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
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
                          <span>{pct > 0 ? 'Resume' : 'Start'}</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
