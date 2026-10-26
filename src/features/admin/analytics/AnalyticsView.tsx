import React from 'react';
import { BarChart3, TrendingUp, Award, Users, CheckCircle2, AlertTriangle } from 'lucide-react';
import { courseService } from '../../../services/course.service';
import { storageService } from '../../../services/storage.service';
import { progressService } from '../../../services/progress.service';

export const AnalyticsView: React.FC = () => {
  const courses = courseService.getCourses();
  const learners = storageService.getUsers().filter((u) => u.role === 'learner');
  const allProgress = storageService.getAllProgress();

  // Compute metrics
  let totalCompletions = 0;
  let totalEnrollments = learners.length * courses.length;

  learners.forEach((l) => {
    courses.forEach((c) => {
      const pct = progressService.getCourseCompletionPercentage(l.id, c.id);
      if (pct >= 100) totalCompletions++;
    });
  });

  const completionPct = totalEnrollments > 0 ? Math.round((totalCompletions / totalEnrollments) * 100) : 0;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', color: '#173B3A', margin: 0 }}>
          Compliance & Readiness Analytics
        </h1>
        <p style={{ color: '#68716D', fontSize: '13px', margin: '4px 0 0' }}>
          Aggregate completion ratios, assessment pass rates, and room inspection telemetry.
        </p>
      </div>

      {/* KPI Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#68716D', marginBottom: '4px' }}>
            Curriculum Completion Rate
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#173B3A' }}>{completionPct}%</div>
          <div className="progress-track" style={{ marginTop: '8px', height: '6px' }}>
            <div className="progress-fill" style={{ width: `${completionPct}%` }} />
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#68716D', marginBottom: '4px' }}>
            Average Examination Score
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#387A5A' }}>88.5%</div>
          <div style={{ fontSize: '12px', color: '#387A5A', fontWeight: 600, marginTop: '4px' }}>
            8.5% above standard threshold
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#68716D', marginBottom: '4px' }}>
            Inspection Detection Accuracy
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#B87955' }}>96.0%</div>
          <div style={{ fontSize: '12px', color: '#8E9995', marginTop: '4px' }}>
            Facility 04 simulated patrol
          </div>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* Course Completion Telemetry */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', color: '#173B3A', marginBottom: '4px' }}>
            Module Performance Ratios
          </h3>
          <p style={{ color: '#68716D', fontSize: '12px', marginBottom: '20px' }}>
            Distribution of certified officers across required units
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {courses.map((course) => {
              const completedCount = learners.filter(
                (l) => progressService.getCourseCompletionPercentage(l.id, course.id) >= 100
              ).length;
              const ratio = learners.length > 0 ? Math.round((completedCount / learners.length) * 100) : 0;

              return (
                <div key={course.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    <span style={{ color: '#173B3A' }}>{course.title}</span>
                    <span style={{ color: '#68716D' }}>{completedCount} / {learners.length} Certified ({ratio}%)</span>
                  </div>
                  <div className="progress-track" style={{ height: '8px' }}>
                    <div
                      className={`progress-fill ${ratio >= 100 ? 'progress-fill-success' : ''}`}
                      style={{ width: `${ratio}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hazard Telemetry Breakdown */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', color: '#173B3A', marginBottom: '4px' }}>
            Reported Irregularity Metrics
          </h3>
          <p style={{ color: '#68716D', fontSize: '12px', marginBottom: '20px' }}>
            Facility 04 environmental and security discrepancies
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', backgroundColor: '#FAF8F3', borderRadius: '8px', border: '1px solid #E5E0D5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#173B3A' }}>Unattended Baggage in Lobby</div>
                <div style={{ fontSize: '11px', color: '#68716D' }}>Zone 102 Main Reception</div>
              </div>
              <span className="badge badge-success">100% Detection</span>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#FAF8F3', borderRadius: '8px', border: '1px solid #E5E0D5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#173B3A' }}>Unsecured Server Rack 02</div>
                <div style={{ fontSize: '11px', color: '#68716D' }}>Zone 201 Data Vault</div>
              </div>
              <span className="badge badge-success">100% Detection</span>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#FAF8F3', borderRadius: '8px', border: '1px solid #E5E0D5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#173B3A' }}>Unattended VIP Laptop & Lanyard</div>
                <div style={{ fontSize: '11px', color: '#68716D' }}>Zone 202 Boardroom A</div>
              </div>
              <span className="badge badge-success">95% Detection</span>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#FAF8F3', borderRadius: '8px', border: '1px solid #E5E0D5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#173B3A' }}>Obstructed Fire Exit Doorway</div>
                <div style={{ fontSize: '11px', color: '#68716D' }}>Zone 103 Fire Corridor</div>
              </div>
              <span className="badge badge-success">98% Detection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
