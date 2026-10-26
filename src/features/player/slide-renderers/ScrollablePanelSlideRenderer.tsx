import React, { useRef, useEffect, useState } from 'react';
import { Slide, ScrollablePanelData } from '../../../types';
import { ShieldAlert, CheckCircle2, Scale, ArrowDown } from 'lucide-react';

interface ScrollablePanelSlideRendererProps {
  slide: Slide;
  savedScrollPosition?: number;
  onUpdateScrollPosition?: (scrollPos: number) => void;
  onInteractionComplete?: () => void;
}

export const ScrollablePanelSlideRenderer: React.FC<ScrollablePanelSlideRendererProps> = ({
  slide,
  savedScrollPosition = 0,
  onUpdateScrollPosition,
  onInteractionComplete,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const data: ScrollablePanelData | undefined = slide.content.scrollablePanel;
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  // Restore scroll position
  useEffect(() => {
    if (panelRef.current && savedScrollPosition > 0) {
      panelRef.current.scrollTop = savedScrollPosition;
    }
  }, [savedScrollPosition]);

  // Monitor scrolling to bottom to satisfy reading prerequisite
  const handleScroll = () => {
    if (!panelRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = panelRef.current;

    if (onUpdateScrollPosition) {
      onUpdateScrollPosition(scrollTop);
    }

    // Check if scrolled near bottom (within 20px)
    if (scrollTop + clientHeight >= scrollHeight - 25) {
      if (!hasScrolledToBottom) {
        setHasScrolledToBottom(true);
        if (onInteractionComplete) {
          onInteractionComplete();
        }
      }
    }
  };

  // If content is short enough that scrolling is not needed, complete immediately
  useEffect(() => {
    if (panelRef.current) {
      const { scrollHeight, clientHeight } = panelRef.current;
      if (scrollHeight <= clientHeight + 10) {
        setHasScrolledToBottom(true);
        if (onInteractionComplete) {
          onInteractionComplete();
        }
      }
    }
  }, [onInteractionComplete]);

  if (!data) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '28px',
        padding: '28px 36px',
        height: '100%',
        alignItems: 'stretch',
      }}
      className="animate-fade-in"
    >
      {/* Left Column: Visual Emblem & Legal Seal */}
      <div
        style={{
          flex: '0 0 300px',
          backgroundColor: '#FAF8F3',
          border: '1.5px solid #E5E0D5',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            backgroundColor: '#173B3A',
            border: '3px solid #B87955',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          <Scale size={44} color="#D49B65" />
        </div>

        <h3 style={{ fontSize: '18px', color: '#173B3A', marginBottom: '6px' }}>
          Statutory Directives
        </h3>
        <p style={{ fontSize: '13px', color: '#68716D', lineHeight: 1.5, margin: '0 0 16px' }}>
          Official rules of engagement, property owner delegation, and constitutional boundaries.
        </p>

        {hasScrolledToBottom ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: '#EAF3EE',
              border: '1px solid #9DC7B0',
              color: '#387A5A',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            <CheckCircle2 size={14} />
            <span>Reading Requirement Met</span>
          </div>
        ) : (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '999px',
              backgroundColor: '#FCF5E9',
              border: '1px solid #F0D09B',
              color: '#B87955',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <ArrowDown size={14} />
            <span>Scroll panel to complete</span>
          </div>
        )}
      </div>

      {/* Right Column: Independently Scrollable Legal Panel */}
      <div
        style={{
          flex: 1,
          minWidth: '340px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FFFFFF',
          border: '1.5px solid #E5E0D5',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
        }}
      >
        {/* Panel Header */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#173B3A',
            color: '#F5F2EA',
            borderBottom: '1px solid #215150',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px' }}>
            <ShieldAlert size={16} color="#D49B65" />
            <span>{data.panelTitle}</span>
          </div>
          <span style={{ fontSize: '11px', color: '#DDE5D7' }}>Scrollable Directive</span>
        </div>

        {/* Scrollable Container with Custom Scrollbar */}
        <div
          ref={panelRef}
          onScroll={handleScroll}
          tabIndex={0}
          aria-label="Legal directives text panel"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 28px',
            color: '#242C2D',
            fontSize: '14.5px',
            lineHeight: 1.7,
            maxHeight: '360px',
          }}
        >
          {data.paragraphs.map((para, i) => (
            <p key={i} style={{ marginBottom: '16px' }}>
              {para}
            </p>
          ))}

          {data.keyDirectives && data.keyDirectives.length > 0 && (
            <div
              style={{
                backgroundColor: '#FAF8F3',
                border: '1px solid #E5E0D5',
                borderRadius: '8px',
                padding: '16px',
                marginTop: '20px',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '12px', color: '#173B3A', marginBottom: '8px', textTransform: 'uppercase' }}>
                Summary Requirements:
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', lineHeight: 1.6 }}>
                {data.keyDirectives.map((d, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{d}</li>
                ))}
              </ul>
            </div>
          )}

          <div
            style={{
              paddingTop: '20px',
              textAlign: 'center',
              fontSize: '12px',
              color: '#387A5A',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <CheckCircle2 size={16} />
            <span>End of Official Directive Document (Verified)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
