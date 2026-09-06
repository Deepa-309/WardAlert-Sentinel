// WardAlert Sentinel - Root Application with Router & Context Providers
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ViewProvider } from './context/ViewContext';
import { AlertProvider } from './context/AlertContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { EvidenceModal } from './components/modals/EvidenceModal';
import { ActionModal } from './components/modals/ActionModal';
import { ConsentModal } from './components/modals/ConsentModal';
import { DemoModal } from './components/modals/DemoModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { LiveAlertsPage } from './pages/LiveAlertsPage';
import { PatientsPage } from './pages/PatientsPage';
import { AlertEpisodesPage } from './pages/AlertEpisodesPage';
import { AlertFatiguePage } from './pages/AlertFatiguePage';
import { BeforeVsAfterPage } from './pages/BeforeVsAfterPage';
import { ErrorAnalysisPage } from './pages/ErrorAnalysisPage';
import { ExperimentsPage } from './pages/ExperimentsPage';
import { CriticalAlertsPage } from './pages/CriticalAlertsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { EdgeCasesPage } from './pages/EdgeCasesPage';
import { SettingsPage } from './pages/SettingsPage';
import { UserGuidePage } from './pages/UserGuidePage';
import { ConsentPage } from './pages/ConsentPage';
import { RoleSelectionPage } from './pages/RoleSelectionPage';

export const App: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileDrawerOpen(prev => !prev);
    } else {
      setSidebarCollapsed(prev => !prev);
    }
  };

  return (
    <Router>
      <AuthProvider>
        <ViewProvider>
          <AlertProvider>
            <div className="min-h-screen bg-[#F8F9FA] text-[#1E293B] flex">
              {/* Left Sidebar (240px) */}
              <Sidebar
                isCollapsed={sidebarCollapsed}
                mobileOpen={mobileDrawerOpen}
                onClose={() => setMobileDrawerOpen(false)}
              />

              {/* Main Content Layout Wrapper */}
              <div
                className={`flex-1 ${
                  sidebarCollapsed ? 'md:pl-0' : 'md:pl-[240px]'
                } flex flex-col min-w-0 min-h-screen transition-all duration-200`}
              >
                {/* Top Header (72px) */}
                <TopHeader onToggleSidebar={handleToggleSidebar} />

                {/* Main Scrollable Canvas */}
                <div className="flex-1 p-4 sm:p-6 md:p-8">
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/alerts" element={<LiveAlertsPage />} />
                    <Route path="/patients" element={<PatientsPage />} />
                    <Route path="/episodes" element={<AlertEpisodesPage />} />
                    <Route path="/episodes/:id" element={<AlertEpisodesPage />} />
                    <Route path="/fatigue" element={<AlertFatiguePage />} />
                    <Route path="/before-after" element={<BeforeVsAfterPage />} />
                    <Route path="/error-analysis" element={<ErrorAnalysisPage />} />
                    <Route path="/experiments" element={<ExperimentsPage />} />
                    <Route path="/critical" element={<CriticalAlertsPage />} />
                    <Route path="/audit" element={<AuditLogPage />} />
                    <Route path="/edge-cases" element={<EdgeCasesPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/guide" element={<UserGuidePage />} />
                    <Route path="/consent" element={<ConsentPage />} />
                    <Route path="/roles" element={<RoleSelectionPage />} />
                  </Routes>
                </div>
              </div>

              {/* Global Interactive Modals */}
              <EvidenceModal />
              <ActionModal />
              <ConsentModal />
              <DemoModal />
            </div>
          </AlertProvider>
        </ViewProvider>
      </AuthProvider>
    </Router>
  );
};
