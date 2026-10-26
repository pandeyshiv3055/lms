import React, { useState } from 'react';
import {
  Film,
  GitBranch,
  Bot,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
  Clock,
  Award,
} from 'lucide-react';
import { seedInteractiveVideo } from '../../../data/seed/interactive-video';
import { seedBranchingScenario } from '../../../data/seed/branching-scenario';
import { seedRolePlayScenario } from '../../../data/seed/role-play';
import {
  InteractiveVideoData,
  VideoCheckpoint,
  BranchingScenarioData,
  ScenarioNode,
  RolePlayScenario,
} from '../../../types';

export const InteractiveModulesEditor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'video' | 'branching' | 'roleplay'>('video');

  // Video State
  const [videoData, setVideoData] = useState<InteractiveVideoData>(seedInteractiveVideo);
  const [selectedCheckpointIndex, setSelectedCheckpointIndex] = useState<number>(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Branching Scenario State
  const [scenarioData, setScenarioData] = useState<BranchingScenarioData>(seedBranchingScenario);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-decision-1');

  // Role Play State
  const [rolePlayData, setRolePlayData] = useState<RolePlayScenario>(seedRolePlayScenario);

  // Helper notice clear
  const triggerSuccess = (msg: string) => {
    setSaveSuccessNotice(msg);
    setValidationError(null);
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  // 1. Checkpoint Validation & Save
  const handleSaveVideoCheckpoint = () => {
    const cp = videoData.checkpoints[selectedCheckpointIndex];
    if (!cp) return;

    if (cp.timestampSeconds < 0 || cp.timestampSeconds > videoData.durationSeconds) {
      setValidationError(`Checkpoint timestamp (${cp.timestampSeconds}s) must be within 0 to ${videoData.durationSeconds}s.`);
      return;
    }

    if (cp.reviewStartSeconds < 0 || cp.reviewStartSeconds >= cp.reviewEndSeconds) {
      setValidationError('Review Start must be less than Review End.');
      return;
    }

    if (!cp.question.prompt.trim()) {
      setValidationError('Question prompt cannot be empty.');
      return;
    }

    if (!cp.question.options.some((o) => o.id === cp.question.correctAnswer)) {
      setValidationError('Correct answer ID must match one of the available options.');
      return;
    }

    setValidationError(null);
    triggerSuccess(`Checkpoint "${cp.title}" validated and configuration saved to local store.`);
  };

  const handleAddCheckpoint = () => {
    const newId = `cp-${Date.now()}`;
    const newCp: VideoCheckpoint = {
      id: newId,
      timestampSeconds: Math.min(videoData.durationSeconds - 2, 15),
      title: 'New Checkpoint',
      reviewStartSeconds: 5,
      reviewEndSeconds: 15,
      required: true,
      maxRetries: 3,
      question: {
        id: `q-${Date.now()}`,
        prompt: 'What security procedure should be executed at this juncture?',
        type: 'multiple-choice',
        options: [
          { id: 'opt-a', text: 'Option A: Notify security dispatch' },
          { id: 'opt-b', text: 'Option B: Ignore and continue patrol' },
        ],
        correctAnswer: 'opt-a',
        explanation: 'Standard operational protocol requires notifying dispatch immediately.',
      },
    };

    setVideoData({
      ...videoData,
      checkpoints: [...videoData.checkpoints, newCp],
    });
    setSelectedCheckpointIndex(videoData.checkpoints.length);
    triggerSuccess('New checkpoint added.');
  };

  const handleDeleteCheckpoint = (index: number) => {
    if (videoData.checkpoints.length <= 1) {
      setValidationError('Interactive video requires at least one checkpoint.');
      return;
    }
    const updated = videoData.checkpoints.filter((_, i) => i !== index);
    setVideoData({ ...videoData, checkpoints: updated });
    setSelectedCheckpointIndex(0);
    triggerSuccess('Checkpoint deleted.');
  };

  // 2. Validate Branching Scenario Graph
  const validateBranchingGraph = () => {
    const nodeIds = new Set(Object.keys(scenarioData.nodes));
    const missingReferences: string[] = [];

    Object.values(scenarioData.nodes).forEach((node) => {
      if (node.choices) {
        node.choices.forEach((choice) => {
          if (!nodeIds.has(choice.nextNodeId)) {
            missingReferences.push(`Choice "${choice.label}" in node "${node.id}" references non-existent node "${choice.nextNodeId}"`);
          }
        });
      }
      if (node.defaultNextNodeId && !nodeIds.has(node.defaultNextNodeId)) {
        missingReferences.push(`Node "${node.id}" references non-existent defaultNextNodeId "${node.defaultNextNodeId}"`);
      }
    });

    if (missingReferences.length > 0) {
      setValidationError(`Graph Validation Failed: ${missingReferences.join('; ')}`);
      return false;
    }

    setValidationError(null);
    triggerSuccess('Branching graph validated: All node references, transitions, and endings are valid.');
    return true;
  };

  const currentCheckpoint = videoData.checkpoints[selectedCheckpointIndex];
  const currentNode = scenarioData.nodes[selectedNodeId];

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="badge badge-copper">Phase 2 Authoring</span>
          <span style={{ fontSize: '12px', color: '#68716D' }}>Interactive Content Studio</span>
        </div>
        <h1 style={{ fontSize: '26px', color: '#173B3A', margin: '0 0 8px 0' }}>
          Interactive Learning Modules Configuration
        </h1>
        <p style={{ color: '#68716D', fontSize: '14px', margin: 0 }}>
          Configure Level 1 Interactive Video checkpoints with mandatory review replays, Level 2 Branching Decision consequence trees, and Level 3 Adaptive AI Role-Play rubrics.
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '2px solid #E5E0D5',
          marginBottom: '24px',
        }}
      >
        <button
          onClick={() => {
            setActiveTab('video');
            setValidationError(null);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeTab === 'video' ? '3px solid #173B3A' : '3px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'video' ? 700 : 500,
            color: activeTab === 'video' ? '#173B3A' : '#68716D',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          <Film size={17} />
          <span>Level 1: Interactive Video Checkpoints</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('branching');
            setValidationError(null);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeTab === 'branching' ? '3px solid #173B3A' : '3px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'branching' ? 700 : 500,
            color: activeTab === 'branching' ? '#173B3A' : '#68716D',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          <GitBranch size={17} />
          <span>Level 2: Branching Scenario Decision Flow</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('roleplay');
            setValidationError(null);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeTab === 'roleplay' ? '3px solid #173B3A' : '3px solid transparent',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'roleplay' ? 700 : 500,
            color: activeTab === 'roleplay' ? '#173B3A' : '#68716D',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          <Bot size={17} />
          <span>Level 3: AI Role-Play & Scoring Rubric</span>
        </button>
      </div>

      {/* Alert Notices */}
      {validationError && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '6px',
            backgroundColor: 'rgba(185, 77, 70, 0.1)',
            border: '1px solid #B94D46',
            color: '#B94D46',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px',
          }}
        >
          <AlertTriangle size={16} />
          <span>{validationError}</span>
        </div>
      )}

      {saveSuccessNotice && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '6px',
            backgroundColor: 'rgba(47, 125, 90, 0.1)',
            border: '1px solid #2F7D5A',
            color: '#2F7D5A',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {/* TAB 1: Level 1 Interactive Video Checkpoints */}
      {activeTab === 'video' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
          {/* Left: Checkpoint List */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#173B3A' }}>Configured Checkpoints</h3>
              <button
                onClick={handleAddCheckpoint}
                className="btn btn-sm btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px' }}
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {videoData.checkpoints.map((cp, idx) => (
                <div
                  key={cp.id}
                  onClick={() => setSelectedCheckpointIndex(idx)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: selectedCheckpointIndex === idx ? '#ECE7DE' : '#FFFFFF',
                    border: `1px solid ${selectedCheckpointIndex === idx ? '#B87955' : '#E5E0D5'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#173B3A' }}>
                      {cp.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#68716D' }}>
                      Trigger: {cp.timestampSeconds}s • Replay: {cp.reviewStartSeconds}s–{cp.reviewEndSeconds}s
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: '#173B3A',
                      color: '#FFFFFF',
                    }}
                  >
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>

            {/* Video Overview Info */}
            <div
              style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid #E5E0D5',
                fontSize: '12px',
                color: '#68716D',
              }}
            >
              <div><strong>Asset:</strong> {videoData.videoUrl}</div>
              <div><strong>Total Duration:</strong> {videoData.durationSeconds}s</div>
              <div><strong>Anti-Skip Lock:</strong> Enforced</div>
            </div>
          </div>

          {/* Right: Checkpoint Editor Form */}
          {currentCheckpoint && (
            <div className="card" style={{ padding: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid #E5E0D5',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', color: '#173B3A' }}>
                    Edit Checkpoint #{selectedCheckpointIndex + 1}: {currentCheckpoint.title}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#68716D' }}>
                    Configure trigger timestamp, question prompt, options, and mandatory review loop.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleDeleteCheckpoint(selectedCheckpointIndex)}
                    className="btn btn-sm btn-ghost"
                    style={{ color: '#B94D46', border: '1px solid #B94D46' }}
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                  <button
                    onClick={handleSaveVideoCheckpoint}
                    className="btn btn-sm btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Save size={14} />
                    <span>Save & Validate</span>
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#173B3A', marginBottom: '4px' }}>
                    Checkpoint Title
                  </label>
                  <input
                    type="text"
                    value={currentCheckpoint.title}
                    onChange={(e) => {
                      const updated = [...videoData.checkpoints];
                      updated[selectedCheckpointIndex].title = e.target.value;
                      setVideoData({ ...videoData, checkpoints: updated });
                    }}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D6CFBF', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#173B3A', marginBottom: '4px' }}>
                    Trigger Timestamp (seconds)
                  </label>
                  <input
                    type="number"
                    value={currentCheckpoint.timestampSeconds}
                    onChange={(e) => {
                      const updated = [...videoData.checkpoints];
                      updated[selectedCheckpointIndex].timestampSeconds = Number(e.target.value);
                      setVideoData({ ...videoData, checkpoints: updated });
                    }}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D6CFBF', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#173B3A', marginBottom: '4px' }}>
                    Mandatory Replay Loop (s)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="number"
                      value={currentCheckpoint.reviewStartSeconds}
                      onChange={(e) => {
                        const updated = [...videoData.checkpoints];
                        updated[selectedCheckpointIndex].reviewStartSeconds = Number(e.target.value);
                        setVideoData({ ...videoData, checkpoints: updated });
                      }}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D6CFBF', fontSize: '13px' }}
                      placeholder="Start"
                    />
                    <span>to</span>
                    <input
                      type="number"
                      value={currentCheckpoint.reviewEndSeconds}
                      onChange={(e) => {
                        const updated = [...videoData.checkpoints];
                        updated[selectedCheckpointIndex].reviewEndSeconds = Number(e.target.value);
                        setVideoData({ ...videoData, checkpoints: updated });
                      }}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D6CFBF', fontSize: '13px' }}
                      placeholder="End"
                    />
                  </div>
                </div>
              </div>

              {/* Question Prompt */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#173B3A', marginBottom: '4px' }}>
                  Question Prompt Text
                </label>
                <textarea
                  rows={2}
                  value={currentCheckpoint.question.prompt}
                  onChange={(e) => {
                    const updated = [...videoData.checkpoints];
                    updated[selectedCheckpointIndex].question.prompt = e.target.value;
                    setVideoData({ ...videoData, checkpoints: updated });
                  }}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D6CFBF', fontSize: '13px' }}
                />
              </div>

              {/* Options & Correct Answer */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#173B3A', marginBottom: '8px' }}>
                  Answer Options (Select Radio for Correct Key)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentCheckpoint.question.options.map((opt, optIdx) => (
                    <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="radio"
                        name="correct-answer"
                        checked={currentCheckpoint.question.correctAnswer === opt.id}
                        onChange={() => {
                          const updated = [...videoData.checkpoints];
                          updated[selectedCheckpointIndex].question.correctAnswer = opt.id;
                          setVideoData({ ...videoData, checkpoints: updated });
                        }}
                      />
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const updated = [...videoData.checkpoints];
                          updated[selectedCheckpointIndex].question.options[optIdx].text = e.target.value;
                          setVideoData({ ...videoData, checkpoints: updated });
                        }}
                        style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #D6CFBF', fontSize: '13px' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#173B3A', marginBottom: '4px' }}>
                  Remediation / Correct Answer Explanation
                </label>
                <textarea
                  rows={2}
                  value={currentCheckpoint.question.explanation}
                  onChange={(e) => {
                    const updated = [...videoData.checkpoints];
                    updated[selectedCheckpointIndex].question.explanation = e.target.value;
                    setVideoData({ ...videoData, checkpoints: updated });
                  }}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D6CFBF', fontSize: '13px' }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Level 2 Branching Scenario Decision Flow */}
      {activeTab === 'branching' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
          {/* Left: Node Tree */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#173B3A' }}>Scenario Nodes</h3>
              <button
                onClick={validateBranchingGraph}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '11px', padding: '4px 8px' }}
              >
                Validate Graph
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.values(scenarioData.nodes).map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: selectedNodeId === node.id ? '#ECE7DE' : '#FFFFFF',
                    border: `1px solid ${selectedNodeId === node.id ? '#B87955' : '#E5E0D5'}`,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: '#173B3A' }}>
                      {node.title}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: node.type === 'decision' ? '#B87955' : '#173B3A',
                        color: '#FFFFFF',
                      }}
                    >
                      {node.type}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#68716D' }}>
                    Node ID: {node.id} {node.choices ? `• ${node.choices.length} choices` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Node Details & Destination Mappings */}
          {currentNode && (
            <div className="card" style={{ padding: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid #E5E0D5',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', color: '#173B3A' }}>
                    Node: {currentNode.title} ({currentNode.id})
                  </h3>
                  <div style={{ fontSize: '12px', color: '#68716D' }}>
                    Type: <strong>{currentNode.type}</strong> • Clip: {currentNode.videoUrl}
                  </div>
                </div>

                <button
                  onClick={validateBranchingGraph}
                  className="btn btn-sm btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Save size={14} />
                  <span>Save & Verify Graph</span>
                </button>
              </div>

              {/* Node Choices & Destination Branch Editor */}
              {currentNode.choices && (
                <div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#173B3A' }}>
                    Decision Options & Destination Nodes
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {currentNode.choices.map((choice, cIdx) => (
                      <div
                        key={choice.id}
                        style={{
                          padding: '14px',
                          borderRadius: '8px',
                          backgroundColor: '#FAF8F3',
                          border: '1px solid #E5E0D5',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 600, fontSize: '13px', color: '#173B3A' }}>
                            Choice {choice.label} (Score: {choice.scoreReward} pts)
                          </span>
                          <span style={{ fontSize: '12px', color: '#B87955', fontWeight: 600 }}>
                            → Leads to: {choice.nextNodeId}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#242C2D' }}>
                          "{choice.text}"
                        </p>
                        <div style={{ fontSize: '12px', color: '#68716D', fontStyle: 'italic' }}>
                          Feedback: {choice.feedback}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ending Node Information */}
              {currentNode.type === 'ending' && (
                <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#FAF8F3', border: '1px solid #E5E0D5' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#173B3A' }}>Terminal Ending Node</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#68716D' }}>
                    This branch concludes the scenario and computes final scoring from learner decisions.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Level 3 AI Role-Play & Scoring Rubric */}
      {activeTab === 'roleplay' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Character Configuration */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#173B3A' }}>
              Simulated Character Profile
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#173B3A', marginBottom: '4px' }}>
                  Character Name
                </label>
                <input
                  type="text"
                  value={rolePlayData.character.name}
                  onChange={(e) =>
                    setRolePlayData({
                      ...rolePlayData,
                      character: { ...rolePlayData.character, name: e.target.value },
                    })
                  }
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D6CFBF', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#173B3A', marginBottom: '4px' }}>
                  Persona & Role
                </label>
                <input
                  type="text"
                  value={rolePlayData.character.role}
                  onChange={(e) =>
                    setRolePlayData({
                      ...rolePlayData,
                      character: { ...rolePlayData.character, role: e.target.value },
                    })
                  }
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D6CFBF', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#173B3A', marginBottom: '4px' }}>
                  Initial Greeting / Prompt
                </label>
                <textarea
                  rows={3}
                  value={rolePlayData.character.initialGreeting}
                  onChange={(e) =>
                    setRolePlayData({
                      ...rolePlayData,
                      character: { ...rolePlayData.character, initialGreeting: e.target.value },
                    })
                  }
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D6CFBF', fontSize: '13px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#173B3A', marginBottom: '4px' }}>
                  Passing Threshold (%)
                </label>
                <input
                  type="number"
                  value={rolePlayData.defaultPassingScore}
                  onChange={(e) =>
                    setRolePlayData({ ...rolePlayData, defaultPassingScore: Number(e.target.value) })
                  }
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D6CFBF', fontSize: '13px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#173B3A', marginBottom: '4px' }}>
                  Max Turns
                </label>
                <input
                  type="number"
                  value={rolePlayData.maxTurns}
                  onChange={(e) =>
                    setRolePlayData({ ...rolePlayData, maxTurns: Number(e.target.value) })
                  }
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D6CFBF', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>

          {/* Scoring Rubric Dimensions */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#173B3A' }}>
              Competency Rubric Dimensions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {rolePlayData.rubricDimensions.map((dim, dIdx) => (
                <div
                  key={dim.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '6px',
                    backgroundColor: '#FAF8F3',
                    border: '1px solid #E5E0D5',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: '#173B3A' }}>
                      {dim.label}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '12px', color: '#B87955' }}>
                      Weight: {dim.weight}%
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#68716D' }}>
                    {dim.description}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                onClick={() => triggerSuccess('Role-Play evaluation rubrics updated.')}
                className="btn btn-sm btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Save size={14} />
                <span>Save Rubrics</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
