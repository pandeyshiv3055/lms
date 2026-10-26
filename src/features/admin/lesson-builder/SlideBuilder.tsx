import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Eye,
  ArrowUp,
  ArrowDown,
  BookOpen,
} from 'lucide-react';
import { courseService } from '../../../services/course.service';
import { Course, Lesson, Slide, SlideType, CompletionRule } from '../../../types';
import { IntroSlideRenderer, InstructorSlideRenderer } from '../../player/slide-renderers/IntroSlideRenderer';
import { CarouselSlideRenderer } from '../../player/slide-renderers/CarouselSlideRenderer';
import { ScrollablePanelSlideRenderer } from '../../player/slide-renderers/ScrollablePanelSlideRenderer';
import { CardGridSlideRenderer } from '../../player/slide-renderers/CardGridSlideRenderer';
import { KnowledgeCheckSlideRenderer } from '../../player/slide-renderers/KnowledgeCheckSlideRenderer';
import { SummarySlideRenderer } from '../../player/slide-renderers/QuizSlideRenderer';

export const SlideBuilder: React.FC = () => {
  const courses = courseService.getCourses();
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');

  const course = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const allLessons: Lesson[] = [];
  course?.modules.forEach((m) => m.lessons.forEach((l) => allLessons.push(l)));

  const [selectedLessonId, setSelectedLessonId] = useState<string>(allLessons[0]?.id || '');
  const currentLesson = allLessons.find((l) => l.id === selectedLessonId) || allLessons[0];

  const [selectedSlideId, setSelectedSlideId] = useState<string>(currentLesson?.slides[0]?.id || '');
  const currentSlide = currentLesson?.slides.find((s) => s.id === selectedSlideId) || currentLesson?.slides[0];

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Edit fields for active slide
  const [title, setTitle] = useState(currentSlide?.title || '');
  const [slideType, setSlideType] = useState<SlideType>(currentSlide?.type || 'instructor');
  const [completionRule, setCompletionRule] = useState<CompletionRule>(currentSlide?.completionRule || 'manual');
  const [duration, setDuration] = useState(currentSlide?.durationSeconds || 15);
  const [narration, setNarration] = useState(currentSlide?.narrationText || '');
  const [headline, setHeadline] = useState(currentSlide?.content?.headline || '');
  const [bodyText, setBodyText] = useState(currentSlide?.content?.bodyParagraphs?.join('\n\n') || '');

  // Synchronize form when selected slide changes
  React.useEffect(() => {
    if (currentSlide) {
      setTitle(currentSlide.title);
      setSlideType(currentSlide.type);
      setCompletionRule(currentSlide.completionRule);
      setDuration(currentSlide.durationSeconds || 15);
      setNarration(currentSlide.narrationText || '');
      setHeadline(currentSlide.content?.headline || '');
      setBodyText(currentSlide.content?.bodyParagraphs?.join('\n\n') || '');
    }
  }, [selectedSlideId]);

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSlide || !course || !currentLesson) return;

    const updatedParagraphs = bodyText.split('\n\n').filter((p) => p.trim().length > 0);

    courseService.updateSlide(course.id, currentLesson.id, currentSlide.id, {
      title,
      type: slideType,
      completionRule,
      durationSeconds: duration,
      requiredDurationSeconds: Math.min(duration, 10),
      narrationText: narration,
      content: {
        ...currentSlide.content,
        headline: headline || title,
        bodyParagraphs: updatedParagraphs.length > 0 ? updatedParagraphs : ['Instructional text content.'],
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleAddSlide = () => {
    if (!course || !currentLesson) return;
    const newSlide = courseService.addSlide(course.id, currentLesson.id, {
      title: 'New Training Slide',
      type: 'instructor',
      completionRule: 'timer',
      durationSeconds: 15,
      content: {
        headline: 'New Topic',
        bodyParagraphs: ['Enter instructional content here.'],
      },
    });
    if (newSlide) {
      setSelectedSlideId(newSlide.id);
    }
  };

  const handleDeleteSlide = (slideId: string) => {
    if (!course || !currentLesson) return;
    if (currentLesson.slides.length <= 1) {
      alert('A lesson must contain at least one slide.');
      return;
    }
    courseService.deleteSlide(course.id, currentLesson.id, slideId);
    setSelectedSlideId(currentLesson.slides[0]?.id || '');
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    if (!course || !currentLesson) return;
    const slides = [...currentLesson.slides];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= slides.length) return;

    const temp = slides[index];
    slides[index] = slides[targetIdx];
    slides[targetIdx] = temp;

    courseService.reorderSlides(course.id, currentLesson.id, slides.map((s) => s.id));
    setSelectedSlideId(slides[targetIdx].id);
  };

  return (
    <div className="animate-fade-in">
      {/* Top Bar with Course & Lesson Selectors */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#68716D', display: 'block', marginBottom: '4px' }}>
              Select Course:
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="form-select"
              style={{ minWidth: '240px' }}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}: {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#68716D', display: 'block', marginBottom: '4px' }}>
              Select Lesson Unit:
            </label>
            <select
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              className="form-select"
              style={{ minWidth: '240px' }}
            >
              {allLessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title} ({l.slides.length} slides)
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleAddSlide}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={15} />
          <span>Add Slide</span>
        </button>
      </div>

      {/* Main 3-Column Studio: Slide List on Left, Editor in Center, Live Preview on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1.2fr 1.4fr', gap: '20px', alignItems: 'start' }}>
        {/* Column 1: Slide List & Reordering */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: '#173B3A', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Slides ({currentLesson?.slides.length || 0})</span>
            <span style={{ fontSize: '11px', color: '#8E9995' }}>Reorderable</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {currentLesson?.slides.map((s, idx) => {
              const isSelected = s.id === selectedSlideId;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSlideId(s.id)}
                  style={{
                    padding: '8px 10px',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                    <span style={{ fontWeight: 700, color: isSelected ? '#D49B65' : '#8E9995', fontSize: '11px' }}>
                      {idx + 1}.
                    </span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleMoveSlide(idx, 'up')}
                      disabled={idx === 0}
                      style={{ padding: '2px', color: isSelected ? '#DDE5D7' : '#8E9995' }}
                      title="Move Up"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      onClick={() => handleMoveSlide(idx, 'down')}
                      disabled={idx === (currentLesson?.slides.length || 0) - 1}
                      style={{ padding: '2px', color: isSelected ? '#DDE5D7' : '#8E9995' }}
                      title="Move Down"
                    >
                      <ArrowDown size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteSlide(s.id)}
                      style={{ padding: '2px', color: '#B44D45' }}
                      title="Delete Slide"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Slide Field Editor */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', color: '#173B3A', margin: 0 }}>
              Slide Properties Editor
            </h3>
            {savedSuccess && (
              <span style={{ color: '#387A5A', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} />
                <span>Saved!</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSlide}>
            <div className="form-group">
              <label className="form-label" htmlFor="slideTitleInput">Slide Navigation Title</label>
              <input
                id="slideTitleInput"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="slideTypeSelect">Slide Layout Type</label>
                <select
                  id="slideTypeSelect"
                  value={slideType}
                  onChange={(e) => setSlideType(e.target.value as SlideType)}
                  className="form-select"
                >
                  <option value="intro">Intro / Title</option>
                  <option value="instructor">Instructor Notes</option>
                  <option value="carousel">Presenter Carousel Board</option>
                  <option value="scrollable-panel">Scrollable Legal Panel</option>
                  <option value="card-grid">Learn More Cards Grid</option>
                  <option value="knowledge-check">Knowledge Check</option>
                  <option value="room-inspection">Room Inspection Activity</option>
                  <option value="summary">Summary</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="completionRuleSelect">Completion Rule</label>
                <select
                  id="completionRuleSelect"
                  value={completionRule}
                  onChange={(e) => setCompletionRule(e.target.value as CompletionRule)}
                  className="form-select"
                >
                  <option value="manual">Manual (Learner Click)</option>
                  <option value="timer">Timer Duration Required</option>
                  <option value="explore-all">Explore All Items Required</option>
                  <option value="interaction">Scroll / Click Action</option>
                  <option value="pass-check">Correct Check Answer</option>
                  <option value="all-rooms">Inspect All Rooms</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="headlineInput">Main Slide Headline</label>
              <input
                id="headlineInput"
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Authority & Legal Boundaries"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="bodyTextInput">
                <span>Body Paragraphs</span>
                <span style={{ fontSize: '11px', color: '#8E9995' }}>separate by empty line</span>
              </label>
              <textarea
                id="bodyTextInput"
                rows={4}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                className="form-textarea"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="narrationInput">Audio Narration Script (Text-To-Speech)</label>
              <textarea
                id="narrationInput"
                rows={3}
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                placeholder="Spoken instructor narration script..."
                className="form-textarea"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Save size={15} />
              <span>Save Slide Changes</span>
            </button>
          </form>
        </div>

        {/* Column 3: Live Visual Slide Preview */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px', color: '#173B3A', marginBottom: '12px' }}>
            <Eye size={15} color="#B87955" />
            <span>Live Learner Slide Preview</span>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #242C2D',
              borderRadius: '8px',
              minHeight: '380px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            {currentSlide && (
              <div style={{ flex: 1, overflow: 'auto' }}>
                {slideType === 'intro' && <IntroSlideRenderer slide={currentSlide} />}
                {slideType === 'instructor' && <InstructorSlideRenderer slide={currentSlide} />}
                {slideType === 'carousel' && <CarouselSlideRenderer slide={currentSlide} />}
                {slideType === 'scrollable-panel' && <ScrollablePanelSlideRenderer slide={currentSlide} />}
                {slideType === 'card-grid' && <CardGridSlideRenderer slide={currentSlide} />}
                {slideType === 'knowledge-check' && <KnowledgeCheckSlideRenderer slide={currentSlide} />}
                {slideType === 'summary' && <SummarySlideRenderer slide={currentSlide} />}
                {slideType === 'room-inspection' && (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#68716D' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏢</div>
                    <div style={{ fontWeight: 700, color: '#173B3A' }}>Room Inspection Simulation Preview</div>
                    <div style={{ fontSize: '12px' }}>6 Interactive zones & irregularity reporting live in player</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
