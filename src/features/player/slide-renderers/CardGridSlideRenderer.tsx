import React, { useState, useEffect } from 'react';
import { Slide, CardGridItem } from '../../../types';
import { Key, AlertTriangle, Compass, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import { Modal } from '../../../components/common/Modal';

interface CardGridSlideRendererProps {
  slide: Slide;
  savedInteractions?: { exploredCardIds?: string[] };
  onUpdateInteractions?: (interactions: Record<string, any>) => void;
  onInteractionComplete?: () => void;
}

export const CardGridSlideRenderer: React.FC<CardGridSlideRendererProps> = ({
  slide,
  savedInteractions,
  onUpdateInteractions,
  onInteractionComplete,
}) => {
  const cards: CardGridItem[] = slide.content.cards || [];
  const [activeCard, setActiveCard] = useState<CardGridItem | null>(null);
  const [exploredCardIds, setExploredCardIds] = useState<string[]>(
    savedInteractions?.exploredCardIds || []
  );

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Key':
        return <Key size={24} color="#D49B65" />;
      case 'AlertTriangle':
        return <AlertTriangle size={24} color="#B44D45" />;
      case 'Compass':
        return <Compass size={24} color="#387A5A" />;
      default:
        return <Shield size={24} color="#B87955" />;
    }
  };

  const handleCardClick = (card: CardGridItem) => {
    setActiveCard(card);

    if (!exploredCardIds.includes(card.id)) {
      const updated = [...exploredCardIds, card.id];
      setExploredCardIds(updated);

      if (onUpdateInteractions) {
        onUpdateInteractions({ exploredCardIds: updated });
      }

      if (cards.length > 0 && updated.length >= cards.length) {
        if (onInteractionComplete) {
          onInteractionComplete();
        }
      }
    }
  };

  // Check on initial mount
  useEffect(() => {
    if (cards.length > 0 && exploredCardIds.length >= cards.length) {
      if (onInteractionComplete) {
        onInteractionComplete();
      }
    }
  }, [cards.length, exploredCardIds.length, onInteractionComplete]);

  const allCardsExplored = cards.length > 0 && exploredCardIds.length >= cards.length;

  return (
    <div
      style={{
        padding: '24px 36px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      className="animate-fade-in"
    >
      {/* Slide Top Headline & Status Pill */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '24px', color: '#173B3A', margin: 0 }}>
            {slide.content.headline || slide.title}
          </h2>
          <p style={{ color: '#68716D', fontSize: '13px', margin: '2px 0 0' }}>
            Click "Learn More" on all four operational duty cards to review detailed field procedures.
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
            backgroundColor: allCardsExplored ? '#EAF3EE' : '#FAF8F3',
            border: allCardsExplored ? '1px solid #9DC7B0' : '1px solid #E5E0D5',
            fontSize: '12px',
            fontWeight: 600,
            color: allCardsExplored ? '#387A5A' : '#B87955',
          }}
        >
          {allCardsExplored ? (
            <>
              <CheckCircle2 size={14} color="#387A5A" />
              <span>All 4 Duties Explored (Next Unlocked)</span>
            </>
          ) : (
            <span>
              Explored {exploredCardIds.length} of {cards.length} cards
            </span>
          )}
        </div>
      </div>

      {/* Four Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          flex: 1,
          alignItems: 'stretch',
        }}
      >
        {cards.map((card) => {
          const isExplored = exploredCardIds.includes(card.id);

          return (
            <div
              key={card.id}
              className="card card-interactive"
              onClick={() => handleCardClick(card)}
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundColor: isExplored ? '#FFFFFF' : '#FAF8F3',
                borderColor: isExplored ? '#387A5A' : '#E5E0D5',
                position: 'relative',
              }}
            >
              {isExplored && (
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#387A5A',
                  }}
                >
                  <CheckCircle2 size={14} />
                  <span>Viewed</span>
                </div>
              )}

              <div>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    backgroundColor: '#FAF8F3',
                    border: '1px solid #E5E0D5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}
                >
                  {getIcon(card.iconName)}
                </div>

                <h3 style={{ fontSize: '17px', color: '#173B3A', marginBottom: '8px' }}>
                  {card.title}
                </h3>

                <p style={{ color: '#68716D', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
                  {card.description}
                </p>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{
                  marginTop: '18px',
                  width: '100%',
                  justifyContent: 'space-between',
                }}
              >
                <span>{card.actionLabel || 'Learn More'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Learn More Detail Modal */}
      {activeCard && (
        <Modal
          isOpen={true}
          onClose={() => setActiveCard(null)}
          title={`Duty Protocol: ${activeCard.title}`}
          maxWidth="640px"
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#FAF8F3',
                  border: '1px solid #E5E0D5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getIcon(activeCard.iconName)}
              </div>
              <div>
                <h4 style={{ fontSize: '17px', color: '#173B3A', margin: 0 }}>
                  {activeCard.title}
                </h4>
                <div style={{ fontSize: '12px', color: '#68716D' }}>
                  Standard Field Duty Instructions
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#FAF8F3',
                border: '1px solid #E5E0D5',
                borderRadius: '8px',
                padding: '16px 20px',
                marginBottom: '20px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#173B3A', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
                Required Operating Protocols:
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#242C2D', fontSize: '14px', lineHeight: 1.6 }}>
                {activeCard.detailedContent.map((point, idx) => (
                  <li key={idx} style={{ marginBottom: '8px' }}>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setActiveCard(null)}
                className="btn btn-primary btn-sm"
              >
                I Understand & Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
