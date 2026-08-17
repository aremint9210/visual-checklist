import React from 'react';
import { 
  AlertOctagon, 
  Send, 
  Mail, 
  X, 
  ExternalLink, 
  CheckCircle2,
  Copy
} from 'lucide-react';
import { InspectionRecord } from '../types/inspection';

interface CriticalDefectModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspection: InspectionRecord | null;
  supervisorPhone?: string;
  supervisorEmail?: string;
}

export const CriticalDefectModal: React.FC<CriticalDefectModalProps> = ({
  isOpen,
  onClose,
  inspection,
  supervisorPhone = '+60123456789',
  supervisorEmail = 'supervisor@port.com',
}) => {
  if (!isOpen || !inspection) return null;

  const defectList: string[] = [];
  Object.entries(inspection.items || {}).forEach(([no, item]) => {
    if (item.status === 'POOR' || item.status === 'SATISFIED') {
      defectList.push(`• Item ${no} [${item.status}]: ${item.remark || 'Defect flagged'}`);
    }
  });

  const messageText = 
`🚨 CRITICAL DEFECT ALERT - PORT INSPECTION
Equipment: ${inspection.equipmentId} (${inspection.equipmentType})
Date: ${inspection.inspectionDate} ${inspection.inspectionTime}
Inspector: ${inspection.inspectorName} ${inspection.inspectorStaffId ? `(ID: ${inspection.inspectorStaffId})` : ''}
Location: ${inspection.location || 'Port Yard'} (${inspection.shift || 'Shift'})

ATTENTION ITEMS FLAGGED:
${defectList.join('\n')}

Notes / Action Plan:
${inspection.generalNotes || 'Immediate engineering assessment requested.'}

View Inspection Report:
${window.location.origin}`;

  const cleanPhone = supervisorPhone.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
  const mailtoUrl = `mailto:${supervisorEmail}?subject=${encodeURIComponent(`[URGENT] Defect Alert: ${inspection.equipmentId}`)}&body=${encodeURIComponent(messageText)}`;

  const handleCopyMessage = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(messageText);
      alert('Alert message copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-rose-500/40 bg-slate-950 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-500/20 bg-rose-950/40 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500 text-white shadow-glow-fail">
              <AlertOctagon className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Critical Defect Alert Dispatched</h3>
              <p className="text-xs text-rose-300">
                Equipment {inspection.equipmentId} logged with attention issues
              </p>
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

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          
          <div className="rounded-xl border border-white/[0.08] bg-slate-900/80 p-3.5 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pre-Formatted Emergency Message:
            </div>
            <pre className="font-mono text-xs text-slate-200 whitespace-pre-wrap bg-slate-950 p-3 rounded-lg border border-white/[0.06] max-h-48 overflow-y-auto">
              {messageText}
            </pre>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* WhatsApp 1-Tap Send */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="touch-press flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-glow-pass hover:bg-emerald-500 transition-all"
            >
              <Send className="h-4 w-4" />
              <span>Send via WhatsApp</span>
            </a>

            {/* Email Dispatch */}
            <a
              href={mailtoUrl}
              className="touch-press flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-slate-900 px-4 py-3 text-xs sm:text-sm font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-all"
            >
              <Mail className="h-4 w-4" />
              <span>Send via Email</span>
            </a>

          </div>

          <button
            type="button"
            onClick={handleCopyMessage}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/[0.1] py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Copy Text to Clipboard</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-white/[0.08] px-5 py-3 bg-slate-900/60">
          <button
            onClick={onClose}
            type="button"
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
          >
            Dismiss Alert
          </button>
        </div>

      </div>
    </div>
  );
};
