// WardAlert Sentinel - Grouped Repetitive Alerts Section
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const GroupedAlertsSection: React.FC = () => {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const [featured, setFeatured] = useState<any>(null);

  useEffect(() => {
    fetch('/api/episodes/featured', { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => setFeatured(data))
      .catch(e => console.error('Failed to load featured episode:', e));
  }, [getAuthHeaders]);

  const timelinePoints = featured?.timeline || [
    { time: '10:04' },
    { time: '10:07' },
    { time: '10:10' },
    { time: '10:13' },
    { time: '10:16' },
    { time: '10:19' },
    { time: '10:22' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
          Grouped repetitive alerts
        </h2>
        <button
          type="button"
          onClick={() => navigate('/episodes')}
          className="text-xs font-semibold text-[#8B1E2F] hover:text-[#70121F] flex items-center gap-1 transition-colors"
        >
          <span>View all episodes</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Episode Card */}
      <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0">
              <Layers className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">Patient P021</div>
              <div className="text-xs font-medium text-slate-500">Low SpO₂</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-purple-800 bg-purple-100/70 px-2.5 py-1 rounded-full">
              7 similar alerts over 18 minutes
            </span>
            <button
              type="button"
              onClick={() => navigate('/episodes/EP-P021-SPO2')}
              className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              View Episode
            </button>
          </div>
        </div>

        {/* Explanatory text */}
        <p className="text-xs text-slate-500 mb-4">
          Instead of 7 separate alerts, they are grouped into one episode.
        </p>

        {/* Horizontal Timeline */}
        <div className="relative pt-3 pb-1">
          {/* Connecting Line */}
          <div className="absolute top-[21px] left-3 right-3 h-0.5 bg-slate-200" />

          {/* Timeline Dots */}
          <div className="relative flex justify-between items-center px-1">
            {timelinePoints.map((pt: any, idx: number) => (
              <div key={idx} className="flex flex-col items-center group">
                <div className="w-3 h-3 rounded-full bg-[#8B1E2F] border-2 border-white ring-2 ring-rose-200 z-10 transition-transform group-hover:scale-125" />
                <span className="text-[0.68rem] font-semibold text-slate-500 mt-2 tracking-tight">
                  {pt.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
