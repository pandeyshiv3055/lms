import React, { useState, useEffect } from 'react';
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
  Clock,
  HelpCircle,
  AlertCircle,
  X,
} from 'lucide-react';
import { courseService } from '../../../services/course.service';
import { Course, Lesson, Slide, SlideType, CompletionRule, LessonType } from '../../../types';
import { IntroSlideRenderer, InstructorSlideRenderer } from '../../player/slide-renderers/IntroSlideRenderer';
import { CarouselSlideRenderer } from '../../player/slide-renderers/CarouselSlideRenderer';
import { ScrollablePanelSlideRenderer } from '../../player/slide-renderers/ScrollablePanelSlideRenderer';
import { CardGridSlideRenderer } from '../../player/slide-renderers/CardGridSlideRenderer';
import { KnowledgeCheckSlideRenderer } from '../../player/slide-renderers/KnowledgeCheckSlideRenderer';
import { SummarySlideRenderer } from '../../player/slide-renderers/QuizSlideRenderer';
import { Modal } from '../../../components/common/Modal';

export const SlideBuilder: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(() => courseService.getCourses());
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');

  const course = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const allLessons: Lesson[] = [];
  course?.modules?.forEach((m) => m.lessons?.forEach((l) => allLessons.push(l)));

  const [selectedLessonId, setSelectedLessonId] = useState<string>(allLessons[0]?.id || '');
  const currentLesson = allLessons.find((l) => l.id === selectedLessonId) || allLessons[0];

  const [selectedSlideId, setSelectedSlideId] = useState<string>(currentLesson?.slides?.[0]?.id || '');
  const currentSlide = currentLesson?.slides?.find((s) => s.id === selectedSlideId) || currentLesson?.slides?.[0];

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [lessonSuccessBanner, setLessonSuccessBanner] = useState<string | null>(null);

  // Lesson creation modal state
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDescription, setNewLessonDescription] = useState('');
  const [newLessonType, setNewLessonType] = useState<LessonType>('instructor');
  const [newLessonMinutes, setNewLessonMinutes] = useState(20);
  const [newLessonModuleId, setNewLessonModuleId] = useState<string>('');
  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);
  const [lessonFormError, setLessonFormError] = useState<string | null>(null);

  // Lesson deletion modal state
  const [showDeleteLessonModal, setShowDeleteLessonModal] = useState(false);
  const [isDeletingLesson, setIsDeletingLesson] = useState(false);

  // Edit fields for active slide
  const [title, setTitle] = useState(currentSlide?.title || '');
  const [slideType, setSlideType] = useState<SlideType>(currentSlide?.type || 'instructor');
  const [completionRule, setCompletionRule] = useState<CompletionRule>(currentSlide?.completionRule || 'manual');
  const [duration, setDuration] = useState(currentSlide?.durationSeconds || 15);
  const [narration, setNarration] = useState(currentSlide?.narrationText || '');
  const [headline, setHeadline] = useState(currentSlide?.content?.headline || '');
  const [bodyText, setBodyText] = useState(currentSlide?.content?.bodyParagraphs?.join('\n\n') || '');

  // Synchronize form when selected slide changes
  useEffect(() => {
    if (currentSlide) {
      setTitle(currentSlide.title || '');
      setSlideType(currentSlide.type || 'instructor');
      setCompletionRule(currentSlide.completionRule || 'manual');
      setDuration(currentSlide.durationSeconds || 15);
      setNarration(currentSlide.narrationText || '');
      setHeadline(currentSlide.content?.headline || '');
      setBodyText(currentSlide.content?.bodyParagraphs?.join('\n\n') || '');
    } else {
      setTitle('');
      setNarration('');
      setHeadline('');
      setBodyText('');
    }
  }, [selectedSlideId, currentSlide]);

  // Handle course switch
  const handleCourseChange = (newCourseId: string) => {
    setSelectedCourseId(newCourseId);
    const targetCourse = courses.find((c) => c.id === newCourseId);
    const targetLessons: Lesson[] = [];
    targetCourse?.modules?.forEach((m) => m.lessons?.forEach((l) => targetLessons.push(l)));

    if (targetLessons.length > 0) {
      setSelectedLessonId(targetLessons[0].id);
      setSelectedSlideId(targetLessons[0].slides?.[0]?.id || '');
    } else {
      setSelectedLessonId('');
      setSelectedSlideId('');
    }
  };

  // Open Add Lesson modal with clean state
  const handleOpenAddLessonModal = () => {
    setNewLessonTitle('');
    setNewLessonDescription('');
    setNewLessonType('instructor');
    setNewLessonMinutes(20);
    setNewLessonModuleId(course?.modules?.[0]?.id || '');
    setLessonFormError(null);
    setShowAddLessonModal(true);
  };

  // Submit new Lesson Unit
  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    const trimmedTitle = newLessonTitle.trim();
    if (!trimmedTitle) {
      setLessonFormError('Please enter a lesson title.');
      return;
    }

    if (trimmedTitle.length > 120) {
      setLessonFormError('Lesson title cannot exceed 120 characters.');
      return;
    }

    setIsSubmittingLesson(true);
    setLessonFormError(null);

    try {
      const createdLesson = courseService.addLesson(course.id, {
        title: trimmedTitle,
        description: newLessonDescription.trim(),
        type: newLessonType,
        estimatedMinutes: Number(newLessonMinutes) || 20,
        moduleId: newLessonModuleId || undefined,
      });

      if (createdLesson) {
        const freshCourses = courseService.getCourses();
        setCourses(freshCourses);
        setSelectedLessonId(createdLesson.id);
        setSelectedSlideId('');
        setShowAddLessonModal(false);
        setLessonSuccessBanner(`Lesson unit "${createdLesson.title}" created successfully under ${course.code}!`);
        setTimeout(() => setLessonSuccessBanner(null), 4000);
      }
    } catch (err: any) {
      setLessonFormError(err.message || 'Unable to create lesson unit. Please check your inputs.');
    } finally {
      setIsSubmittingLesson(false);
    }
  };

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

    const freshCourses = courseService.getCourses();
    setCourses(freshCourses);
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
      const freshCourses = courseService.getCourses();
      setCourses(freshCourses);
      setSelectedSlideId(newSlide.id);
    }
  };

  const handleConfirmDeleteLesson = () => {
    if (!course || !currentLesson) return;
    setIsDeletingLesson(true);
    try {
      const lessonTitle = currentLesson.title;
      const success = courseService.deleteLesson(course.id, currentLesson.id);
      if (success) {
        const freshCourses = courseService.getCourses();
        setCourses(freshCourses);

        const updatedCourse = freshCourses.find((c) => c.id === course.id);
        const remainingLessons: Lesson[] = [];
        updatedCourse?.modules?.forEach((m) => m.lessons?.forEach((l) => remainingLessons.push(l)));

        if (remainingLessons.length > 0) {
          setSelectedLessonId(remainingLessons[0].id);
          setSelectedSlideId(remainingLessons[0].slides?.[0]?.id || '');
        } else {
          setSelectedLessonId('');
          setSelectedSlideId('');
        }

        setShowDeleteLessonModal(false);
        setLessonSuccessBanner(`Lesson unit "${lessonTitle}" has been deleted successfully.`);
        setTimeout(() => setLessonSuccessBanner(null), 4000);
      }
    } catch (err: any) {
      alert(err.message || 'Unable to delete lesson unit.');
    } finally {
      setIsDeletingLesson(false);
    }
  };

  const handleDeleteSlide = (slideId: string) => {
    if (!course || !currentLesson) return;
    if (currentLesson.slides.length <= 1) {
      const confirmDeleteLast = window.confirm(
        'This is the only slide in this lesson unit. Deleting it will leave this lesson with 0 slides.\n\nTo delete the entire lesson unit instead, use the "Delete Lesson" button.\n\nDo you want to proceed with deleting this slide?'
      );
      if (!confirmDeleteLast) return;
    }
    courseService.deleteSlide(course.id, currentLesson.id, slideId);
    const freshCourses = courseService.getCourses();
    setCourses(freshCourses);
    const updatedLesson = courseService.getLesson(course.id, currentLesson.id)?.lesson;
    setSelectedSlideId(updatedLesson?.slides[0]?.id || '');
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
    const freshCourses = courseService.getCourses();
    setCourses(freshCourses);
    setSelectedSlideId(slides[targetIdx].id);
  };

  return (
    <div className="animate-fade-in">
      {/* Success Notification Banner */}
      {lessonSuccessBanner && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px 16px',
            backgroundColor: '#EAF3EE',
            border: '1px solid #9DC7B0',
            borderRadius: '8px',
            color: '#387A5A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#387A5A" />
            <span>{lessonSuccessBanner}</span>
          </div>
          <button
            onClick={() => setLessonSuccessBanner(null)}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#387A5A' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

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
              onChange={(e) => handleCourseChange(e.target.value)}
              className="form-select"
              id="select-course-dropdown"
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#68716D', display: 'block' }}>
                Select Lesson Unit:
              </label>
              {currentLesson && (
                <button
                  type="button"
                  onClick={() => setShowDeleteLessonModal(true)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#B44D45',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '0 4px',
                  }}
                  id="link-delete-lesson-unit"
                  title={`Delete lesson unit "${currentLesson.title}"`}
                >
                  <Trash2 size={12} />
                  <span>Delete Lesson</span>
                </button>
              )}
            </div>
            <select
              value={selectedLessonId}
              onChange={(e) => {
                setSelectedLessonId(e.target.value);
                const l = allLessons.find((item) => item.id === e.target.value);
                setSelectedSlideId(l?.slides?.[0]?.id || '');
              }}
              className="form-select"
              id="select-lesson-unit-dropdown"
              style={{ minWidth: '260px' }}
              disabled={allLessons.length === 0}
            >
              {allLessons.length === 0 ? (
                <option value="">No lesson units available</option>
              ) : (
                allLessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title} ({l.slides?.length || 0} slides)
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Action Buttons: Add Lesson Unit + Add Slide + Delete Lesson */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleOpenAddLessonModal}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            id="btn-add-lesson-unit"
            title="Create a new lesson unit under this course"
          >
            <Plus size={15} />
            <span>Add Lesson Unit</span>
          </button>

          <button
            type="button"
            onClick={handleAddSlide}
            disabled={!currentLesson}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            id="btn-add-slide"
            title={currentLesson ? 'Add a new slide to this lesson unit' : 'Create or select a lesson unit first'}
          >
            <Plus size={15} />
            <span>Add Slide</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteLessonModal(true)}
            disabled={!currentLesson}
            className="btn btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FBEBEA',
              color: '#B44D45',
              border: '1px solid #E8BFBB',
              fontWeight: 600,
              cursor: currentLesson ? 'pointer' : 'not-allowed',
              opacity: currentLesson ? 1 : 0.6,
            }}
            id="btn-delete-lesson-unit"
            title={currentLesson ? `Delete lesson unit "${currentLesson.title}"` : 'Select a lesson unit first'}
          >
            <Trash2 size={15} />
            <span>Delete Lesson</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Studio: Slide List on Left, Editor in Center, Live Preview on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1.2fr 1.4fr', gap: '20px', alignItems: 'start' }}>
        {/* Column 1: Slide List & Reordering */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: '#173B3A', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Slides ({currentLesson?.slides?.length || 0})</span>
            <span style={{ fontSize: '11px', color: '#8E9995' }}>Reorderable</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {!currentLesson || currentLesson.slides.length === 0 ? (
              <div
                style={{
                  padding: '24px 16px',
                  textAlign: 'center',
                  backgroundColor: '#FAF8F3',
                  borderRadius: '8px',
                  border: '1px dashed #D49B65',
                }}
              >
                <BookOpen size={24} color="#B87955" style={{ margin: '0 auto 8px', display: 'block' }} />
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#173B3A' }}>0 Slides Configured</div>
                <p style={{ fontSize: '11.5px', color: '#68716D', margin: '4px 0 12px' }}>
                  This lesson unit has no slides yet.
                </p>
                <button
                  type="button"
                  onClick={handleAddSlide}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  id="btn-add-first-slide"
                >
                  <Plus size={13} />
                  <span>Add First Slide</span>
                </button>
              </div>
            ) : (
              currentLesson.slides.map((s, idx) => {
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
                        style={{ padding: '2px', color: isSelected ? '#DDE5D7' : '#8E9995', border: 'none', background: 'transparent', cursor: idx === 0 ? 'default' : 'pointer' }}
                        title="Move Up"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        onClick={() => handleMoveSlide(idx, 'down')}
                        disabled={idx === (currentLesson?.slides.length || 0) - 1}
                        style={{ padding: '2px', color: isSelected ? '#DDE5D7' : '#8E9995', border: 'none', background: 'transparent', cursor: idx === (currentLesson?.slides.length || 0) - 1 ? 'default' : 'pointer' }}
                        title="Move Down"
                      >
                        <ArrowDown size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteSlide(s.id)}
                        style={{ padding: '2px', color: '#B44D45', border: 'none', background: 'transparent', cursor: 'pointer' }}
                        title="Delete Slide"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
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

          {!currentSlide ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: '#68716D' }}>
              <Layers size={32} color="#8E9995" style={{ margin: '0 auto 12px', display: 'block' }} />
              <h4 style={{ fontSize: '16px', color: '#173B3A', margin: '0 0 6px', fontWeight: 700 }}>
                No Slide Selected
              </h4>
              <p style={{ fontSize: '13px', margin: '0 0 16px', color: '#68716D' }}>
                {currentLesson
                  ? 'This lesson unit currently has zero slides. Click below to add the first slide.'
                  : 'Select a lesson unit to edit its slides.'}
              </p>
              {currentLesson && (
                <button
                  type="button"
                  onClick={handleAddSlide}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={14} />
                  <span>Add First Slide</span>
                </button>
              )}
            </div>
          ) : (
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
                  <span style={{ fontSize: '11px', color: '#8E9995', marginLeft: '6px' }}>(separate paragraphs with a blank line)</span>
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
          )}
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
            {!currentSlide ? (
              <div style={{ padding: '64px 24px', textAlign: 'center', color: '#8E9995', margin: 'auto' }}>
                <Eye size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#173B3A' }}>No Slide Content to Preview</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>Add a slide to view live interactive rendering</div>
              </div>
            ) : (
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

      {/* Add Lesson Unit Modal */}
      <Modal
        isOpen={showAddLessonModal}
        onClose={() => {
          if (!isSubmittingLesson) setShowAddLessonModal(false);
        }}
        title="Create New Lesson Unit"
        maxWidth="560px"
      >
        <form onSubmit={handleCreateLesson} style={{ padding: '4px 0' }}>
          {lessonFormError && (
            <div
              style={{
                marginBottom: '16px',
                padding: '10px 14px',
                backgroundColor: '#FAEEEC',
                border: '1px solid #E8ABA7',
                borderRadius: '6px',
                color: '#B44D45',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{lessonFormError}</span>
            </div>
          )}

          {/* Target Course Info Card */}
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#FAF8F3',
              border: '1px solid #E5E0D5',
              borderRadius: '6px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontSize: '11px', color: '#68716D', fontWeight: 700, display: 'block' }}>
                ASSOCIATED COURSE
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#173B3A' }}>
                {course ? `${course.code}: ${course.title}` : 'Selected Course'}
              </span>
            </div>
            <span className="badge badge-copper" style={{ fontSize: '11px' }}>
              {course?.category}
            </span>
          </div>

          {/* Module Association (if multiple modules) */}
          {course && course.modules && course.modules.length > 1 && (
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" htmlFor="newLessonModuleSelect">
                Target Module:
              </label>
              <select
                id="newLessonModuleSelect"
                value={newLessonModuleId}
                onChange={(e) => setNewLessonModuleId(e.target.value)}
                className="form-select"
              >
                {course.modules.map((m, idx) => (
                  <option key={m.id} value={m.id}>
                    {m.title || `Module ${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Lesson Title */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="newLessonTitleInput">
              Lesson Title <span style={{ color: '#B44D45' }}>*</span>
            </label>
            <input
              id="newLessonTitleInput"
              type="text"
              required
              autoFocus
              maxLength={120}
              placeholder="e.g. Lesson 1.2: Incident Reporting & Evidence Logging"
              value={newLessonTitle}
              onChange={(e) => setNewLessonTitle(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Lesson Type & Duration in 2 Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="newLessonTypeSelect">
                Lesson Type
              </label>
              <select
                id="newLessonTypeSelect"
                value={newLessonType}
                onChange={(e) => setNewLessonType(e.target.value as LessonType)}
                className="form-select"
              >
                <option value="instructor">Instructor Presentation</option>
                <option value="presentation">Interactive Board</option>
                <option value="knowledge-check">Knowledge Check</option>
                <option value="inspection">Facility Inspection</option>
                <option value="scenario">Branching Scenario</option>
                <option value="quiz">Certification Exam</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="newLessonDurationInput">
                Duration (minutes)
              </label>
              <input
                id="newLessonDurationInput"
                type="number"
                min={1}
                max={240}
                value={newLessonMinutes}
                onChange={(e) => setNewLessonMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className="form-input"
              />
            </div>
          </div>

          {/* Lesson Description */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" htmlFor="newLessonDescInput">
              Lesson Description / Objectives <span style={{ fontSize: '11px', color: '#8E9995' }}>(optional)</span>
            </label>
            <textarea
              id="newLessonDescInput"
              rows={3}
              placeholder="Learn standard operational procedures for logging incident reports, establishing perimeters, and escalating..."
              value={newLessonDescription}
              onChange={(e) => setNewLessonDescription(e.target.value)}
              className="form-textarea"
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setShowAddLessonModal(false)}
              disabled={isSubmittingLesson}
              className="btn btn-secondary btn-sm"
              id="btn-cancel-add-lesson"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingLesson || !newLessonTitle.trim()}
              className="btn btn-primary btn-sm"
              id="btn-save-new-lesson"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Save size={14} />
              <span>{isSubmittingLesson ? 'Creating Lesson...' : 'Create Lesson Unit'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Lesson Confirmation Modal */}
      <Modal
        isOpen={showDeleteLessonModal}
        onClose={() => !isDeletingLesson && setShowDeleteLessonModal(false)}
        title="Confirm Lesson Unit Deletion"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: '#FBEBEA',
                border: '1px solid #E8BFBB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Trash2 size={20} color="#B44D45" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#173B3A' }}>
                Are you sure you want to delete this lesson unit?
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#68716D', lineHeight: 1.5 }}>
                This action is permanent and will remove the lesson unit along with all of its slides from this course.
              </p>
            </div>
          </div>

          {currentLesson && (
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#F5F7F6',
                borderRadius: '6px',
                border: '1px solid #DCE3E0',
                fontSize: '13px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#68716D', fontWeight: 600 }}>Course:</span>
                <span style={{ color: '#173B3A', fontWeight: 700 }}>{course?.code}: {course?.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#68716D', fontWeight: 600 }}>Lesson Unit:</span>
                <span style={{ color: '#173B3A', fontWeight: 700 }}>{currentLesson.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#68716D', fontWeight: 600 }}>Total Slides:</span>
                <span style={{ color: '#173B3A', fontWeight: 700 }}>{currentLesson.slides?.length || 0} slide(s)</span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => setShowDeleteLessonModal(false)}
              disabled={isDeletingLesson}
              className="btn btn-secondary btn-sm"
              id="btn-cancel-delete-lesson"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDeleteLesson}
              disabled={isDeletingLesson}
              className="btn btn-danger btn-sm"
              id="btn-confirm-delete-lesson"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Trash2 size={14} />
              <span>{isDeletingLesson ? 'Deleting...' : 'Delete Lesson Unit'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
