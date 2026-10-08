import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { SubmitComplaint } from './pages/SubmitComplaint';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { PriorityQueue } from './pages/PriorityQueue';
import { AdminCommandCenter } from './pages/AdminCommandCenter';
import { OfficerTasks } from './pages/OfficerTasks';
import { ComplaintDetail } from './pages/ComplaintDetail';
import { MapView } from './pages/MapView';
import { AnalyticsView } from './pages/AnalyticsView';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-sky-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Main App Layout
const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex">
        {user && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
        <main className={`flex-1 p-4 sm:p-6 transition-all ${user ? 'lg:ml-64' : ''}`}>
          <div className="max-w-7xl mx-auto">
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Home Redirection */}
              <Route
                path="/"
                element={
                  user ? (
                    user.role === 'ADMIN' ? (
                      <Navigate to="/command-center" replace />
                    ) : user.role === 'DEPARTMENT_HEAD' ? (
                      <Navigate to="/priority-queue" replace />
                    ) : user.role === 'OFFICER' ? (
                      <Navigate to="/officer-tasks" replace />
                    ) : (
                      <Navigate to="/dashboard" replace />
                    )
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              {/* Citizen Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <CitizenDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/submit"
                element={
                  <ProtectedRoute>
                    <SubmitComplaint />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-complaints"
                element={
                  <ProtectedRoute>
                    <CitizenDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Field Officer Routes */}
              <Route
                path="/officer-tasks"
                element={
                  <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN', 'DEPARTMENT_HEAD']}>
                    <OfficerTasks />
                  </ProtectedRoute>
                }
              />

              {/* Department Head & Admin Priority Queue */}
              <Route
                path="/priority-queue"
                element={
                  <ProtectedRoute allowedRoles={['DEPARTMENT_HEAD', 'ADMIN']}>
                    <PriorityQueue />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dept-complaints"
                element={
                  <ProtectedRoute allowedRoles={['DEPARTMENT_HEAD', 'ADMIN']}>
                    <PriorityQueue />
                  </ProtectedRoute>
                }
              />

              {/* Admin Command Center */}
              <Route
                path="/command-center"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminCommandCenter />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/all-complaints"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminCommandCenter />
                  </ProtectedRoute>
                }
              />

              {/* Complaint Detail View */}
              <Route
                path="/complaint/:id"
                element={
                  <ProtectedRoute>
                    <ComplaintDetail />
                  </ProtectedRoute>
                }
              />

              {/* Maps & Hotspot Intelligence */}
              <Route
                path="/map"
                element={
                  <ProtectedRoute>
                    <MapView />
                  </ProtectedRoute>
                }
              />

              {/* Analytics & Insights */}
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <AnalyticsView />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <AppLayout />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
