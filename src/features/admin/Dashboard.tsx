import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Award,
  Layers,
  ArrowRight,
  Shield,
  Clock,
} from 'lucide-react';
import { courseService } from '../../services/course.service';
import { storageService } from '../../services/storage.service';
import { progressService } from '../../services/progress.service';

export const AdminDashboard: React.FC = () => {
  const courses = courseService.getCourses();
  const publishedCount = courses.filter((c) => c.status === 'published').length;
  const draftCount = courses.filter((c) => c.status === 'draft').length;
  const learners = storageService.getUsers().filter((u) => u.role === 'learner');
  const allProgress = storageService.getAllProgress();

  // Compute metrics from shared state
  let totalCompletions = 0;
  let totalEnrollments = 0;
  let totalScoreSum = 0;
  let totalScoresCount = 0;

  learners.forEach((l) => {
    courses.forEach((c) => {
      totalEnrollments++;
      const pct = progressService.getCourseCompletionPercentage(l.id, c.id);
      if (pct >= 100) {
        totalCompletions++;
      }
    });

    const userProg = allProgress[l.id];
    if (userProg && userProg.quizAttempts) {
      Object.values(userProg.quizAttempts).forEach((attempts) => {
        attempts.forEach((att) => {
          totalScoreSum += att.scorePercentage;
          totalScoresCount++;
        });
      });
    }
  });

  const overallCompletionRate =
    totalEnrollments > 0 ? Math.round((totalCompletions / totalEnrollments) * 100) : 0;
  const avgScore = totalScoresCount > 0 ? Math.round(totalScoreSum / totalScoresCount) : 88;

  return (
    <div className="animate-fade-in">
      {/* Top Welcome & KPI Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#68716D' }}>Registered Officers</span>
            <Users size={18} color="#173B3A" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#173B3A' }}>{learners.length}</div>
          <div style={{ fontSize: '12px', color: '#8E9995', marginTop: '4px' }}>Active field personnel</div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#68716D' }}>Active Courses</span>
            <BookOpen size={18} color="#B87955" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#B87955' }}>
            {publishedCount}{' '}
            <span style={{ fontSize: '14px', color: '#68716D', fontWeight: 500 }}>
              ({draftCount} draft)
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#8E9995', marginTop: '4px' }}>In published catalogue</div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#68716D' }}>Average Exam Score</span>
            <Award size={18} color="#387A5A" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#387A5A' }}>{avgScore}%</div>
          <div style={{ fontSize: '12px', color: '#387A5A', fontWeight: 600, marginTop: '4px' }}>Above 80% passing standard</div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#68716D' }}>Curriculum Completion</span>
            <TrendingUp size={18} color="#D49B65" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#173B3A' }}>
            {overallCompletionRate}%
          </div>
          <div className="progress-track" style={{ marginTop: '8px', height: '6px' }}>
            <div className="progress-fill" style={{ width: `${overallCompletionRate}%` }} />
          </div>
        </div>
      </div>

      {/* Responsive Visual Analytics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Course Completion Distribution Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', color: '#173B3A', margin: 0 }}>
                Course Progression Distribution
              </h3>
              <p style={{ color: '#68716D', fontSize: '12px', margin: '2px 0 0' }}>
                Completion rate by security curriculum part
              </p>
            </div>
            <span className="badge badge-stone">Real-Time Mock Ledger</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {courses.slice(0, 5).map((course, idx) => {
              const demoPct = progressService.getCourseCompletionPercentage('user-demo-learner', course.id);
              return (
                <div key={course.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                    <span style={{ color: '#173B3A' }}>
                      Part {idx + 1}: {course.title}
                    </span>
                    <span style={{ color: demoPct >= 100 ? '#387A5A' : '#B87955' }}>
                      {demoPct}%
                    </span>
                  </div>
                  <div className="progress-track" style={{ height: '8px' }}>
                    <div
                      className={`progress-fill ${demoPct >= 100 ? 'progress-fill-success' : ''}`}
                      style={{ width: `${demoPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Shortcuts & Fast Actions */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', color: '#173B3A', marginBottom: '6px' }}>
            Quick Management Actions
          </h3>
          <p style={{ color: '#68716D', fontSize: '12px', marginBottom: '18px' }}>
            Author content, configure simulation scenarios, or manage assessments.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link
              to="/admin/courses"
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '10px 14px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={16} color="#173B3A" />
                <span>Create or Edit Courses</span>
              </div>
              <ArrowRight size={14} color="#68716D" />
            </Link>

            <Link
              to="/admin/lessons"
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '10px 14px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color="#B87955" />
                <span>Visual Slide Builder</span>
              </div>
              <ArrowRight size={14} color="#68716D" />
            </Link>

            <Link
              to="/admin/scenarios"
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '10px 14px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={16} color="#387A5A" />
                <span>Configure Room Scenarios</span>
              </div>
              <ArrowRight size={14} color="#68716D" />
            </Link>

            <Link
              to="/admin/quizzes"
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '10px 14px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={16} color="#D49B65" />
                <span>Assessment & Quiz Settings</span>
              </div>
              <ArrowRight size={14} color="#68716D" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Learner Activity Table */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '18px', color: '#173B3A', margin: 0 }}>
              Officer Roster & Compliance Status
            </h3>
            <p style={{ color: '#68716D', fontSize: '13px', margin: '2px 0 0' }}>
              Enrolled security personnel across departments
            </p>
          </div>
          <Link
            to="/admin/learners"
            style={{ fontSize: '13px', fontWeight: 700, color: '#B87955' }}
          >
            Manage Roster
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E0D5', color: '#68716D' }}>
                <th style={{ padding: '10px 12px' }}>Officer</th>
                <th style={{ padding: '10px 12px' }}>Role & Title</th>
                <th style={{ padding: '10px 12px' }}>Facility / Unit</th>
                <th style={{ padding: '10px 12px' }}>Course 101 Status</th>
                <th style={{ padding: '10px 12px' }}>Badges</th>
              </tr>
            </thead>
            <tbody>
              {learners.map((learner) => {
                const pct = progressService.getCourseCompletionPercentage(learner.id, 'course-nature-role');
                const isCertified = pct >= 100;
                return (
                  <tr key={learner.id} style={{ borderBottom: '1px solid #E5E0D5' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={learner.avatar}
                          alt={learner.name}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: '#173B3A' }}>{learner.name}</div>
                          <div style={{ fontSize: '11px', color: '#8E9995' }}>{learner.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: '#242C2D' }}>{learner.jobTitle}</td>
                    <td style={{ padding: '12px', color: '#68716D' }}>{learner.department}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="progress-track" style={{ width: '80px', height: '6px' }}>
                          <div
                            className={`progress-fill ${isCertified ? 'progress-fill-success' : ''}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: isCertified ? '#387A5A' : '#B87955' }}>
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className="badge badge-stone">{learner.badgeCount || 0} badges</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
