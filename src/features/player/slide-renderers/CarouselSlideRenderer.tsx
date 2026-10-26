import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Shield } from 'lucide-react';
import { Slide, CarouselItem } from '../../../types';
import { PresenterBoard } from '../../../assets/illustrations/presenter-board';

interface CarouselSlideRendererProps {
  slide: Slide;
  savedInteractions?: { currentCarouselIndex?: number; exploredIndices?: number[] };
  onUpdateInteractions?: (interactions: Record<string, any>) => void;
  onInteractionComplete?: () => void;
}

export const CarouselSlideRenderer: React.FC<CarouselSlideRendererProps> = ({
  slide,
  savedInteractions,
  onUpdateInteractions,
  onInteractionComplete,
}) => {
  const items: CarouselItem[] = slide.content.carouselItems || [];

  const [currentIndex, setCurrentIndex] = useState<number>(
    savedInteractions?.currentCarouselIndex ?? 0
  );
  const [exploredIndices, setExploredIndices] = useState<number[]>(
    savedInteractions?.exploredIndices ?? [0]
  );

  // Mark current index as explored
  useEffect(() => {
    if (!exploredIndices.includes(currentIndex)) {
      const updated = [...exploredIndices, currentIndex];
      setExploredIndices(updated);

      if (onUpdateInteractions) {
        onUpdateInteractions({
          currentCarouselIndex: currentIndex,
          exploredIndices: updated,
        });
      }

      // Check if all items are explored
      if (items.length > 0 && updated.length >= items.length) {
        if (onInteractionComplete) {
          onInteractionComplete();
        }
      }
    } else {
      if (onUpdateInteractions) {
        onUpdateInteractions({
          currentCarouselIndex: currentIndex,
          exploredIndices,
        });
      }
    }
  }, [currentIndex, exploredIndices, items.length, onInteractionComplete, onUpdateInteractions]);

  // Initial check on load
  useEffect(() => {
    if (items.length > 0 && exploredIndices.length >= items.length) {
      if (onInteractionComplete) {
        onInteractionComplete();
      }
    }
  }, [items.length, exploredIndices.length, onInteractionComplete]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, items.length]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const currentItem = items[currentIndex];
  if (!currentItem) return null;

  const allExplored = items.length > 0 && exploredIndices.length >= items.length;

  return (
    <div
      style={{
        padding: '24px 32px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      className="animate-fade-in"
    >
      {/* Slide Top Headline & Instructions */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '24px', color: '#173B3A', margin: 0 }}>
            {slide.content.headline || slide.title}
          </h2>
          <p style={{ color: '#68716D', fontSize: '13px', margin: '2px 0 0' }}>
            Click the left and right arrows on the presentation board to explore all phases of the framework.
          </p>
        </div>

        {/* Exploration Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '999px',
            backgroundColor: allExplored ? '#EAF3EE' : '#FAF8F3',
            border: allExplored ? '1px solid #9DC7B0' : '1px solid #E5E0D5',
            fontSize: '12px',
            fontWeight: 600,
            color: allExplored ? '#387A5A' : '#B87955',
          }}
        >
          {allExplored ? (
            <>
              <CheckCircle2 size={14} color="#387A5A" />
              <span>All {items.length} Phases Explored (Next Unlocked)</span>
            </>
          ) : (
            <span>
              Explored {exploredIndices.length} of {items.length} items
            </span>
          )}
        </div>
      </div>

      {/* Main Interactive Stage with Presenter Figure & Board */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <PresenterBoard>
          {/* Board Header Ribbon */}
          <div
            style={{
              padding: '12px 20px',
              backgroundColor: '#173B3A',
              color: '#F5F2EA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #215150',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={16} color="#D49B65" />
              <span style={{ fontWeight: 700, fontSize: '13px', letterSpacing: '0.04em' }}>
                AEGIS OPERATIONAL DIRECTIVES • PHASE {currentIndex + 1} OF {items.length}
              </span>
            </div>

            {/* Indicator Dots */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {items.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: i === currentIndex ? '#D49B65' : 'rgba(255,255,255,0.25)',
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Board Main Canvas Content */}
          <div
            style={{
              flex: 1,
              padding: '24px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backgroundColor: '#FFFFFF',
            }}
          >
            <div>
              {currentItem.badgeText && (
                <span
                  className="badge badge-copper"
                  style={{ marginBottom: '10px' }}
                >
                  {currentItem.badgeText}
                </span>
              )}

              <h3
                style={{
                  fontSize: '20px',
                  color: '#173B3A',
                  marginBottom: '10px',
                  transition: 'opacity 0.2s ease',
                }}
              >
                {currentItem.title}
              </h3>

              <p
                style={{
                  color: '#242C2D',
                  fontSize: '14.5px',
                  lineHeight: 1.6,
                  marginBottom: '16px',
                }}
              >
                {currentItem.description}
              </p>

              {/* Key directives list */}
              {currentItem.keyPoints && currentItem.keyPoints.length > 0 && (
                <div
                  style={{
                    backgroundColor: '#FAF8F3',
                    border: '1px solid #E5E0D5',
                    borderRadius: '8px',
                    padding: '14px 18px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#173B3A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Standard Operating Procedure:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#242C2D', fontSize: '13px', lineHeight: 1.5 }}>
                    {currentItem.keyPoints.map((pt, idx) => (
                      <li key={idx} style={{ marginBottom: '3px' }}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Board Navigation Arrows at Bottom */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '1px solid #E5E0D5',
              }}
            >
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  backgroundColor: '#FAF8F3',
                  border: '1px solid #E5E0D5',
                  color: currentIndex === 0 ? '#CCC4B4' : '#173B3A',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                }}
                aria-label="Previous board item"
              >
                <ChevronLeft size={16} />
                <span>Previous Phase</span>
              </button>

              <span style={{ fontSize: '12px', color: '#68716D', fontWeight: 600 }}>
                {currentIndex + 1} / {items.length}
              </span>

              <button
                onClick={handleNext}
                disabled={currentIndex === items.length - 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  backgroundColor: currentIndex === items.length - 1 ? '#FAF8F3' : '#173B3A',
                  border: currentIndex === items.length - 1 ? '1px solid #E5E0D5' : '1px solid #173B3A',
                  color: currentIndex === items.length - 1 ? '#CCC4B4' : '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: currentIndex === items.length - 1 ? 'not-allowed' : 'pointer',
                }}
                aria-label="Next board item"
              >
                <span>Next Phase</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </PresenterBoard>
      </div>
    </div>
  );
};
