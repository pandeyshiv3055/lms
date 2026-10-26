import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Course, Lesson, Slide } from '../../types';
import { courseService } from '../../services/course.service';
import { progressService } from '../../services/progress.service';
import { authService } from '../../services/auth.service';
import { PlayerSidebar } from './components/PlayerSidebar';
import { PlayerControls } from './components/PlayerControls';
import { IntroSlideRenderer, InstructorSlideRenderer } from './slide-renderers/IntroSlideRenderer';
import { CarouselSlideRenderer } from './slide-renderers/CarouselSlideRenderer';
import { ScrollablePanelSlideRenderer } from './slide-renderers/ScrollablePanelSlideRenderer';
import { CardGridSlideRenderer } from './slide-renderers/CardGridSlideRenderer';
import { KnowledgeCheckSlideRenderer } from './slide-renderers/KnowledgeCheckSlideRenderer';
import { QuizSlideRenderer, SummarySlideRenderer } from './slide-renderers/QuizSlideRenderer';
import { BuildingInspectionActivity } from './room-inspection/BuildingInspectionActivity';
import { InteractiveVideoPlayer } from './interactive-video/InteractiveVideoPlayer';
import { BranchingScenarioPlayer } from './branching-scenario/BranchingScenarioPlayer';
import { AIRolePlayPlayer } from './role-play/AIRolePlayPlayer';
import { AlertTriangle, Lock } from 'lucide-react';

export const CoursePlayer: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const userId = user?.id || 'user-demo-learner';

  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Playback & Timing state
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [slideCompletedLocally, setSlideCompletedLocally] = useState(false);
  const [interactionState, setInteractionState] = useState<Record<string, any>>({});
  const [scrollPosition, setScrollPosition] = useState<number>(0);

  const timerRef = useRef<number | null>(null);

  // 1. Load course and lesson with strict prerequisite access check
  useEffect(() => {
    if (!courseId || !lessonId) return;

    const loadedCourse = courseService.getCourseById(courseId);
    if (!loadedCourse) {
      navigate('/learner/courses', { replace: true });
      return;
    }
    setCourse(loadedCourse);

    // ANTI-SKIP PREREQUISITE GUARD: Check if learner can access this lesson!
    const canAccess = progressService.canAccessLesson(userId, courseId, lessonId);
    if (!canAccess) {
      // Redirect to the first incomplete or permitted lesson
      const firstLesson = loadedCourse.modules[0]?.lessons[0]?.id || '';
      navigate(`/learner/player/${courseId}/${firstLesson}`, { replace: true });
      return;
    }

    const context = courseService.getLesson(courseId, lessonId);
    if (context) {
      setCurrentLesson(context.lesson);

      // Restore saved playback position for this lesson
      const savedPos = progressService.getActivePosition(userId, lessonId);
      if (savedPos) {
        setSlideIndex(Math.min(savedPos.slideIndex, context.lesson.slides.length - 1));
        setElapsedSeconds(savedPos.elapsedSeconds);
        setInteractionState(savedPos.interactions || {});
        setScrollPosition(savedPos.scrollPosition || 0);
      } else {
        setSlideIndex(0);
        setElapsedSeconds(0);
        setInteractionState({});
        setScrollPosition(0);
      }
      setIsPlaying(true);
    }
  }, [courseId, lessonId, userId, navigate]);

  // Current Slide
  const currentSlide: Slide | null =
    currentLesson && currentLesson.slides[slideIndex]
      ? currentLesson.slides[slideIndex]
      : null;

  const totalSlides = currentLesson?.slides.length || 0;
  const requiredDuration = currentSlide?.requiredDurationSeconds || 0;

  // Determine if current slide is complete
  const isSlideAlreadySavedComplete =
    currentLesson && currentSlide
      ? progressService.isSlideCompleted(userId, currentLesson.id, currentSlide.id)
      : false;

  const isCurrentSlideInspection =
    currentSlide?.type === 'room-inspection' || currentSlide?.id === 'slide-8-room-inspection';

  const isSlideComplete = isCurrentSlideInspection
    ? isSlideAlreadySavedComplete ||
      progressService.isRoomInspectionComplete(
        userId,
        currentSlide?.content.buildingScenarioId || 'scenario-facility-04'
      )
    : isSlideAlreadySavedComplete || slideCompletedLocally;

  // 2. Timer engine for timed slides
  useEffect(() => {
    if (!isPlaying || !currentSlide) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        // If slide relies on timer duration, mark complete when elapsed >= required
        if (requiredDuration > 0 && next >= requiredDuration && !isSlideComplete) {
          handleInteractionComplete();
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentSlide, requiredDuration, isSlideComplete]);

  // 3. Tab visibility handling: pause timers when browser tab is hidden, resume ONLY if was playing!
  const wasPlayingBeforeTabHiddenRef = useRef<boolean>(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        wasPlayingBeforeTabHiddenRef.current = isPlaying;
        setIsPlaying(false);
      } else {
        if (wasPlayingBeforeTabHiddenRef.current) {
          setIsPlaying(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying]);

  // 4. Save playback position on unmount / slide change
  useEffect(() => {
    if (!currentLesson) return;

    progressService.saveActivePosition(userId, currentLesson.id, {
      slideIndex,
      elapsedSeconds,
      interactions: interactionState,
      scrollPosition,
    });
  }, [userId, currentLesson, slideIndex, elapsedSeconds, interactionState, scrollPosition]);

  // Reset local state when navigating between slides
  useEffect(() => {
    setSlideCompletedLocally(false);
    setElapsedSeconds(0);
  }, [slideIndex]);

  // Interaction complete callback from slide renderers
  const handleInteractionComplete = useCallback(() => {
    setSlideCompletedLocally(true);

    if (course && currentLesson && currentSlide) {
      progressService.markSlideCompleted(
        userId,
        course.id,
        currentLesson.id,
        currentSlide.id
      );
    }
  }, [course, currentLesson, currentSlide, userId]);

  // Handle Previous Slide
  const handlePrevious = () => {
    if (slideIndex > 0) {
      setSlideIndex((prev) => prev - 1);
    }
  };

  // Handle Next Slide (Strictly guarded by isSlideComplete)
  const handleNext = () => {
    if (!isSlideComplete) return;

    if (slideIndex < totalSlides - 1) {
      setSlideIndex((prev) => prev + 1);
    } else {
      // Last slide of lesson completed! Mark lesson complete
      if (course && currentLesson) {
        progressService.markLessonCompleted(userId, course.id, currentLesson.id);

        // Find next sequential lesson in course
        const allLessons: Lesson[] = [];
        course.modules.forEach((m) => m.lessons.forEach((l) => allLessons.push(l)));
        const currentIdx = allLessons.findIndex((l) => l.id === currentLesson.id);

        if (currentIdx >= 0 && currentIdx < allLessons.length - 1) {
          const nextLesson = allLessons[currentIdx + 1];
          navigate(`/learner/player/${course.id}/${nextLesson.id}`);
        } else {
          // Entire course completed!
          navigate(`/learner/courses/${course.id}`);
        }
      }
    }
  };

  // Handle Restart Lesson
  const handleRestart = () => {
    if (!currentLesson) return;
    progressService.restartLesson(userId, currentLesson.id);
    progressService.resetRoomInspectionProgress(userId, 'scenario-facility-04');
    setSlideIndex(0);
    setElapsedSeconds(0);
    setInteractionState({});
    setScrollPosition(0);
    setSlideCompletedLocally(false);
    setIsPlaying(false);
  };

  // Switch Lesson from Sidebar
  const handleSelectLesson = (targetLessonId: string) => {
    if (!course) return;
    navigate(`/learner/player/${course.id}/${targetLessonId}`);
  };

  if (!course || !currentLesson || !currentSlide) {
    return (
      <div
        style={{
          height: '100vh',
          backgroundColor: '#181E1F',
          color: '#FAF8F3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Loading interactive player...
      </div>
    );
  }

  // Render appropriate slide component based on typed slide schema
  const renderSlideContent = () => {
    switch (currentSlide.type) {
      case 'intro':
      case 'title':
        return <IntroSlideRenderer slide={currentSlide} onInteractionComplete={handleInteractionComplete} />;

      case 'instructor':
        return <InstructorSlideRenderer slide={currentSlide} onInteractionComplete={handleInteractionComplete} />;

      case 'carousel':
        return (
          <CarouselSlideRenderer
            slide={currentSlide}
            savedInteractions={interactionState}
            onUpdateInteractions={(inter) => setInteractionState((prev) => ({ ...prev, ...inter }))}
            onInteractionComplete={handleInteractionComplete}
          />
        );

      case 'scrollable-panel':
        return (
          <ScrollablePanelSlideRenderer
            slide={currentSlide}
            savedScrollPosition={scrollPosition}
            onUpdateScrollPosition={(pos) => setScrollPosition(pos)}
            onInteractionComplete={handleInteractionComplete}
          />
        );

      case 'card-grid':
        return (
          <CardGridSlideRenderer
            slide={currentSlide}
            savedInteractions={interactionState}
            onUpdateInteractions={(inter) => setInteractionState((prev) => ({ ...prev, ...inter }))}
            onInteractionComplete={handleInteractionComplete}
          />
        );

      case 'knowledge-check':
      case 'multiple-choice':
      case 'true-false':
        return (
          <KnowledgeCheckSlideRenderer
            slide={currentSlide}
            savedInteractions={interactionState[currentSlide.id]}
            onUpdateInteractions={(inter) =>
              setInteractionState((prev) => ({ ...prev, [currentSlide.id]: inter }))
            }
            onInteractionComplete={handleInteractionComplete}
          />
        );

      case 'room-inspection':
        return (
          <BuildingInspectionActivity
            scenarioId={currentSlide.content.buildingScenarioId}
            onActivityComplete={handleInteractionComplete}
          />
        );

      case 'interactive-video':
        return (
          <InteractiveVideoPlayer
            data={currentSlide.content.interactiveVideo || currentSlide.content.interactiveVideoData!}
            onComplete={handleInteractionComplete}
          />
        );

      case 'branching-scenario':
        return (
          <BranchingScenarioPlayer
            data={currentSlide.content.branchingScenario || currentSlide.content.branchingScenarioData!}
            onComplete={handleInteractionComplete}
          />
        );

      case 'role-play':
        return (
          <AIRolePlayPlayer
            scenario={currentSlide.content.rolePlayScenario}
            userId={userId}
            courseId={course.id}
            lessonId={currentLesson.id}
            onActivityComplete={handleInteractionComplete}
          />
        );

      case 'quiz-intro':
      case 'quiz-question':
      case 'results':
        return (
          <QuizSlideRenderer
            slide={currentSlide}
            courseId={course.id}
            onInteractionComplete={handleInteractionComplete}
          />
        );

      case 'summary':
      case 'completion':
        return <SummarySlideRenderer slide={currentSlide} onInteractionComplete={handleInteractionComplete} />;

      default:
        return <IntroSlideRenderer slide={currentSlide} onInteractionComplete={handleInteractionComplete} />;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: '#181E1F',
      }}
    >
      {/* A. Left Navigation Sidebar */}
      <PlayerSidebar
        course={course}
        currentLessonId={currentLesson.id}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSelectLesson={handleSelectLesson}
      />

      {/* Main Stage & Playback Wrapper */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          minWidth: 0,
          backgroundColor: '#1E2425',
        }}
      >
        {/* Stage Top Breadcrumb Bar */}
        <div
          style={{
            height: '48px',
            backgroundColor: '#141A1B',
            borderBottom: '1px solid #2E3839',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#A3AFAC',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#D49B65', fontWeight: 700 }}>{course.code}</span>
            <span>/</span>
            <span style={{ color: '#FAF8F3', fontWeight: 600 }}>{currentLesson.title}</span>
            <span>/</span>
            <span>{currentSlide.title}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#DDE5D7' }}>
              Slide {slideIndex + 1} of {totalSlides}
            </span>
          </div>
        </div>

        {/* Centered Slide Learning Canvas */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflow: 'auto',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '1180px',
              height: '100%',
              maxHeight: '660px',
              aspectRatio: '16/9',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-player)',
              border: '2px solid #2E3839',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {renderSlideContent()}
          </div>
        </div>

        {/* C. Bottom Playback Controls */}
        <PlayerControls
          currentSlide={currentSlide}
          slideIndex={slideIndex}
          totalSlides={totalSlides}
          isPlaying={isPlaying}
          onTogglePlay={setIsPlaying}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onRestart={handleRestart}
          canGoPrevious={slideIndex > 0}
          canGoNext={isSlideComplete}
          elapsedSeconds={elapsedSeconds}
          requiredDurationSeconds={requiredDuration}
          isSlideComplete={isSlideComplete}
          onNarrationFinished={handleInteractionComplete}
        />
      </div>
    </div>
  );
};
