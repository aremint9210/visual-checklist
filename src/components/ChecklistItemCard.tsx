import React, { useState } from 'react';
import { 
  Check, 
  AlertTriangle, 
  X, 
  Mic, 
  Camera, 
  Trash2, 
  MapPin, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ChecklistItemDef, ItemEvaluation, ItemStatus, DefectPin } from '../types/inspection';
import { ImageAnnotatorModal } from './ImageAnnotatorModal';

interface ChecklistItemCardProps {
  item: ChecklistItemDef;
  evaluation: ItemEvaluation;
  onUpdateEvaluation: (itemNo: string, updated: Partial<ItemEvaluation>) => void;
  isListening: boolean;
  onToggleVoice: (itemNo: string) => void;
}

export const ChecklistItemCard: React.FC<ChecklistItemCardProps> = ({
  item,
  evaluation,
  onUpdateEvaluation,
  isListening,
  onToggleVoice,
}) => {
  const [isAnnotatorOpen, setIsAnnotatorOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(
    evaluation.status === 'POOR' || evaluation.status === 'SATISFIED' || !!evaluation.remark || !!evaluation.photo
  );

  const status = evaluation.status;
  const isGood = status === 'GOOD';
  const isSatisfied = status === 'SATISFIED';
  const isPoor = status === 'POOR';

  const handleStatusClick = (clickedStatus: ItemStatus) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(clickedStatus === 'POOR' ? [20, 40, 20] : 15);
    }
    const newStatus = status === clickedStatus ? '' : clickedStatus;
    onUpdateEvaluation(item.no, { status: newStatus });

    if (newStatus === 'SATISFIED' || newStatus === 'POOR') {
      setIsExpanded(true);
    }
  };

  const handleToggleTag = (tag: string) => {
    const currentTags = evaluation.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];

    let newRemark = evaluation.remark || '';
    if (!currentTags.includes(tag)) {
      newRemark = newRemark ? `${newRemark}, ${tag}` : tag;
    }

    onUpdateEvaluation(item.no, { tags: newTags, remark: newRemark });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onUpdateEvaluation(item.no, { photo: data.photoUrl });
        setIsExpanded(true);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const defectPins = evaluation.defectPins || [];

  return (
    <div
      id={`item-card-${item.no.replace('.', '_')}`}
      className={`group relative rounded-2xl border p-4 transition-all duration-200 ${
        isGood
          ? 'border-emerald-500/30 bg-emerald-500/[0.03] shadow-sm'
          : isSatisfied
          ? 'border-amber-500/30 bg-amber-500/[0.04] shadow-sm'
          : isPoor
          ? 'border-rose-500/40 bg-rose-500/[0.05] shadow-glow-fail'
          : 'border-white/[0.08] bg-slate-900/40 hover:border-white/[0.14] hover:bg-slate-900/60'
      }`}
    >
      {/* Top Row: Item No, Description, Tag */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2.5">
          <span
            className={`mt-0.5 flex h-6 min-w-6 items-center justify-center rounded-lg font-mono text-xs font-bold border transition-colors ${
              isGood
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : isSatisfied
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : isPoor
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse'
                : 'bg-slate-800 text-slate-400 border-white/[0.08]'
            }`}
          >
            {item.no}
          </span>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-slate-100 leading-snug">
              {item.description}
            </h4>
          </div>
        </div>

        {item.applicableTo !== 'ALL' && (
          <span className="rounded-md bg-slate-800 border border-white/[0.08] px-2 py-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            {item.applicableTo}
          </span>
        )}
      </div>

      {/* 3-Way Tactical Toggle Buttons */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        
        {/* PASS / GOOD Button */}
        <button
          type="button"
          onClick={() => handleStatusClick('GOOD')}
          className={`touch-press flex h-12 sm:h-13 items-center justify-center gap-1.5 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
            isGood
              ? 'bg-emerald-500 text-white border-emerald-400 shadow-glow-pass scale-[1.02]'
              : 'border-white/[0.08] bg-slate-900/80 text-slate-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300'
          }`}
        >
          <Check className={`h-4 w-4 sm:h-5 sm:w-5 ${isGood ? 'stroke-[3]' : 'stroke-2'}`} />
          <span>PASS</span>
        </button>

        {/* FLAG / SATISFIED Button */}
        <button
          type="button"
          onClick={() => handleStatusClick('SATISFIED')}
          className={`touch-press flex h-12 sm:h-13 items-center justify-center gap-1.5 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
            isSatisfied
              ? 'bg-amber-500 text-white border-amber-400 shadow-glow-flag scale-[1.02]'
              : 'border-white/[0.08] bg-slate-900/80 text-slate-400 hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-300'
          }`}
        >
          <AlertTriangle className={`h-4 w-4 sm:h-5 sm:w-5 ${isSatisfied ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span>FLAG</span>
        </button>

        {/* FAIL / POOR Button */}
        <button
          type="button"
          onClick={() => handleStatusClick('POOR')}
          className={`touch-press flex h-12 sm:h-13 items-center justify-center gap-1.5 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
            isPoor
              ? 'bg-rose-600 text-white border-rose-400 shadow-glow-fail scale-[1.02]'
              : 'border-white/[0.08] bg-slate-900/80 text-slate-400 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300'
          }`}
        >
          <X className={`h-4 w-4 sm:h-5 sm:w-5 ${isPoor ? 'stroke-[3]' : 'stroke-2'}`} />
          <span>FAIL</span>
        </button>
      </div>

      {/* Expandable Defect Details Tray */}
      {(isExpanded || isSatisfied || isPoor || evaluation.remark || evaluation.photo) && (
        <div className="mt-3.5 pt-3 border-t border-white/[0.08] space-y-3 animate-fade-in">
          
          {/* Defect Tag Chips */}
          {item.defectTags && item.defectTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Quick Tag:</span>
              {item.defectTags.map((tag) => {
                const isSelected = (evaluation.tags || []).includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all border ${
                      isSelected
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-white/[0.08] hover:bg-white/[0.06] hover:text-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          )}

          {/* Remark Input Row with Voice & Photo Trigger */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={evaluation.remark || ''}
              onChange={(e) => onUpdateEvaluation(item.no, { remark: e.target.value })}
              placeholder="Remark or defect description..."
              className="flex-1 rounded-xl border border-white/[0.1] bg-slate-950 px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500/50"
            />

            {/* Voice Dictation Button */}
            <button
              type="button"
              onClick={() => onToggleVoice(item.no)}
              title={isListening ? 'Stop Listening' : 'Speak remark'}
              className={`touch-press flex h-9.5 w-9.5 sm:h-10 sm:w-10 items-center justify-center rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-400 shadow-glow-fail animate-pulse'
                  : 'bg-slate-900 text-slate-400 border-white/[0.1] hover:bg-slate-800 hover:text-emerald-400'
              }`}
            >
              {isListening ? (
                <div className="flex items-center gap-0.5">
                  <div className="w-1 bg-white voice-wave-bar"></div>
                  <div className="w-1 bg-white voice-wave-bar"></div>
                  <div className="w-1 bg-white voice-wave-bar"></div>
                </div>
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>

            {/* Photo Capture / Upload Button */}
            <label
              title="Attach defect photo"
              className={`touch-press flex h-9.5 w-9.5 sm:h-10 sm:w-10 cursor-pointer items-center justify-center rounded-xl border transition-all ${
                evaluation.photo
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-white/[0.1] hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Camera className="h-4 w-4" />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Photo Preview & Pin Drop Annotation Trigger */}
          {evaluation.photo && (
            <div className="flex items-center justify-between rounded-xl border border-white/[0.1] bg-slate-950/80 p-2.5">
              <div 
                onClick={() => setIsAnnotatorOpen(true)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-white/[0.1]">
                  <img
                    src={evaluation.photo}
                    alt="Defect"
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                  />
                  {defectPins.length > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm">
                      {defectPins.length}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Open Pin-Drop Annotator</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {defectPins.length > 0
                      ? `${defectPins.length} defect pin(s) marked on photo`
                      : 'Tap to mark exact defect positions'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onUpdateEvaluation(item.no, { photo: null, defectPins: [] })}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400"
                title="Remove photo"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}

        </div>
      )}

      {/* Image Annotator Modal */}
      {evaluation.photo && (
        <ImageAnnotatorModal
          isOpen={isAnnotatorOpen}
          onClose={() => setIsAnnotatorOpen(false)}
          imageUrl={evaluation.photo}
          itemNo={item.no}
          itemDescription={item.description}
          initialPins={evaluation.defectPins || []}
          onSavePins={(pins) => onUpdateEvaluation(item.no, { defectPins: pins })}
        />
      )}
    </div>
  );
};
