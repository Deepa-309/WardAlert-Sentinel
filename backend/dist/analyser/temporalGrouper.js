"use strict";
// WardAlert Sentinel - Temporal Grouping Engine
// Clusters repetitive notifications into clinical episodes while preserving breakout safety.
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupAlertsTemporally = groupAlertsTemporally;
const breakoutLogic_1 = require("./breakoutLogic");
function groupAlertsTemporally(alerts, windowMinutes = 15) {
    const sorted = [...alerts].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const episodes = [];
    const presentedAlerts = [];
    const breakouts = [];
    let episodeSeq = 1;
    // Track active episodes by patientId + alertType
    const activeEpisodes = new Map();
    for (const alert of sorted) {
        const key = `${alert.patientId}_${alert.alertType}`;
        const activeEpisode = activeEpisodes.get(key);
        // Check if there is an open episode within window
        if (activeEpisode) {
            const timeSinceStart = (alert.timestamp.getTime() - activeEpisode.startTime.getTime()) / (1000 * 60);
            // Check breakout condition:
            const breakout = (0, breakoutLogic_1.checkBreakoutCondition)(alert, activeEpisode.alerts);
            if (breakout.shouldBreakout) {
                // Critical or deteriorating event MUST break out!
                activeEpisode.status = 'BROKEN_OUT';
                activeEpisode.breakoutReason = breakout.reason;
                activeEpisode.endTime = alert.timestamp;
                activeEpisodes.delete(key);
                // Alert is presented independently with breakout status
                alert.episodeId = null;
                presentedAlerts.push(alert);
                breakouts.push(alert);
                continue;
            }
            // If still within sliding window, append to episode
            if (timeSinceStart <= windowMinutes * 2) {
                activeEpisode.alertCount++;
                activeEpisode.endTime = alert.timestamp;
                activeEpisode.alerts.push(alert);
                alert.episodeId = activeEpisode.id;
                continue;
            }
            else {
                // Episode expired, close it
                activeEpisode.status = 'RESOLVED';
                activeEpisodes.delete(key);
            }
        }
        // Check if new alert is critical (P0/P1) - P0 is never grouped initially
        if (alert.severity === 'P0') {
            alert.episodeId = null;
            presentedAlerts.push(alert);
            breakouts.push(alert);
            continue;
        }
        // Create a new episode for moderate/low repetitive alerts
        const newEpisode = {
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
