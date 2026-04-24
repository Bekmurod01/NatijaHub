import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/admin/Dashboard';
import CompanyDashboard from './pages/company/Dashboard';
import CompanyInternships from './pages/company/Internships';
import CompanyApplications from './pages/company/Applications';
import StudentDashboard from './pages/student/Dashboard';
import StudentInternships from './pages/student/Internships';
import Notifications from './pages/Notifications';

const Spinner = () => <div>Loading...</div>;

function AppRoutes() {
  const { loading } = useContext(AuthContext);
  if (loading) return <Spinner />;

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
        {/* Student routes */}
        <Route path="/student" element={
          <ProtectedRoute roles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/student/internships" element={
          <ProtectedRoute roles={['student']}>
            <StudentInternships />
          </ProtectedRoute>
        } />
        {/* Company routes */}
        <Route path="/company" element={
          <ProtectedRoute roles={['company']}>
            <CompanyDashboard />
          </ProtectedRoute>
        } />
        <Route path="/company/internships" element={
          <ProtectedRoute roles={['company']}>
            <CompanyInternships />
          </ProtectedRoute>
        } />
        <Route path="/company/applications" element={
          <ProtectedRoute roles={['company']}>
            <CompanyApplications />
          </ProtectedRoute>
        } />
        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
  </AuthProvider>
);

export default App;
