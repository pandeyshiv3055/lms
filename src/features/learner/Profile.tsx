import React, { useState } from 'react';
import { User, Mail, Shield, Building, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { storageService } from '../../services/storage.service';
import { Modal } from '../../components/common/Modal';

export const Profile: React.FC = () => {
  const user = authService.getCurrentUser();
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  const handleConfirmReset = () => {
    storageService.resetDemoData();
    setResetModalOpen(false);
    setResetComplete(true);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <h1 className="page-title">Officer Credentials & Profile</h1>
        <p className="page-subtitle">
          Identity records, department assignment, security credentials, and demo persistence controls.
        </p>
      </div>

      {resetComplete && (
        <div
          style={{
            backgroundColor: '#EAF3EE',
            border: '1px solid #9DC7B0',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#387A5A',
            fontSize: '14px',
          }}
        >
          <CheckCircle2 size={18} />
          <span>Demo data successfully reset to initial factory state. Reloading...</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="card" style={{ marginBottom: '28px', padding: '32px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px', marginBottom: '28px' }}>
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'}
            alt={user?.name || 'Officer'}
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #173B3A',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h2 style={{ fontSize: '24px', color: '#173B3A', margin: 0 }}>
                {user?.name || 'Officer Alex Taylor'}
              </h2>
              <span className="badge badge-copper">
                {user?.role === 'admin' ? 'ADMINISTRATOR' : 'LICENSED OFFICER'}
              </span>
            </div>
            <div style={{ color: '#68716D', fontSize: '14px' }}>
              {user?.jobTitle} • {user?.department}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8E9995', fontSize: '13px', marginTop: '4px' }}>
              <Mail size={14} />
              <span>{user?.email}</span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            padding: '20px',
            backgroundColor: '#FAF8F3',
            borderRadius: '10px',
            border: '1px solid #E5E0D5',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#68716D' }}>Badge / Credential ID</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#173B3A', marginTop: '2px' }}>
              AEGIS-SEC-0941
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#68716D' }}>Licensing Clearance</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#387A5A', marginTop: '2px' }}>
              Level 2 Armed / Unarmed Commercial
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#68716D' }}>Assigned Facility</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#173B3A', marginTop: '2px' }}>
              Facility 04 — Sector B Logistics
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#68716D' }}>Compliance Status</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#B87955', marginTop: '2px' }}>
              Active Cycle (In Progress)
            </div>
          </div>
        </div>
      </div>

      {/* Developer / Evaluator Controls: Reset Demo Data */}
      <div
        className="card"
        style={{
          padding: '24px',
          border: '1px solid #E8ABA7',
          backgroundColor: '#FFFDFD',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', color: '#B44D45', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RotateCcw size={16} />
              <span>Reset Demo State & Progress</span>
            </h3>
            <p style={{ color: '#68716D', fontSize: '13px', margin: 0, maxWidth: '520px' }}>
              Restore all mock courses, slide progression, building inspection reports, and badge achievements back to the default factory state.
            </p>
          </div>

          <button
            onClick={() => setResetModalOpen(true)}
            className="btn btn-danger btn-sm"
          >
            Reset Demo Data
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Confirm Factory Reset"
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#FAEEEC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={20} color="#B44D45" />
          </div>
          <div>
            <h4 style={{ fontSize: '16px', color: '#173B3A', marginBottom: '6px' }}>
              Are you sure you want to reset all demo data?
            </h4>
            <p style={{ fontSize: '14px', color: '#68716D', lineHeight: 1.5, marginBottom: '20px' }}>
              This will clear your local storage progress, completed lessons, room inspection reports, and quiz scores. Initial seed data will be cleanly re-initialized.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setResetModalOpen(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="btn btn-danger btn-sm"
              >
                Yes, Reset All Data
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
