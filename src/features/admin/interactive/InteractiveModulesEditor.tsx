import React, { useState, useEffect } from 'react';
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
  BookOpen,
} from 'lucide-react';
import { courseService } from '../../../services/course.service';
import { interactiveService } from '../../../services/interactive.service';
import {
  Course,
  Lesson,
  InteractiveVideoData,
  VideoCheckpoint,
  BranchingScenarioData,
  ScenarioNode,
  RolePlayScenario,
  InteractiveConfigStatus,
} from '../../../types';

export const InteractiveModulesEditor: React.FC = () => {
  // Course and Lesson Selection State
  const [courses, setCourses] = useState<Course[]>(() => courseService.getCourses());
  const [selectedCourseId, setSelectedCourseId] = useState<string>(() => {
    const list = courseService.getCourses();
    const sec101 = list.find((c) => c.code === 'SEC-101' || c.id === 'course-nature-role');
    return sec101 ? sec101.id : list[0]?.id || '';
  });

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const availableLessons: Lesson[] = [];
  selectedCourse?.modules?.forEach((m) => m.lessons?.forEach((l) => availableLessons.push(l)));

  const [selectedLessonId, setSelectedLessonId] = useState<string>(() => {
    // Default to pilot lesson if available in default course, else first lesson
    const pilot = availableLessons.find((l) => l.id === 'lesson-incident-deescalation');
    return pilot ? pilot.id : availableLessons[0]?.id || '';
  });

  const selectedLesson = availableLessons.find((l) => l.id === selectedLessonId) || availableLessons[0];

  const [activeTab, setActiveTab] = useState<'video' | 'branching' | 'roleplay'>('video');

  // Video State (Level 1)
  const [videoData, setVideoData] = useState<InteractiveVideoData | null>(null);
  const [selectedCheckpointIndex, setSelectedCheckpointIndex] = useState<number>(0);

  // Branching Scenario State (Level 2)
  const [scenarioData, setScenarioData] = useState<BranchingScenarioData | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-opening');

  // Role Play State (Level 3)
  const [rolePlayData, setRolePlayData] = useState<RolePlayScenario | null>(null);

  // Status & Notifications
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Load lesson configuration whenever selected course or lesson changes
  useEffect(() => {
    if (!selectedCourse || !selectedLesson) {
      setVideoData(null);
      setScenarioData(null);
      setRolePlayData(null);
      setValidationError(null);
      return;
    }

    const config = interactiveService.getConfig(selectedCourse.id, selectedLesson.id);

    setVideoData(config?.level1 ? JSON.parse(JSON.stringify(config.level1)) : null);
    setSelectedCheckpointIndex(0);

    if (config?.level2) {
      setScenarioData(JSON.parse(JSON.stringify(config.level2)));
      const initialId = config.level2.initialNodeId || Object.keys(config.level2.nodes || {})[0] || 'node-opening';
      setSelectedNodeId(initialId);
    } else {
      setScenarioData(null);
      setSelectedNodeId('node-opening');
    }

    setRolePlayData(config?.level3 ? JSON.parse(JSON.stringify(config.level3)) : null);
    setValidationError(null);
  }, [selectedCourseId, selectedLessonId]);

  // Handle Course Change
  const handleCourseChange = (newCourseId: string) => {
    setSelectedCourseId(newCourseId);
    const targetCourse = courses.find((c) => c.id === newCourseId);
    const targetLessons: Lesson[] = [];
    targetCourse?.modules?.forEach((m) => m.lessons?.forEach((l) => targetLessons.push(l)));

    if (targetLessons.length > 0) {
      setSelectedLessonId(targetLessons[0].id);
    } else {
      setSelectedLessonId('');
    }
  };

  // Helper notice clear
  const triggerSuccess = (msg: string) => {
    setSaveSuccessNotice(msg);
    setValidationError(null);
    setTimeout(() => setSaveSuccessNotice(null), 4000);
  };

  // Get status for current lesson
  const currentConfig = selectedCourse && selectedLesson
    ? interactiveService.getConfig(selectedCourse.id, selectedLesson.id)
    : null;

  const getStatusBadge = (status?: InteractiveConfigStatus) => {
    switch (status) {
      case 'validated':
        return (
          <span
            style={{
              padding: '3px 8px',
              borderRadius: '4px',
              backgroundColor: '#EAF3EE',
              color: '#387A5A',
              fontWeight: 700,
              fontSize: '11px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <CheckCircle2 size={12} />
            <span>Validated</span>
          </span>
        );
      case 'saved':
      case 'draft':
        return (
          <span
            style={{
              padding: '3px 8px',
              borderRadius: '4px',
              backgroundColor: '#FFF8E7',
              color: '#B87955',
              fontWeight: 700,
              fontSize: '11px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Clock size={12} />
            <span>{status === 'draft' ? 'Draft' : 'Saved'}</span>
          </span>
        );
      default:
        return (
          <span
            style={{
              padding: '3px 8px',
              borderRadius: '4px',
              backgroundColor: '#F5F7F6',
              color: '#8E9995',
              fontWeight: 600,
              fontSize: '11px',
            }}
          >
            Not Configured
          </span>
        );
    }
  };

  // 1. Level 1: Save & Validate Video Checkpoint
  const handleSaveVideoCheckpoint = () => {
    if (!selectedCourse || !selectedLesson || !videoData) return;

    const res = interactiveService.saveLevel1(selectedCourse.id, selectedLesson.id, videoData);
    if (!res.success) {
      setValidationError(res.error || 'Validation failed for Level 1 video checkpoints.');
      return;
    }

    setValidationError(null);
    triggerSuccess(`Level 1 Checkpoints validated and saved for "${selectedLesson.title}".`);
  };

  const handleAddCheckpoint = () => {
    if (!videoData) return;
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
    if (!videoData) return;
    if (videoData.checkpoints.length <= 1) {
      setValidationError('Interactive video requires at least one checkpoint.');
      return;
    }
    const updated = videoData.checkpoints.filter((_, i) => i !== index);
    setVideoData({ ...videoData, checkpoints: updated });
    setSelectedCheckpointIndex(0);
    triggerSuccess('Checkpoint deleted.');
  };

  const handleInitializeLevel1 = () => {
    if (!selectedCourse || !selectedLesson) return;
    const defaultData = interactiveService.createDefaultLevel1(
      `Level 1: Interactive Video Checkpoints — ${selectedLesson.title}`
    );
    setVideoData(defaultData);
    setSelectedCheckpointIndex(0);
    triggerSuccess('Level 1 template initialized for this lesson. Click "Save & Validate" to persist.');
  };

  // 2. Level 2: Validate & Save Branching Scenario Graph
  const handleSaveBranchingGraph = () => {
    if (!selectedCourse || !selectedLesson || !scenarioData) return;

    const res = interactiveService.saveLevel2(selectedCourse.id, selectedLesson.id, scenarioData);
    if (!res.success) {
      setValidationError(res.error || 'Validation failed for Level 2 branching scenario.');
      return;
    }

    setValidationError(null);
    triggerSuccess(`Level 2 Branching Graph validated and saved for "${selectedLesson.title}".`);
  };

  const handleInitializeLevel2 = () => {
    if (!selectedCourse || !selectedLesson) return;
    const defaultData = interactiveService.createDefaultLevel2(
      `Level 2: Branching Scenario — ${selectedLesson.title}`
    );
    setScenarioData(defaultData);
    setSelectedNodeId('node-opening');
    triggerSuccess('Level 2 template initialized for this lesson. Click "Save & Verify Graph" to persist.');
  };

  // 3. Level 3: Save AI Role-Play & Scoring Rubric
  const handleSaveRolePlayRubrics = () => {
    if (!selectedCourse || !selectedLesson || !rolePlayData) return;

    const res = interactiveService.saveLevel3(selectedCourse.id, selectedLesson.id, rolePlayData);
    if (!res.success) {
      setValidationError(res.error || 'Validation failed for Level 3 role-play.');
      return;
    }

    setValidationError(null);
    triggerSuccess(`Level 3 Character & Rubrics validated and saved for "${selectedLesson.title}".`);
  };

  const handleInitializeLevel3 = () => {
    if (!selectedCourse || !selectedLesson) return;
    const defaultData = interactiveService.createDefaultLevel3(
      `Level 3: AI Role-Play — ${selectedLesson.title}`
    );
    setRolePlayData(defaultData);
    triggerSuccess('Level 3 template initialized for this lesson. Click "Save Rubrics" to persist.');
  };

  const currentCheckpoint = videoData?.checkpoints?.[selectedCheckpointIndex];
  const currentNode = scenarioData?.nodes?.[selectedNodeId];

  // Active level status calculation
  const getActiveLevelStatus = (): InteractiveConfigStatus => {
    if (activeTab === 'video') return currentConfig?.level1Status || (videoData ? 'draft' : 'not-configured');
    if (activeTab === 'branching') return currentConfig?.level2Status || (scenarioData ? 'draft' : 'not-configured');
    return currentConfig?.level3Status || (rolePlayData ? 'draft' : 'not-configured');
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="badge badge-copper">Phase 2 Authoring</span>
          <span style={{ fontSize: '12px', color: '#68716D' }}>Interactive Content Studio</span>
        </div>
        <h1 style={{ fontSize: '26px', color: '#173B3A', margin: '0 0 6px 0' }}>
          Interactive Learning Modules Configuration
        </h1>
        <p style={{ color: '#68716D', fontSize: '14px', margin: 0 }}>
          Configure Level 1 Interactive Video checkpoints with mandatory review replays, Level 2 Branching Decision consequence trees, and Level 3 Adaptive AI Role-Play rubrics scoped to specific courses and lessons.
        </p>
      </div>

      {/* Top Card: Shared Course & Lesson Selection System */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <label
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#68716D',
                display: 'block',
                marginBottom: '4px',
              }}
            >
              Select Course:
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="form-select"
              id="select-course-dropdown"
              style={{ minWidth: '260px' }}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}: {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#68716D',
                display: 'block',
                marginBottom: '4px',
              }}
            >
              Select Lesson Unit:
            </label>
            <select
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              className="form-select"
              id="select-lesson-unit-dropdown"
              style={{ minWidth: '280px' }}
              disabled={availableLessons.length === 0}
            >
              {availableLessons.length === 0 ? (
                <option value="">No lesson units available for this course</option>
              ) : (
                availableLessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Configuration Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#68716D', marginBottom: '4px' }}>
              Current Level Status:
            </div>
            <div>{getStatusBadge(getActiveLevelStatus())}</div>
          </div>

          <div
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: '#F5F7F6',
              border: '1px solid #E5E0D5',
              display: 'flex',
              gap: '10px',
              fontSize: '11px',
              color: '#173B3A',
            }}
          >
            <span style={{ fontWeight: 600 }}>
              L1: {currentConfig?.level1 || videoData ? '✓' : '—'}
            </span>
            <span style={{ fontWeight: 600 }}>
              L2: {currentConfig?.level2 || scenarioData ? '✓' : '—'}
            </span>
            <span style={{ fontWeight: 600 }}>
              L3: {currentConfig?.level3 || rolePlayData ? '✓' : '—'}
            </span>
          </div>
        </div>
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
          id="tab-level-1"
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
          {videoData && (
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#387A5A',
              }}
            />
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('branching');
            setValidationError(null);
          }}
          id="tab-level-2"
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
          {scenarioData && (
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#387A5A',
              }}
            />
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('roleplay');
            setValidationError(null);
          }}
          id="tab-level-3"
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
          {rolePlayData && (
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#387A5A',
              }}
            />
          )}
        </button>
      </div>

      {/* Alert Notices */}
      {validationError && (
        <div
          id="validation-error-banner"
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
          id="save-success-banner"
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

      {/* When course has no lessons */}
      {availableLessons.length === 0 && (
        <div
          className="card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            backgroundColor: '#FAF8F3',
          }}
        >
          <BookOpen size={40} color="#8E9995" style={{ marginBottom: '12px' }} />
          <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#173B3A' }}>
            No Lesson Units Found for This Course
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#68716D' }}>
            Please navigate to <strong>Lessons & Slides</strong> and create a lesson unit under{' '}
            <strong>{selectedCourse?.code}: {selectedCourse?.title}</strong> before configuring interactive content.
          </p>
        </div>
      )}

      {/* TAB 1: Level 1 Interactive Video Checkpoints */}
      {availableLessons.length > 0 && activeTab === 'video' && (
        <>
          {!videoData ? (
            <div
              className="card"
              style={{
                padding: '48px 24px',
                textAlign: 'center',
                backgroundColor: '#FAF8F3',
                border: '1px dashed #D6CFBF',
              }}
            >
              <Film size={40} color="#8E9995" style={{ marginBottom: '12px' }} />
              <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#173B3A' }}>
                No Level 1 Video Checkpoints Configured for This Lesson
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#68716D' }}>
                "{selectedLesson?.title}" does not have active interactive video checkpoints. Configure checkpoints with mandatory replay loops to enforce mastery.
              </p>
              <button
                onClick={handleInitializeLevel1}
                className="btn btn-primary btn-sm"
                id="btn-configure-level-1"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={15} />
                <span>Configure Level 1 Video Checkpoints</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
              {/* Left: Checkpoint List */}
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', color: '#173B3A' }}>Configured Checkpoints</h3>
                  <button
                    onClick={handleAddCheckpoint}
                    className="btn btn-sm btn-secondary"
                    id="btn-add-checkpoint"
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
                        id="btn-delete-checkpoint"
                        style={{ color: '#B94D46', border: '1px solid #B94D46' }}
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                      <button
                        onClick={handleSaveVideoCheckpoint}
                        className="btn btn-sm btn-primary"
                        id="btn-save-video-checkpoint"
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
                        id="input-checkpoint-title"
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
                        id="input-checkpoint-timestamp"
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
                          id="input-checkpoint-replay-start"
                          value={currentCheckpoint.reviewStartSeconds}
                          onChange={(e) => {
                            const updated = [...videoData.checkpoints];
                            updated[selectedCheckpointIndex].reviewStartSeconds = Number(e.target.value);
                            setVideoData({ ...videoData, checkpoints: updated });
                          }}
                          style={{ width: '50%', padding: '8px', borderRadius: '6px', border: '1px solid #D6CFBF', fontSize: '13px' }}
                        />
                        <span style={{ fontSize: '12px', color: '#68716D' }}>to</span>
                        <input
                          type="number"
                          id="input-checkpoint-replay-end"
                          value={currentCheckpoint.reviewEndSeconds}
                          onChange={(e) => {
                            const updated = [...videoData.checkpoints];
                            updated[selectedCheckpointIndex].reviewEndSeconds = Number(e.target.value);
                            setVideoData({ ...videoData, checkpoints: updated });
                          }}
                          style={{ width: '50%', padding: '8px', borderRadius: '6px', border: '1px solid #D6CFBF', fontSize: '13px' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#173B3A', marginBottom: '4px' }}>
                      Learner Checkpoint Question
                    </label>
                    <textarea
                      rows={2}
                      id="input-checkpoint-prompt"
                      value={currentCheckpoint.question.prompt}
                      onChange={(e) => {
                        const updated = [...videoData.checkpoints];
                        updated[selectedCheckpointIndex].question.prompt = e.target.value;
                        setVideoData({ ...videoData, checkpoints: updated });
                      }}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D6CFBF', fontSize: '13px' }}
                    />
                  </div>

                  {/* Options */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#173B3A', marginBottom: '4px' }}>
                      Answer Options (Select radio button for the correct answer)
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {currentCheckpoint.question.options.map((opt, optIdx) => (
                        <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input
                            type="radio"
                            name="correctAnswerGroup"
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
                      id="input-checkpoint-explanation"
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
        </>
      )}

      {/* TAB 2: Level 2 Branching Scenario Decision Flow */}
      {availableLessons.length > 0 && activeTab === 'branching' && (
        <>
          {!scenarioData ? (
            <div
              className="card"
              style={{
                padding: '48px 24px',
                textAlign: 'center',
                backgroundColor: '#FAF8F3',
                border: '1px dashed #D6CFBF',
              }}
            >
              <GitBranch size={40} color="#8E9995" style={{ marginBottom: '12px' }} />
              <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#173B3A' }}>
                No Level 2 Branching Scenario Configured for This Lesson
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#68716D' }}>
                "{selectedLesson?.title}" does not have a branching scenario decision flow. Build multi-pathway decisions with consequences to practice tactical judgment.
              </p>
              <button
                onClick={handleInitializeLevel2}
                className="btn btn-primary btn-sm"
                id="btn-configure-level-2"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={15} />
                <span>Configure Level 2 Branching Scenario</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
              {/* Left: Node Tree */}
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', color: '#173B3A' }}>Scenario Nodes</h3>
                  <button
                    onClick={handleSaveBranchingGraph}
                    className="btn btn-sm btn-secondary"
                    id="btn-validate-graph-top"
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
                        Type: <strong>{currentNode.type}</strong> • Clip: {currentNode.videoUrl || 'Standard Video Clip'}
                      </div>
                    </div>

                    <button
                      onClick={handleSaveBranchingGraph}
                      className="btn btn-sm btn-primary"
                      id="btn-save-branching-graph"
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
                                Choice {choice.label} (Score: {choice.scoreReward ?? choice.score} pts)
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
                  {(currentNode.type === 'ending' || currentNode.type === 'consequence') && (
                    <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#FAF8F3', border: '1px solid #E5E0D5', marginTop: '16px' }}>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#173B3A' }}>
                        {currentNode.type === 'ending' ? 'Terminal Ending Node' : 'Consequence Node'}
                      </h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#68716D' }}>
                        {currentNode.description || 'This branch computes final scoring from learner decisions and applies operational feedback.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* TAB 3: Level 3 AI Role-Play & Scoring Rubric */}
      {availableLessons.length > 0 && activeTab === 'roleplay' && (
        <>
          {!rolePlayData ? (
            <div
              className="card"
              style={{
                padding: '48px 24px',
                textAlign: 'center',
                backgroundColor: '#FAF8F3',
                border: '1px dashed #D6CFBF',
              }}
            >
              <Bot size={40} color="#8E9995" style={{ marginBottom: '12px' }} />
              <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#173B3A' }}>
                No Level 3 AI Role-Play Configured for This Lesson
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#68716D' }}>
                "{selectedLesson?.title}" does not have an adaptive role-play simulation or competency rubric. Create frontline dialogue scenarios with weighted rubrics.
              </p>
              <button
                onClick={handleInitializeLevel3}
                className="btn btn-primary btn-sm"
                id="btn-configure-level-3"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={15} />
                <span>Configure Level 3 AI Role-Play</span>
              </button>
            </div>
          ) : (
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
                      id="input-roleplay-character-name"
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
                      id="input-roleplay-character-role"
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
                      id="input-roleplay-initial-greeting"
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
                      id="input-roleplay-passing-score"
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
                      id="input-roleplay-max-turns"
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '11px', color: '#68716D' }}>Weight:</span>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={dim.weight}
                            onChange={(e) => {
                              const updatedDims = [...rolePlayData.rubricDimensions];
                              updatedDims[dIdx].weight = Number(e.target.value) || 0;
                              setRolePlayData({ ...rolePlayData, rubricDimensions: updatedDims });
                            }}
                            style={{
                              width: '54px',
                              padding: '2px 4px',
                              fontSize: '12px',
                              fontWeight: 700,
                              color: '#B87955',
                              border: '1px solid #D6CFBF',
                              borderRadius: '4px',
                              textAlign: 'right',
                            }}
                          />
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#B87955' }}>%</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#68716D' }}>
                        {dim.description}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    color: '#68716D',
                  }}
                >
                  <span>
                    Total Weight:{' '}
                    <strong
                      style={{
                        color:
                          rolePlayData.rubricDimensions.reduce((sum, d) => sum + (Number(d.weight) || 0), 0) === 100
                            ? '#387A5A'
                            : '#B94D46',
                      }}
                    >
                      {rolePlayData.rubricDimensions.reduce((sum, d) => sum + (Number(d.weight) || 0), 0)}%
                    </strong>{' '}
                    (must equal 100%)
                  </span>
                </div>

                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                  <button
                    onClick={handleSaveRolePlayRubrics}
                    className="btn btn-sm btn-primary"
                    id="btn-save-roleplay-rubrics"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Save size={14} />
                    <span>Save Rubrics</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
