import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Zap, 
  Save, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface ProgressTrackerProps {
  total: number;
  checked: number;
  goodCount: number;
  satisfiedCount: number;
  poorCount: number;
  onQuickFillGood: () => void;
  onSave: () => void;
  onReset: () => void;
  isSaving: boolean;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  total,
  checked,
  goodCount,
  satisfiedCount,
  poorCount,
  onQuickFillGood,
  onSave,
  onReset,
  isSaving,
}) => {
  const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;
  const isComplete = checked === total && total > 0;
  const hasDefects = poorCount > 0;

  return (
    <div className="sticky bottom-14 md:bottom-4 z-30 mx-auto max-w-4xl px-3 sm:px-4">
      <div className="rounded-2xl border border-white/[0.12] bg-slate-950/90 p-3 sm:p-4 shadow-2xl backdrop-blur-2xl transition-all">
        
        {/* Top Stat Row */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 items-center justify-center rounded-lg bg-emerald-500/20 px-2 font-mono text-xs font-bold text-emerald-400 border border-emerald-500/30">
              {checked} / {total}
            </span>
            <span className="text-xs font-semibold text-slate-300">
              {isComplete
                ? hasDefects
                  ? `⚠️ Ready (${poorCount} defect flagged)`
                  : '✅ 100% Completed'
                : `${percentage}% Checked`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {goodCount > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="h-3 w-3" /> {goodCount}
              </span>
            )}
            {satisfiedCount > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <AlertTriangle className="h-3 w-3" /> {satisfiedCount}
              </span>
            )}
            {poorCount > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30 animate-pulse">
                <XCircle className="h-3 w-3" /> {poorCount}
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/80 mb-3 border border-white/[0.04]">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              hasDefects
                ? 'bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500'
                : 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-glow-pass'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-between gap-2">
          
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onReset}
              className="touch-press rounded-xl border border-white/[0.08] bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
            >
              <RotateCcw className="h-3.5 w-3.5 inline mr-1" />
              Reset
            </button>

            {checked < total && (
              <button
                type="button"
                onClick={onQuickFillGood}
                className="touch-press flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 shadow-sm"
              >
                <Zap className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Pass Remaining ({total - checked})</span>
                <span className="sm:hidden">Pass ({total - checked})</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className={`touch-press flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xl transition-all ${
              hasDefects
                ? 'bg-rose-600 hover:bg-rose-500 shadow-glow-fail'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-glow-pass'
            } ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving Audit...' : hasDefects ? 'Submit with Defects' : 'Save Inspection'}</span>
          </button>

        </div>

      </div>
    </div>
  );
};
