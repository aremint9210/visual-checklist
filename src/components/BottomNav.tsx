import React from 'react';
import { 
  ClipboardCheck, 
  History, 
  Layers, 
  Activity, 
  FileSpreadsheet, 
  MessageSquareHeart 
} from 'lucide-react';

export type NavTabId = 'inspect' | 'history' | 'fleet' | 'cbm' | 'export' | 'feedback';

interface BottomNavProps {
  activeTab: NavTabId;
  onChangeTab: (tab: NavTabId) => void;
  openDefectCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  openDefectCount = 0,
}) => {
  const tabs = [
    { id: 'inspect' as NavTabId, label: 'Inspect', icon: ClipboardCheck },
    { id: 'history' as NavTabId, label: 'Track Back', icon: History },
    { id: 'fleet' as NavTabId, label: 'Equipment', icon: Layers },
    { id: 'cbm' as NavTabId, label: 'CBM Analytics', icon: Activity },
    { id: 'export' as NavTabId, label: 'Export & QR', icon: FileSpreadsheet },
    { id: 'feedback' as NavTabId, label: 'Feedback', icon: MessageSquareHeart },
  ];

  const handleTabClick = (tabId: NavTabId) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(12);
    }
    onChangeTab(tabId);
  };

  return (
    <>
      {/* Desktop / Tablet Top Tabs Bar (Visible on md and up) */}
      <div className="hidden md:block w-full border-b border-white/[0.06] bg-slate-950/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                type="button"
                className={`group relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 border border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.id === 'inspect' && openDefectCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500/20 px-1 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                    {openDefectCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Sticky Bottom Navigation Bar (Visible on mobile screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-slate-950/90 backdrop-blur-xl px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                type="button"
                className={`touch-press relative flex flex-1 flex-col items-center justify-center py-1 text-center transition-all ${
                  isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 transition-transform ${isActive ? 'scale-110' : 'scale-100'}`} />
                  {tab.id === 'inspect' && openDefectCount > 0 && (
                    <span className="absolute -top-1 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                      {openDefectCount}
                    </span>
                  )}
                </div>
                <span className={`mt-1 text-[10px] tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute -top-1.5 h-0.5 w-6 rounded-full bg-emerald-400 shadow-glow-pass" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
