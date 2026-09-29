import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { ScannerPage } from '@/pages/ScannerPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { IntelligencePage } from '@/pages/IntelligencePage';
import { ReportsPage } from '@/pages/ReportsPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { AICopilotPage } from '@/pages/AICopilotPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';

function AppRoutes() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={<LandingPage isAuthenticated={true} onLogout={logout} />}
      />
      <Route path="/login" element={<Navigate to="/app" replace />} />

      {/* Protected Enterprise Console Routes */}
      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="scanner" element={<ScannerPage onOpenCopilot={() => {}} />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="intelligence" element={<IntelligencePage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="copilot" element={<AICopilotPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
