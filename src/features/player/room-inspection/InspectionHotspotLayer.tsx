import React, { useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { InspectionObject } from '../../../types';

export interface InspectionHotspotLayerProps {
  objects: InspectionObject[];
  activeSelectedObjectId: string | null;
  reportedObjectId?: string | null;
  isReportCorrect?: boolean;
  canSelect: boolean;
  onSelectObject: (obj: InspectionObject) => void;
  allowHover?: boolean;
}

export const InspectionHotspotLayer: React.FC<InspectionHotspotLayerProps> = ({
  objects,
  activeSelectedObjectId,
  reportedObjectId,
  isReportCorrect,
  canSelect,
  onSelectObject,
  allowHover = true,
}) => {
  // Localized hover and keyboard-focus states prevent parent re-renders on pointer movement
  const [hoveredObjectId, setHoveredObjectId] = useState<string | null>(null);
  const [focusedObjectId, setFocusedObjectId] = useState<string | null>(null);

  return (
    <div
      className="inspection-hotspots-overlay"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 25,
      }}
    >
      {objects.map((obj) => {
        const { x, y, width = 14, height = 14 } = obj.hotspot;
        const isSelected = activeSelectedObjectId === obj.id;
        const isReported = reportedObjectId === obj.id;
        const isHovered = allowHover && canSelect && hoveredObjectId === obj.id;
        const isFocused = canSelect && focusedObjectId === obj.id;
        const isInteractive = canSelect;

        // Visual state priority: Reported > Selected > Hovered/Focused > Default (Clean)
        let borderStyle = '2px solid transparent';
        let backgroundColor = 'transparent';
        let boxShadow = 'none';

        if (isReported) {
          if (isReportCorrect) {
            borderStyle = '2.5px solid #387A5A';
            backgroundColor = 'rgba(56, 122, 90, 0.22)';
            boxShadow = '0 0 14px rgba(56, 122, 90, 0.7)';
          } else {
            borderStyle = '2.5px solid #B44D45';
            backgroundColor = 'rgba(180, 77, 69, 0.22)';
            boxShadow = '0 0 14px rgba(180, 77, 69, 0.7)';
          }
        } else if (isSelected) {
          borderStyle = '3px solid #D49B65';
          backgroundColor = 'rgba(212, 155, 101, 0.26)';
          boxShadow = '0 0 16px rgba(212, 155, 101, 0.85)';
        } else if (isHovered || isFocused) {
          borderStyle = '2px solid rgba(212, 155, 101, 0.88)';
          backgroundColor = 'rgba(212, 155, 101, 0.12)';
          boxShadow = '0 0 12px rgba(212, 155, 101, 0.5)';
        }

        return (
          <div
            key={obj.id}
            className="inspection-hotspot-item"
            onClick={() => isInteractive && onSelectObject(obj)}
            onPointerEnter={(e) => {
              if (canSelect && e.pointerType !== 'touch') {
                setHoveredObjectId(obj.id);
              }
            }}
            onPointerLeave={() => {
              setHoveredObjectId(null);
            }}
            onFocus={() => canSelect && setFocusedObjectId(obj.id)}
            onBlur={() => setFocusedObjectId(null)}
            tabIndex={isInteractive ? 0 : -1}
            role="button"
            aria-label={`Inspect ${obj.label}`}
            aria-pressed={isSelected}
            title={canSelect ? obj.label : undefined}
            onKeyDown={(e) => {
              if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onSelectObject(obj);
              }
            }}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: `${width}%`,
              height: `${height}%`,
              transform: 'translate(-50%, -50%)',
              cursor: isInteractive ? 'pointer' : 'default',
              pointerEvents: isInteractive || isSelected || isReported ? 'auto' : 'none',
              borderRadius: '6px',
              border: borderStyle,
              backgroundColor,
              boxShadow,
              transition: 'border 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease',
              outline: isFocused ? '2px solid #FAF8F3' : 'none',
              outlineOffset: isFocused ? '2px' : '0',
              zIndex: isReported ? 35 : isSelected ? 34 : isHovered || isFocused ? 33 : 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {/* Hover Tooltip */}
            {(isHovered || isFocused) && !isSelected && !isReported && (
              <div
                style={{
                  position: 'absolute',
                  ...(y > 75 ? { top: '-28px' } : { bottom: '-28px' }),
                  backgroundColor: 'rgba(23, 59, 58, 0.95)',
                  border: '1px solid rgba(212, 155, 101, 0.88)',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  color: '#FAF8F3',
                  fontSize: '11px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  zIndex: 40,
                }}
              >
                {obj.label}
              </div>
            )}

            {/* Persistent Selected Indicator Badge */}
            {isSelected && !isReported && (
              <div
                style={{
                  position: 'absolute',
                  ...(y > 75 ? { top: '-28px' } : { bottom: '-28px' }),
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
                  zIndex: 40,
                }}
              >
                Selected: {obj.label}
              </div>
            )}

            {/* Persistent Reported Indicator Badge */}
            {isReported && (
              <div
                style={{
                  position: 'absolute',
                  ...(y > 75 ? { top: '-28px' } : { bottom: '-28px' }),
                  backgroundColor: isReportCorrect ? 'rgba(23, 59, 58, 0.95)' : 'rgba(56, 23, 23, 0.95)',
                  border: `1px solid ${isReportCorrect ? '#387A5A' : '#B44D45'}`,
                  borderRadius: '4px',
                  padding: '3px 8px',
                  color: '#FAF8F3',
                  fontSize: '11px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  zIndex: 40,
                }}
              >
                {isReportCorrect ? (
                  <>
                    <CheckCircle2 size={12} color="#9DC7B0" />
                    <span>Verified: {obj.label}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={12} color="#E8ABA7" />
                    <span>Reported: {obj.label}</span>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
