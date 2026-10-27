import React, { useState, useEffect, useMemo } from 'react';
import {
  Building,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Edit,
  AlertCircle,
  X,
  Image as ImageIcon,
  FolderOpen,
  Layers,
} from 'lucide-react';
import { scenarioService } from '../../../services/scenario.service';
import { courseService } from '../../../services/course.service';
import { BuildingScenario, Room, Irregularity, Course, Lesson } from '../../../types';
import { BuildingFacade } from '../../../assets/illustrations/building-facade';
import { RoomScene } from '../../../assets/illustrations/room-scenes';
import { Modal } from '../../../components/common/Modal';

const AVAILABLE_ROOM_IMAGES = [
  {
    value: '/assets/facility-inspection/rooms/conference-room.jpg',
    label: 'Executive Boardroom Conference Room',
  },
  {
    value: '/assets/facility-inspection/rooms/reception.jpg',
    label: 'Main Reception and Visitor Foyer',
  },
  {
    value: '/assets/facility-inspection/rooms/server-vault.jpg',
    label: 'Critical Server and Data Vault',
  },
  {
    value: '/assets/facility-inspection/rooms/security-operations.jpg',
    label: 'Security Operations Center (SOC)',
  },
  {
    value: '/assets/facility-inspection/rooms/storage-room.jpg',
    label: 'Storage and Logistics Loading Bay',
  },
  {
    value: '/assets/facility-inspection/rooms/fire-corridor.jpg',
    label: 'Emergency Stairwell and Fire Exit Corridor',
  },
];

export const RoomScenarioEditor: React.FC = () => {
  // 1. Course and Lesson Selection State
  const courses: Course[] = useMemo(() => courseService.getCourses(), []);

  // Baseline course: SEC-101 (course-nature-role)
  const defaultCourse = useMemo(() => {
    return courses.find((c) => c.id === 'course-nature-role' || c.code === 'SEC-101') || courses[0];
  }, [courses]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>(defaultCourse?.id || '');

  // Extract available lessons for the selected course
  const availableLessons = useMemo<Lesson[]>(() => {
    const course = courses.find((c) => c.id === selectedCourseId);
    if (!course) return [];
    const lessons: Lesson[] = [];
    course.modules.forEach((m) => {
      m.lessons.forEach((l) => lessons.push(l));
    });
    return lessons;
  }, [courses, selectedCourseId]);

  // Baseline lesson: Lesson 1.1 (lesson-basic-duties)
  const [selectedLessonId, setSelectedLessonId] = useState<string>(() => {
    const course = courses.find((c) => c.id === (defaultCourse?.id || ''));
    if (!course) return '';
    let found = '';
    course.modules.forEach((m) => {
      m.lessons.forEach((l) => {
        if (!found || l.id === 'lesson-basic-duties') {
          found = l.id;
        }
      });
    });
    return found;
  });

  // Active scenario and selected room state
  const [scenario, setScenario] = useState<BuildingScenario | null>(() => {
    return scenarioService.getScenarioForLesson(
      defaultCourse?.id || '',
      'lesson-basic-duties'
    );
  });

  const [selectedRoomId, setSelectedRoomId] = useState<string>(() => {
    const initScenario = scenarioService.getScenarioForLesson(
      defaultCourse?.id || '',
      'lesson-basic-duties'
    );
    return initScenario?.rooms[0]?.id || '';
  });

  const currentRoom = useMemo(() => {
    if (!scenario || !scenario.rooms.length) return null;
    return scenario.rooms.find((r) => r.id === selectedRoomId) || scenario.rooms[0] || null;
  }, [scenario, selectedRoomId]);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [roomSuccessBanner, setRoomSuccessBanner] = useState<string | null>(null);

  // Edit room form fields
  const [roomName, setRoomName] = useState(currentRoom?.name || '');
  const [roomCode, setRoomCode] = useState(currentRoom?.code || '');
  const [promptQuestion, setPromptQuestion] = useState(currentRoom?.promptQuestion || '');
  const [explanation, setExplanation] = useState(currentRoom?.explanation || '');
  const [hasIrregularity, setHasIrregularity] = useState(currentRoom?.hasIrregularities || false);
  const [roomImage, setRoomImage] = useState(currentRoom?.roomImage || AVAILABLE_ROOM_IMAGES[0].value);

  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);

  // Creation modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomCode, setNewRoomCode] = useState('');
  const [newPromptQuestion, setNewPromptQuestion] = useState('Are there any security or safety irregularities in this room?');
  const [newExplanation, setNewExplanation] = useState('');
  const [newHasIrregularity, setNewHasIrregularity] = useState(false);
  const [newRoomImage, setNewRoomImage] = useState(AVAILABLE_ROOM_IMAGES[0].value);
  const [isSubmittingRoom, setIsSubmittingRoom] = useState(false);
  const [roomFormError, setRoomFormError] = useState<string | null>(null);

  // Dependent selection: when selectedCourseId changes
  const handleCourseChange = (newCourseId: string) => {
    setSelectedCourseId(newCourseId);
    const course = courses.find((c) => c.id === newCourseId);
    if (!course || !course.modules.length) {
      setSelectedLessonId('');
      setScenario(null);
      setSelectedRoomId('');
      return;
    }
    const lessons: Lesson[] = [];
    course.modules.forEach((m) => m.lessons.forEach((l) => lessons.push(l)));

    // Choose first lesson or lesson matching current if valid
    const targetLessonId = lessons.some((l) => l.id === selectedLessonId)
      ? selectedLessonId
      : lessons[0]?.id || '';
    setSelectedLessonId(targetLessonId);

    if (targetLessonId) {
      const freshSc = scenarioService.getScenarioForLesson(newCourseId, targetLessonId);
      setScenario(freshSc);
      setSelectedRoomId(freshSc?.rooms[0]?.id || '');
    } else {
      setScenario(null);
      setSelectedRoomId('');
    }
  };

  // Dependent selection: when selectedLessonId changes
  const handleLessonChange = (newLessonId: string) => {
    setSelectedLessonId(newLessonId);
    if (!selectedCourseId || !newLessonId) {
      setScenario(null);
      setSelectedRoomId('');
      return;
    }
    const freshSc = scenarioService.getScenarioForLesson(selectedCourseId, newLessonId);
    setScenario(freshSc);
    setSelectedRoomId(freshSc?.rooms[0]?.id || '');
  };

  // Keep form fields synced when currentRoom changes
  useEffect(() => {
    if (currentRoom) {
      setRoomName(currentRoom.name);
      setRoomCode(currentRoom.code);
      setPromptQuestion(currentRoom.promptQuestion);
      setExplanation(currentRoom.explanation);
      setHasIrregularity(currentRoom.hasIrregularities);
      setRoomImage(currentRoom.roomImage || AVAILABLE_ROOM_IMAGES[0].value);
    } else {
      setRoomName('');
      setRoomCode('');
      setPromptQuestion('');
      setExplanation('');
      setHasIrregularity(false);
      setRoomImage(AVAILABLE_ROOM_IMAGES[0].value);
    }
  }, [currentRoom]);

  // Generate suggested next zone code
  const suggestedNextCode = useMemo(() => {
    const existingCodes = (scenario?.rooms || []).map((r) => r.code);
    let candidateNum = 104;
    while (existingCodes.some((c) => c.toLowerCase().includes(String(candidateNum)))) {
      candidateNum++;
    }
    return `Zone ${candidateNum}`;
  }, [scenario?.rooms]);

  // Open Create Modal with clean defaults
  const handleOpenCreateModal = () => {
    if (!selectedCourseId || !selectedLessonId) {
      setRoomFormError('Please select a course and a lesson unit first.');
      setCreateModalOpen(true);
      return;
    }
    setNewRoomName('');
    setNewRoomCode(suggestedNextCode);
    setNewPromptQuestion('Are there any security or safety irregularities in this room?');
    setNewExplanation('');
    setNewHasIrregularity(false);
    setNewRoomImage(AVAILABLE_ROOM_IMAGES[0].value);
    setRoomFormError(null);
    setCreateModalOpen(true);
  };

  // Submit new room creation
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourseId || !selectedLessonId) {
      setRoomFormError('Please select both a course and a lesson unit before saving a zone.');
      return;
    }

    const trimmedName = newRoomName.trim();
    if (!trimmedName) {
      setRoomFormError('Please enter a room or zone name.');
      return;
    }

    const trimmedCode = newRoomCode.trim();
    if (!trimmedCode) {
      setRoomFormError('Please enter a zone code.');
      return;
    }

    const trimmedExplanation = newExplanation.trim();
    if (!trimmedExplanation) {
      setRoomFormError('Please enter a feedback explanation.');
      return;
    }

    setIsSubmittingRoom(true);
    setRoomFormError(null);

    // Get or initialize scenario for the selected course and lesson
    const activeScenario = scenarioService.getOrCreateScenarioForLesson(
      selectedCourseId,
      selectedLessonId
    );

    const result = scenarioService.createRoom(activeScenario.id, {
      name: trimmedName,
      code: trimmedCode,
      promptQuestion: newPromptQuestion.trim(),
      explanation: trimmedExplanation,
      hasIrregularities: newHasIrregularity,
      roomImage: newRoomImage,
    });

    if (!result.success) {
      setRoomFormError(result.error || 'Failed to save room scenario.');
      setIsSubmittingRoom(false);
      return;
    }

    // Refresh scenario and select newly created room
    const freshScenario = scenarioService.getScenarioById(activeScenario.id);
    if (freshScenario && result.room) {
      setScenario(freshScenario);
      setSelectedRoomId(result.room.id);
      setCreateModalOpen(false);
      setIsSubmittingRoom(false);
      setRoomSuccessBanner(
        `Room scenario "${result.room.name}" (${result.room.code}) created and configured successfully for this lesson!`
      );
      setTimeout(() => setRoomSuccessBanner(null), 4000);
    }
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenario || !currentRoom) return;

    const updatedRoom: Room = {
      ...currentRoom,
      name: roomName.trim(),
      code: roomCode.trim(),
      promptQuestion: promptQuestion.trim(),
      explanation: explanation.trim(),
      hasIrregularities: hasIrregularity,
      correctAnswerHasIrregularity: hasIrregularity,
      roomImage,
    };

    const updatedScenario = scenarioService.updateRoom(scenario.id, updatedRoom);
    if (updatedScenario) {
      setScenario(updatedScenario);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
      setRoomSuccessBanner(`Zone "${updatedRoom.name}" (${updatedRoom.code}) updated and persisted.`);
      setTimeout(() => setRoomSuccessBanner(null), 3000);
    }
  };

  const handleDeleteRoom = (roomId: string, roomTitle: string) => {
    if (!scenario) return;
    if (!window.confirm(`Are you sure you want to delete zone "${roomTitle}" from this scenario?`)) {
      return;
    }

    const updatedScenario = scenarioService.deleteRoom(scenario.id, roomId);
    if (updatedScenario) {
      setScenario(updatedScenario);
      setSelectedRoomId(updatedScenario.rooms[0]?.id || '');
      setRoomSuccessBanner(`Zone "${roomTitle}" has been removed.`);
      setTimeout(() => setRoomSuccessBanner(null), 3000);
    }
  };

  const currentCourse = courses.find((c) => c.id === selectedCourseId);
  const currentLesson = availableLessons.find((l) => l.id === selectedLessonId);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '32px' }}>
      {/* Success Notification Banner */}
      {roomSuccessBanner && (
        <div
          id="room-success-banner"
          style={{
            marginBottom: '16px',
            padding: '12px 16px',
            backgroundColor: '#EAF3EE',
            border: '1px solid #9DC7B0',
            borderRadius: '8px',
            color: '#387A5A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#387A5A" />
            <span>{roomSuccessBanner}</span>
          </div>
          <button
            onClick={() => setRoomSuccessBanner(null)}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#387A5A' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Page Title & Top Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-copper">Simulation Studio</span>
            <span style={{ fontSize: '12px', color: '#68716D' }}>Interactive Inspection Engine</span>
          </div>
          <h1 style={{ fontSize: '24px', color: '#173B3A', margin: 0, fontWeight: 800 }}>
            Building & Room Inspection Scenario Editor
          </h1>
          <p style={{ color: '#68716D', fontSize: '13px', margin: '4px 0 0' }}>
            Configure interactive room hotspots, irregularity answers, and feedback rules scoped to specific courses and lessons.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setPreviewOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            id="btn-preview-facility-exterior"
          >
            <Eye size={15} />
            <span>Preview Facility Exterior</span>
          </button>
        </div>
      </div>

      {/* Shared Course & Lesson Selection Bar */}
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
              htmlFor="select-scenario-course"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#68716D',
                display: 'block',
                marginBottom: '4px',
              }}
            >
              Course:
            </label>
            <select
              id="select-scenario-course"
              value={selectedCourseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="form-select"
              style={{ minWidth: '280px' }}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="select-scenario-lesson"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#68716D',
                display: 'block',
                marginBottom: '4px',
              }}
            >
              Lesson:
            </label>
            <select
              id="select-scenario-lesson"
              value={selectedLessonId}
              onChange={(e) => handleLessonChange(e.target.value)}
              className="form-select"
              style={{ minWidth: '300px' }}
              disabled={availableLessons.length === 0}
            >
              {availableLessons.length === 0 ? (
                <option value="">No lesson units found for this course</option>
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

        {/* Configuration Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#68716D' }}>
            Scenario Status:
          </span>
          {scenario && scenario.rooms.length > 0 ? (
            <span
              id="scenario-status-badge"
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: '#EAF3EE',
                color: '#387A5A',
                fontWeight: 700,
                fontSize: '11px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <CheckCircle2 size={13} color="#387A5A" />
              <span>Configured ({scenario.rooms.length} Zones)</span>
            </span>
          ) : scenario && scenario.rooms.length === 0 ? (
            <span
              id="scenario-status-badge"
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: '#FFF8E7',
                color: '#B87955',
                fontWeight: 700,
                fontSize: '11px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <AlertTriangle size={13} color="#B87955" />
              <span>No Zones Configured</span>
            </span>
          ) : (
            <span
              id="scenario-status-badge"
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: '#F5F7F6',
                color: '#8E9995',
                fontWeight: 600,
                fontSize: '11px',
              }}
            >
              Not Configured
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area or Empty States */}
      {!selectedCourseId ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <Building size={40} color="#8E9995" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '17px', color: '#173B3A', margin: '0 0 6px', fontWeight: 700 }}>
            No Course Selected
          </h3>
          <p style={{ fontSize: '13px', color: '#68716D', margin: 0 }}>
            No course selected. Select a course to manage inspection scenarios.
          </p>
        </div>
      ) : availableLessons.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <FolderOpen size={40} color="#8E9995" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '17px', color: '#173B3A', margin: '0 0 6px', fontWeight: 700 }}>
            No Lesson Units Found
          </h3>
          <p style={{ fontSize: '13px', color: '#68716D', margin: 0 }}>
            No lesson units found for this course.
          </p>
        </div>
      ) : !scenario || scenario.rooms.length === 0 ? (
        /* Empty State for Unconfigured Scenario or 0 Zones */
        <div className="card" style={{ padding: '54px 24px', textAlign: 'center' }}>
          <Building size={48} color="#B87955" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', color: '#173B3A', margin: '0 0 8px', fontWeight: 800 }}>
            {!scenario
              ? 'No inspection scenario configured for this lesson.'
              : 'No zones configured for this lesson. Select Add Zone to create one.'}
          </h3>
          <p
            style={{
              fontSize: '13.5px',
              color: '#68716D',
              maxWidth: '540px',
              margin: '0 auto 24px',
              lineHeight: 1.6,
            }}
          >
            Create an interactive inspection scenario for{' '}
            <strong>{currentLesson?.title || 'the selected lesson'}</strong>. Configure realistic room
            scenes, reportable irregularities, and standard operating feedback for your learners.
          </p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="btn btn-primary"
            id="btn-add-room-scenario"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px' }}
          >
            <Plus size={16} />
            <span>Add Zone</span>
          </button>
        </div>
      ) : (
        /* 3-Column Layout: Configured Zones | Zone Editor | Live Preview */
        <div style={{ display: 'grid', gridTemplateColumns: '290px 1.2fr 1.2fr', gap: '20px', alignItems: 'start' }}>
          {/* Column 1: Configured Zones List with Add Action */}
          <div className="card" style={{ padding: '16px' }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: '13px',
                color: '#173B3A',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building size={14} color="#68716D" />
                <span>Configured Zones ({scenario.rooms.length})</span>
              </div>

              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="btn btn-primary btn-xs"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                id="btn-add-room-scenario"
                title="Create a new room scenario zone for this lesson"
              >
                <Plus size={13} />
                <span>Add Zone</span>
              </button>
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
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: isSelected ? '#D49B65' : '#B87955', fontWeight: 700 }}>
                        {room.code}
                      </span>
                      <span style={{ fontSize: '10px', color: isSelected ? '#DDE5D7' : '#8E9995' }}>
                        {room.hasIrregularities
                          ? `${room.irregularities?.length || 1} issues`
                          : 'Compliant'}
                      </span>
                    </div>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {room.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 2: Room Form Editor */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', color: '#173B3A', margin: 0, fontWeight: 700 }}>
                Edit Zone: {currentRoom?.name || 'Selected Room'}
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
                  <label className="form-label" htmlFor="roomNameInput">
                    Room / Zone Name
                  </label>
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
                  <label className="form-label" htmlFor="roomCodeInput">
                    Zone Code
                  </label>
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
                <label className="form-label" htmlFor="promptQuestionInput">
                  Learner Inspection Prompt
                </label>
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
                <label className="form-label" htmlFor="hasIrregularityCheck">
                  Zone Status
                </label>
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
                <label className="form-label" htmlFor="explanationInput">
                  Correct Feedback Explanation
                </label>
                <textarea
                  id="explanationInput"
                  rows={3}
                  required
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="form-textarea"
                />
              </div>

              {/* Room Photographic Asset Selection */}
              <div className="form-group">
                <label className="form-label" htmlFor="roomImageSelect">
                  Room Scene Photographic Asset
                </label>
                <select
                  id="roomImageSelect"
                  value={roomImage}
                  onChange={(e) => setRoomImage(e.target.value)}
                  className="form-select"
                >
                  {AVAILABLE_ROOM_IMAGES.map((img) => (
                    <option key={img.value} value={img.value}>
                      {img.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Configured Irregularities in Room */}
              <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '12px', color: '#173B3A', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Hotspot Irregularities ({currentRoom?.irregularities?.length || 0}):
                </div>
                {!currentRoom?.irregularities || currentRoom.irregularities.length === 0 ? (
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

              {/* Actions: Save & Delete */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  id="btn-save-zone-config"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Save size={15} />
                  <span>Save Zone Configuration</span>
                </button>
                {currentRoom && (
                  <button
                    type="button"
                    onClick={() => handleDeleteRoom(currentRoom.id, currentRoom.name)}
                    className="btn btn-secondary btn-sm"
                    id="btn-delete-zone"
                    style={{ color: '#B44D45', borderColor: '#E8ABA7', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Delete this zone from the current scenario"
                  >
                    <Trash2 size={14} />
                    <span>Delete Zone</span>
                  </button>
                )}
              </div>
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
              <RoomScene roomId={currentRoom?.id} imageSrc={currentRoom?.roomImage} />
            </div>

            <div style={{ marginTop: '12px', fontSize: '11px', color: '#68716D', lineHeight: 1.5 }}>
              <strong>Inspection Hint:</strong> In learner mode, clicking the hotspots triggers official report verification and logs points towards the Safety Observer qualification.
            </div>
          </div>
        </div>
      )}

      {/* Building Exterior Preview Modal */}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Facility Building Facade Overview"
        maxWidth="880px"
      >
        <div style={{ height: '460px', backgroundColor: '#1E2729', borderRadius: '8px', overflow: 'hidden' }}>
          <BuildingFacade />
        </div>
      </Modal>

      {/* Add Room Scenario Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => {
          if (!isSubmittingRoom) setCreateModalOpen(false);
        }}
        title={`Add Zone to ${currentLesson?.title || 'Selected Lesson'}`}
        maxWidth="600px"
      >
        <form onSubmit={handleCreateRoom} style={{ padding: '4px 0' }}>
          {roomFormError && (
            <div
              style={{
                marginBottom: '16px',
                padding: '10px 14px',
                backgroundColor: '#FAEEEC',
                border: '1px solid #E8ABA7',
                borderRadius: '6px',
                color: '#B44D45',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              role="alert"
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{roomFormError}</span>
            </div>
          )}

          {/* Target Course & Lesson Information */}
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#FAF8F3',
              border: '1px solid #E5E0D5',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '12px',
              color: '#173B3A',
            }}
          >
            <div><strong>Target Course:</strong> {currentCourse?.code}: {currentCourse?.title}</div>
            <div style={{ marginTop: '2px' }}><strong>Target Lesson:</strong> {currentLesson?.title}</div>
          </div>

          {/* Room Name and Code */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="newRoomNameInput">
                Room / Zone Name <span style={{ color: '#B44D45' }}>*</span>
              </label>
              <input
                id="newRoomNameInput"
                type="text"
                required
                autoFocus
                placeholder="e.g. Emergency Equipment Storage"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="newRoomCodeInput">
                Zone Code <span style={{ color: '#B44D45' }}>*</span>
              </label>
              <input
                id="newRoomCodeInput"
                type="text"
                required
                placeholder="e.g. Zone 104"
                value={newRoomCode}
                onChange={(e) => setNewRoomCode(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Learner Inspection Prompt */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="newPromptQuestionInput">
              Learner Inspection Prompt
            </label>
            <input
              id="newPromptQuestionInput"
              type="text"
              required
              value={newPromptQuestion}
              onChange={(e) => setNewPromptQuestion(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Zone Status Checkbox */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="newHasIrregularityCheck">
              Zone Status
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
              <input
                id="newHasIrregularityCheck"
                type="checkbox"
                checked={newHasIrregularity}
                onChange={(e) => setNewHasIrregularity(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="newHasIrregularityCheck" style={{ fontSize: '13.5px', color: '#173B3A', fontWeight: 600, cursor: 'pointer' }}>
                Zone contains reportable security/safety irregularities
              </label>
            </div>
          </div>

          {/* Correct Feedback Explanation */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="newExplanationInput">
              Correct Feedback Explanation <span style={{ color: '#B44D45' }}>*</span>
            </label>
            <textarea
              id="newExplanationInput"
              rows={3}
              required
              placeholder="Describe the operational finding or standard operating procedure..."
              value={newExplanation}
              onChange={(e) => setNewExplanation(e.target.value)}
              className="form-textarea"
            />
          </div>

          {/* Photographic Scene Asset Dropdown & Preview */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" htmlFor="newRoomImageSelect">
              Room Scene Photographic Asset
            </label>
            <select
              id="newRoomImageSelect"
              value={newRoomImage}
              onChange={(e) => setNewRoomImage(e.target.value)}
              className="form-select"
            >
              {AVAILABLE_ROOM_IMAGES.map((img) => (
                <option key={img.value} value={img.value}>
                  {img.label}
                </option>
              ))}
            </select>

            {/* In-Modal Thumbnail Preview */}
            <div
              style={{
                marginTop: '10px',
                height: '140px',
                borderRadius: '6px',
                overflow: 'hidden',
                border: '1px solid #2E3839',
                backgroundColor: '#0F1314',
                position: 'relative',
              }}
            >
              <img
                src={newRoomImage}
                alt="Selected Room Scene Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '6px',
                  right: '8px',
                  backgroundColor: 'rgba(0,0,0,0.65)',
                  color: '#FAF8F3',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                }}
              >
                Live Asset Preview
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              disabled={isSubmittingRoom}
              className="btn btn-secondary btn-sm"
              id="btn-cancel-add-room"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingRoom || !newRoomName.trim() || !newRoomCode.trim() || !newExplanation.trim()}
              className="btn btn-primary btn-sm"
              id="btn-save-new-room"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Save size={14} />
              <span>{isSubmittingRoom ? 'Saving Room...' : 'Save Room Scenario'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
