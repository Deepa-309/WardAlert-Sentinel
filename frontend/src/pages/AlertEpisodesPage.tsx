// WardAlert Sentinel - Alert Episodes & Temporal Clustering Page
import React, { useState, useEffect } from 'react';
import { Layers, Clock, AlertTriangle, ShieldCheck, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Episode } from '../types';

export const AlertEpisodesPage: React.FC = () => {
  const { getAuthHeaders } = useAuth();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  useEffect(() => {
    fetch('/api/episodes', { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => setEpisodes(data.episodes || []))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [getAuthHeaders]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Grouped Alert Episodes
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Temporal clusters of repetitive physiological warnings consolidated into cohesive clinical episodes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Active Episodes:</span>
          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-purple-700 text-white">
            {episodes.length} Episodes
          </span>
        </div>
      </div>

      {/* Episodes List */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 font-medium">
          Loading active episodes...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {episodes.map((ep) => {
            const isBrokenOut = ep.status === 'BROKEN_OUT';

            return (
              <div
                key={ep.id}
                onClick={() => setSelectedEpisode(ep)}
                className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  isBrokenOut ? 'border-red-300 ring-1 ring-red-200' : 'border-slate-200/80'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-extrabold text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                    {ep.id}
                  </span>
                  <span
                    className={`text-[0.68rem] font-bold px-2 py-0.5 rounded-full ${
                      isBrokenOut
                        ? 'bg-red-100 text-red-800'
                        : ep.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {ep.status === 'BROKEN_OUT' ? 'BREAKOUT DETECTED' : ep.status}
                  </span>
                </div>

                {/* Patient & Vital */}
                <div className="font-extrabold text-slate-900 text-sm mb-1">
                  Patient {ep.patientId} • {ep.patient?.bed || 'Ward Bed'}
                </div>
                <div className="text-xs font-bold text-slate-600 mb-3">
                  {ep.alertType.replace('_', ' ')}
                </div>

                {/* Metrics */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs mb-3">
                  <div>
                    <span className="text-[0.65rem] font-bold text-slate-400 block">Consolidated</span>
                    <span className="text-base font-extrabold text-slate-900">{ep.alertCount} alarms</span>
                  </div>
                  <div>
                    <span className="text-[0.65rem] font-bold text-slate-400 block">Window</span>
                    <span className="text-xs font-semibold text-slate-700">15-min sliding</span>
                  </div>
                </div>

                {/* Breakout Notice */}
                {isBrokenOut && (
                  <div className="text-[0.7rem] font-bold text-red-700 bg-red-50 p-2 rounded-lg border border-red-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Deteriorated into P0 Critical alert</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Episode Detail Modal */}
      {selectedEpisode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Episode Trace</span>
                <h3 className="text-lg font-black text-slate-900">
                  {selectedEpisode.id} • Patient {selectedEpisode.patientId}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEpisode(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                This episode consolidated <strong>{selectedEpisode.alertCount} repetitive notifications</strong> into a single clinical card, preventing repeated bedside pager interruptions.
              </p>

              {selectedEpisode.breakoutReason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800">
                  <strong>Breakout Reason: </strong>
                  {selectedEpisode.breakoutReason}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEpisode(null)}
                className="px-4 py-2 bg-[#8B1E2F] hover:bg-[#721523] text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
