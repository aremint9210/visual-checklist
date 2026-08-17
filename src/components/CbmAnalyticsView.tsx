import React, { useState } from 'react';
import { 
  Activity, 
  Flame, 
  Trophy, 
  BellRing, 
  ShieldAlert, 
  Save, 
  TrendingUp, 
  Layers
} from 'lucide-react';
import { CbmSummary } from '../types/inspection';

interface CbmAnalyticsViewProps {
  cbmData: CbmSummary | null;
  supervisorPhone: string;
  supervisorEmail: string;
  onSaveAlertSettings: (phone: string, email: string) => void;
}

export const CbmAnalyticsView: React.FC<CbmAnalyticsViewProps> = ({
  cbmData,
  supervisorPhone,
  supervisorEmail,
  onSaveAlertSettings,
}) => {
  const [phoneInput, setPhoneInput] = useState(supervisorPhone);
  const [emailInput, setEmailInput] = useState(supervisorEmail);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmitSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAlertSettings(phoneInput, emailInput);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const healthScore = cbmData?.fleetHealthScore || 100;
  const hotspots = cbmData?.topHotspots || [];
  const rankings = cbmData?.equipmentRankings || [];

  return (
    <div className="space-y-6">
      
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Fleet Score KPI */}
        <div className="rounded-2xl border border-white/[0.08] bg-slate-950/60 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Fleet Reliability Index</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">{healthScore}%</span>
            <span className={`text-xs font-bold ${healthScore >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {healthScore >= 90 ? 'EXCELLENT' : 'ATTENTION'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Across {cbmData?.totalInspections || 0} completed visual audits
          </div>
        </div>

        {/* Defects Flagged */}
        <div className="rounded-2xl border border-white/[0.08] bg-slate-950/60 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Total Defect Occurrences</span>
            <Flame className="h-4 w-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-rose-400">
              {(cbmData?.totalPoor || 0) + (cbmData?.totalSatisfied || 0)}
            </span>
            <span className="text-xs text-slate-400">Defects Logged</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            🔴 {cbmData?.totalPoor || 0} Poor • 🟡 {cbmData?.totalSatisfied || 0} Satisfied
          </div>
        </div>

        {/* Monitored Cranes */}
        <div className="rounded-2xl border border-white/[0.08] bg-slate-950/60 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Monitored Fleet Assets</span>
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">{rankings.length || 9}</span>
            <span className="text-xs text-emerald-400 font-bold">100% Online</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Quay Cranes, RTG, RMG & Mobile Cranes
          </div>
        </div>

      </div>

      {/* Defect Hotspots Heatmap */}
      <div className="rounded-2xl border border-white/[0.08] bg-slate-950/60 p-5 backdrop-blur-xl">
        <div className="flex items-center gap-2.5 mb-4">
          <Flame className="h-5 w-5 text-rose-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Defect Hotspots Heatmap (CBM Preventive Focus)</h3>
            <p className="text-xs text-slate-400">Recurring items flagged across all crane visual checks</p>
          </div>
        </div>

        {hotspots.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No recurring defects recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {hotspots.map((h) => {
              const maxIncidents = Math.max(...hotspots.map((x) => x.totalIncidents), 1);
              const barWidth = Math.round((h.totalIncidents / maxIncidents) * 100);

              return (
                <div key={h.itemNo} className="space-y-1.5 rounded-xl border border-white/[0.06] bg-slate-900/40 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-emerald-400 font-mono mr-1.5">{h.itemNo}</strong>
                      <span className="text-slate-200">{h.description}</span>
                    </div>
                    <span className="font-bold text-rose-400 font-mono">{h.totalIncidents} incident(s)</span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{h.category}</span>
                    <span>🔴 {h.poorCount} Poor • 🟡 {h.satisfiedCount} Satisfied</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Crane Health Ranking Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-slate-950/60 p-5 backdrop-blur-xl">
        <div className="flex items-center gap-2.5 mb-4">
          <Trophy className="h-5 w-5 text-amber-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Equipment Reliability Ranking</h3>
            <p className="text-xs text-slate-400">Crane ranking based on inspection pass rates</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-400 uppercase font-semibold">
                <th className="pb-3">Equipment</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Audits</th>
                <th className="pb-3">Reliability</th>
                <th className="pb-3">Condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {rankings.map((eq) => (
                <tr key={eq.equipmentId} className="hover:bg-white/[0.02]">
                  <td className="py-3 font-mono font-bold text-white">{eq.equipmentId}</td>
                  <td className="py-3 text-slate-400">{eq.equipmentType}</td>
                  <td className="py-3 text-slate-300">{eq.inspectionsCount}</td>
                  <td className="py-3 font-mono font-bold text-emerald-400">{eq.reliabilityScore}%</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      eq.status === 'ATTENTION_NEEDED' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {eq.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supervisor Critical Alert Dispatch Settings */}
      <div className="rounded-2xl border border-white/[0.08] bg-slate-950/60 p-5 backdrop-blur-xl">
        <div className="flex items-center gap-2.5 mb-3">
          <BellRing className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-sm font-bold text-white">1-Tap Defect Dispatcher Configuration</h3>
            <p className="text-xs text-slate-400">Configure phone & email targets for instant defect escalation</p>
          </div>
        </div>

        <form onSubmit={handleSubmitSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Maintenance Lead WhatsApp Phone Number (with Country Code)
              </label>
              <input
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="e.g. +60123456789"
                className="w-full rounded-xl border border-white/[0.1] bg-slate-900 px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Supervisor Escalation Email Address
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="e.g. supervisor@port.com"
                className="w-full rounded-xl border border-white/[0.1] bg-slate-900 px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              {isSaved ? '✅ Settings saved successfully!' : 'Alerts are dispatched when FAIL items are logged.'}
            </span>
            <button
              type="submit"
              className="touch-press flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-glow-pass"
            >
              <Save className="h-4 w-4" />
              <span>Save Alert Settings</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
