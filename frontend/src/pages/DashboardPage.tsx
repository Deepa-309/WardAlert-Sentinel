// WardAlert Sentinel - Main Dashboard Page (Exact reference screenshot composition)
import React from 'react';
import { HeroSummary } from '../components/dashboard/HeroSummary';
import { CriticalAlertsSection } from '../components/dashboard/CriticalAlertsSection';
import { AlertFatigueOverview } from '../components/dashboard/AlertFatigueOverview';
import { GroupedAlertsSection } from '../components/dashboard/GroupedAlertsSection';
import { WardAlertSummary } from '../components/dashboard/WardAlertSummary';
import { ClinicianResponseSection } from '../components/dashboard/ClinicianResponseSection';
import { RightSafetyPanel } from '../components/layout/RightSafetyPanel';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

export const DashboardPage: React.FC = () => {
  return (
    <div className="flex flex-col xl:flex-row items-start gap-6 w-full max-w-[1600px] mx-auto">
      {/* Primary Dashboard Area */}
      <main className="flex-1 w-full space-y-6" id="main-dashboard-content">
        {/* RED SUMMARY HERO CARD (No greetings, purely alert metrics) */}
        <ErrorBoundary fallbackTitle="Hero Summary Unavailable">
          <HeroSummary />
        </ErrorBoundary>

        {/* ROW 1: Critical Alerts (Left) + Alert Fatigue Overview (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <ErrorBoundary fallbackTitle="Critical Alerts Unavailable">
            <CriticalAlertsSection />
          </ErrorBoundary>
          <ErrorBoundary fallbackTitle="Alert Fatigue Overview Unavailable">
            <AlertFatigueOverview />
          </ErrorBoundary>
        </div>

        {/* ROW 2: Grouped Repetitive Alerts (Left) + Ward Alert Summary (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <ErrorBoundary fallbackTitle="Grouped Alerts Unavailable">
            <GroupedAlertsSection />
          </ErrorBoundary>
          <ErrorBoundary fallbackTitle="Ward Alert Summary Unavailable">
            <WardAlertSummary />
          </ErrorBoundary>
        </div>

        {/* ROW 3: Clinician Response (Today) */}
        <ErrorBoundary fallbackTitle="Clinician Response Metrics Unavailable">
          <ClinicianResponseSection />
        </ErrorBoundary>
      </main>

      {/* Right Safety Information Column (~300px) */}
      <ErrorBoundary fallbackTitle="Safety Information Panel Unavailable">
        <RightSafetyPanel />
      </ErrorBoundary>
    </div>
  );
};
