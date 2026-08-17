import React, { useState, useRef } from 'react';
import { 
  X, 
  MapPin, 
  Plus, 
  Trash2, 
  Check, 
  AlertTriangle, 
  AlertCircle, 
  Info,
  Maximize2
} from 'lucide-react';
import { DefectPin } from '../types/inspection';

interface ImageAnnotatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  itemNo: string;
  itemDescription: string;
  initialPins?: DefectPin[];
  onSavePins: (pins: DefectPin[]) => void;
}

export const ImageAnnotatorModal: React.FC<ImageAnnotatorModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  itemNo,
  itemDescription,
  initialPins = [],
  onSavePins,
}) => {
  const [pins, setPins] = useState<DefectPin[]>(initialPins);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [activePinDraft, setActivePinDraft] = useState<{
    x: number;
    y: number;
    label: string;
    severity: 'CRITICAL' | 'WARNING' | 'MINOR';
  } | null>(null);

  const imgContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgContainerRef.current) return;
    const rect = imgContainerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    setActivePinDraft({
      x: Math.min(Math.max(x, 2), 98),
      y: Math.min(Math.max(y, 2), 98),
      label: 'Defect location flagged',
      severity: 'CRITICAL',
    });
  };

  const handleSaveActivePin = () => {
    if (!activePinDraft) return;
    const newPin: DefectPin = {
      id: 'PIN-' + Date.now().toString().slice(-6),
      x: activePinDraft.x,
      y: activePinDraft.y,
      label: activePinDraft.label.trim() || 'Defect location',
      severity: activePinDraft.severity,
    };
    setPins([...pins, newPin]);
    setActivePinDraft(null);
  };

  const handleDeletePin = (pinId: string) => {
    setPins(pins.filter((p) => p.id !== pinId));
    if (selectedPinId === pinId) setSelectedPinId(null);
  };

  const handleSaveAndClose = () => {
    onSavePins(pins);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="flex h-full max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/[0.12] bg-slate-950 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3.5 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <span className="rounded bg-rose-500/20 px-2 py-0.5 font-mono text-xs font-bold text-rose-400 border border-rose-500/30">
              {itemNo}
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">Visual Defect Pin-Drop Annotator</h3>
              <p className="text-xs text-slate-400 line-clamp-1">{itemDescription}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/[0.08] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Workspace Body */}
        <div className="grid flex-1 grid-cols-1 md:grid-cols-3 overflow-hidden">
          
          {/* Main Interactive Canvas */}
          <div className="relative col-span-2 flex items-center justify-center bg-slate-900/80 p-4 select-none overflow-hidden">
            <div 
              ref={imgContainerRef}
              onClick={handleImageClick}
              className="relative max-h-[60vh] max-w-full cursor-crosshair overflow-hidden rounded-xl border border-white/[0.1] shadow-lg"
            >
              <img
                src={imageUrl}
                alt="Defect Inspection"
                className="max-h-[58vh] max-w-full object-contain pointer-events-none"
              />

              {/* Saved Pins */}
              {pins.map((pin, idx) => {
                const isCritical = pin.severity === 'CRITICAL';
                const isWarning = pin.severity === 'WARNING';
                const isSelected = selectedPinId === pin.id;

                return (
                  <div
                    key={pin.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPinId(pin.id);
                    }}
                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125 z-20 group"
                  >
                    <div
                      className={`relative flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-md border-2 border-white ${
                        isCritical
                          ? 'bg-rose-500 shadow-glow-fail'
                          : isWarning
                          ? 'bg-amber-500 shadow-glow-flag'
                          : 'bg-slate-700'
                      }`}
                    >
                      {idx + 1}
                      {isSelected && (
                        <span className="absolute -inset-1 rounded-full border-2 border-emerald-400 animate-ping"></span>
                      )}
                    </div>
                    {/* Tooltip on hover */}
                    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-max max-w-[200px] rounded bg-slate-950/90 border border-white/[0.1] px-2 py-1 text-[11px] text-white shadow-lg group-hover:block z-30">
                      <strong>#{idx + 1}:</strong> {pin.label}
                    </div>
                  </div>
                );
              })}

              {/* Active Draft Pin Animation */}
              {activePinDraft && (
                <div
                  style={{ left: `${activePinDraft.x}%`, top: `${activePinDraft.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
                >
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white border-2 border-white shadow-glow-fail animate-bounce">
                    <MapPin className="h-4 w-4" />
                  </div>
                </div>
              )}
            </div>

            {/* Instruction Badge */}
            <div className="absolute bottom-4 left-4 rounded-lg bg-slate-950/80 backdrop-blur-sm border border-white/[0.1] px-3 py-1.5 text-xs text-slate-300 pointer-events-none">
              🎯 <strong>Tap anywhere</strong> on the photo to drop a defect pin.
            </div>
          </div>

          {/* Right Sidebar: Pin List & Pin Editor */}
          <div className="flex flex-col border-l border-white/[0.08] bg-slate-950 p-4 overflow-y-auto">
            
            {/* Active Pin Form (When user clicked image) */}
            {activePinDraft ? (
              <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 animate-slide-up">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-rose-300">📍 New Defect Pin</span>
                  <button
                    onClick={() => setActivePinDraft(null)}
                    type="button"
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Severity Level
                </label>
                <div className="grid grid-cols-3 gap-1 mb-3">
                  {(['CRITICAL', 'WARNING', 'MINOR'] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setActivePinDraft({ ...activePinDraft, severity: sev })}
                      className={`rounded-lg py-1 text-[10px] font-bold border transition-all ${
                        activePinDraft.severity === sev
                          ? sev === 'CRITICAL'
                            ? 'bg-rose-500 text-white border-rose-400'
                            : sev === 'WARNING'
                            ? 'bg-amber-500 text-white border-amber-400'
                            : 'bg-slate-700 text-white border-slate-500'
                          : 'bg-slate-900 text-slate-400 border-white/[0.08]'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>

                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Defect Description
                </label>
                <input
                  type="text"
                  value={activePinDraft.label}
                  onChange={(e) => setActivePinDraft({ ...activePinDraft, label: e.target.value })}
                  placeholder="e.g. Broken strand / crack / heavy wear"
                  className="w-full rounded-lg border border-white/[0.1] bg-slate-900 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-400 mb-3"
                  autoFocus
                />

                <button
                  onClick={handleSaveActivePin}
                  type="button"
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 py-1.5 text-xs font-bold text-white hover:bg-rose-500 shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Defect Pin</span>
                </button>
              </div>
            ) : null}

            {/* List of Marked Defect Pins */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Defect Pins ({pins.length})
                </span>
                {pins.length > 0 && (
                  <button
                    onClick={() => setPins([])}
                    type="button"
                    className="text-[11px] text-rose-400 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {pins.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-white/[0.08] rounded-xl p-4">
                  No defect pins placed yet. Tap on the image to mark exact defect positions.
                </div>
              ) : (
                <div className="space-y-2">
                  {pins.map((pin, idx) => {
                    const isSelected = selectedPinId === pin.id;
                    return (
                      <div
                        key={pin.id}
                        onClick={() => setSelectedPinId(pin.id)}
                        className={`flex items-center justify-between rounded-xl border p-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500/50 bg-emerald-500/10'
                            : 'border-white/[0.08] bg-slate-900 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                              pin.severity === 'CRITICAL'
                                ? 'bg-rose-500'
                                : pin.severity === 'WARNING'
                                ? 'bg-amber-500'
                                : 'bg-slate-700'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <div className="text-xs font-semibold text-white line-clamp-1">
                              {pin.label}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {pin.severity} • {pin.x}%, {pin.y}%
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePin(pin.id);
                          }}
                          type="button"
                          className="rounded p-1 text-slate-500 hover:bg-rose-500/20 hover:text-rose-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-white/[0.08] px-5 py-3 bg-slate-900/80">
          <span className="text-xs text-slate-400">
            {pins.length} defect point(s) mapped
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              type="button"
              className="rounded-lg border border-white/[0.1] px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/[0.06]"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAndClose}
              type="button"
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-glow-pass"
            >
              <Check className="h-4 w-4" />
              <span>Save Annotations</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
