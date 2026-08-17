import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  CornerDownLeft, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileSpreadsheet, 
  Activity, 
  Layers, 
  Share2,
  Sparkles
} from 'lucide-react';
import { ChecklistCategoryDef } from '../types/inspection';
import { NavTabId } from './BottomNav';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ChecklistCategoryDef[];
  onSelectItem: (itemNo: string) => void;
  onNavigateTab: (tab: NavTabId) => void;
  onQuickFillGood: () => void;
  onOpenQr: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  categories,
  onSelectItem,
  onNavigateTab,
  onQuickFillGood,
  onOpenQr,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Flatten items with category info
  const allItems: { no: string; desc: string; category: string; tags: string[] }[] = [];
  categories.forEach((cat) => {
    (cat.items || []).forEach((item) => {
      allItems.push({
        no: item.no,
        desc: item.description,
        category: cat.name,
        tags: item.defectTags || [],
      });
    });
  });

  const q = query.toLowerCase().trim();
  const matchedItems = allItems.filter(
    (it) =>
      !q ||
      it.no.toLowerCase().includes(q) ||
      it.desc.toLowerCase().includes(q) ||
      it.category.toLowerCase().includes(q) ||
      it.tags.some((t) => t.toLowerCase().includes(q))
  );

  const quickActions = [
    {
      id: 'quick-pass',
      title: 'Quick Pass All Remaining Items',
      desc: 'Mark all unchecked checklist points as GOOD',
      icon: CheckCircle2,
      action: () => {
        onQuickFillGood();
        onClose();
      },
    },
    {
      id: 'tab-cbm',
      title: 'Open CBM Analytics & Failure Hotspots',
      desc: 'View fleet reliability scores and equipment health ranking',
      icon: Activity,
      action: () => {
        onNavigateTab('cbm');
        onClose();
      },
    },
    {
      id: 'tab-export',
      title: 'Download Excel Reports & Audit Logs',
      desc: 'Export consolidated master spreadsheet or scan mobile QR',
      icon: FileSpreadsheet,
      action: () => {
        onNavigateTab('export');
        onClose();
      },
    },
    {
      id: 'share-qr',
      title: 'Open Mobile Access QR Code',
      desc: 'Scan with smartphone camera to inspect anywhere',
      icon: Share2,
      action: () => {
        onOpenQr();
        onClose();
      },
    },
  ].filter((a) => !q || a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-black/70 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/[0.12] bg-slate-950 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Header */}
        <div className="relative flex items-center border-b border-white/[0.08] px-4 py-3 bg-slate-900/50">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search 26 inspection items (e.g. brakes, rope, cabin)..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 rounded-lg p-1 text-slate-400 hover:bg-white/[0.08] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results Stream */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-4">
          
          {/* Quick Actions Group */}
          {quickActions.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Quick Actions
              </div>
              <div className="space-y-1">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={action.action}
                      type="button"
                      className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all hover:bg-emerald-500/10 hover:border-emerald-500/20 border border-transparent"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-300">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-emerald-300">
                            {action.title}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {action.desc}
                          </div>
                        </div>
                      </div>
                      <CornerDownLeft className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Checklist Items Match Group */}
          {matchedItems.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Checklist Inspection Points ({matchedItems.length})
              </div>
              <div className="space-y-1">
                {matchedItems.map((item) => (
                  <button
                    key={item.no}
                    onClick={() => {
                      onSelectItem(item.no);
                      onClose();
                    }}
                    type="button"
                    className="group flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-all hover:bg-white/[0.06] border border-transparent"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[11px] font-bold text-emerald-400">
                        {item.no}
                      </span>
                      <div>
                        <div className="text-xs font-medium text-slate-200 group-hover:text-white line-clamp-1">
                          {item.desc}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {item.category}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 group-hover:text-emerald-400 transition-colors">
                      Jump →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty Search Result */}
          {quickActions.length === 0 && matchedItems.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm">
              No matching checklist items or commands for "{query}".
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-2 text-[11px] text-slate-400 bg-slate-900/30">
          <span>Navigate with <strong>↑ ↓</strong> and press <strong>Enter</strong></span>
          <span>Press <strong>ESC</strong> to close</span>
        </div>
      </div>
    </div>
  );
};
