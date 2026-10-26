import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  BookOpen,
  Edit,
  Copy,
  Archive,
  Trash2,
  CheckCircle2,
  Eye,
  Layers,
} from 'lucide-react';
import { courseService } from '../../../services/course.service';
import { Course } from '../../../types';
import { Modal } from '../../../components/common/Modal';

export const CourseList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courses, setCourses] = useState<Course[]>(() => courseService.getCourses());

  // Creation modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCategory, setNewCategory] = useState('Foundations');

  // Delete modal state
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);

  const refreshCourses = () => {
    setCourses(courseService.getCourses());
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    courseService.createCourse({
      title: newTitle.trim(),
      code: newCode.trim() || `SEC-${Math.floor(100 + Math.random() * 900)}`,
      category: newCategory,
    });

    setNewTitle('');
    setNewCode('');
    setCreateModalOpen(false);
    refreshCourses();
  };

  const handleTogglePublish = (courseId: string) => {
    courseService.togglePublish(courseId);
    refreshCourses();
  };

  const handleDuplicate = (courseId: string) => {
    courseService.duplicateCourse(courseId);
    refreshCourses();
  };

  const handleArchive = (courseId: string) => {
    courseService.archiveCourse(courseId);
    refreshCourses();
  };

  const handleConfirmDelete = () => {
    if (deleteCourseId) {
      courseService.deleteCourse(deleteCourseId);
      setDeleteCourseId(null);
      refreshCourses();
    }
  };

  // Filter courses
  const filtered = courses.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch =
      !search.trim() ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="animate-fade-in">
      {/* Header & Create Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#173B3A', margin: 0 }}>Course Catalog Management</h1>
          <p style={{ color: '#68716D', fontSize: '13px', margin: '4px 0 0' }}>
            Publish, edit, and organize security curricula and prerequisite rules.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} />
          <span>Create New Course</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
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
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#8E9995',
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or course code..."
            className="form-input"
            style={{ paddingLeft: '36px' }}
          />
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'published', 'draft', 'archived'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                textTransform: 'capitalize',
                backgroundColor: statusFilter === status ? '#173B3A' : '#FAF8F3',
                color: statusFilter === status ? '#FFFFFF' : '#68716D',
                border: statusFilter === status ? '1px solid #173B3A' : '1px solid #E5E0D5',
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Course Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAF8F3', borderBottom: '2px solid #E5E0D5', color: '#68716D' }}>
                <th style={{ padding: '12px 16px' }}>Code</th>
                <th style={{ padding: '12px 16px' }}>Course Title</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>Units</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((course) => {
                const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
                return (
                  <tr key={course.id} style={{ borderBottom: '1px solid #E5E0D5' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#B87955' }}>
                      {course.code}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#173B3A' }}>{course.title}</div>
                      <div style={{ fontSize: '12px', color: '#8E9995' }}>{course.duration} • Passing: {course.passingScore}%</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#242C2D' }}>
                      <span className="badge badge-stone">{course.category}</span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#68716D' }}>
                      {course.modules.length} modules ({totalLessons} lessons)
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        className={`badge ${
                          course.status === 'published'
                            ? 'badge-success'
                            : course.status === 'draft'
                            ? 'badge-warning'
                            : 'badge-stone'
                        }`}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {course.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Link
                          to={`/admin/courses/${course.id}`}
                          className="btn btn-secondary btn-sm"
                          title="Edit Course Information"
                        >
                          <Edit size={14} />
                          <span>Edit</span>
                        </Link>

                        <button
                          onClick={() => handleTogglePublish(course.id)}
                          className="btn btn-secondary btn-sm"
                          title={course.status === 'published' ? 'Unpublish' : 'Publish'}
                        >
                          {course.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>

                        <button
                          onClick={() => handleDuplicate(course.id)}
                          className="btn btn-ghost btn-sm"
                          title="Duplicate Course"
                          aria-label="Duplicate Course"
                        >
                          <Copy size={14} />
                        </button>

                        {course.status !== 'archived' && (
                          <button
                            onClick={() => handleArchive(course.id)}
                            className="btn btn-ghost btn-sm"
                            title="Archive Course"
                            aria-label="Archive Course"
                          >
                            <Archive size={14} />
                          </button>
                        )}

                        <button
                          onClick={() => setDeleteCourseId(course.id)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#B44D45' }}
                          title="Delete Course"
                          aria-label="Delete Course"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Course Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Training Course"
      >
        <form onSubmit={handleCreateCourse}>
          <div className="form-group">
            <label className="form-label" htmlFor="courseTitle">Course Title</label>
            <input
              id="courseTitle"
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Advanced Defensive Tactical Observation"
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="courseCode">Course Code</label>
              <input
                id="courseCode"
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="e.g. SEC-201"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="courseCategory">Category</label>
              <select
                id="courseCategory"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="form-select"
              >
                <option value="Foundations">Foundations</option>
                <option value="Field Operations">Field Operations</option>
                <option value="Perimeter Defense">Perimeter Defense</option>
                <option value="Documentation & Crisis">Documentation & Crisis</option>
                <option value="Safety & Compliance">Safety & Compliance</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
            >
              Save New Course Draft
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteCourseId)}
        onClose={() => setDeleteCourseId(null)}
        title="Confirm Course Deletion"
      >
        <p style={{ fontSize: '14px', color: '#68716D', lineHeight: 1.5, marginBottom: '20px' }}>
          Are you sure you want to delete this course? This action will remove the curriculum outline from the catalog.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={() => setDeleteCourseId(null)}
            className="btn btn-secondary btn-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDelete}
            className="btn btn-danger btn-sm"
          >
            Delete Course
          </button>
        </div>
      </Modal>
    </div>
  );
};
