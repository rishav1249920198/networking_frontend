import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const StaffDashboard = lazy(() => import('./pages/StaffDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PublicAdmissionPage = lazy(() => import('./pages/PublicAdmissionPage'));

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, hasRole } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !hasRole(roles)) return <Navigate to="/" replace />;
  return children;
};

const DashboardRouter = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'student' || user.role === 'co-admin') return <Navigate to="/dashboard/student" replace />;
  if (user.role === 'staff') return <Navigate to="/dashboard/staff" replace />;
  if (['centre_admin', 'super_admin', 'admin'].includes(user.role)) return <Navigate to="/dashboard/admin" replace />;
  return <Navigate to="/" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff' } }} />
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)' }}><div className="spinner" style={{ borderColor: 'rgba(10,36,99,0.3)', borderTopColor: 'var(--primary)', width: '40px', height: '40px', borderWidth: '4px' }}></div></div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admission" element={<PublicAdmissionPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
            <Route path="/dashboard/student" element={
              <ProtectedRoute roles={['student', 'co-admin']}><StudentDashboard /></ProtectedRoute>
            } />
            <Route path="/dashboard/staff" element={
              <ProtectedRoute roles={['staff']}><StaffDashboard /></ProtectedRoute>
            } />
            <Route path="/dashboard/admin" element={
              <ProtectedRoute roles={['centre_admin', 'super_admin', 'admin', 'co-admin']}><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
