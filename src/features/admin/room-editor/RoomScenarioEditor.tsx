import React, { useState } from 'react';
import {
  Building,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Edit,
} from 'lucide-react';
import { scenarioService } from '../../../services/scenario.service';
import { BuildingScenario, Room, Irregularity } from '../../../types';
import { BuildingFacade } from '../../../assets/illustrations/building-facade';
import { RoomScene } from '../../../assets/illustrations/room-scenes';
import { Modal } from '../../../components/common/Modal';

export const RoomScenarioEditor: React.FC = () => {
  const scenarios = scenarioService.getScenarios();
  const [scenario, setScenario] = useState<BuildingScenario>(scenarios[0]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(scenario.rooms[0]?.id || '');

  const currentRoom = scenario.rooms.find((r) => r.id === selectedRoomId) || scenario.rooms[0];
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Edit room form fields
  const [roomName, setRoomName] = useState(currentRoom?.name || '');
  const [roomCode, setRoomCode] = useState(currentRoom?.code || '');
  const [promptQuestion, setPromptQuestion] = useState(currentRoom?.promptQuestion || '');
  const [explanation, setExplanation] = useState(currentRoom?.explanation || '');
  const [hasIrregularity, setHasIrregularity] = useState(currentRoom?.hasIrregularities || false);

  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);

  React.useEffect(() => {
    if (currentRoom) {
      setRoomName(currentRoom.name);
      setRoomCode(currentRoom.code);
      setPromptQuestion(currentRoom.promptQuestion);
      setExplanation(currentRoom.explanation);
      setHasIrregularity(currentRoom.hasIrregularities);
    }
  }, [selectedRoomId]);

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRoom) return;

    const updatedRoom: Room = {
      ...currentRoom,
      name: roomName,
      code: roomCode,
      promptQuestion,
      explanation,
      hasIrregularities: hasIrregularity,
      correctAnswerHasIrregularity: hasIrregularity,
    };

    const updatedScenario = scenarioService.updateRoom(scenario.id, updatedRoom);
    if (updatedScenario) {
      setScenario(updatedScenario);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#173B3A', margin: 0 }}>
            Building & Room Inspection Scenario Editor
          </h1>
          <p style={{ color: '#68716D', fontSize: '13px', margin: '4px 0 0' }}>
            Configure interactive room hotspots, irregularity answers, and feedback rules for Facility 04.
          </p>
        </div>

        <button
          onClick={() => setPreviewOpen(true)}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Eye size={15} />
          <span>Preview Facility Exterior</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1.2fr 1.2fr', gap: '20px', alignItems: 'start' }}>
        {/* Column 1: Rooms List */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: '#173B3A', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Configured Zones ({scenario.rooms.length})</span>
            <Building size={14} color="#68716D" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {scenario.rooms.map((room) => {
              const isSelected = room.id === selectedRoomId;
              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: isSelected ? '#173B3A' : '#FAF8F3',
                    color: isSelected ? '#FAF8F3' : '#242C2D',
                    border: isSelected ? '1px solid #173B3A' : '1px solid #E5E0D5',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: isSelected ? 700 : 500,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', color: isSelected ? '#D49B65' : '#B87955', fontWeight: 700 }}>
                      {room.code}
                    </span>
                    <span style={{ fontSize: '10px', color: isSelected ? '#DDE5D7' : '#8E9995' }}>
                      {room.irregularities.length} issues
                    </span>
                  </div>
                  <div>{room.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 2: Room Form Editor */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', color: '#173B3A', margin: 0 }}>
              Edit Zone: {currentRoom.name}
            </h3>
            {savedSuccess && (
              <span style={{ color: '#387A5A', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} />
                <span>Saved!</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveRoom}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="roomNameInput">Room / Zone Name</label>
                <input
                  id="roomNameInput"
                  type="text"
                  required
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="roomCodeInput">Zone Code</label>
                <input
                  id="roomCodeInput"
                  type="text"
                  required
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="promptQuestionInput">Learner Inspection Prompt</label>
              <input
                id="promptQuestionInput"
                type="text"
                required
                value={promptQuestion}
                onChange={(e) => setPromptQuestion(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="hasIrregularityCheck">Zone Status</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
                <input
                  id="hasIrregularityCheck"
                  type="checkbox"
                  checked={hasIrregularity}
                  onChange={(e) => setHasIrregularity(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="hasIrregularityCheck" style={{ fontSize: '13.5px', color: '#173B3A', fontWeight: 600, cursor: 'pointer' }}>
                  Zone contains reportable security/safety irregularities
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="explanationInput">Correct Feedback Explanation</label>
              <textarea
                id="explanationInput"
                rows={3}
                required
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="form-textarea"
              />
            </div>

            {/* Configured Irregularities in Room */}
            <div style={{ marginTop: '16px', marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '12px', color: '#173B3A', marginBottom: '8px', textTransform: 'uppercase' }}>
                Hotspot Irregularities ({currentRoom.irregularities.length}):
              </div>
              {currentRoom.irregularities.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#8E9995', fontStyle: 'italic' }}>
                  No irregularities. Compliant control zone.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentRoom.irregularities.map((irreg) => (
                    <div
                      key={irreg.id}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: '#FAF8F3',
                        border: '1px solid #E5E0D5',
                        borderRadius: '6px',
                        fontSize: '12px',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#B44D45' }}>{irreg.name}</div>
                      <div style={{ color: '#68716D', marginTop: '2px' }}>{irreg.description}</div>
                      <div style={{ fontSize: '11px', color: '#8E9995', marginTop: '4px' }}>
                        Coords: ({irreg.hotspot.x}%, {irreg.hotspot.y}%) • Severity: {irreg.severity}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Save size={15} />
              <span>Save Zone Configuration</span>
            </button>
          </form>
        </div>

        {/* Column 3: Live Visual Room Scene Preview */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: '#173B3A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Eye size={15} color="#B87955" />
            <span>Room Scene Live Preview</span>
          </div>

          <div
            style={{
              backgroundColor: '#1C2426',
              border: '2px solid #3A4A4C',
              borderRadius: '8px',
              height: '320px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            <RoomScene roomId={currentRoom.id} />
          </div>

          <div style={{ marginTop: '12px', fontSize: '11px', color: '#68716D', lineHeight: 1.5 }}>
            <strong>Inspection Hint:</strong> In learner mode, clicking the hotspots triggers official report verification and logs points towards the Safety Observer qualification.
          </div>
        </div>
      </div>

      {/* Building Exterior Preview Modal */}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Facility 04 Building Facade Overview"
        maxWidth="880px"
      >
        <div style={{ height: '460px', backgroundColor: '#1E2729', borderRadius: '8px', overflow: 'hidden' }}>
          <BuildingFacade />
        </div>
      </Modal>
    </div>
  );
};
