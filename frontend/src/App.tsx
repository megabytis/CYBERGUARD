import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { LandingPage } from '@/pages/LandingPage';
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
  return (
    <Routes>
      {/* Public Landing with Direct Dashboard Link */}
      <Route path="/" element={<LandingPage />} />

      {/* Direct Enterprise Console Routes - Direct Access */}
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Navigate to="/app/scanner" replace />} />
        <Route path="overview" element={<Navigate to="/app/scanner" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="scanner" element={<ScannerPage onOpenCopilot={() => {}} />} />
        <Route path="intelligence" element={<IntelligencePage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="copilot" element={<AICopilotPage />} />
        <Route path="profile" element={<Navigate to="/app/settings" replace />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Redirect legacy login requests directly to dashboard */}
      <Route path="/login" element={<Navigate to="/app" replace />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
