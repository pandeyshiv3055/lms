import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, CheckCircle2, BookOpen } from 'lucide-react';
import { courseService } from '../../../services/course.service';
import { Course } from '../../../types';

export const CourseEditor: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const initialCourse = courseService.getCourseById(courseId || '');

  const [course, setCourse] = useState<Course | null>(initialCourse);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!course) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <h2>Course not found</h2>
        <button onClick={() => navigate('/admin/courses')} className="btn btn-secondary">
          Back to Courses
        </button>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    courseService.saveCourse(course);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/admin/courses')}
          className="btn btn-ghost btn-sm"
          style={{ padding: '6px 10px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </button>

        {savedSuccess && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              backgroundColor: '#EAF3EE',
              color: '#387A5A',
              fontWeight: 600,
              fontSize: '13px',
              border: '1px solid #9DC7B0',
            }}
          >
            <CheckCircle2 size={16} />
            <span>Course saved and catalog updated!</span>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <BookOpen size={22} color="#173B3A" />
          <h2 style={{ fontSize: '20px', color: '#173B3A', margin: 0 }}>
            Edit Course: {course.title}
          </h2>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="editTitle">Course Title</label>
              <input
                id="editTitle"
                type="text"
                required
                value={course.title}
                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="editCode">Course Code</label>
              <input
                id="editCode"
                type="text"
                required
                value={course.code}
                onChange={(e) => setCourse({ ...course, code: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="editCategory">Category</label>
              <select
                id="editCategory"
                value={course.category}
                onChange={(e) => setCourse({ ...course, category: e.target.value })}
                className="form-select"
              >
                <option value="Foundations">Foundations</option>
                <option value="Field Operations">Field Operations</option>
                <option value="Perimeter Defense">Perimeter Defense</option>
                <option value="Documentation & Crisis">Documentation & Crisis</option>
                <option value="Safety & Compliance">Safety & Compliance</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="editLevel">Difficulty Level</label>
              <select
                id="editLevel"
                value={course.level}
                onChange={(e) => setCourse({ ...course, level: e.target.value as any })}
                className="form-select"
              >
                <option value="Foundational">Foundational</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="editDuration">Estimated Duration</label>
              <input
                id="editDuration"
                type="text"
                value={course.duration}
                onChange={(e) => setCourse({ ...course, duration: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="editDescription">Full Course Description</label>
            <textarea
              id="editDescription"
              rows={4}
              value={course.description}
              onChange={(e) => setCourse({ ...course, description: e.target.value })}
              className="form-textarea"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="editAudience">Target Audience</label>
              <input
                id="editAudience"
                type="text"
                value={course.targetAudience}
                onChange={(e) => setCourse({ ...course, targetAudience: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="editPassingScore">Exam Passing Threshold (%)</label>
              <input
                id="editPassingScore"
                type="number"
                min={50}
                max={100}
                value={course.passingScore}
                onChange={(e) => setCourse({ ...course, passingScore: Number(e.target.value) })}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="editStatus">Catalog Status</label>
            <select
              id="editStatus"
              value={course.status}
              onChange={(e) => setCourse({ ...course, status: e.target.value as any })}
              className="form-select"
            >
              <option value="published">Published (Visible in Learner Portal)</option>
              <option value="draft">Draft (Hidden from Learner Enrollment)</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={() => navigate('/admin/courses')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Save size={16} />
              <span>Save Course Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
