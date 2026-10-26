import React, { useState } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Volume2,
  Award,
  AlertTriangle,
} from 'lucide-react';
import { settingsService } from '../../../services/settings.service';
import { storageService } from '../../../services/storage.service';
import { AppSettings } from '../../../types';
import { Modal } from '../../../components/common/Modal';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(() => settingsService.getSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    settingsService.updateSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleConfirmResetAll = () => {
    storageService.resetDemoData();
    setResetModalOpen(false);
    window.location.reload();
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#173B3A', margin: 0 }}>
            Central System Configuration
          </h1>
          <p style={{ color: '#68716D', fontSize: '13px', margin: '4px 0 0' }}>
            Player progression rules, passing criteria thresholds, audio behaviors, and demo persistence.
          </p>
        </div>

        {savedSuccess && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              backgroundColor: '#EAF3EE',
              color: '#387A5A',
              fontWeight: 600,
              fontSize: '13px',
              border: '1px solid #9DC7B0',
            }}
          >
            <CheckCircle2 size={16} />
            <span>Settings saved and applied!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave}>
        {/* Section 1: General Product Identity */}
        <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Sliders size={18} color="#173B3A" />
            <h2 style={{ fontSize: '18px', color: '#173B3A', margin: 0 }}>
              General Platform Identity
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="productNameInput">Product Full Name</label>
              <input
                id="productNameInput"
                type="text"
                value={settings.general.productName}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, productName: e.target.value },
                  })
                }
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="wordmarkInput">Header Wordmark</label>
              <input
                id="wordmarkInput"
                type="text"
                value={settings.general.wordmark}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, wordmark: e.target.value },
                  })
                }
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="announcementInput">Learner-Facing Compliance Announcement Banner</label>
            <input
              id="announcementInput"
              type="text"
              value={settings.learnerAnnouncement || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  learnerAnnouncement: e.target.value,
                })
              }
              placeholder="e.g. Mandatory Compliance Period: Complete SEC-101 before cycle audit..."
              className="form-input"
            />
          </div>
        </div>

        {/* Section 2: Player Progression & Audio Policies */}
        <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Volume2 size={18} color="#B87955" />
            <h2 style={{ fontSize: '18px', color: '#173B3A', margin: 0 }}>
              Course Player & Anti-Skip Policies
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.player.defaultNarration}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    player: { ...settings.player, defaultNarration: e.target.checked },
                  })
                }
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '13.5px', color: '#242C2D' }}>
                Enable Speech Synthesis / Audio Narration by default on slides
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.player.allowReplay}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    player: { ...settings.player, allowReplay: e.target.checked },
                  })
                }
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '13.5px', color: '#242C2D' }}>
                Allow officers to replay completed lessons without wiping certification records
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.player.requireCardsExploration}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    player: { ...settings.player, requireCardsExploration: e.target.checked },
                  })
                }
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '13.5px', color: '#242C2D' }}>
                Require all 4 interactive "Learn More" duty cards to be explored to complete card slides
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.player.requireAllRoomsInspection}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    player: { ...settings.player, requireAllRoomsInspection: e.target.checked },
                  })
                }
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '13.5px', color: '#242C2D' }}>
                Require inspection of all 6 facility zones before completing the building simulation
              </span>
            </label>
          </div>
        </div>

        {/* Section 3: Assessment & Examination Settings */}
        <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Award size={18} color="#387A5A" />
            <h2 style={{ fontSize: '18px', color: '#173B3A', margin: 0 }}>
              Assessment & Qualification Standards
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="defaultPassingScoreInput">Global Default Passing Threshold (%)</label>
              <input
                id="defaultPassingScoreInput"
                type="number"
                min={50}
                max={100}
                value={settings.assessment.defaultPassingScore}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    assessment: { ...settings.assessment, defaultPassingScore: Number(e.target.value) },
                  })
                }
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="defaultMaxAttemptsInput">Default Maximum Attempts</label>
              <input
                id="defaultMaxAttemptsInput"
                type="number"
                min={1}
                max={10}
                value={settings.assessment.defaultMaxAttempts}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    assessment: { ...settings.assessment, defaultMaxAttempts: Number(e.target.value) },
                  })
                }
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="btn btn-danger btn-sm"
          >
            <RotateCcw size={14} />
            <span>Reset All Demo Data & Storage</span>
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
          >
            <Save size={16} />
            <span>Save All Configuration Settings</span>
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Confirm Factory Reset of All Demo Data"
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
              Restore Default Seed State?
            </h4>
            <p style={{ fontSize: '14px', color: '#68716D', lineHeight: 1.5, marginBottom: '20px' }}>
              This will reset all courses, lessons, simulation hotspots, and user progress back to factory defaults.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setResetModalOpen(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResetAll}
                className="btn btn-danger btn-sm"
              >
                Yes, Reset All Demo Data
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
