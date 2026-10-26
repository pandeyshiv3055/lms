import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  GitBranch,
  Shield,
  Award,
  Sparkles,
} from 'lucide-react';
import {
  BranchingScenarioData,
  ScenarioNode,
  ScenarioChoice,
  BranchingScenarioProgress,
  LearningActivityResult,
} from '../../../types';
import { trackingService } from '../../../services/tracking.service';
import { authService } from '../../../services/auth.service';

interface BranchingScenarioPlayerProps {
  data: BranchingScenarioData;
  savedProgress?: BranchingScenarioProgress;
  onUpdateProgress?: (progress: BranchingScenarioProgress) => void;
  onComplete?: (result: LearningActivityResult) => void;
}

export const BranchingScenarioPlayer: React.FC<BranchingScenarioPlayerProps> = ({
  data,
  savedProgress,
  onUpdateProgress,
  onComplete,
}) => {
  const user = authService.getCurrentUser();
  const userName = user?.name || 'Officer Learner';
  const userEmail = user?.email || 'learner@aegis-defense.com';

  const videoRef = useRef<HTMLVideoElement>(null);

  // Scenario Node state
  const [currentNodeId, setCurrentNodeId] = useState<string>(
    savedProgress?.currentNodeId || data.initialNodeId
  );
  const [history, setHistory] = useState<string[]>(
    savedProgress?.history || [data.initialNodeId]
  );
  const [choicesMade, setChoicesMade] = useState<Record<string, string>>(
    savedProgress?.choicesMade || {}
  );
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [totalScore, setTotalScore] = useState<number>(savedProgress?.totalScore || 0);
  const [isCompleted, setIsCompleted] = useState<boolean>(savedProgress?.completed || false);
  const [clipEnded, setClipEnded] = useState<boolean>(false);

  const currentNode: ScenarioNode = data.nodes[currentNodeId] || data.nodes[data.initialNodeId];

  // Track initial scene access
  useEffect(() => {
    trackingService.trackActivity(
      userName,
      userEmail,
      'experienced',
      data.id,
      data.title,
      'branching_scenario'
    );
  }, [data.id, data.title, userName, userEmail]);

  // Handle video ended event
  const handleVideoEnded = () => {
    setClipEnded(true);
    // If it's a node with a default next node and no choices, transition or prompt
    if (currentNode.type === 'intro' && currentNode.nextDefaultNodeId) {
      transitionToNode(currentNode.nextDefaultNodeId);
    }
  };

  // Transition to a node in the branching graph
  const transitionToNode = (targetNodeId: string) => {
    const nextNode = data.nodes[targetNodeId];
    if (!nextNode) return;

    setCurrentNodeId(targetNodeId);
    setHistory((prev) => [...prev, targetNodeId]);
    setSelectedChoiceId(null);
    setClipEnded(false);

    if (nextNode.type === 'ending') {
      const isPassed = (nextNode.score || totalScore) >= data.passingScore;
      setIsCompleted(true);

      trackingService.trackActivity(
        userName,
        userEmail,
        isPassed ? 'passed' : 'failed',
        data.id,
        data.title,
        'branching_scenario',
        { rawScore: nextNode.score || totalScore, success: isPassed }
      );

      trackingService.updateScormState(
        `lesson-branching-${data.id}`,
        isPassed ? 'passed' : 'failed',
        nextNode.score || totalScore
      );

      if (onComplete) {
        onComplete({
          activityId: data.id,
          activityType: 'branching_scenario',
          completed: true,
          score: nextNode.score || totalScore,
          attempts: 1,
          completedAt: new Date().toISOString(),
        });
      }
    }

    if (onUpdateProgress) {
      onUpdateProgress({
        currentNodeId: targetNodeId,
        history: [...history, targetNodeId],
        choicesMade,
        totalScore: nextNode.score !== undefined ? nextNode.score : totalScore,
        completed: nextNode.type === 'ending',
      });
    }
  };

  // Handle user decision
  const handleSelectChoice = (choice: ScenarioChoice) => {
    setSelectedChoiceId(choice.id);
    const newChoices = { ...choicesMade, [currentNode.id]: choice.id };
    setChoicesMade(newChoices);
    setTotalScore(choice.score);

    trackingService.trackActivity(
      userName,
      userEmail,
      'interacted',
      choice.id,
      choice.label,
      'scenario_decision',
      { rawScore: choice.score, success: choice.score >= 70, response: choice.label }
    );
  };

  // Confirm and advance to the consequence branch
  const handleConfirmDecision = () => {
    if (!selectedChoiceId || !currentNode.choices) return;
    const choice = currentNode.choices.find((c) => c.id === selectedChoiceId);
    if (!choice) return;

    transitionToNode(choice.nextNodeId);
  };

  // Restart scenario attempt
  const handleRestart = () => {
    setCurrentNodeId(data.initialNodeId);
    setHistory([data.initialNodeId]);
    setChoicesMade({});
    setSelectedChoiceId(null);
    setTotalScore(0);
    setIsCompleted(false);
    setClipEnded(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0F1314',
        color: '#FAF8F3',
        overflowY: 'auto',
      }}
      className="animate-fade-in"
    >
      {/* Top Header */}
      <div
        style={{
          padding: '12px 20px',
          backgroundColor: '#172321',
          borderBottom: '1px solid #2E3839',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
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
            <GitBranch size={16} color="#D49B65" />
          </div>

          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#FAF8F3' }}>
              Level 2: {data.title}
            </div>
            <div style={{ fontSize: '11px', color: '#A3AFAC' }}>
              Interactive Branching Decision Tree & Consequence Simulation
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={handleRestart} className="btn btn-secondary btn-sm" style={{ padding: '5px 12px' }}>
            <RotateCcw size={13} />
            <span>Restart Scenario</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Video or Clip Player if node has videoUrl */}
        {currentNode.videoUrl && (
          <div
            style={{
              width: '100%',
              maxHeight: '380px',
              borderRadius: '10px',
              overflow: 'hidden',
              backgroundColor: '#000000',
              border: '2px solid #2E3839',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <video
              ref={videoRef}
              key={currentNode.videoUrl}
              src={currentNode.videoUrl}
              poster={currentNode.posterUrl}
              autoPlay
              controls
              playsInline
              onEnded={handleVideoEnded}
              style={{ width: '100%', maxHeight: '380px', objectFit: 'contain' }}
            />
          </div>
        )}

        {/* Current Node Stage Content */}
        <div
          style={{
            backgroundColor: '#182223',
            border: '1.5px solid #2E3839',
            borderRadius: '10px',
            padding: '20px 24px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
          }}
        >
          {/* Node Category Badge & Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span
              className={
                currentNode.type === 'decision'
                  ? 'badge badge-copper'
                  : currentNode.type === 'consequence'
                  ? 'badge badge-primary'
                  : 'badge badge-success'
              }
            >
              {currentNode.type.toUpperCase()} STAGE
            </span>

            {currentNode.score !== undefined && (
              <span style={{ fontSize: '13px', fontWeight: 800, color: currentNode.score >= 75 ? '#387A5A' : '#D49B65' }}>
                Score: {currentNode.score} / 100
              </span>
            )}
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FAF8F3', margin: '0 0 10px' }}>
            {currentNode.title}
          </h3>

          <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#DDE5D7', margin: '0 0 16px' }}>
            {currentNode.description}
          </p>

          {/* Feedback & Consequence Summary if present */}
          {currentNode.consequenceSummary && (
            <div
              style={{
                backgroundColor: 'rgba(23, 59, 58, 0.4)',
                borderLeft: '3px solid #D49B65',
                padding: '10px 14px',
                borderRadius: '4px',
                marginBottom: '16px',
                fontSize: '13px',
                color: '#FAF8F3',
              }}
            >
              <strong>Outcome: </strong>
              {currentNode.consequenceSummary}
            </div>
          )}

          {/* Decision Point Options */}
          {currentNode.type === 'decision' && currentNode.choices && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#D49B65' }}>
                Select your operational response:
              </div>

              {currentNode.choices.map((choice) => {
                const isSelected = selectedChoiceId === choice.id;
                return (
                  <button
                    key={choice.id}
                    onClick={() => handleSelectChoice(choice)}
                    style={{
                      textAlign: 'left',
                      padding: '14px 18px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #D49B65' : '1.5px solid #2E3839',
                      backgroundColor: isSelected ? 'rgba(212, 155, 101, 0.2)' : '#121A1B',
                      color: '#FAF8F3',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 800, fontSize: '14px', color: isSelected ? '#D49B65' : '#FAF8F3' }}>
                        {choice.label}
                      </span>
                      <span
                        className="badge"
                        style={{
                          fontSize: '10px',
                          backgroundColor:
                            choice.behaviorTag === 'professional'
                              ? '#173B3A'
                              : choice.behaviorTag === 'confrontational'
                              ? '#4A1D1A'
                              : '#2E3839',
                          color: '#FAF8F3',
                        }}
                      >
                        {choice.behaviorTag.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ fontSize: '12.5px', color: '#A3AFAC', lineHeight: 1.4 }}>
                      {choice.description}
                    </div>
                  </button>
                );
              })}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  onClick={handleConfirmDecision}
                  disabled={!selectedChoiceId}
                  className="btn btn-primary"
                  style={{
                    padding: '10px 24px',
                    fontWeight: 700,
                    opacity: selectedChoiceId ? 1 : 0.45,
                    cursor: selectedChoiceId ? 'pointer' : 'not-allowed',
                  }}
                >
                  <span>Experience Branch Consequence</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Consequence Next Action */}
          {currentNode.type === 'consequence' && currentNode.nextDefaultNodeId && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                onClick={() => transitionToNode(currentNode.nextDefaultNodeId!)}
                className="btn btn-primary"
                style={{ padding: '10px 24px', fontWeight: 700 }}
              >
                <span>View Scenario Final Outcome</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Ending Screen Summary */}
          {currentNode.type === 'ending' && (
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: totalScore >= data.passingScore ? '#EAF3EE' : '#FCE8E6',
                  border: `3px solid ${totalScore >= data.passingScore ? '#387A5A' : '#B44D45'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                {totalScore >= data.passingScore ? (
                  <Award size={36} color="#387A5A" />
                ) : (
                  <AlertTriangle size={36} color="#B44D45" />
                )}
              </div>

              <h4 style={{ fontSize: '20px', color: '#FAF8F3', marginBottom: '8px' }}>
                {totalScore >= data.passingScore
                  ? 'Branching Scenario Certified!'
                  : 'Remediation Required'}
              </h4>

              <p style={{ color: '#A3AFAC', maxWidth: '500px', fontSize: '13.5px', marginBottom: '20px' }}>
                {totalScore >= data.passingScore
                  ? 'You demonstrated tactical emotional intelligence, de-escalated hostile tension, and followed verified security protocols.'
                  : 'Your response choice compromised de-escalation protocols. Re-attempt the scenario to achieve passing certification.'}
              </p>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleRestart} className="btn btn-secondary">
                  <RotateCcw size={15} />
                  <span>Try Alternative Decision Branch</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
