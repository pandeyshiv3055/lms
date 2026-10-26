import React, { useState } from 'react';
import {
  Users,
  Search,
  RotateCcw,
  CheckCircle2,
  Award,
  BookOpen,
} from 'lucide-react';
import { storageService } from '../../../services/storage.service';
import { progressService } from '../../../services/progress.service';
import { courseService } from '../../../services/course.service';
import { User } from '../../../types';
import { Modal } from '../../../components/common/Modal';

export const LearnerList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [learners, setLearners] = useState<User[]>(() =>
    storageService.getUsers().filter((u) => u.role === 'learner')
  );
  const courses = courseService.getCourses();

  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [selectedLearner, setSelectedLearner] = useState<User | null>(null);

  const refreshLearners = () => {
    setLearners(storageService.getUsers().filter((u) => u.role === 'learner'));
  };

  const handleConfirmReset = () => {
    if (resetUserId) {
      const all = storageService.getAllProgress();
      delete all[resetUserId];
      storageService.saveAllProgress(all);
      setResetUserId(null);
      refreshLearners();
    }
  };

  const filtered = learners.filter(
    (l) =>
      !search.trim() ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#173B3A', margin: 0 }}>
            Security Personnel Roster & Performance
          </h1>
          <p style={{ color: '#68716D', fontSize: '13px', margin: '4px 0 0' }}>
            Inspect officer credentials, unit progress percentages, and reset individual demo attempts.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ position: 'relative', width: '320px' }}>
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
            placeholder="Search officers by name, email, or unit..."
            className="form-input"
            style={{ paddingLeft: '36px' }}
          />
        </div>

        <span style={{ fontSize: '13px', color: '#68716D', fontWeight: 600 }}>
          {filtered.length} Officers Registered
        </span>
      </div>

      {/* Roster Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAF8F3', borderBottom: '2px solid #E5E0D5', color: '#68716D' }}>
                <th style={{ padding: '12px 16px' }}>Officer</th>
                <th style={{ padding: '12px 16px' }}>Title & Department</th>
                <th style={{ padding: '12px 16px' }}>Course 101 Progress</th>
                <th style={{ padding: '12px 16px' }}>Badges</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((learner) => {
                const pct = progressService.getCourseCompletionPercentage(learner.id, 'course-nature-role');
                const isDone = pct >= 100;

                return (
                  <tr key={learner.id} style={{ borderBottom: '1px solid #E5E0D5' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={learner.avatar}
                          alt={learner.name}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: '#173B3A' }}>{learner.name}</div>
                          <div style={{ fontSize: '11px', color: '#8E9995' }}>{learner.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#242C2D' }}>{learner.jobTitle}</div>
                      <div style={{ fontSize: '11px', color: '#68716D' }}>{learner.department}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="progress-track" style={{ width: '90px', height: '6px' }}>
                          <div
                            className={`progress-fill ${isDone ? 'progress-fill-success' : ''}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: isDone ? '#387A5A' : '#B87955' }}>
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className="badge badge-stone">{learner.badgeCount || 0} awards</span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => setSelectedLearner(learner)}
                          className="btn btn-secondary btn-sm"
                        >
                          Details
                        </button>

                        <button
                          onClick={() => setResetUserId(learner.id)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#B44D45' }}
                          title="Reset Progress"
                        >
                          <RotateCcw size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Learner Detail Modal */}
      {selectedLearner && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedLearner(null)}
          title={`Officer Dossier: ${selectedLearner.name}`}
          maxWidth="680px"
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <img
                src={selectedLearner.avatar}
                alt={selectedLearner.name}
                style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <h3 style={{ fontSize: '18px', color: '#173B3A', margin: 0 }}>{selectedLearner.name}</h3>
                <div style={{ fontSize: '13px', color: '#68716D' }}>{selectedLearner.jobTitle} • {selectedLearner.department}</div>
                <div style={{ fontSize: '11px', color: '#8E9995' }}>{selectedLearner.email}</div>
              </div>
            </div>

            <div style={{ fontWeight: 700, fontSize: '13px', color: '#173B3A', marginBottom: '8px' }}>
              Curriculum Progression Record:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {courses.map((c) => {
                const pct = progressService.getCourseCompletionPercentage(selectedLearner.id, c.id);
                return (
                  <div
                    key={c.id}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: '#FAF8F3',
                      border: '1px solid #E5E0D5',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#173B3A' }}>{c.code}: {c.title}</span>
                    <span style={{ fontWeight: 700, color: pct >= 100 ? '#387A5A' : '#B87955' }}>
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedLearner(null)}
                className="btn btn-secondary btn-sm"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={Boolean(resetUserId)}
        onClose={() => setResetUserId(null)}
        title="Confirm Officer Progress Reset"
      >
        <p style={{ fontSize: '14px', color: '#68716D', lineHeight: 1.5, marginBottom: '20px' }}>
          Are you sure you want to reset demo training progress for this officer? All completed units, room inspection reports, and exam records for this user will be cleared.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={() => setResetUserId(null)}
            className="btn btn-secondary btn-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmReset}
            className="btn btn-danger btn-sm"
          >
            Yes, Reset Officer
          </button>
        </div>
      </Modal>
    </div>
  );
};
