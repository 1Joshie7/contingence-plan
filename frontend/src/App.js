import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import AssignmentDetail from './pages/AssignmentDetail';
import CreateAssignment from './pages/CreateAssignment';
import EditAssignment from './pages/EditAssignment';
import SubmissionsList from './pages/SubmissionsList';
import SubmissionDetail from './pages/SubmissionDetail';
import PlagiarismReports from './pages/PlagiarismReports';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Student routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assignment/:id"
          element={
            <ProtectedRoute requiredRole="student">
              <AssignmentDetail />
            </ProtectedRoute>
          }
        />

        {/* Lecturer routes */}
        <Route
          path="/lecturer"
          element={
            <ProtectedRoute requiredRole="lecturer">
              <LecturerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/assignments/new"
          element={
            <ProtectedRoute requiredRole="lecturer">
              <CreateAssignment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/assignments/:id/edit"
          element={
            <ProtectedRoute requiredRole="lecturer">
              <EditAssignment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/assignments/:id/submissions"
          element={
            <ProtectedRoute requiredRole="lecturer">
              <SubmissionsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/submissions/:id"
          element={
            <ProtectedRoute requiredRole="lecturer">
              <SubmissionDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/assignments/:id/plagiarism"
          element={
            <ProtectedRoute requiredRole="lecturer">
              <PlagiarismReports />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;