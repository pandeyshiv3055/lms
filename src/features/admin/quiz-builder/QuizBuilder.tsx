import React, { useState } from 'react';
import {
  Award,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { assessmentService } from '../../../services/assessment.service';
import { Assessment, QuizQuestion } from '../../../types';

export const QuizBuilder: React.FC = () => {
  const assessments = assessmentService.getAllAssessments();
  const [assessment, setAssessment] = useState<Assessment>(assessments[0]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states for general assessment settings
  const [passingScore, setPassingScore] = useState(assessment.passingScore);
  const [maxAttempts, setMaxAttempts] = useState(assessment.maxAttempts || 3);
  const [reviewAllowed, setReviewAllowed] = useState(assessment.reviewAllowed);

  // Form states for active question
  const currentQuestion: QuizQuestion | undefined = assessment.questions[selectedQuestionIndex];
  const [questionText, setQuestionText] = useState(currentQuestion?.text || '');
  const [explanation, setExplanation] = useState(currentQuestion?.explanation || '');
  const [points, setPoints] = useState(currentQuestion?.points || 10);
  const [correctAnswer, setCorrectAnswer] = useState(currentQuestion?.correctAnswer || '');

  React.useEffect(() => {
    if (currentQuestion) {
      setQuestionText(currentQuestion.text);
      setExplanation(currentQuestion.explanation);
      setPoints(currentQuestion.points);
      setCorrectAnswer(currentQuestion.correctAnswer);
    }
  }, [selectedQuestionIndex]);

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion) return;

    const updatedQuestions = [...assessment.questions];
    updatedQuestions[selectedQuestionIndex] = {
      ...currentQuestion,
      text: questionText,
      explanation,
      points: Number(points),
      correctAnswer,
    };

    const updated: Assessment = {
      ...assessment,
      passingScore: Number(passingScore),
      maxAttempts: Number(maxAttempts),
      reviewAllowed,
      questions: updatedQuestions,
    };

    const saved = assessmentService.saveAssessment(updated);
    setAssessment(saved);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleAddQuestion = () => {
    const newQ: QuizQuestion = {
      id: `q-${Date.now()}`,
      text: 'New security knowledge question',
      type: 'single-choice',
      points: 10,
      options: [
        { id: 'opt-a', text: 'Option A (Compliant)' },
        { id: 'opt-b', text: 'Option B (Non-compliant)' },
      ],
      correctAnswer: 'opt-a',
      explanation: 'Explanation of compliant standard procedure.',
    };

    const updated: Assessment = {
      ...assessment,
      questions: [...assessment.questions, newQ],
    };

    assessmentService.saveAssessment(updated);
    setAssessment(updated);
    setSelectedQuestionIndex(updated.questions.length - 1);
  };

  const handleDeleteQuestion = (idx: number) => {
    if (assessment.questions.length <= 1) {
      alert('Assessment must contain at least one question.');
      return;
    }
    const filtered = assessment.questions.filter((_, i) => i !== idx);
    const updated = { ...assessment, questions: filtered };
    assessmentService.saveAssessment(updated);
    setAssessment(updated);
    setSelectedQuestionIndex(0);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#173B3A', margin: 0 }}>
            Assessment & Examination Builder
          </h1>
          <p style={{ color: '#68716D', fontSize: '13px', margin: '4px 0 0' }}>
            Configure passing criteria, scoring policy, question banks, and answer rationales.
          </p>
        </div>

        <button
          onClick={handleAddQuestion}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={15} />
          <span>Add Exam Question</span>
        </button>
      </div>

      {/* Global Assessment Settings Bar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          alignItems: 'center',
        }}
      >
        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#68716D', display: 'block', marginBottom: '4px' }}>
            Passing Score Threshold (%)
          </label>
          <input
            type="number"
            min={50}
            max={100}
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
            className="form-input"
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#68716D', display: 'block', marginBottom: '4px' }}>
            Maximum Attempts Allowed
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={maxAttempts}
            onChange={(e) => setMaxAttempts(Number(e.target.value))}
            className="form-input"
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#68716D', display: 'block', marginBottom: '4px' }}>
            Answer Review Access
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '38px' }}>
            <input
              id="reviewAllowedCheck"
              type="checkbox"
              checked={reviewAllowed}
              onChange={(e) => setReviewAllowed(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="reviewAllowedCheck" style={{ fontSize: '13px', color: '#242C2D', cursor: 'pointer' }}>
              Allow learners to review answers
            </label>
          </div>
        </div>
      </div>

      {/* Questions Studio: Left List, Right Editor */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1.6fr', gap: '20px', alignItems: 'start' }}>
        {/* Left Question List */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: '#173B3A', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Question Bank ({assessment.questions.length})</span>
            <Award size={14} color="#D49B65" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {assessment.questions.map((q, idx) => {
              const isSelected = idx === selectedQuestionIndex;
              return (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuestionIndex(idx)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: isSelected ? '#173B3A' : '#FAF8F3',
                    color: isSelected ? '#FAF8F3' : '#242C2D',
                    border: isSelected ? '1px solid #173B3A' : '1px solid #E5E0D5',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12.5px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <span style={{ fontWeight: 700, color: isSelected ? '#D49B65' : '#8E9995', fontSize: '11px' }}>
                      Q{idx + 1}.
                    </span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {q.text}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteQuestion(idx);
                    }}
                    style={{ padding: '2px', color: '#B44D45' }}
                    title="Delete Question"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Question Editor */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', color: '#173B3A', margin: 0 }}>
              Edit Question {selectedQuestionIndex + 1}
            </h3>
            {savedSuccess && (
              <span style={{ color: '#387A5A', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} />
                <span>Assessment Saved!</span>
              </span>
            )}
          </div>

          {currentQuestion && (
            <form onSubmit={handleSaveAssessment}>
              <div className="form-group">
                <label className="form-label" htmlFor="qTextInput">Question Prompt Text</label>
                <textarea
                  id="qTextInput"
                  rows={3}
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="pointsInput">Awarded Points</label>
                  <input
                    id="pointsInput"
                    type="number"
                    min={1}
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="correctAnswerInput">Correct Option Key</label>
                  <input
                    id="correctAnswerInput"
                    type="text"
                    required
                    value={Array.isArray(correctAnswer) ? correctAnswer.join(',') : correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="qExplanationInput">Explanation & Evidentiary Rationale</label>
                <textarea
                  id="qExplanationInput"
                  rows={3}
                  required
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Save size={16} />
                <span>Save Question & Assessment Settings</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
