import React from 'react';
import { AlertOctagon, CheckCircle2, MessageSquare } from 'lucide-react';
import { OpenDefect } from '../types/inspection';

interface OpenDefectsBannerProps {
  equipmentId: string;
  defects: OpenDefect[];
  lastInspectionDate: string;
  onRectify: (itemNo: string) => void;
}

export const OpenDefectsBanner: React.FC<OpenDefectsBannerProps> = ({
  equipmentId,
  defects,
  lastInspectionDate,
  onRectify,
}) => {
  if (!defects || defects.length === 0) return null;

  return (
    <div className="mb-6 rounded-2xl border border-rose-500/40 bg-gradient-to-br from-rose-950/40 via-slate-900/60 to-slate-950 p-4 sm:p-5 shadow-glow-fail animate-fade-in">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <AlertOctagon className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Active Issues on {equipmentId}</span>
              <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                {defects.length} Unresolved
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Reported on {lastInspectionDate}. Verify condition below or mark rectified.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {defects.map((defect) => (
          <div
            key={defect.itemNo}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-slate-950/70 p-3.5"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded bg-rose-500/20 px-1.5 py-0.5 font-mono text-xs font-bold text-rose-400">
                  {defect.itemNo}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-200">
                  {defect.description}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  defect.status === 'POOR' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {defect.status}
                </span>
              </div>
              {defect.remark && (
                <div className="flex items-center gap-1.5 text-xs text-amber-300/90 pl-1">
                  <MessageSquare className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <em>"{defect.remark}"</em>
                  <span className="text-slate-500 text-[11px]">— by {defect.reportedBy}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onRectify(defect.itemNo)}
              className="touch-press flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 px-3.5 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all shrink-0"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Mark Rectified / Repaired</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
