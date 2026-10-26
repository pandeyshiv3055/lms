import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Play,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building,
  RotateCcw,
  Award,
  ChevronRight,
  Eye,
  Shield,
  FileText,
  Lock,
  Layers,
  AlertCircle,
} from 'lucide-react';
import {
  BuildingScenario,
  Room,
  InspectionObject,
  SubmittedReport,
  RoomInspectionState,
  RoomInspectionProgress,
} from '../../../types';
import { scenarioService } from '../../../services/scenario.service';
import { progressService } from '../../../services/progress.service';
import { authService } from '../../../services/auth.service';

interface BuildingInspectionActivityProps {
  scenarioId?: string;
  onActivityComplete?: () => void;
}

type ActivityStage = 'intro' | 'building' | 'room' | 'summary';
type RoomStep = 'inspect_prompt' | 'select_object' | 'file_report' | 'feedback';

export const BuildingInspectionActivity: React.FC<BuildingInspectionActivityProps> = ({
  scenarioId = 'scenario-facility-04',
  onActivityComplete,
}) => {
  const user = authService.getCurrentUser();
  const userId = user?.id || 'user-demo-learner';

  const scenario: BuildingScenario = useMemo(() => {
    return scenarioService.getScenarioById(scenarioId) || scenarioService.getScenarios()[0];
  }, [scenarioId]);

  // Load saved inspection progress
  const [stage, setStage] = useState<ActivityStage>('intro');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomStep, setRoomStep] = useState<RoomStep>('inspect_prompt');

  const initialProgress = useMemo(() => {
    return (
      progressService.getRoomInspectionProgress(userId, scenario.id) || {
        inspectedRoomIds: [],
        reportedIrregularityIds: [],
        score: 0,
        completed: false,
        roomAnswers: {},
        roomStates: {},
        submittedReports: {},
      }
    );
  }, [userId, scenario.id]);

  // Persistent state maps
  const [roomStates, setRoomStates] = useState<Record<string, RoomInspectionState>>(
    initialProgress.roomStates || {}
  );
  const [submittedReports, setSubmittedReports] = useState<Record<string, SubmittedReport>>(
    initialProgress.submittedReports || {}
  );
  const [roomAnswers, setRoomAnswers] = useState<Record<string, boolean>>(
    initialProgress.roomAnswers || {}
  );

  // Active room temporary working state (for current attempt)
  const [selectedYesNo, setSelectedYesNo] = useState<boolean | null>(null);
  const [activeSelectedObjectId, setActiveSelectedObjectId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('physical-security');
  const [activeSeverity, setActiveSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [activeDescription, setActiveDescription] = useState<string>('');
  const [activeFeedback, setActiveFeedback] = useState<{
    isCorrect: boolean;
    title: string;
    message: string;
    whyItMatters?: string;
  } | null>(null);

  // Completed rooms calculation: strictly derived from verified room states
  const completedRoomIds = useMemo(() => {
    return scenario.rooms
      .filter((r) => {
        const state = roomStates[r.id];
        return state && state.status === 'complete' && state.isCorrect;
      })
      .map((r) => r.id);
  }, [scenario.rooms, roomStates]);

  const requiredRooms = useMemo(() => {
    return scenario.rooms.filter((r) => r.required !== false);
  }, [scenario.rooms]);

  const isActivityFullyComplete = useMemo(() => {
    return (
      requiredRooms.length > 0 &&
      requiredRooms.every((r) => completedRoomIds.includes(r.id))
    );
  }, [requiredRooms, completedRoomIds]);

  // Trigger parent completion when all required rooms are complete
  useEffect(() => {
    if (isActivityFullyComplete && onActivityComplete) {
      onActivityComplete();
    }
  }, [isActivityFullyComplete, onActivityComplete]);

  // Save progress helper
  const persistProgress = (
    updatedStates: Record<string, RoomInspectionState>,
    updatedReports: Record<string, SubmittedReport>,
    updatedAnswers: Record<string, boolean>
  ) => {
    const newlyCompleted = scenario.rooms
      .filter((r) => {
        const s = updatedStates[r.id];
        return s && s.status === 'complete' && s.isCorrect;
      })
      .map((r) => r.id);

    const isAllDone =
      requiredRooms.length > 0 &&
      requiredRooms.every((r) => newlyCompleted.includes(r.id));

    const reportedIds = Object.keys(updatedReports);
    const score = Math.round((newlyCompleted.length / scenario.rooms.length) * 100);

    const updatedData: Partial<RoomInspectionProgress> = {
      inspectedRoomIds: newlyCompleted,
      reportedIrregularityIds: reportedIds,
      score,
      completed: isAllDone,
      roomAnswers: updatedAnswers,
      roomStates: updatedStates,
      submittedReports: updatedReports,
    };

    progressService.saveRoomInspectionProgress(userId, scenario.id, updatedData);

    if (isAllDone && onActivityComplete) {
      onActivityComplete();
    }
  };

  // Open Room Scene
  const handleOpenRoom = (room: Room) => {
    setSelectedRoom(room);
    const existingState = roomStates[room.id];

    if (existingState && existingState.status === 'complete') {
      // Room already complete: show feedback state
      setSelectedYesNo(existingState.observedIrregularity ?? null);
      setActiveSelectedObjectId(existingState.selectedObjectId || null);
      const rep = existingState.report || submittedReports[room.id];
      if (rep) {
        setActiveFeedback({
          isCorrect: true,
          title: 'Zone Observation Verified & Report Filed',
          message: rep.feedbackText || room.explanation,
          whyItMatters: rep.whyItMatters,
        });
      } else {
        setActiveFeedback({
          isCorrect: true,
          title: 'Zone Observation Confirmed Compliant',
          message: room.correctFeedback || room.explanation,
        });
      }
      setRoomStep('feedback');
    } else {
      // Fresh or in-progress room attempt
      setSelectedYesNo(null);
      setActiveSelectedObjectId(null);
      setActiveDescription('');
      setActiveFeedback(null);
      setRoomStep('inspect_prompt');

      // Update state to opened / in_progress if not yet set
      const updatedStates = {
        ...roomStates,
        [room.id]: existingState || {
          roomId: room.id,
          opened: true,
          yesNoAnswered: false,
          isCorrect: false,
          status: 'in_progress',
          attempts: 1,
        },
      };
      setRoomStates(updatedStates);
    }

    setStage('room');
  };

  // Submit Yes/No observation question
  const handleSubmitYesNo = () => {
    if (!selectedRoom || selectedYesNo === null) return;

    const newAnswers = { ...roomAnswers, [selectedRoom.id]: selectedYesNo };
    setRoomAnswers(newAnswers);

    const existingState = roomStates[selectedRoom.id] || {
      roomId: selectedRoom.id,
      opened: true,
      yesNoAnswered: true,
      observedIrregularity: selectedYesNo,
      isCorrect: false,
      status: 'in_progress',
      attempts: 1,
    };

    if (selectedYesNo === true) {
      // User says YES: must now select the faulty object within the image
      const updatedStates = {
        ...roomStates,
        [selectedRoom.id]: {
          ...existingState,
          yesNoAnswered: true,
          observedIrregularity: true,
          status: 'in_progress' as const,
        },
      };
      setRoomStates(updatedStates);
      persistProgress(updatedStates, submittedReports, newAnswers);
      setRoomStep('select_object');
    } else {
      // User says NO: Evaluate if room actually has irregularities
      if (!selectedRoom.hasIrregularities) {
        // Correct! Zone is compliant (e.g. Zone 203 SOC)
        const updatedStates = {
          ...roomStates,
          [selectedRoom.id]: {
            ...existingState,
            yesNoAnswered: true,
            observedIrregularity: false,
            isCorrect: true,
            status: 'complete' as const,
          },
        };
        setRoomStates(updatedStates);
        persistProgress(updatedStates, submittedReports, newAnswers);
        setActiveFeedback({
          isCorrect: true,
          title: 'Zone Observation Confirmed Compliant',
          message:
            selectedRoom.correctFeedback ||
            'Correct observation! This zone is fully compliant with all security, life-safety, and operational standards.',
        });
        setRoomStep('feedback');
      } else {
        // Incorrect! Irregularity was missed
        const updatedStates = {
          ...roomStates,
          [selectedRoom.id]: {
            ...existingState,
            yesNoAnswered: true,
            observedIrregularity: false,
            isCorrect: false,
            status: 'failed' as const,
            attempts: (existingState.attempts || 1) + 1,
          },
        };
        setRoomStates(updatedStates);
        persistProgress(updatedStates, submittedReports, newAnswers);
        setActiveFeedback({
          isCorrect: false,
          title: 'Irregularity Overlooked',
          message:
            selectedRoom.incorrectFeedback ||
            'A security or safety hazard was present in this zone. Re-inspect the photographic scene carefully.',
        });
        setRoomStep('feedback');
      }
    }
  };

  // Click an object hotspot within the room photo
  const handleSelectObject = (obj: InspectionObject) => {
    setActiveSelectedObjectId(obj.id);
    // Prefill default category based on object's incidentType
    if (obj.incidentType === 'information-security') {
      setActiveCategory('information-security');
    } else if (obj.incidentType === 'environmental-safety' || obj.incidentType === 'egress-obstruction') {
      setActiveCategory('safety');
    } else {
      setActiveCategory('physical-security');
    }
    setActiveSeverity(obj.severity || 'high');
  };

  // Open incident reporting form
  const handleProceedToReport = () => {
    if (!activeSelectedObjectId) return;
    setRoomStep('file_report');
  };

  // Submit incident report
  const handleSubmitReport = () => {
    if (!selectedRoom || !activeSelectedObjectId) return;

    const selectedObj = selectedRoom.objects.find((o) => o.id === activeSelectedObjectId);
    if (!selectedObj) return;

    const isTargetCorrect = selectedObj.isExpectedTarget;
    const isCategoryAccepted =
      !selectedObj.acceptedIncidentCategories ||
      selectedObj.acceptedIncidentCategories.length === 0 ||
      selectedObj.acceptedIncidentCategories.includes(activeCategory);

    const isReportSuccessful = isTargetCorrect && isCategoryAccepted;

    const report: SubmittedReport = {
      roomId: selectedRoom.id,
      objectId: selectedObj.id,
      objectLabel: selectedObj.label,
      category: activeCategory,
      description: activeDescription.trim() || `Irregularity observed on ${selectedObj.label}.`,
      severity: activeSeverity,
      isCorrect: isReportSuccessful,
      submittedAt: new Date().toISOString(),
      feedbackText: isReportSuccessful
        ? selectedObj.feedbackCorrect || selectedRoom.explanation
        : 'The selected object does not match the configured irregularity. Re-inspect the zone and identify the actual hazard.',
      whyItMatters: selectedObj.feedbackWhyItMatters,
    };

    const newReports = {
      ...submittedReports,
      [selectedRoom.id]: report,
    };
    setSubmittedReports(newReports);

    const existingState = roomStates[selectedRoom.id];
    const updatedStates = {
      ...roomStates,
      [selectedRoom.id]: {
        ...existingState,
        roomId: selectedRoom.id,
        opened: true,
        yesNoAnswered: true,
        observedIrregularity: true,
        selectedObjectId: selectedObj.id,
        report,
        isCorrect: isReportSuccessful,
        status: isReportSuccessful ? ('complete' as const) : ('failed' as const),
        attempts: (existingState?.attempts || 1) + 1,
      },
    };
    setRoomStates(updatedStates);
    persistProgress(updatedStates, newReports, roomAnswers);

    if (isReportSuccessful) {
      setActiveFeedback({
        isCorrect: true,
        title: 'Irregularity Verified & Incident Logged',
        message: report.feedbackText,
        whyItMatters: report.whyItMatters,
      });
    } else {
      setActiveFeedback({
        isCorrect: false,
        title: 'Inspection Finding Inconclusive / Incorrect Object',
        message:
          'The selected object does not present an irregularity in this zone. Re-inspect the room and identify the actual security issue.',
      });
    }

    setRoomStep('feedback');
  };

  // Retry or Re-inspect
  const handleRetryRoom = () => {
    setSelectedYesNo(null);
    setActiveSelectedObjectId(null);
    setActiveFeedback(null);
    setRoomStep('inspect_prompt');
  };

  // Return to Building Facade
  const handleReturnToBuilding = () => {
    setSelectedRoom(null);
    setActiveSelectedObjectId(null);
    setActiveFeedback(null);

    // If all required rooms are complete, offer summary
    if (isActivityFullyComplete) {
      setStage('summary');
    } else {
      setStage('building');
    }
  };

  /* ==========================================================================
     STAGE 1: INTRODUCTION SCREEN
     ========================================================================== */
  if (stage === 'intro') {
    return (
      <div
        style={{
          padding: '36px 40px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          maxWidth: '880px',
          margin: '0 auto',
        }}
        className="animate-fade-in"
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: '#173B3A',
            border: '2px solid #B87955',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '18px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
          }}
        >
          <Building size={32} color="#D49B65" />
        </div>

        <span className="badge badge-copper" style={{ marginBottom: '8px' }}>
          REALISTIC FACILITY INSPECTION SIMULATOR
        </span>

        <h1 style={{ fontSize: '28px', color: '#173B3A', marginBottom: '12px' }}>
          {scenario.title}
        </h1>

        <p
          style={{
            color: '#242C2D',
            fontSize: '15px',
            lineHeight: 1.6,
            maxWidth: '720px',
            marginBottom: '24px',
          }}
        >
          {scenario.instructions}
        </p>

        {/* Mission Directives Box */}
        <div
          style={{
            backgroundColor: '#FAF8F3',
            border: '1.5px solid #E5E0D5',
            borderRadius: '10px',
            padding: '20px 24px',
            maxWidth: '640px',
            width: '100%',
            marginBottom: '28px',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: '13px',
              color: '#173B3A',
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Shield size={16} color="#B87955" />
            <span>Inspection Directives & Strict Certification Rules:</span>
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: '20px',
              fontSize: '13.5px',
              color: '#242C2D',
              lineHeight: 1.6,
            }}
          >
            <li>
              <strong>Mandatory Flow:</strong> Inspect each realistic room photograph, answer the
              Yes/No observation question, pinpoint the faulty object, and file an incident report.
            </li>
            <li>
              <strong>Gated Progression:</strong> All 6 facility zones must be certified complete
              before the player's <strong>Next</strong> button unlocks.
            </li>
            <li>
              <strong>Photographic Accuracy:</strong> Hotspots are calibrated directly to actual
              physical equipment, credentials, and environmental hazards.
            </li>
          </ul>
        </div>

        <button
          onClick={() => setStage('building')}
          className="btn btn-accent btn-lg"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 36px',
            fontSize: '15px',
            boxShadow: '0 4px 16px rgba(184, 121, 85, 0.4)',
          }}
        >
          <Play size={18} fill="#FFF" />
          <span>Enter Facility 04 Simulation</span>
        </button>
      </div>
    );
  }

  /* ==========================================================================
     STAGE 2: BUILDING OVERVIEW SCREEN (Realistic Facade with Hotspots)
     ========================================================================== */
  if (stage === 'building') {
    return (
      <div
        style={{
          padding: '16px 24px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
        className="animate-fade-in"
      >
        {/* Top Control Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '20px', color: '#173B3A', margin: 0, fontWeight: 800 }}>
                Facility 04 Exterior Overview
              </h2>
              <span className="badge badge-copper" style={{ fontSize: '11px' }}>
                High-Definition Architecture
              </span>
            </div>
            <p style={{ color: '#68716D', fontSize: '12.5px', margin: '2px 0 0' }}>
              Click any illuminated zone hotspot on the commercial facility facade to enter and inspect the room.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Real derived progress counter */}
            <div
              style={{
                backgroundColor: isActivityFullyComplete ? '#EAF3EE' : '#FAF8F3',
                border: `1.5px solid ${isActivityFullyComplete ? '#387A5A' : '#D49B65'}`,
                borderRadius: '8px',
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {isActivityFullyComplete ? (
                <CheckCircle2 size={16} color="#387A5A" />
              ) : (
                <Eye size={16} color="#D49B65" />
              )}
              <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#173B3A' }}>
                Progress: {completedRoomIds.length} / {scenario.rooms.length} Rooms Inspected
              </span>
            </div>

            {isActivityFullyComplete && (
              <button
                onClick={() => setStage('summary')}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>View Final Certification</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Realistic Building Facade Container (16:9 ratio, responsive percentage hotspots) */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '2px solid #2E3839',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            backgroundColor: '#0F1314',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
          }}
        >
          {/* Photographic Building Exterior Image */}
          <img
            src={scenario.buildingImage}
            alt="Facility 04 Modern Commercial Office Exterior"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              filter: 'brightness(0.96)',
            }}
          />

          {/* Interactive Room Hotspots Overlay */}
          {scenario.rooms.map((room) => {
            const state = roomStates[room.id];
            const isCompleted = state && state.status === 'complete' && state.isCorrect;
            const isFailed = state && state.status === 'failed';
            const isInProgress = state && state.status === 'in_progress';
            const { x, y, label } = room.buildingCoordinates;

            return (
              <div
                key={room.id}
                onClick={() => handleOpenRoom(room)}
                tabIndex={0}
                role="button"
                aria-label={`Enter and inspect ${room.name} (${room.code})`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleOpenRoom(room);
                }}
                style={{
                  position: 'absolute',
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  zIndex: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  outline: 'none',
                  transition: 'transform 0.15s ease',
                }}
                className="building-hotspot-group"
              >
                {/* Hotspot Target Marker */}
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted
                      ? '#387A5A'
                      : isFailed
                      ? '#B44D45'
                      : isInProgress
                      ? '#B87955'
                      : '#173B3A',
                    border: '2.5px solid #FAF8F3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.6)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={20} color="#FAF8F3" />
                  ) : isFailed ? (
                    <AlertTriangle size={18} color="#FAF8F3" />
                  ) : (
                    <Eye size={18} color="#FAF8F3" />
                  )}
                </div>

                {/* Hotspot Badge Label */}
                <div
                  style={{
                    marginTop: '6px',
                    backgroundColor: 'rgba(15, 23, 24, 0.94)',
                    border: `1.5px solid ${isCompleted ? '#387A5A' : '#D49B65'}`,
                    borderRadius: '5px',
                    padding: '4px 10px',
                    color: '#FAF8F3',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 3px 8px rgba(0,0,0,0.5)',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <span>{label || room.name}</span>
                  {isCompleted && (
                    <span style={{ color: '#9DC7B0', fontSize: '11px' }}>✓</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Status Instruction Banner */}
        <div
          style={{
            marginTop: '10px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E0D5',
            borderRadius: '8px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12.5px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#242C2D' }}>
            <Lock size={14} color="#B87955" />
            <span>
              <strong>Player Navigation Gated:</strong> Next button will unlock only when all 6 required
              inspection zones are certified complete ({completedRoomIds.length}/6 complete).
            </span>
          </div>

          <div style={{ color: '#68716D', fontStyle: 'italic', fontSize: '11.5px' }}>
            Click any illuminated marker to inspect
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     STAGE 3: ROOM INTERIOR SCENE (Photographic Room with Calibrated Hotspots)
     ========================================================================== */
  if (stage === 'room' && selectedRoom) {
    const selectedObj = selectedRoom.objects.find((o) => o.id === activeSelectedObjectId);
    const roomProgressState = roomStates[selectedRoom.id];
    const isRoomFinished = roomProgressState && roomProgressState.status === 'complete';

    return (
      <div
        style={{
          padding: '14px 20px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
        className="animate-fade-in"
      >
        {/* Room Header & Navigation Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleReturnToBuilding}
              className="btn btn-secondary btn-sm"
              style={{
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
              }}
            >
              <ArrowLeft size={15} />
              <span>Return to Building</span>
            </button>

            <div>
              <div style={{ fontWeight: 800, fontSize: '16.5px', color: '#173B3A' }}>
                {selectedRoom.name} ({selectedRoom.code})
              </div>
              <div style={{ fontSize: '11.5px', color: '#68716D' }}>
                Realistic interior photograph. Inspect physical objects and report irregularities.
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isRoomFinished ? (
              <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} />
                <span>Zone Certified Complete</span>
              </span>
            ) : (
              <span className="badge badge-copper" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Eye size={13} />
                <span>Inspection in Progress</span>
              </span>
            )}
          </div>
        </div>

        {/* Photographic Room Stage with Responsive Hotspot Layer */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '2px solid #2E3839',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            backgroundColor: '#0F1314',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '340px',
          }}
        >
          {/* High-Definition Photographic Scene */}
          <img
            src={selectedRoom.roomImage}
            alt={selectedRoom.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />

          {/* Instruction overlay when selecting objects */}
          {roomStep === 'select_object' && (
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(23, 59, 58, 0.95)',
                border: '1.5px solid #D49B65',
                borderRadius: '8px',
                padding: '6px 16px',
                color: '#FAF8F3',
                fontSize: '12px',
                fontWeight: 700,
                zIndex: 40,
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Eye size={15} color="#D49B65" />
              <span>Select the object or area you believe contains the irregularity:</span>
            </div>
          )}

          {/* Object Hotspots (Enabled during select_object or feedback) */}
          {selectedRoom.objects.map((obj) => {
            const isSelected = activeSelectedObjectId === obj.id;
            const { x, y, width = 14, height = 14 } = obj.hotspot;
            const canInteract = roomStep === 'select_object';

            return (
              <div
                key={obj.id}
                onClick={() => canInteract && handleSelectObject(obj)}
                tabIndex={canInteract ? 0 : -1}
                role="button"
                aria-label={`Inspect ${obj.label}`}
                title={obj.label}
                onKeyDown={(e) => {
                  if (canInteract && (e.key === 'Enter' || e.key === ' ')) {
                    handleSelectObject(obj);
                  }
                }}
                style={{
                  position: 'absolute',
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${width}%`,
                  height: `${height}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: canInteract ? 'pointer' : 'default',
                  zIndex: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  border: isSelected
                    ? '3px solid #D49B65'
                    : canInteract
                    ? '2px dashed rgba(250, 248, 243, 0.55)'
                    : 'none',
                  backgroundColor: isSelected
                    ? 'rgba(212, 155, 101, 0.25)'
                    : 'transparent',
                  boxShadow: isSelected
                    ? '0 0 16px rgba(212, 155, 101, 0.8)'
                    : 'none',
                  transition: 'all 0.15s ease',
                  outline: 'none',
                }}
              >
                {/* Visual Label or Selection Indicator */}
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-28px',
                      backgroundColor: 'rgba(23, 59, 58, 0.95)',
                      border: '1px solid #D49B65',
                      borderRadius: '4px',
                      padding: '3px 8px',
                      color: '#FAF8F3',
                      fontSize: '11px',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                    }}
                  >
                    Selected: {obj.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Interaction Panel (Strict Sequence) */}
        <div
          style={{
            marginTop: '10px',
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #E5E0D5',
            borderRadius: '10px',
            padding: '14px 20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          }}
        >
          {/* STEP A: Yes / No Observation Question */}
          {roomStep === 'inspect_prompt' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
              }}
            >
              <div>
                <span className="badge badge-copper" style={{ marginBottom: '4px' }}>
                  Step 1: Observation Assessment
                </span>
                <h3 style={{ fontSize: '15.5px', color: '#173B3A', margin: 0 }}>
                  {selectedRoom.promptQuestion}
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#68716D' }}>
                  Inspect the physical room photograph and indicate your operational finding.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Radio Button Options */}
                <button
                  onClick={() => setSelectedYesNo(true)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    border: selectedYesNo === true ? '2px solid #B87955' : '1.5px solid #CBD5D1',
                    backgroundColor: selectedYesNo === true ? '#F7EFEA' : '#FFFFFF',
                    color: selectedYesNo === true ? '#B87955' : '#242C2D',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Yes — Irregularity Observed
                </button>

                <button
                  onClick={() => setSelectedYesNo(false)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    border: selectedYesNo === false ? '2px solid #173B3A' : '1.5px solid #CBD5D1',
                    backgroundColor: selectedYesNo === false ? '#EAF3EE' : '#FFFFFF',
                    color: selectedYesNo === false ? '#173B3A' : '#242C2D',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  No — Room Compliant
                </button>

                {/* Submit Observation (Disabled until choice made!) */}
                <button
                  onClick={handleSubmitYesNo}
                  disabled={selectedYesNo === null}
                  className="btn btn-primary btn-sm"
                  style={{
                    padding: '9px 20px',
                    fontWeight: 700,
                    opacity: selectedYesNo !== null ? 1 : 0.5,
                    cursor: selectedYesNo !== null ? 'pointer' : 'not-allowed',
                  }}
                >
                  <span>Submit Observation</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP B: Identify Faulty Object */}
          {roomStep === 'select_object' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <span className="badge badge-copper" style={{ marginBottom: '4px' }}>
                  Step 2: Object-Level Identification
                </span>
                <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#173B3A' }}>
                  {activeSelectedObjectId && selectedObj ? (
                    <span>
                      Target Selected: <strong style={{ color: '#B87955' }}>{selectedObj.label}</strong>
                    </span>
                  ) : (
                    <span>Click on the physical object or area in the photograph above to select it</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setRoomStep('inspect_prompt')}
                  className="btn btn-secondary btn-sm"
                >
                  <span>Change Yes/No Answer</span>
                </button>

                <button
                  onClick={handleProceedToReport}
                  disabled={!activeSelectedObjectId}
                  className="btn btn-accent btn-sm"
                  style={{
                    padding: '8px 20px',
                    fontWeight: 700,
                    opacity: activeSelectedObjectId ? 1 : 0.45,
                    cursor: activeSelectedObjectId ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <FileText size={15} />
                  <span>File Incident Report</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP C: Incident Reporting Form */}
          {roomStep === 'file_report' && (
            <div className="animate-fade-in">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  borderBottom: '1px solid #E5E0D5',
                  paddingBottom: '8px',
                }}
              >
                <div>
                  <span className="badge badge-copper" style={{ marginBottom: '2px' }}>
                    Step 3: Official Incident Report
                  </span>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: '#173B3A' }}>
                    Filing Log for: {selectedRoom.name} — {selectedObj?.label}
                  </div>
                </div>

                <button
                  onClick={() => setRoomStep('select_object')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '12px' }}
                >
                  Cancel / Select Different Object
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  marginBottom: '10px',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: '#242C2D',
                      marginBottom: '4px',
                    }}
                  >
                    Incident Category
                  </label>
                  <select
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1.5px solid #CBD5D1',
                      fontSize: '12.5px',
                      backgroundColor: '#FFFFFF',
                      color: '#173B3A',
                      fontWeight: 600,
                    }}
                  >
                    <option value="physical-security">Physical Security & Unauthorized Access</option>
                    <option value="information-security">Information Security & Clean Desk</option>
                    <option value="safety">Occupational Safety & Walkway Hazards</option>
                    <option value="egress">Life Safety & Egress Obstruction</option>
                    <option value="compliance">Regulatory Compliance / Equipment Fault</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: '#242C2D',
                      marginBottom: '4px',
                    }}
                  >
                    Severity Classification
                  </label>
                  <select
                    value={activeSeverity}
                    onChange={(e) =>
                      setActiveSeverity(e.target.value as 'low' | 'medium' | 'high' | 'critical')
                    }
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1.5px solid #CBD5D1',
                      fontSize: '12.5px',
                      backgroundColor: '#FFFFFF',
                      color: '#173B3A',
                      fontWeight: 600,
                    }}
                  >
                    <option value="critical">Critical (Immediate life safety / breach)</option>
                    <option value="high">High (Major protocol violation)</option>
                    <option value="medium">Medium (Hazard requiring prompt action)</option>
                    <option value="low">Low (Routine maintenance)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#242C2D',
                    marginBottom: '4px',
                  }}
                >
                  Officer Observation Notes
                </label>
                <input
                  type="text"
                  value={activeDescription}
                  onChange={(e) => setActiveDescription(e.target.value)}
                  placeholder="Enter brief description of observed condition..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1.5px solid #CBD5D1',
                    fontSize: '12.5px',
                    backgroundColor: '#FAF8F3',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  onClick={handleSubmitReport}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '8px 24px', fontWeight: 700 }}
                >
                  <CheckCircle2 size={15} />
                  <span>Submit Incident Report</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP D: Feedback & Resolution */}
          {roomStep === 'feedback' && activeFeedback && (
            <div className="animate-fade-in">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {activeFeedback.isCorrect ? (
                    <>
                      <CheckCircle2 size={20} color="#387A5A" />
                      <span style={{ fontWeight: 800, color: '#387A5A', fontSize: '15px' }}>
                        {activeFeedback.title}
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle size={20} color="#B44D45" />
                      <span style={{ fontWeight: 800, color: '#B44D45', fontSize: '15px' }}>
                        {activeFeedback.title}
                      </span>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {!activeFeedback.isCorrect ? (
                    <button
                      onClick={handleRetryRoom}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 14px', fontWeight: 700 }}
                    >
                      <RotateCcw size={14} />
                      <span>Re-inspect Zone</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleReturnToBuilding}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '6px 16px', fontWeight: 700 }}
                    >
                      <span>Return to Building Facade</span>
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>

              <p style={{ margin: '0 0 8px', fontSize: '13.5px', color: '#242C2D', lineHeight: 1.5 }}>
                {activeFeedback.message}
              </p>

              {activeFeedback.whyItMatters && (
                <div
                  style={{
                    backgroundColor: '#FAF8F3',
                    borderLeft: '3px solid #B87955',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#68716D',
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ color: '#173B3A' }}>Operational Context: </strong>
                  {activeFeedback.whyItMatters}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ==========================================================================
     STAGE 4: ACTIVITY CERTIFICATION SUMMARY (All 6 Zones Complete)
     ========================================================================== */
  return (
    <div
      style={{
        padding: '36px 40px',
        maxWidth: '780px',
        margin: '0 auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
      className="animate-fade-in"
    >
      <div
        style={{
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          backgroundColor: '#EAF3EE',
          border: '3px solid #387A5A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 8px 24px rgba(56, 122, 90, 0.25)',
        }}
      >
        <Award size={42} color="#387A5A" />
      </div>

      <span className="badge badge-success" style={{ marginBottom: '8px' }}>
        FACILITY 04 OFFICIALLY CERTIFIED
      </span>

      <h2 style={{ fontSize: '28px', color: '#173B3A', marginBottom: '8px', fontWeight: 800 }}>
        Inspection Activity Complete!
      </h2>

      <p
        style={{
          color: '#68716D',
          fontSize: '15px',
          maxWidth: '620px',
          lineHeight: 1.6,
          marginBottom: '24px',
        }}
      >
        Outstanding vigilance, Officer! You have successfully completed active inspections across all
        6 facility zones, pinpointed every physical and informational irregularity, and logged verified reports.
      </p>

      {/* Observation Score Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          width: '100%',
          maxWidth: '560px',
          marginBottom: '28px',
        }}
      >
        <div
          style={{
            backgroundColor: '#FAF8F3',
            border: '1px solid #E5E0D5',
            borderRadius: '10px',
            padding: '16px',
          }}
        >
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#173B3A' }}>
            {completedRoomIds.length} / {scenario.rooms.length}
          </div>
          <div style={{ fontSize: '11px', color: '#68716D', marginTop: '2px' }}>
            Zones Certified
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FAF8F3',
            border: '1px solid #E5E0D5',
            borderRadius: '10px',
            padding: '16px',
          }}
        >
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#B87955' }}>
            {Object.keys(submittedReports).length}
          </div>
          <div style={{ fontSize: '11px', color: '#68716D', marginTop: '2px' }}>
            Incidents Filed
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FAF8F3',
            border: '1px solid #E5E0D5',
            borderRadius: '10px',
            padding: '16px',
          }}
        >
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#387A5A' }}>
            100%
          </div>
          <div style={{ fontSize: '11px', color: '#68716D', marginTop: '2px' }}>
            Patrol Coverage
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '14px' }}>
        <button
          onClick={() => setStage('building')}
          className="btn btn-secondary"
          style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RotateCcw size={16} />
          <span>Review Building Zones</span>
        </button>

        <button
          onClick={() => {
            if (onActivityComplete) {
              onActivityComplete();
            }
          }}
          className="btn btn-primary"
          style={{
            padding: '10px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 700,
          }}
        >
          <span>Continue to Lesson Summary</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
