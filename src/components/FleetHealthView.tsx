import React from 'react';
import { Layers, CheckCircle2, AlertTriangle, ShieldCheck, Clock, User } from 'lucide-react';
import { EquipmentStat } from '../types/inspection';

interface FleetHealthViewProps {
  fleetStats: EquipmentStat[];
  onSelectEquipment: (equipmentId: string, type: string) => void;
}

export const FleetHealthView: React.FC<FleetHealthViewProps> = ({
  fleetStats,
  onSelectEquipment,
}) => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="rounded-2xl border border-white/[0.08] bg-slate-950/60 p-5 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Equipment Fleet Health Matrix</h2>
            <p className="text-xs text-slate-400">
              Live status, reliability ratings, and inspection track-backs for all port cranes.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Equipment Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {fleetStats.map((eq) => {
          const isHealthy = eq.status === 'HEALTHY';
          const isDefect = eq.status === 'DEFECT_LOGGED';

          return (
            <div
              key={eq.equipmentId}
              className="group rounded-2xl border border-white/[0.08] bg-slate-950/50 p-4 hover:border-emerald-500/40 hover:bg-slate-950/80 transition-all shadow-sm"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 font-mono text-sm font-bold text-white border border-white/[0.1]">
                    {eq.equipmentId}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-200">{eq.equipmentType} Crane</div>
                    <div className="text-[11px] text-slate-400">{eq.totalInspections} audits logged</div>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                    isHealthy
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : isDefect
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {eq.status}
                </span>
              </div>

              {/* Score bar */}
              <div className="space-y-1 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Reliability Rate</span>
                  <span className="font-bold text-emerald-400">{eq.reliabilityRate}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${eq.reliabilityRate}%` }}
                  />
                </div>
              </div>

              {/* Metadata */}
              <div className="text-[11px] text-slate-400 space-y-1 bg-slate-900/50 p-2.5 rounded-xl border border-white/[0.04] mb-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-slate-500" />
                  <span>Last Checked: {eq.lastInspectionDate || 'No audits yet'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="h-3 w-3 text-slate-500" />
                  <span>By: {eq.lastInspector || '-'} {eq.lastInspectorStaffId ? `(${eq.lastInspectorStaffId})` : ''}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectEquipment(eq.equipmentId, eq.equipmentType)}
                className="touch-press w-full rounded-xl border border-white/[0.1] bg-slate-900 py-2 text-xs font-bold text-white hover:bg-emerald-600 hover:border-emerald-500 transition-all"
              >
                Inspect {eq.equipmentId} Now →
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};
