import React, { useState, useEffect, useRef } from 'react';
import {
  RolePlayScenario,
  ChatMessage,
  RolePlayEvaluation,
  LearningActivityResult,
  RolePlayProgress,
} from '../../../types';
import { seedRolePlayScenario } from '../../../data/seed/role-play';
import { trackingService } from '../../../services/tracking.service';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Award,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  User,
  Bot,
} from 'lucide-react';

interface AIRolePlayPlayerProps {
  scenario?: RolePlayScenario;
  userId?: string;
  courseId?: string;
  lessonId?: string;
  onActivityComplete?: (result: LearningActivityResult) => void;
  onUpdateProgress?: (progress: RolePlayProgress) => void;
}

export const AIRolePlayPlayer: React.FC<AIRolePlayPlayerProps> = ({
  scenario = seedRolePlayScenario,
  userId = 'user-demo-learner',
  courseId = 'course-sec-101',
  lessonId = 'lesson-1-3',
  onActivityComplete,
  onUpdateProgress,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState(scenario.character.initialEmotion);
  const [turnsCount, setTurnsCount] = useState(0);
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [evaluation, setEvaluation] = useState<RolePlayEvaluation | null>(null);

  // Audio / Speech State
  const [voiceSynthesisEnabled, setVoiceSynthesisEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // 1. Initialize Scenario & Greeting
  useEffect(() => {
    // Initial greeting from Alex Morgan
    const initialGreeting: ChatMessage = {
      id: 'msg-init-0',
      sender: 'character',
      text: scenario.character.initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      emotion: scenario.character.initialEmotion,
    };
    setMessages([initialGreeting]);

    // Check Speech Recognition capability in current browser
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      setSpeechSupported(true);
      try {
        const recognition = new SpeechRec();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsListening(false);
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition error:', err);
          setIsListening(false);
          setSpeechNotice('Speech recognition notice: Microphone input paused or not permitted.');
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        speechRecognitionRef.current = recognition;
      } catch (e) {
        setSpeechSupported(false);
      }
    } else {
      setSpeechSupported(false);
    }

    trackingService.recordXApi({
      verb: 'experienced',
      actor: { id: userId, name: 'Learner' },
      object: { id: scenario.id, type: 'role-play', name: scenario.title },
    });
  }, [scenario, userId]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Voice synthesis for character replies
  const speakText = (text: string) => {
    if (!voiceSynthesisEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis unavailable:', e);
    }
  };

  // Toggle Voice Input
  const toggleSpeechRecognition = () => {
    if (!speechSupported) {
      setSpeechNotice('Speech recognition is not supported in this browser. Please type your responses below.');
      return;
    }

    if (isListening) {
      speechRecognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setSpeechNotice(null);
      try {
        speechRecognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  // 2. Deterministic NLP Intent Matcher
  const matchIntentAndReply = (userText: string) => {
    const lower = userText.toLowerCase();

    // Check each intent rule
    for (const rule of scenario.mockResponses) {
      if (rule.intent === 'default') continue;
      const matched = rule.keywords.some((kw) => lower.includes(kw.toLowerCase()));
      if (matched) {
        return rule;
      }
    }

    // Fallback to default
    return (
      scenario.mockResponses.find((r) => r.intent === 'default') ||
      scenario.mockResponses[0]
    );
  };

  // 3. Handle Send Message
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-learner-${Date.now()}`,
      sender: 'learner',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    setSpeechNotice(null);

    const nextTurns = turnsCount + 1;
    setTurnsCount(nextTurns);

    // Track interaction
    trackingService.recordXApi({
      verb: 'interacted',
      actor: { id: userId, name: 'Learner' },
      object: { id: `${scenario.id}-turn-${nextTurns}`, type: 'role-play-turn', name: `Turn ${nextTurns}` },
      result: { response: text },
    });

    // Simulate AI character response delay (1.2 seconds)
    setTimeout(() => {
      const matchedRule = matchIntentAndReply(text);
      const characterReply: ChatMessage = {
        id: `msg-char-${Date.now()}`,
        sender: 'character',
        text: matchedRule.characterReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        emotion: matchedRule.emotionShift as any,
        intentMatched: matchedRule.intent,
      };

      setMessages((prev) => [...prev, characterReply]);
      setCurrentEmotion(matchedRule.emotionShift as any);
      setIsTyping(false);

      speakText(matchedRule.characterReply);

      // If learner reached maxTurns, auto-trigger evaluation
      if (nextTurns >= scenario.maxTurns) {
        generateEvaluation([...messages, userMsg, characterReply]);
      }
    }, 1200);
  };

  // 4. Generate Comprehensive Evaluation
  const generateEvaluation = (currentChat = messages) => {
    const learnerMsgs = currentChat.filter((m) => m.sender === 'learner');
    const matchedIntents: string[] = [];

    learnerMsgs.forEach((msg) => {
      const rule = matchIntentAndReply(msg.text);
      matchedIntents.push(rule.intent);
    });

    // Calculate score for each rubric dimension
    const dimensionResults: Record<string, number> = {};
    const strengths: string[] = [];
    const improvements: string[] = [];

    scenario.rubricDimensions.forEach((dim) => {
      let totalDimScore = 0;
      learnerMsgs.forEach((msg) => {
        const rule = matchIntentAndReply(msg.text);
        totalDimScore += rule.dimensionScores[dim.id] || 70;
      });
      const avg = learnerMsgs.length > 0 ? Math.round(totalDimScore / learnerMsgs.length) : 75;
      dimensionResults[dim.id] = avg;
    });

    // Formulate qualitative insights
    if (matchedIntents.includes('empathy')) {
      strengths.push('Acknowledged visitor frustration with validating and professional language.');
    }
    if (matchedIntents.includes('procedure')) {
      strengths.push('Firmly upheld access control compliance and requested proper host verification.');
    }
    if (matchedIntents.includes('alternative')) {
      strengths.push('Offered constructive de-escalation by providing comfortable lounge waiting and calling the executive assistant.');
    }
    if (matchedIntents.includes('hostility')) {
      improvements.push('Avoid confrontational threats or hostile vocabulary that risk escalating visitor tension.');
    }
    if (matchedIntents.includes('passive')) {
      improvements.push('Avoid dismissive phrases like "rules are rules"—always pair policy constraints with helpful alternatives.');
    }
    if (strengths.length === 0) {
      strengths.push('Remained actively engaged throughout the interaction.');
    }
    if (improvements.length === 0) {
      improvements.push('Continue refining prompt response times when initiating host phone verification.');
    }

    // Calculate overall weighted score
    let weightedSum = 0;
    let totalWeight = 0;
    scenario.rubricDimensions.forEach((dim) => {
      weightedSum += (dimensionResults[dim.id] || 70) * dim.weight;
      totalWeight += dim.weight;
    });
    const overallScore = Math.round(weightedSum / (totalWeight || 100));
    const passed = overallScore >= scenario.defaultPassingScore;

    const evalResult: RolePlayEvaluation = {
      overallScore,
      passed,
      dimensionScores: dimensionResults,
      strengths,
      improvements,
      remediationAdvice:
        'Review Lesson 1.1 Access Control Protocols and Section 3: Conflict De-escalation Techniques for Front-Desk Security.',
      evaluatedAt: new Date().toISOString(),
    };

    setEvaluation(evalResult);
    setIsEvaluated(true);

    // Dispatch completion & tracking
    trackingService.recordRolePlayCompleted(
      scenario.id,
      scenario.title,
      overallScore,
      passed,
      turnsCount
    );

    const activityResult: LearningActivityResult = {
      activityId: scenario.id,
      activityType: 'role_play',
      completed: true,
      score: overallScore,
      attempts: 1,
      completedAt: new Date().toISOString(),
    };

    onActivityComplete?.(activityResult);

    onUpdateProgress?.({
      scenarioId: scenario.id,
      completed: true,
      score: overallScore,
      turnsCompleted: turnsCount,
      messages: currentChat,
      evaluation: evalResult,
    });
  };

  // Reset Roleplay
  const handleReset = () => {
    const initialGreeting: ChatMessage = {
      id: 'msg-init-0',
      sender: 'character',
      text: scenario.character.initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      emotion: scenario.character.initialEmotion,
    };
    setMessages([initialGreeting]);
    setInputText('');
    setTurnsCount(0);
    setCurrentEmotion(scenario.character.initialEmotion);
    setIsEvaluated(false);
    setEvaluation(null);
  };

  const getEmotionBadge = (emotion: string) => {
    switch (emotion) {
      case 'calmer':
        return { label: 'Calmer / Receptive', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'neutral':
        return { label: 'Neutral / Listening', color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.15)' };
      case 'more_agitated':
        return { label: 'Agitated / Combative', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.2)' };
      case 'frustrated':
      default:
        return { label: 'Frustrated / Impatient', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.18)' };
    }
  };

  const emotionInfo = getEmotionBadge(currentEmotion);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#111717',
        color: '#E5E7EB',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* 1. Header Bar: Character Profile & Status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          backgroundColor: '#162322',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={scenario.character.avatarUrl}
              alt={scenario.character.name}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: `2px solid ${emotionInfo.color}`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: emotionInfo.color,
                border: '2px solid #162322',
              }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#F3F4F6' }}>
                {scenario.character.name}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: emotionInfo.bg,
                  color: emotionInfo.color,
                  fontWeight: 600,
                  border: `1px solid ${emotionInfo.color}40`,
                }}
              >
                ● {emotionInfo.label}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
              {scenario.character.role} • Turn {turnsCount} of {scenario.maxTurns}
            </div>
          </div>
        </div>

        {/* Action Controls & Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Speech Audio Toggle */}
          <button
            onClick={() => setVoiceSynthesisEnabled(!voiceSynthesisEnabled)}
            title={voiceSynthesisEnabled ? 'Voice playback enabled' : 'Voice playback muted'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor: voiceSynthesisEnabled ? 'rgba(30, 98, 88, 0.3)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${voiceSynthesisEnabled ? '#1E6258' : 'rgba(255, 255, 255, 0.1)'}`,
              color: voiceSynthesisEnabled ? '#5EEAD4' : '#9CA3AF',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {voiceSynthesisEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span>{voiceSynthesisEnabled ? 'Speech Audio ON' : 'Audio Muted'}</span>
          </button>

          {/* End & Evaluate Button */}
          {!isEvaluated && (
            <button
              onClick={() => generateEvaluation()}
              disabled={turnsCount === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                backgroundColor: turnsCount > 0 ? '#C47C52' : 'rgba(255, 255, 255, 0.1)',
                color: turnsCount > 0 ? '#FFFFFF' : '#6B7280',
                border: 'none',
                fontWeight: 600,
                fontSize: '12px',
                cursor: turnsCount > 0 ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
              }}
            >
              <Award size={15} />
              <span>Conclude & Evaluate</span>
            </button>
          )}

          {isEvaluated && (
            <button
              onClick={handleReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#E5E7EB',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={14} />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Simulation Disclaimer Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 20px',
          backgroundColor: 'rgba(30, 98, 88, 0.15)',
          borderBottom: '1px solid rgba(30, 98, 88, 0.3)',
          fontSize: '11px',
          color: '#A7F3D0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={13} color="#34D399" />
          <span>
            <strong>Interactive AI Role-Play (Pilot Engine):</strong> Communicating with simulated security persona Alex Morgan using deterministic intent scoring.
          </span>
        </div>
        <span style={{ color: '#9CA3AF' }}>Goal: De-escalate & verify before admittance</span>
      </div>

      {/* 3. Main Stage: Either Chat Transcript OR Evaluation Results */}
      {!isEvaluated ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Messages Stream */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {/* Scenario Objective Card */}
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                fontSize: '13px',
                color: '#9CA3AF',
                display: 'flex',
                gap: '10px',
              }}
            >
              <Info size={16} color="#38BDF8" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#E5E7EB' }}>Scenario Brief: </strong>
                {scenario.objective}
              </div>
            </div>

            {/* Conversation Messages */}
            {messages.map((msg) => {
              const isLearner = msg.sender === 'learner';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: isLearner ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  {/* Sender Avatar */}
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: isLearner ? '#C47C52' : '#1E6258',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    {isLearner ? <User size={16} /> : <Bot size={16} />}
                  </div>

                  {/* Message Bubble */}
                  <div
                    style={{
                      maxWidth: '75%',
                      backgroundColor: isLearner
                        ? 'rgba(196, 124, 82, 0.2)'
                        : 'rgba(30, 98, 88, 0.25)',
                      border: `1px solid ${
                        isLearner ? 'rgba(196, 124, 82, 0.4)' : 'rgba(30, 98, 88, 0.45)'
                      }`,
                      borderRadius: isLearner ? '12px 2px 12px 12px' : '2px 12px 12px 12px',
                      padding: '12px 16px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        marginBottom: '4px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: isLearner ? '#FDBA74' : '#5EEAD4',
                        }}
                      >
                        {isLearner ? 'Security Officer (You)' : scenario.character.name}
                      </span>
                      <span style={{ fontSize: '11px', color: '#6B7280' }}>{msg.timestamp}</span>
                    </div>

                    <p
                      style={{
                        margin: 0,
                        fontSize: '14px',
                        lineHeight: 1.5,
                        color: '#F3F4F6',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {msg.text}
                    </p>

                    {/* Intent Tag if simulated */}
                    {!isLearner && msg.intentMatched && (
                      <div
                        style={{
                          marginTop: '6px',
                          fontSize: '10px',
                          color: '#9CA3AF',
                          fontStyle: 'italic',
                        }}
                      >
                        Intent recognized: {msg.intentMatched}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Character is typing indicator */}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#1E6258',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                  }}
                >
                  <Bot size={16} />
                </div>
                <div
                  style={{
                    padding: '8px 14px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(30, 98, 88, 0.2)',
                    fontSize: '12px',
                    color: '#9CA3AF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span style={{ fontStyle: 'italic' }}>{scenario.character.name} is responding...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Prompt Suggestions Bar */}
          <div
            style={{
              padding: '8px 20px',
              backgroundColor: '#141E1D',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
            }}
          >
            <span style={{ fontSize: '11px', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
              Suggested responses:
            </span>
            <button
              onClick={() =>
                handleSendMessage(
                  "I understand your presentation is urgent, Mr. Morgan. Let me immediately contact Sarah Chen's desk to verify your badge approval."
                )
              }
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#D1D5DB',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              Empathy + Host Contact
            </button>
            <button
              onClick={() =>
                handleSendMessage(
                  "For facility safety protocols, all visitors must have security credentials. If you have your government ID, I will expedite your temporary visitor pass."
                )
              }
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#D1D5DB',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              Policy + ID Verification
            </button>
            <button
              onClick={() =>
                handleSendMessage(
                  "Please have a seat in our reception lounge while I phone the technology department directly to arrange an escort for you."
                )
              }
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#D1D5DB',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              Offer Lounge + Escort
            </button>
          </div>

          {/* Speech error or notice banner if any */}
          {speechNotice && (
            <div
              style={{
                padding: '6px 20px',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                color: '#FBBF24',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={13} />
              <span>{speechNotice}</span>
            </div>
          )}

          {/* 4. Text & Voice Input Field */}
          <div
            style={{
              padding: '14px 20px',
              backgroundColor: '#162322',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            {/* Voice Input Microphone */}
            <button
              onClick={toggleSpeechRecognition}
              title={
                speechSupported
                  ? isListening
                    ? 'Stop listening'
                    : 'Speak your response (Voice mode)'
                  : 'Speech recognition not supported in browser'
              }
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isListening
                  ? 'rgba(239, 68, 68, 0.3)'
                  : 'rgba(255, 255, 255, 0.08)',
                color: isListening ? '#EF4444' : '#9CA3AF',
                border: `1px solid ${isListening ? '#EF4444' : 'rgba(255, 255, 255, 0.1)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder={
                isListening
                  ? 'Listening to your speech... (speak now)'
                  : 'Type your response to Alex Morgan (e.g. "I understand your urgency, let me call your host...")'
              }
              style={{
                flex: 1,
                padding: '10px 14px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#F9FAFB',
                fontSize: '14px',
                outline: 'none',
              }}
            />

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isTyping}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                backgroundColor: inputText.trim() && !isTyping ? '#1E6258' : 'rgba(255, 255, 255, 0.1)',
                color: inputText.trim() && !isTyping ? '#FFFFFF' : '#6B7280',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: inputText.trim() && !isTyping ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
              }}
            >
              <Send size={15} />
              <span>Send</span>
            </button>
          </div>
        </div>
      ) : (
        /* 5. Evaluation & Performance Report View */
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '30px',
            maxWidth: '860px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          {/* Result Header Card */}
          <div
            style={{
              padding: '24px',
              borderRadius: '12px',
              backgroundColor: '#162322',
              border: `1px solid ${evaluation?.passed ? '#1E6258' : '#B94D46'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                {evaluation?.passed ? (
                  <CheckCircle2 size={24} color="#10B981" />
                ) : (
                  <AlertTriangle size={24} color="#EF4444" />
                )}
                <h3 style={{ margin: 0, fontSize: '20px', color: '#F9FAFB' }}>
                  {evaluation?.passed ? 'Role-Play Competency Demonstrated' : 'Needs Further Practice'}
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#9CA3AF' }}>
                Scenario: {scenario.title} • {turnsCount} conversation turns completed
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: '34px',
                  fontWeight: 700,
                  color: evaluation?.passed ? '#34D399' : '#F87171',
                }}
              >
                {evaluation?.overallScore}%
              </div>
              <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                Passing Threshold: {scenario.defaultPassingScore}%
              </div>
            </div>
          </div>

          {/* Rubric Dimensions Grid */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', color: '#F3F4F6' }}>
              Performance Evaluation by Rubric Dimension
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '14px',
              }}
            >
              {scenario.rubricDimensions.map((dim) => {
                const score = evaluation?.dimensionScores[dim.id] || 0;
                return (
                  <div
                    key={dim.id}
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '6px',
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#E5E7EB' }}>
                        {dim.label}
                      </span>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: score >= 75 ? '#34D399' : '#FBBF24',
                        }}
                      >
                        {score}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div
                      style={{
                        height: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                        marginBottom: '8px',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${score}%`,
                          backgroundColor: score >= 75 ? '#1E6258' : '#C47C52',
                          borderRadius: '3px',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', lineHeight: 1.4 }}>
                      {dim.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feedback Columns: Strengths & Recommendations */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            {/* Strengths */}
            <div
              style={{
                padding: '18px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '10px',
                  color: '#34D399',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                <CheckCircle2 size={16} />
                <span>Demonstrated Strengths</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#D1D5DB', lineHeight: 1.6 }}>
                {evaluation?.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div
              style={{
                padding: '18px',
                borderRadius: '8px',
                backgroundColor: 'rgba(196, 124, 82, 0.08)',
                border: '1px solid rgba(196, 124, 82, 0.25)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '10px',
                  color: '#FB923C',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                <AlertTriangle size={16} />
                <span>Areas for Growth</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#D1D5DB', lineHeight: 1.6 }}>
                {evaluation?.improvements.map((imp, i) => (
                  <li key={i}>{imp}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Remediation Advice */}
          {evaluation?.remediationAdvice && (
            <div
              style={{
                padding: '14px 18px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '28px',
                fontSize: '13px',
                color: '#9CA3AF',
              }}
            >
              <strong style={{ color: '#E5E7EB' }}>Curriculum Recommendation: </strong>
              {evaluation.remediationAdvice}
            </div>
          )}

          {/* Finish & Replay Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              onClick={handleReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#E5E7EB',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={15} />
              <span>Practice Again</span>
            </button>

            <button
              onClick={() => {
                const activityResult: LearningActivityResult = {
                  activityId: scenario.id,
                  activityType: 'role_play',
                  completed: true,
                  score: evaluation?.overallScore || 85,
                  attempts: 1,
                  completedAt: new Date().toISOString(),
                };
                onActivityComplete?.(activityResult);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '8px',
                backgroundColor: '#1E6258',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <span>Accept Evaluation & Complete Slide</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
