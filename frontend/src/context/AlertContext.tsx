// WardAlert Sentinel - Alert State & Action Context
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert, SummaryMetrics, EvidenceData } from '../types';
import { useAuth } from './AuthContext';

export interface AlertNotification {
  id: string;
  alertId?: string;
  patientId: string;
  bed: string;
  title: string;
  message: string;
  severity: 'P0' | 'P1' | 'GROUPED';
  timestamp: Date;
  read: boolean;
  alert?: Alert;
}

interface AlertContextType {
  alerts: Alert[];
  criticalAlerts: Alert[];
  summary: SummaryMetrics | null;
  loading: boolean;
  notifications: AlertNotification[];
  unreadCount: number;
  selectedAlertForEvidence: Alert | null;
  selectedAlertForAction: { alert: Alert; defaultAction: string } | null;
  isDemoOpen: boolean;
  isConsentOpen: boolean;
  refreshData: () => Promise<void>;
  openEvidenceModal: (alert: Alert) => void;
  closeEvidenceModal: () => void;
  openActionModal: (alert: Alert, defaultAction?: string) => void;
  closeActionModal: () => void;
  openDemoModal: () => void;
  closeDemoModal: () => void;
  acceptConsent: () => void;
  performAction: (alertId: string, action: string, overrideReason?: string, outcomeNotes?: string) => Promise<boolean>;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getAuthHeaders, role, user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<Alert[]>([]);
  const [summary, setSummary] = useState<SummaryMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Read notifications set from localStorage
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('wardalert_read_notifications');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Modals state
  const [selectedAlertForEvidence, setSelectedAlertForEvidence] = useState<Alert | null>(null);
  const [selectedAlertForAction, setSelectedAlertForAction] = useState<{ alert: Alert; defaultAction: string } | null>(null);
  const [isDemoOpen, setIsDemoOpen] = useState<boolean>(false);
  const [isConsentOpen, setIsConsentOpen] = useState<boolean>(() => {
    return localStorage.getItem('wardalert_consent_accepted') !== 'true';
  });

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const [sumRes, critRes, allRes] = await Promise.all([
        fetch('/api/alerts/summary', { headers: getAuthHeaders() }),
        fetch('/api/alerts/critical-attention', { headers: getAuthHeaders() }),
        fetch('/api/alerts?limit=100', { headers: getAuthHeaders() })
      ]);

      if (sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData);
      }
      if (critRes.ok) {
        const critData = await critRes.json();
        setCriticalAlerts(critData.criticalAlerts || []);
      }
      if (allRes.ok) {
        const allData = await allRes.json();
        setAlerts(allData.alerts || []);
      }
    } catch (err) {
      console.error('Failed to load alert data:', err);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    refreshData();
    // Poll every 8 seconds for real-time ward telemetry updates
    const interval = setInterval(refreshData, 8000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Derive dynamic notifications from live alerts and grouped alerts
  const notifications: AlertNotification[] = React.useMemo(() => {
    const list: AlertNotification[] = [];

    // 1. Critical P0 alerts
    criticalAlerts.forEach((a) => {
      list.push({
        id: `notif-${a.id}`,
        alertId: a.id,
        patientId: a.patientId,
        bed: a.patient?.bed || 'Bed 14',
        title: `CRITICAL: ${a.context || a.alertType.replace('_', ' ')}`,
        message: `${a.alertType.replace('_', ' ')} observed at ${a.observedValue}. Immediate intervention required.`,
        severity: 'P0',
        timestamp: new Date(a.timestamp),
        read: readNotificationIds.has(`notif-${a.id}`),
        alert: a
      });
    });

    // 2. High-priority P1 alerts (not already in critical list)
    alerts
      .filter((a) => a.severity === 'P1' && !criticalAlerts.some((c) => c.id === a.id))
      .slice(0, 3)
      .forEach((a) => {
        list.push({
          id: `notif-${a.id}`,
          alertId: a.id,
          patientId: a.patientId,
          bed: a.patient?.bed || 'Bed 21',
          title: `HIGH PRIORITY: ${a.context || a.alertType.replace('_', ' ')}`,
          message: `${a.alertType.replace('_', ' ')}: ${a.observedValue} (${a.deviation || 'Exceeds threshold'}).`,
          severity: 'P1',
          timestamp: new Date(a.timestamp),
          read: readNotificationIds.has(`notif-${a.id}`),
          alert: a
        });
      });

    // 3. Grouped alerts notification
    if (summary && summary.groupedAlerts > 0) {
      const groupedId = 'notif-grouped-episode';
      list.push({
        id: groupedId,
        patientId: 'P021',
        bed: 'Bed 21',
        title: 'GROUPED ALERTS CONSOLIDATION',
        message: `${summary.groupedAlerts} repetitive telemetry alarms consolidated into 1 episode.`,
        severity: 'GROUPED',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: readNotificationIds.has(groupedId)
      });
    }

    return list;
  }, [criticalAlerts, alerts, summary, readNotificationIds]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markNotificationAsRead = (notificationId: string) => {
    setReadNotificationIds((prev) => {
      const next = new Set(prev);
      next.add(notificationId);
      localStorage.setItem('wardalert_read_notifications', JSON.stringify(Array.from(next)));
      return next;
    });

    // Log NOTIFICATION_READ to audit trail
    fetch('/api/audit', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        action: 'NOTIFICATION_READ',
        reason: `Clinician marked notification ${notificationId} as read`,
        details: { notificationId }
      })
    }).catch(err => console.error('Failed to log notification read:', err));
  };

  const markAllNotificationsAsRead = () => {
    const allIds = new Set(readNotificationIds);
    notifications.forEach(n => allIds.add(n.id));
    setReadNotificationIds(allIds);
    localStorage.setItem('wardalert_read_notifications', JSON.stringify(Array.from(allIds)));

    fetch('/api/audit', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        action: 'NOTIFICATION_READ',
        reason: `Clinician marked all ${notifications.length} notifications as read`,
        details: { count: notifications.length }
      })
    }).catch(err => console.error('Failed to log all notifications read:', err));
  };

  const openEvidenceModal = (alert: Alert) => {
    setSelectedAlertForEvidence(alert);

    // Record ALERT_VIEWED
    fetch(`/api/alerts/${alert.id}/view`, {
      method: 'POST',
      headers: getAuthHeaders()
    }).catch(() => {});
  };

  const closeEvidenceModal = () => setSelectedAlertForEvidence(null);

  const openActionModal = (alert: Alert, defaultAction = 'ACKNOWLEDGE') =>
    setSelectedAlertForAction({ alert, defaultAction });
  const closeActionModal = () => setSelectedAlertForAction(null);

  const openDemoModal = () => {
    setIsDemoOpen(true);
    // Record DEMO_STARTED in audit
    fetch('/api/audit', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        action: 'DEMO_STARTED',
        reason: 'User opened Interactive Demonstration Scenario Console',
        details: { persona: role, timestamp: new Date().toISOString() }
      })
    }).catch(() => {});
  };

  const closeDemoModal = () => setIsDemoOpen(false);

  const acceptConsent = () => {
    localStorage.setItem('wardalert_consent_accepted', 'true');
    setIsConsentOpen(false);
  };

  const performAction = async (
    alertId: string,
    action: string,
    overrideReason?: string,
    outcomeNotes?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/alerts/${alertId}/action`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action, overrideReason, outcomeNotes })
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error executing alert action:', err);
      return false;
    }
  };

  return (
    <AlertContext.Provider
      value={{
        alerts,
        criticalAlerts,
        summary,
        loading,
        notifications,
        unreadCount,
        selectedAlertForEvidence,
        selectedAlertForAction,
        isDemoOpen,
        isConsentOpen,
        refreshData,
        openEvidenceModal,
        closeEvidenceModal,
        openActionModal,
        closeActionModal,
        openDemoModal,
        closeDemoModal,
        acceptConsent,
        performAction,
        markNotificationAsRead,
        markAllNotificationsAsRead
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};

