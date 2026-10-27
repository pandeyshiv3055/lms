import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Lock,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  HelpCircle,
  Shield,
  Award,
  Layers,
  Building,
} from 'lucide-react';
import { Course, Lesson } from '../../../types';
import { progressService } from '../../../services/progress.service';
import { authService } from '../../../services/auth.service';

interface PlayerSidebarProps {
  course: Course;
  currentLessonId: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSelectLesson: (lessonId: string) => void;
}

export const PlayerSidebar: React.FC<PlayerSidebarProps> = ({
  course,
  currentLessonId,
  isCollapsed,
  onToggleCollapse,
  onSelectLesson,
}) => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const userId = user?.id || 'user-demo-learner';
  const progress = progressService.getProgress(userId);

  const getLessonTypeIcon = (type: Lesson['type']) => {
    switch (type) {
      case 'quiz':
        return <Award size={14} color="#D49B65" />;
      case 'inspection':
        return <Building size={14} color="#387A5A" />;
      case 'knowledge-check':
        return <HelpCircle size={14} color="#B87955" />;
      default:
        return <BookOpen size={14} color="#DDE5D7" />;
    }
  };

  if (isCollapsed) {
    return (
      <div
        style={{
          width: '56px',
          backgroundColor: '#181E1F',
          borderRight: '1px solid #2E3839',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '16px 0',
          gap: '16px',
          zIndex: 30,
        }}
      >
        <button
          onClick={onToggleCollapse}
          aria-label="Expand syllabus sidebar"
          style={{
            padding: '8px',
            borderRadius: '6px',
            backgroundColor: '#242C2D',
            color: '#DDE5D7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Expand Outline"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <aside
      style={{
        width: 'var(--player-sidebar-width)',
        backgroundColor: '#181E1F',
        borderRight: '1px solid #2E3839',
        color: '#F5F2EA',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '100vh',
        zIndex: 30,
        flexShrink: 0,
      }}
    >
      {/* Course Header in Sidebar */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #2E3839',
          backgroundColor: '#121718',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <Shield size={13} color="#D49B65" />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#D49B65', letterSpacing: '0.04em' }}>
              {course.code}
            </span>
          </div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#FAF8F3',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={course.title}
          >
            {course.title}
          </div>
        </div>

        <button
          onClick={onToggleCollapse}
          aria-label="Collapse outline"
          style={{
            padding: '6px',
            borderRadius: '4px',
            color: '#A3AFAC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="btn-ghost"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Module & Lessons Tree */}
      <div
        className="dark-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {course.modules.map((mod) => (
          <div key={mod.id}>
            {/* Module Heading */}
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#8E9995',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Layers size={13} />
              <span>{mod.title}</span>
            </div>

            {/* Lesson list in module */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
              {mod.lessons.map((lesson) => {
                const isCurrent = lesson.id === currentLessonId;
                const isCompleted = progress.completedLessons.includes(lesson.id);
                const isAccessible = progressService.canAccessLesson(userId, course.id, lesson.id);

                return (
                  <button
                    key={lesson.id}
                    disabled={!isAccessible}
                    onClick={() => {
                      if (isAccessible) {
                        onSelectLesson(lesson.id);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      backgroundColor: isCurrent
                        ? '#243E3D'
                        : isAccessible
                          ? 'transparent'
                          : 'rgba(255,255,255,0.02)',
                      borderLeft: isCurrent ? '3px solid #D49B65' : '3px solid transparent',
                      color: isCurrent ? '#FAF8F3' : isAccessible ? '#DDE5D7' : '#68716D',
                      textAlign: 'left',
                      fontSize: '12.5px',
                      fontWeight: isCurrent ? 700 : 500,
                      cursor: isAccessible ? 'pointer' : 'not-allowed',
                      opacity: isAccessible ? 1 : 0.5,
                      transition: 'all 0.15s ease',
                      width: '100%',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      {isCompleted ? (
                        <CheckCircle2 size={16} color="#387A5A" style={{ flexShrink: 0 }} />
                      ) : isAccessible ? (
                        <div style={{ flexShrink: 0 }}>{getLessonTypeIcon(lesson.type)}</div>
                      ) : (
                        <Lock size={14} color="#68716D" style={{ flexShrink: 0 }} />
                      )}

                      <span
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={lesson.title}
                      >
                        {lesson.title}
                      </span>
                    </div>

                    <span style={{ fontSize: '10px', color: '#8E9995', flexShrink: 0, marginLeft: '6px' }}>
                      {lesson.slides.length}s
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Return to Dashboard Footer */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #2E3839', backgroundColor: '#121718' }}>
        <button
          onClick={() => navigate('/learner/dashboard')}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: '#242C2D',
            color: '#DDE5D7',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
          className="btn-secondary"
        >
          <span>Exit Player</span>
        </button>
      </div>
    </aside>
  );
};
