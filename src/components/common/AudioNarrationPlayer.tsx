import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, FileText, ChevronUp, ChevronDown } from 'lucide-react';

interface AudioNarrationPlayerProps {
  narrationText?: string;
  audioUrl?: string;
  isPlaying: boolean;
  onTogglePlay: (playing: boolean) => void;
  onFinished?: () => void;
  onProgress?: (elapsed: number, duration: number) => void;
  requireNarrationFinish?: boolean;
}

export const AudioNarrationPlayer: React.FC<AudioNarrationPlayerProps> = ({
  narrationText,
  audioUrl,
  isPlaying,
  onTogglePlay,
  onFinished,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechActive, setSpeechActive] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      setSpeechSupported(true);
    }
  }, []);

  // Control speech synthesis based on isPlaying & isMuted
  useEffect(() => {
    if (!speechSupported || !synthRef.current || !narrationText) return;

    if (isPlaying && !isMuted) {
      synthRef.current.cancel(); // Stop prior speech
      const utterance = new SpeechSynthesisUtterance(narrationText);
      utterance.rate = 0.95; // Clear presentation pacing
      utterance.pitch = 1.0;

      utterance.onstart = () => setSpeechActive(true);
      utterance.onend = () => {
        setSpeechActive(false);
        if (onFinished) onFinished();
      };
      utterance.onerror = () => {
        setSpeechActive(false);
      };

      utterRef.current = utterance;
      try {
        synthRef.current.speak(utterance);
      } catch (e) {
        setSpeechActive(false);
      }
    } else {
      if (synthRef.current.speaking) {
        synthRef.current.cancel();
      }
      setSpeechActive(false);
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [isPlaying, isMuted, narrationText, speechSupported, onFinished]);

  if (!narrationText && !audioUrl) {
    return null;
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#1E2829',
        border: '1px solid #38484A',
        borderRadius: '6px',
        padding: '4px 10px',
        position: 'relative',
      }}
    >
      {/* Speech Audio Active Indicator / Waveform */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          height: '14px',
          marginRight: '4px',
        }}
        title={speechActive ? 'Instructor Narration Active' : 'Narration Paused'}
      >
        <div
          style={{
            width: '3px',
            height: speechActive ? '12px' : '4px',
            backgroundColor: speechActive ? '#387A5A' : '#68716D',
            borderRadius: '2px',
            transition: 'height 0.2s ease',
          }}
        />
        <div
          style={{
            width: '3px',
            height: speechActive ? '16px' : '6px',
            backgroundColor: speechActive ? '#387A5A' : '#68716D',
            borderRadius: '2px',
            transition: 'height 0.15s ease',
          }}
        />
        <div
          style={{
            width: '3px',
            height: speechActive ? '10px' : '4px',
            backgroundColor: speechActive ? '#387A5A' : '#68716D',
            borderRadius: '2px',
            transition: 'height 0.25s ease',
          }}
        />
      </div>

      {/* Narration Play/Pause button */}
      <button
        onClick={() => onTogglePlay(!isPlaying)}
        style={{
          color: isPlaying ? '#D49B65' : '#DDE5D7',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '12px',
          fontWeight: 600,
        }}
        aria-label={isPlaying ? 'Pause Narration' : 'Play Narration'}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        <span>{isPlaying ? 'Pause' : 'Play'}</span>
      </button>

      {/* Mute button */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        style={{
          color: isMuted ? '#B44D45' : '#A3AFAC',
          display: 'flex',
          alignItems: 'center',
          padding: '2px',
        }}
        aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        title={isMuted ? 'Unmute Narration' : 'Mute Narration'}
      >
        {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
      </button>

      {/* Transcript toggle */}
      <button
        onClick={() => setShowTranscript(!showTranscript)}
        style={{
          color: showTranscript ? '#D49B65' : '#A3AFAC',
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          fontSize: '11px',
          borderLeft: '1px solid #38484A',
          paddingLeft: '8px',
        }}
        aria-label="Toggle Script"
        title="View Narration Script"
      >
        <FileText size={13} />
        <span>Transcript</span>
        {showTranscript ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
      </button>

      {/* Transcript Popover */}
      {showTranscript && narrationText && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            right: 0,
            width: '320px',
            maxWidth: '90vw',
            backgroundColor: '#1C2527',
            border: '1px solid #485A5C',
            borderRadius: '8px',
            padding: '12px 14px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
            color: '#F5F2EA',
            fontSize: '12px',
            lineHeight: 1.5,
            zIndex: 100,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: '#D49B65',
              marginBottom: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Instructor Narration Transcript</span>
            <span style={{ fontSize: '10px', color: '#8E9995' }}>Read-Along</span>
          </div>
          <p style={{ margin: 0, color: '#DDE5D7' }}>{narrationText}</p>
        </div>
      )}
    </div>
  );
};
