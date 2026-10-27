import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Lock,
  Clock,
} from 'lucide-react';
import { Slide } from '../../../types';
import { AudioNarrationPlayer } from '../../../components/common/AudioNarrationPlayer';

interface PlayerControlsProps {
  currentSlide: Slide;
  slideIndex: number;
  totalSlides: number;
  isPlaying: boolean;
  onTogglePlay: (playing: boolean) => void;
  onPrevious: () => void;
  onNext: () => void;
  onRestart: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  elapsedSeconds: number;
  requiredDurationSeconds: number;
  isSlideComplete: boolean;
  onNarrationFinished?: () => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  currentSlide,
  slideIndex,
  totalSlides,
  isPlaying,
  onTogglePlay,
  onPrevious,
  onNext,
  onRestart,
  canGoPrevious,
  canGoNext,
  elapsedSeconds,
  requiredDurationSeconds,
  isSlideComplete,
  onNarrationFinished,
}) => {
  // Timer completion percentage
  const timerPct =
    requiredDurationSeconds > 0
      ? Math.min(100, Math.round((elapsedSeconds / requiredDurationSeconds) * 100))
      : 100;

  return (
    <footer
      className="player-controls-footer"
      style={{
        height: 'var(--player-control-height)',
        backgroundColor: '#181E1F',
        borderTop: '1px solid #2E3839',
        color: '#F5F2EA',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        zIndex: 20,
        flexShrink: 0,
      }}
    >
      {/* Left: Audio Narration & Restart Control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onRestart}
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            backgroundColor: '#242C2D',
            color: '#DDE5D7',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 600,
          }}
          title="Restart Lesson from Slide 1"
        >
          <RotateCcw size={14} />
          <span className="d-sm-inline">Restart</span>
        </button>

        {/* Audio Narration Player */}
        <AudioNarrationPlayer
          narrationText={currentSlide.narrationText}
          audioUrl={currentSlide.audioUrl}
          isPlaying={isPlaying}
          onTogglePlay={onTogglePlay}
          onFinished={onNarrationFinished}
        />
      </div>

      {/* Center: Slide Timer & Completion Status Badge */}
      <div
        className="player-controls-center"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          maxWidth: '360px',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#A3AFAC' }}>
          <span>Slide {slideIndex + 1} of {totalSlides}</span>
          <span>•</span>
          {isSlideComplete ? (
            <span style={{ color: '#387A5A', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
              <CheckCircle2 size={12} />
              <span>Complete</span>
            </span>
          ) : requiredDurationSeconds > 0 ? (
            <span style={{ color: '#D49B65', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
              <Clock size={12} />
              <span>{Math.max(0, requiredDurationSeconds - elapsedSeconds)}s remaining</span>
            </span>
          ) : currentSlide.type === 'room-inspection' ? (
            <span style={{ color: '#D49B65', fontWeight: 600 }}>
              Complete all required room inspections and incident reports to continue
            </span>
          ) : (
            <span style={{ color: '#B87955', fontWeight: 600 }}>
              Interaction required to proceed
            </span>
          )}
        </div>

        {/* Timer Bar */}
        {requiredDurationSeconds > 0 && (
          <div
            style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#2E3839',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${timerPct}%`,
                backgroundColor: isSlideComplete ? '#387A5A' : '#D49B65',
                transition: 'width 0.25s linear',
              }}
            />
          </div>
        )}
      </div>

      {/* Right: Previous & Next Controls (Strictly Enforced!) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          style={{
            padding: '8px 14px',
            borderRadius: '6px',
            backgroundColor: '#242C2D',
            color: canGoPrevious ? '#FAF8F3' : '#68716D',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 600,
            opacity: canGoPrevious ? 1 : 0.45,
            cursor: canGoPrevious ? 'pointer' : 'not-allowed',
          }}
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        <button
          onClick={onNext}
          disabled={!canGoNext}
          style={{
            padding: '8px 18px',
            borderRadius: '6px',
            backgroundColor: canGoNext ? '#B87955' : '#2C3537',
            color: canGoNext ? '#FFFFFF' : '#68716D',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 700,
            boxShadow: canGoNext ? '0 2px 6px rgba(184, 121, 85, 0.3)' : 'none',
            cursor: canGoNext ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s ease',
          }}
          title={
            !canGoNext
              ? currentSlide.type === 'room-inspection'
                ? 'Complete all required room inspections and incident reports to continue'
                : 'Satisfy slide completion requirement to advance'
              : 'Next Slide'
          }
        >
          <span>Next</span>
          {canGoNext ? <ChevronRight size={16} /> : <Lock size={13} color="#68716D" />}
        </button>
      </div>
    </footer>
  );
};
