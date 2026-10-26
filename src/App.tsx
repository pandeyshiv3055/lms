import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { authService } from './services/auth.service';
import { Login } from './features/auth/Login';
import { LearnerShell } from './components/layout/LearnerShell';
import { AdminShell } from './components/layout/AdminShell';

// Learner Views
import { Dashboard } from './features/learner/Dashboard';
import { CourseCatalogue } from './features/learner/CourseCatalogue';
import { CourseDetails } from './features/learner/CourseDetails';
import { CoursePlayer } from './features/player/CoursePlayer';
import { ProgressPage } from './features/progress/ProgressPage';
import { Profile } from './features/learner/Profile';

// Admin Views
import { AdminDashboard } from './features/admin/Dashboard';
import { CourseList } from './features/admin/course-editor/CourseList';
import { CourseEditor } from './features/admin/course-editor/CourseEditor';
import { SlideBuilder } from './features/admin/lesson-builder/SlideBuilder';
import { RoomScenarioEditor } from './features/admin/room-editor/RoomScenarioEditor';
import { QuizBuilder } from './features/admin/quiz-builder/QuizBuilder';
import { MediaLibrary } from './features/admin/media-library/MediaLibrary';
import { LearnerList } from './features/admin/learners/LearnerList';
import { AnalyticsView } from './features/admin/analytics/AnalyticsView';
import { SettingsView } from './features/admin/settings/SettingsView';
import { InteractiveModulesEditor } from './features/admin/interactive/InteractiveModulesEditor';
import { TrackingInspector } from './features/admin/tracking/TrackingInspector';

// Route Guards
const LearnerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAuth = authService.isAuthenticated();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAuth = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    // Ordinary learner cannot view admin routes
    return <Navigate to="/learner/dashboard" replace />;
  }

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const isAuth = authService.isAuthenticated();
  if (!isAuth) return <Navigate to="/login" replace />;

  if (authService.isAdmin()) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/learner/dashboard" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root Redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<Login />} />

        {/* Learner Portal Routes */}
        <Route
          path="/learner"
          element={
            <LearnerRoute>
              <LearnerShell />
            </LearnerRoute>
          }
        >
          <Route index element={<Navigate to="/learner/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="courses" element={<CourseCatalogue />} />
          <Route path="courses/:courseId" element={<CourseDetails />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Full-Screen Course Player (Learner Route) */}
        <Route
          path="/learner/player/:courseId/:lessonId"
          element={
            <LearnerRoute>
              <CoursePlayer />
            </LearnerRoute>
          }
        />

        {/* Administrator Portal Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminShell />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="courses" element={<CourseList />} />
          <Route path="courses/:courseId" element={<CourseEditor />} />
          <Route path="lessons" element={<SlideBuilder />} />
          <Route path="interactive-modules" element={<InteractiveModulesEditor />} />
          <Route path="scenarios" element={<RoomScenarioEditor />} />
          <Route path="quizzes" element={<QuizBuilder />} />
          <Route path="tracking" element={<TrackingInspector />} />
          <Route path="content-library" element={<MediaLibrary />} />
          <Route path="learners" element={<LearnerList />} />
          <Route path="analytics" element={<AnalyticsView />} />
          <Route path="settings" element={<SettingsView />} />
        </Route>

        {/* Fallback Redirect */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
