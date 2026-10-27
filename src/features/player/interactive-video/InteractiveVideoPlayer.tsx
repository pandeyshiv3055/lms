import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  ChevronRight,
  Shield,
  Clock,
  Sparkles,
  FileText,
} from 'lucide-react';
import {
  InteractiveVideoData,
  VideoCheckpoint,
  InteractiveVideoProgress,
  LearningActivityResult,
} from '../../../types';
import { trackingService } from '../../../services/tracking.service';
import { authService } from '../../../services/auth.service';

interface InteractiveVideoPlayerProps {
  data: InteractiveVideoData;
  savedProgress?: InteractiveVideoProgress;
  onUpdateProgress?: (progress: InteractiveVideoProgress) => void;
  onComplete?: (result: LearningActivityResult) => void;
}

export const InteractiveVideoPlayer: React.FC<InteractiveVideoPlayerProps> = ({
  data,
  savedProgress,
  onUpdateProgress,
  onComplete,
}) => {
  const user = authService.getCurrentUser();
  const userName = user?.name || 'Officer Learner';
  const userEmail = user?.email || 'learner@aegis-defense.com';

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(data.durationSeconds || 30);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Checkpoint & Review State
  const [completedCheckpoints, setCompletedCheckpoints] = useState<string[]>(
    savedProgress?.completedCheckpointIds || []
  );
  const [activeCheckpoint, setActiveCheckpoint] = useState<VideoCheckpoint | null>(null);
  const [activeReviewCheckpoint, setActiveReviewCheckpoint] = useState<VideoCheckpoint | null>(null);
  const [maxWatchedTime, setMaxWatchedTime] = useState<number>(
    savedProgress?.maxWatchedTimeSeconds || 0
  );

  // Question Interaction State
  const [selectedOption, setSelectedOption] = useState<string | string[] | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [questionFeedback, setQuestionFeedback] = useState<{
    isCorrect: boolean;
    explanation: string;
    hint?: string;
  } | null>(null);
  const [attempts, setAttempts] = useState<Record<string, number>>(
    savedProgress?.checkpointAttempts || {}
  );
  const [showTranscript, setShowTranscript] = useState<boolean>(false);

  // Sort checkpoints chronologically
  const sortedCheckpoints = [...data.checkpoints].sort(
    (a, b) => a.timestampSeconds - b.timestampSeconds
  );

  // Earliest unresolved checkpoint determines how far the user can seek
  const earliestUnresolvedCheckpoint = sortedCheckpoints.find(
    (c) => !completedCheckpoints.includes(c.id)
  );
  const seekableLimit = earliestUnresolvedCheckpoint
    ? earliestUnresolvedCheckpoint.timestampSeconds
    : duration;

  // Track tab visibility to pause playback when hidden
  const wasPlayingBeforeTabHidden = useRef<boolean>(false);
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        if (videoRef.current && !videoRef.current.paused) {
          wasPlayingBeforeTabHidden.current = true;
          videoRef.current.pause();
          setIsPlaying(false);
        } else {
          wasPlayingBeforeTabHidden.current = false;
        }
      } else {
        if (wasPlayingBeforeTabHidden.current && !activeCheckpoint && videoRef.current) {
          videoRef.current.play().catch(() => { });
          setIsPlaying(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [activeCheckpoint]);

  // Initial tracking
  useEffect(() => {
    trackingService.trackActivity(
      userName,
      userEmail,
      'experienced',
      data.id,
      data.title,
      'interactive_video'
    );
  }, [data.id, data.title, userName, userEmail]);

  // Handle Video Time Update
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // Track max watched time
    if (time > maxWatchedTime) {
      setMaxWatchedTime(time);
    }

    // A. Review segment enforcement
    if (activeReviewCheckpoint) {
      // If user reached the end of the mandatory review segment:
      if (time >= activeReviewCheckpoint.reviewEndSeconds) {
        videoRef.current.pause();
        setIsPlaying(false);
        // Review segment complete: re-open question for new attempt!
        const ckpt = activeReviewCheckpoint;
        setActiveReviewCheckpoint(null);
        setActiveCheckpoint(ckpt);
        setSelectedOption(null);
        setSelectedText('');
        setQuestionFeedback(null);
        return;
      }
      return;
    }

    // B. Normal playback checkpoint detection
    if (!activeCheckpoint) {
      // Find if we hit an unresolved checkpoint timestamp
      for (const checkpoint of sortedCheckpoints) {
        if (!completedCheckpoints.includes(checkpoint.id)) {
          // Check if video reached or just passed checkpoint timestamp
          if (time >= checkpoint.timestampSeconds - 0.25 && time <= checkpoint.timestampSeconds + 1.0) {
            videoRef.current.pause();
            videoRef.current.currentTime = checkpoint.timestampSeconds;
            setIsPlaying(false);
            setActiveCheckpoint(checkpoint);
            setSelectedOption(null);
            setSelectedText('');
            setQuestionFeedback(null);

            trackingService.trackActivity(
              userName,
              userEmail,
              'interacted',
              checkpoint.id,
              checkpoint.question.prompt,
              'question_checkpoint'
            );
            break;
          }
        }
      }
    }

    // C. Check for video completion
    if (time >= duration - 0.5 && completedCheckpoints.length === sortedCheckpoints.length) {
      handleCompleteVideo();
    }
  }, [
    activeCheckpoint,
    activeReviewCheckpoint,
    completedCheckpoints,
    duration,
    maxWatchedTime,
    sortedCheckpoints,
    userName,
    userEmail,
  ]);

  // Toggle Play / Pause
  const handleTogglePlay = () => {
    if (activeCheckpoint) return; // Cannot play while question is open!

    if (videoRef.current) {
      if (videoRef.current.paused) {
        // Prevent playing past unresolved checkpoint
        if (earliestUnresolvedCheckpoint && videoRef.current.currentTime >= earliestUnresolvedCheckpoint.timestampSeconds) {
          videoRef.current.currentTime = earliestUnresolvedCheckpoint.timestampSeconds;
          setActiveCheckpoint(earliestUnresolvedCheckpoint);
          return;
        }

        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn('Autoplay error:', err);
        });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // Seeking Guard (Clamps seeking past earliest unresolved checkpoint or during review)
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (!videoRef.current) return;

    if (activeReviewCheckpoint) {
      // During review, lock user within [reviewStartSeconds, reviewEndSeconds]
      if (targetTime < activeReviewCheckpoint.reviewStartSeconds || targetTime > activeReviewCheckpoint.reviewEndSeconds) {
        return;
      }
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
      return;
    }

    // Normal seeking: cannot seek past earliest unresolved checkpoint
    if (targetTime > seekableLimit) {
      videoRef.current.currentTime = seekableLimit;
      setCurrentTime(seekableLimit);
    } else {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  // Submit Answer to Active Checkpoint
  const handleSubmitAnswer = () => {
    if (!activeCheckpoint) return;

    const currentAttempt = (attempts[activeCheckpoint.id] || 0) + 1;
    const newAttempts = { ...attempts, [activeCheckpoint.id]: currentAttempt };
    setAttempts(newAttempts);

    const question = activeCheckpoint.question;
    let isCorrect = false;

    if (question.type === 'single-choice' || question.type === 'true-false') {
      isCorrect = selectedOption === question.correctAnswer;
    } else if (question.type === 'multiple-select') {
      const correctArr = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [question.correctAnswer];
      const selectedArr = Array.isArray(selectedOption) ? selectedOption : [];
      isCorrect =
        correctArr.length === selectedArr.length &&
        correctArr.every((id) => selectedArr.includes(id));
    } else if (question.type === 'short-text') {
      isCorrect = selectedText.trim().toLowerCase().length >= 3;
    }

    // Log tracking
    trackingService.trackActivity(
      userName,
      userEmail,
      'answered',
      activeCheckpoint.id,
      question.prompt,
      'question_response',
      {
        success: isCorrect,
        rawScore: isCorrect ? activeCheckpoint.scoreWeight : 0,
        response: String(selectedOption || selectedText),
      }
    );

    if (isCorrect) {
      // SUCCESS! Mark checkpoint complete
      const newCompleted = Array.from(new Set([...completedCheckpoints, activeCheckpoint.id]));
      setCompletedCheckpoints(newCompleted);

      setQuestionFeedback({
        isCorrect: true,
        explanation: question.explanation,
      });

      // Update progress
      if (onUpdateProgress) {
        onUpdateProgress({
          completedCheckpointIds: newCompleted,
          checkpointAnswers: { [activeCheckpoint.id]: selectedOption || selectedText },
          checkpointAttempts: newAttempts,
          maxWatchedTimeSeconds: maxWatchedTime,
          isComplete: newCompleted.length === sortedCheckpoints.length && currentTime >= duration - 1,
          score: Math.round((newCompleted.length / sortedCheckpoints.length) * 100),
        });
      }

      // Check if all complete
      if (newCompleted.length === sortedCheckpoints.length && currentTime >= duration - 1) {
        handleCompleteVideo();
      }
    } else {
      // INCORRECT! Mandatory review requirement
      setQuestionFeedback({
        isCorrect: false,
        explanation: `Incorrect observation. Review required: Re-watching the operational demonstration segment (${formatTime(activeCheckpoint.reviewStartSeconds)} - ${formatTime(activeCheckpoint.reviewEndSeconds)}) before retrying.`,
        hint: question.hint,
      });
    }
  };

  // Continue after correct answer
  const handleContinueAfterCorrect = () => {
    setActiveCheckpoint(null);
    setQuestionFeedback(null);
    setSelectedOption(null);

    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => { });
    }
  };

  // Initiate mandatory review replay
  const handleStartReview = () => {
    if (!activeCheckpoint) return;

    const ckpt = activeCheckpoint;
    setActiveCheckpoint(null);
    setActiveReviewCheckpoint(ckpt);
    setQuestionFeedback(null);

    if (videoRef.current) {
      videoRef.current.currentTime = ckpt.reviewStartSeconds;
      videoRef.current.playbackRate = 1.0; // Enforce normal speed
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => { });
    }
  };

  // Final Video Completion
  const handleCompleteVideo = () => {
    const totalScore = 100;
    trackingService.trackActivity(
      userName,
      userEmail,
      'completed',
      data.id,
      data.title,
      'interactive_video',
      { rawScore: totalScore, success: true }
    );

    trackingService.updateScormState(`lesson-interactive-video-${data.id}`, 'completed', totalScore);

    if (onComplete) {
      onComplete({
        activityId: data.id,
        activityType: 'interactive_video',
        completed: true,
        score: totalScore,
        attempts: 1,
        completedAt: new Date().toISOString(),
      });
    }
  };

  // Time formatter helper
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isAllCheckpointsDone = completedCheckpoints.length === sortedCheckpoints.length;

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0F1314',
        position: 'relative',
        color: '#FAF8F3',
        overflow: 'hidden',
      }}
      className="animate-fade-in"
    >
      {/* Top Header Overlay Bar */}
      <div
        style={{
          padding: '12px 20px',
          backgroundColor: 'rgba(23, 35, 33, 0.95)',
          borderBottom: '1px solid #2E3839',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 25,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              padding: '6px',
              borderRadius: '6px',
              backgroundColor: '#173B3A',
              border: '1px solid #B87955',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield size={16} color="#D49B65" />
          </div>

          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#FAF8F3' }}>
              Level 1: {data.title}
            </div>
            <div style={{ fontSize: '11px', color: '#A3AFAC' }}>
              Mandatory Checkpoint Evaluation & Anti-Skip Replay Protection
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Progress Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1C2626',
              border: '1px solid #2E3839',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 700,
              color: isAllCheckpointsDone ? '#387A5A' : '#D49B65',
            }}
          >
            {isAllCheckpointsDone ? (
              <CheckCircle2 size={14} color="#387A5A" />
            ) : (
              <Clock size={14} color="#D49B65" />
            )}
            <span>
              Checkpoints: {completedCheckpoints.length} / {sortedCheckpoints.length} Resolved
            </span>
          </div>

          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 10px', fontSize: '11px' }}
          >
            <FileText size={13} />
            <span>Transcript</span>
          </button>
        </div>
      </div>

      {/* Main Video Viewport & Overlay Stage */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          backgroundColor: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <video
          ref={videoRef}
          src={data.videoUrl}
          poster={data.posterUrl}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration || data.durationSeconds);
            }
          }}
          onEnded={handleCompleteVideo}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            maxHeight: 'calc(100vh - 180px)',
          }}
        />

        {/* Mandatory Review Segment Watermark Banner */}
        {activeReviewCheckpoint && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(180, 77, 69, 0.95)',
              border: '1.5px solid #FAF8F3',
              borderRadius: '8px',
              padding: '8px 20px',
              color: '#FAF8F3',
              fontSize: '13px',
              fontWeight: 800,
              zIndex: 40,
              boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertTriangle size={16} />
            <span>
              MANDATORY REVIEW SEGMENT ACTIVE ({formatTime(currentTime)} / {formatTime(activeReviewCheckpoint.reviewEndSeconds)}) — SEEKING LOCKED
            </span>
          </div>
        )}

        {/* Question Checkpoint Overlay Dialog (Paused state) */}
        {activeCheckpoint && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 24, 0.88)',
              backdropFilter: 'blur(6px)',
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}
            className="animate-fade-in"
          >
            <div
              style={{
                backgroundColor: '#1E2728',
                border: '2px solid #B87955',
                borderRadius: '12px',
                padding: '28px 32px',
                maxWidth: '680px',
                width: '100%',
                boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
              }}
            >
              {/* Checkpoint Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-copper">
                    CHECKPOINT AT {formatTime(activeCheckpoint.timestampSeconds)}
                  </span>
                  <span style={{ fontSize: '12px', color: '#A3AFAC' }}>
                    Attempt {attempts[activeCheckpoint.id] || 1}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: '#D49B65', fontWeight: 700 }}>
                  Weight: {activeCheckpoint.scoreWeight} Points
                </div>
              </div>

              {/* Question Prompt */}
              <h3 style={{ fontSize: '18px', color: '#FAF8F3', marginBottom: '20px', lineHeight: 1.5 }}>
                {activeCheckpoint.question.prompt}
              </h3>

              {/* Question Options */}
              {!questionFeedback ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  {activeCheckpoint.question.options.map((opt) => {
                    const isSelected = selectedOption === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedOption(opt.id)}
                        style={{
                          textAlign: 'left',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid #D49B65' : '1.5px solid #2E3839',
                          backgroundColor: isSelected ? 'rgba(212, 155, 101, 0.2)' : '#172223',
                          color: '#FAF8F3',
                          fontSize: '14px',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: isSelected ? '6px solid #D49B65' : '2px solid #68716D',
                            backgroundColor: '#1E2728',
                            flexShrink: 0,
                          }}
                        />
                        <span>{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Feedback View after submission */
                <div style={{ marginBottom: '24px' }}>
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      backgroundColor: questionFeedback.isCorrect
                        ? 'rgba(56, 122, 90, 0.2)'
                        : 'rgba(180, 77, 69, 0.2)',
                      border: `1.5px solid ${questionFeedback.isCorrect ? '#387A5A' : '#B44D45'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {questionFeedback.isCorrect ? (
                        <>
                          <CheckCircle2 size={20} color="#387A5A" />
                          <strong style={{ color: '#9DC7B0', fontSize: '15px' }}>
                            Correct Observation!
                          </strong>
                        </>
                      ) : (
                        <>
                          <XCircle size={20} color="#B44D45" />
                          <strong style={{ color: '#E59892', fontSize: '15px' }}>
                            Observation Needs Review
                          </strong>
                        </>
                      )}
                    </div>

                    <p style={{ margin: 0, fontSize: '13.5px', color: '#FAF8F3', lineHeight: 1.5 }}>
                      {questionFeedback.explanation}
                    </p>

                    {questionFeedback.hint && (
                      <div style={{ fontSize: '12px', color: '#D49B65', fontStyle: 'italic' }}>
                        Hint: {questionFeedback.hint}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                {!questionFeedback ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedOption}
                    className="btn btn-primary"
                    style={{
                      padding: '10px 24px',
                      fontWeight: 700,
                      opacity: selectedOption ? 1 : 0.45,
                      cursor: selectedOption ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <span>Submit Answer</span>
                    <ChevronRight size={16} />
                  </button>
                ) : questionFeedback.isCorrect ? (
                  <button
                    onClick={handleContinueAfterCorrect}
                    className="btn btn-primary"
                    style={{ padding: '10px 28px', fontWeight: 700 }}
                  >
                    <span>Continue Video Playback</span>
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleStartReview}
                    className="btn btn-accent"
                    style={{
                      padding: '10px 24px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <RotateCcw size={16} />
                    <span>Replay Review Segment & Retry</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Transcript Drawer */}
        {showTranscript && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '320px',
              backgroundColor: 'rgba(23, 35, 33, 0.96)',
              borderLeft: '1px solid #2E3839',
              padding: '20px',
              overflowY: 'auto',
              zIndex: 35,
            }}
            className="animate-fade-in"
          >
            <div style={{ fontWeight: 800, fontSize: '14px', color: '#D49B65', marginBottom: '8px' }}>
              Video Transcript & Closed Captions
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#FAF8F3' }}>
              {data.transcriptText || 'No transcript available.'}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Custom Playback Bar */}
      <div
        style={{
          padding: '12px 20px',
          backgroundColor: '#181E1F',
          borderTop: '1px solid #2E3839',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 25,
        }}
      >
        {/* Progress Bar with Checkpoint Pins */}
        <div style={{ position: 'relative', width: '100%', height: '18px', display: 'flex', alignItems: 'center' }}>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            disabled={!!activeCheckpoint}
            style={{
              width: '100%',
              accentColor: activeReviewCheckpoint ? '#B44D45' : '#D49B65',
              cursor: activeCheckpoint ? 'not-allowed' : 'pointer',
              zIndex: 10,
            }}
          />

          {/* Render Checkpoint Markers on the Progress Bar */}
          {sortedCheckpoints.map((ckpt) => {
            const isResolved = completedCheckpoints.includes(ckpt.id);
            const pct = (ckpt.timestampSeconds / duration) * 100;

            return (
              <div
                key={ckpt.id}
                title={`Checkpoint at ${formatTime(ckpt.timestampSeconds)}: ${ckpt.question.prompt}`}
                style={{
                  position: 'absolute',
                  left: `${pct}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: isResolved ? '#387A5A' : '#D49B65',
                  border: '2px solid #FAF8F3',
                  boxShadow: '0 0 6px rgba(0,0,0,0.6)',
                  pointerEvents: 'none',
                  zIndex: 15,
                }}
              />
            );
          })}
        </div>

        {/* Player Controls Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={handleTogglePlay}
              disabled={!!activeCheckpoint}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#242C2D',
                border: '1px solid #3A4A4C',
                color: '#FAF8F3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: activeCheckpoint ? 'not-allowed' : 'pointer',
              }}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} fill="#FFF" />}
            </button>

            {/* Time Stamp Display */}
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#DDE5D7' }}>
              <span>{formatTime(currentTime)}</span>
              <span style={{ margin: '0 4px', color: '#68716D' }}>/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Audio Mute Control */}
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.muted = !isMuted;
                  setIsMuted(!isMuted);
                }
              }}
              style={{ background: 'none', border: 'none', color: '#DDE5D7', cursor: 'pointer' }}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => {
                if (containerRef.current) {
                  if (document.fullscreenElement) {
                    document.exitFullscreen();
                  } else {
                    containerRef.current.requestFullscreen();
                  }
                }
              }}
              style={{ background: 'none', border: 'none', color: '#DDE5D7', cursor: 'pointer' }}
              title="Fullscreen"
            >
              <Maximize size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
