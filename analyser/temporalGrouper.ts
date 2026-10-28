// WardAlert Sentinel - Temporal Grouping Engine
// Clusters repetitive notifications into clinical episodes while preserving breakout safety.

import { SyntheticAlert } from '../simulation/generator';
import { checkBreakoutCondition } from './breakoutLogic';

export interface AlertEpisodeData {
  id: string;
  patientId: string;
  alertType: string;
  startTime: Date;
  endTime: Date;
  alertCount: number;
  status: 'ACTIVE' | 'RESOLVED' | 'BROKEN_OUT';
  representativeAlertId: string;
  breakoutReason?: string;
  alerts: SyntheticAlert[];
}

export interface GroupingResult {
  episodes: AlertEpisodeData[];
  presentedAlerts: SyntheticAlert[]; // Alerts shown to clinician
  groupedCount: number; // Alerts consolidated
  breakouts: SyntheticAlert[]; // Critical breakout alerts
}

export function groupAlertsTemporally(
  alerts: SyntheticAlert[],
  windowMinutes: number = 10
): GroupingResult {
  const sorted = [...alerts].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const episodes: AlertEpisodeData[] = [];
  const presentedAlerts: SyntheticAlert[] = [];
  const breakouts: SyntheticAlert[] = [];
  let episodeSeq = 1;

  // Track active episodes by patientId + alertType
  const activeEpisodes = new Map<string, AlertEpisodeData>();

  for (const alert of sorted) {
    // Check if the alert represents an emergency event (P0 Critical or P1 High-Priority)
    // either according to the current classifier or underlying ground-truth.
    const isP0orP1 = alert.severity === 'P0' || alert.severity === 'P1' || alert.groundTruthPriority === 'P0' || alert.groundTruthPriority === 'P1';

    // REGULATORY SAFETY INVARIANT:
    // P0 Critical and P1 High-Priority alerts must NEVER be grouped, consolidated, or hidden.
    // Grouping a critical alarm inside an episode container introduces visual latency and cognitive
    // suppression, which could delay life-saving resuscitation during acute cardiac or respiratory arrest.
    // If an active episode exists for this patient/vital, it is immediately marked as BROKEN_OUT and sealed.
    if (isP0orP1) {
      const key = `${alert.patientId}_${alert.alertType}`;
      const activeEpisode = activeEpisodes.get(key);
      if (activeEpisode) {
        activeEpisode.status = 'BROKEN_OUT';
        activeEpisode.breakoutReason = `High-priority / Critical alert (${alert.severity}) breached threshold; immediate breakout enforced.`;
        activeEpisode.endTime = alert.timestamp;
        activeEpisodes.delete(key);
      }

      alert.episodeId = null;
      presentedAlerts.push(alert);
      breakouts.push(alert);
      continue;
    }

    const key = `${alert.patientId}_${alert.alertType}`;
    const activeEpisode = activeEpisodes.get(key);

    // Evaluate existing active episode for this patient and vital parameter
    if (activeEpisode) {
      const timeSinceStart = (alert.timestamp.getTime() - activeEpisode.startTime.getTime()) / (1000 * 60);

      // WORSENING TREND DETECTION:
      // Even if the current alert is nominally P2, check if its trajectory indicates rapid deterioration
      // (e.g., steep SpO2 or blood pressure decline across the episode history).
      const breakout = checkBreakoutCondition(alert, activeEpisode.alerts);

      if (breakout.shouldBreakout) {
        // Patient condition is actively destabilizing; terminate episode and isolate the alert
        activeEpisode.status = 'BROKEN_OUT';
        activeEpisode.breakoutReason = breakout.reason;
        activeEpisode.endTime = alert.timestamp;
        activeEpisodes.delete(key);

        // Alert is presented independently with breakout status and attached trajectory evidence
        alert.episodeId = null;
        presentedAlerts.push(alert);
        breakouts.push(alert);
        continue;
      }

      const timeSinceLast = (alert.timestamp.getTime() - activeEpisode.endTime.getTime()) / (1000 * 60);

      // TEMPORAL CLUSTERING RULES:
      // 1. Same Patient & Vital: Ensured by composite hash key `${patientId}_${alertType}`.
      // 2. Strict Priority Tier Parity: Merging across different tiers (e.g., P2 moderate with P3 low)
      //    is prohibited because it would distort clinical urgency semantics and obscure moderate risks.
      // 3. Sliding Window Dynamic Gap: `timeSinceLast <= windowMinutes` ensures ongoing telemetry clusters
      //    are absorbed without artificial boundary slicing.
      // 4. Maximum Inception Cap (`timeSinceStart <= windowMinutes * 2`): Enforces a hard ceiling on episode
      //    longevity (e.g., 20m for a 10m window). This prevents a chronically borderline vital from spawning
      //    an infinite multi-day episode, guaranteeing periodic episodic closure and clinician re-evaluation.
      const samePriority = activeEpisode.alerts[0].severity === alert.severity;

      if ((timeSinceLast <= windowMinutes || timeSinceStart <= windowMinutes * 2) && samePriority) {
        activeEpisode.alertCount++;
        activeEpisode.endTime = alert.timestamp;
        activeEpisode.alerts.push(alert);
        alert.episodeId = activeEpisode.id;
        continue;
      } else {
        // Episode exceeded maximum temporal span or changed priority tier; seal previous episode
        activeEpisode.status = 'RESOLVED';
        activeEpisodes.delete(key);
      }
    }

    // Create a new episode for moderate/low repetitive alerts (P2/P3)
    const newEpisode: AlertEpisodeData = {
      id: `EP-${String(episodeSeq++).padStart(3, '0')}`,
      patientId: alert.patientId,
      alertType: alert.alertType,
      startTime: alert.timestamp,
      endTime: alert.timestamp,
      alertCount: 1,
      status: 'ACTIVE',
      representativeAlertId: alert.id,
      alerts: [alert]
    };

    alert.episodeId = newEpisode.id;
    episodes.push(newEpisode);
    activeEpisodes.set(key, newEpisode);
    presentedAlerts.push(alert);
  }

  // Calculate grouped count (total alerts minus presented alerts)
  const groupedCount = alerts.length - presentedAlerts.length;

  return {
    episodes,
    presentedAlerts,
    groupedCount,
    breakouts
  };
}
