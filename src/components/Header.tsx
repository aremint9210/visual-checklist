import React from 'react';
import { 
  ShieldCheck, 
  QrCode, 
  Search, 
  Radio, 
  Share2,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenQr: () => void;
  isOnline: boolean;
  selectedEquipment: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenQr,
  isOnline,
  selectedEquipment,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 via-slate-800 to-slate-900 border border-emerald-500/30 shadow-glow-pass">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">
                PortInspect<span className="text-emerald-400 font-mono">.AI</span>
              </h1>
              <span className="hidden rounded-full bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 text-[10px] font-semibold text-slate-300 sm:inline-block">
                CBM v2.5
              </span>
            </div>
            <p className="hidden text-xs text-slate-400 sm:block">
              Industrial Crane & Equipment Visual Inspection System
            </p>
          </div>
        </div>

        {/* Center: Search / Cmd+K Pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            type="button"
            className="flex items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300 transition-all hover:border-emerald-500/40 hover:bg-white/[0.08] hover:text-white"
          >
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search checklist & items...</span>
            <span className="sm:hidden">Search</span>
            <kbd className="hidden rounded bg-slate-800 border border-slate-700 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 sm:inline-block">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Status & Quick Phone Action */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Online Sync Pill */}
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
            <Radio className="h-3 w-3 animate-pulse text-emerald-400" />
            <span className="hidden sm:inline">{isOnline ? 'Cloud Synced' : 'Offline Mode'}</span>
          </div>

          {/* QR Modal Trigger */}
          <button
            onClick={onOpenQr}
            type="button"
            title="Scan QR to open on phone"
            className="touch-press flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.1] bg-slate-900 text-slate-300 hover:border-emerald-500/40 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <QrCode className="h-4 w-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
