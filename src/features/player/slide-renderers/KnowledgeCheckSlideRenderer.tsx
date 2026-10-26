import React, { useState, useEffect } from 'react';
import { Slide, KnowledgeCheckData } from '../../../types';
import { CheckCircle2, XCircle, HelpCircle, RotateCcw } from 'lucide-react';

interface KnowledgeCheckSlideRendererProps {
  slide: Slide;
  savedInteractions?: {
    userAnswer?: string | string[];
    isSubmitted?: boolean;
    isCorrect?: boolean;
    attempts?: number;
  };
  onUpdateInteractions?: (interactions: Record<string, any>) => void;
  onInteractionComplete?: () => void;
}

export const KnowledgeCheckSlideRenderer: React.FC<KnowledgeCheckSlideRendererProps> = ({
  slide,
  savedInteractions,
  onUpdateInteractions,
  onInteractionComplete,
}) => {
  const data: KnowledgeCheckData | undefined = slide.content.knowledgeCheck;

  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(() => {
    if (savedInteractions?.userAnswer) {
      return Array.isArray(savedInteractions.userAnswer)
        ? savedInteractions.userAnswer
        : [savedInteractions.userAnswer];
    }
    return [];
  });

  const [isSubmitted, setIsSubmitted] = useState<boolean>(
    savedInteractions?.isSubmitted || false
  );
  const [isCorrect, setIsCorrect] = useState<boolean>(
    savedInteractions?.isCorrect || false
  );
  const [attempts, setAttempts] = useState<number>(
    savedInteractions?.attempts || 0
  );
  const [showHint, setShowHint] = useState<boolean>(false);

  // If already completed in past visit, trigger onInteractionComplete
  useEffect(() => {
    if (savedInteractions?.isCorrect && onInteractionComplete) {
      onInteractionComplete();
    }
  }, [savedInteractions?.isCorrect, onInteractionComplete]);

  if (!data) return null;

  const handleSelectOption = (optionId: string) => {
    if (isSubmitted && isCorrect) return; // Prevent changing after correct submit

    if (data.type === 'multiple-select') {
      if (selectedAnswers.includes(optionId)) {
        setSelectedAnswers(selectedAnswers.filter((id) => id !== optionId));
      } else {
        setSelectedAnswers([...selectedAnswers, optionId]);
      }
    } else {
      // Single choice or True/False
      setSelectedAnswers([optionId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAnswers.length === 0) return;

    let correct = false;
    if (Array.isArray(data.correctAnswer)) {
      correct =
        selectedAnswers.length === data.correctAnswer.length &&
        selectedAnswers.every((id) => (data.correctAnswer as string[]).includes(id));
    } else {
      correct = selectedAnswers[0] === data.correctAnswer;
    }

    const newAttempts = attempts + 1;
    setIsSubmitted(true);
    setIsCorrect(correct);
    setAttempts(newAttempts);

    if (onUpdateInteractions) {
      onUpdateInteractions({
        userAnswer: data.type === 'multiple-select' ? selectedAnswers : selectedAnswers[0],
        isSubmitted: true,
        isCorrect: correct,
        attempts: newAttempts,
      });
    }

    if (correct && onInteractionComplete) {
      onInteractionComplete();
    }
  };

  const handleRetry = () => {
    setIsSubmitted(false);
    setIsCorrect(false);
    setSelectedAnswers([]);
  };

  return (
    <div
      style={{
        padding: '32px 40px',
        maxWidth: '820px',
        margin: '0 auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
      className="animate-fade-in"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-copper">KNOWLEDGE CHECK</span>
          <span style={{ fontSize: '12px', color: '#68716D' }}>
            {data.type === 'multiple-select' ? 'Select all that apply' : 'Choose one answer'}
          </span>
        </div>

        {data.hint && !showHint && (
          <button
            onClick={() => setShowHint(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              color: '#B87955',
              fontWeight: 600,
            }}
          >
            <HelpCircle size={14} />
            <span>Show Hint</span>
          </button>
        )}
      </div>

      {showHint && data.hint && (
        <div
          style={{
            backgroundColor: '#FCF5E9',
            border: '1px solid #F0D09B',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '12px',
            color: '#966142',
            marginBottom: '16px',
          }}
        >
          <strong>Hint:</strong> {data.hint}
        </div>
      )}

      {/* The Question Text */}
      <h2 style={{ fontSize: '20px', color: '#173B3A', marginBottom: '20px', lineHeight: 1.4 }}>
        {data.question}
      </h2>

      {/* Answer Options */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {data.options.map((opt) => {
          const isSelected = selectedAnswers.includes(opt.id);
          let borderColor = '#E5E0D5';
          let bgColor = '#FFFFFF';

          if (isSubmitted) {
            const isCorrectOption = Array.isArray(data.correctAnswer)
              ? (data.correctAnswer as string[]).includes(opt.id)
              : data.correctAnswer === opt.id;

            if (isCorrectOption) {
              borderColor = '#387A5A';
              bgColor = '#EAF3EE';
            } else if (isSelected && !isCorrectOption) {
              borderColor = '#B44D45';
              bgColor = '#FAEEEC';
            }
          } else if (isSelected) {
            borderColor = '#B87955';
            bgColor = 'rgba(184, 121, 85, 0.08)';
          }

          return (
            <div
              key={opt.id}
              onClick={() => handleSelectOption(opt.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                border: `2px solid ${borderColor}`,
                backgroundColor: bgColor,
                cursor: isSubmitted && isCorrect ? 'default' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: data.type === 'multiple-select' ? '4px' : '50%',
                  border: isSelected ? '6px solid #B87955' : '2px solid #CCC4B4',
                  backgroundColor: '#FFFFFF',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
              />
              <span style={{ fontSize: '14.5px', color: '#1C2424', lineHeight: 1.4 }}>
                {opt.text}
              </span>
            </div>
          );
        })}

        {/* Action button & immediate feedback banner */}
        {!isSubmitted ? (
          <div style={{ marginTop: '16px' }}>
            <button
              type="submit"
              disabled={selectedAnswers.length === 0}
              className="btn btn-primary"
              style={{ padding: '10px 24px' }}
            >
              Submit Answer
            </button>
          </div>
        ) : (
          <div
            style={{
              marginTop: '16px',
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: isCorrect ? '#EAF3EE' : '#FAEEEC',
              border: `1.5px solid ${isCorrect ? '#9DC7B0' : '#E8ABA7'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              {isCorrect ? (
                <>
                  <CheckCircle2 size={18} color="#387A5A" />
                  <span style={{ fontWeight: 700, color: '#387A5A', fontSize: '14px' }}>
                    Correct Response! Next slide unlocked.
                  </span>
                </>
              ) : (
                <>
                  <XCircle size={18} color="#B44D45" />
                  <span style={{ fontWeight: 700, color: '#B44D45', fontSize: '14px' }}>
                    Incorrect Selection
                  </span>
                </>
              )}
            </div>

            <p style={{ margin: '0 0 10px', fontSize: '13.5px', color: '#242C2D', lineHeight: 1.5 }}>
              {data.explanation}
            </p>

            {!isCorrect && (
              <button
                type="button"
                onClick={handleRetry}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RotateCcw size={13} />
                <span>Try Again</span>
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
};
