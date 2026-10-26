import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { settingsService } from '../../services/settings.service';
import { ShieldCheck, Info } from 'lucide-react';

export const LearnerShell: React.FC = () => {
  const settings = settingsService.getSettings();
  const announcement = settings.learnerAnnouncement;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F5F2EA' }}>
      <Navbar />

      {/* Compliance Announcement Banner */}
      {announcement && (
        <div
          style={{
            backgroundColor: '#1E2829',
            borderBottom: '1px solid #38484A',
            color: '#DDE5D7',
            padding: '8px 16px',
            fontSize: '12px',
          }}
        >
          <div
            className="container"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={15} color="#D49B65" />
              <span>{announcement}</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#387A5A',
                fontWeight: 600,
                fontSize: '11px',
              }}
            >
              <ShieldCheck size={14} />
              <span>Compliant & Verified</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Stage */}
      <main style={{ flex: 1, padding: '32px 0 64px' }}>
        <Outlet />
      </main>

      {/* Grounded Corporate Footer */}
      <footer
        style={{
          backgroundColor: '#173B3A',
          borderTop: '1px solid #215150',
          padding: '24px 0',
          color: '#A3AFAC',
          fontSize: '13px',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, color: '#FAF8F3' }}>AEGIS Defense & Security</span>
            <span>• Professional E-Learning Management System</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
            <span>Demo Mode — Local Storage State</span>
            <span>OSHA & NFPA Compliant Curriculum</span>
            <span style={{ color: '#D49B65' }}>2026 Certification Cycle</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
