import React, { useState } from 'react';
import { 
  QrCode, 
  Share2, 
  Copy, 
  FileSpreadsheet, 
  Download, 
  Send, 
  Trash2, 
  Smartphone,
  ExternalLink,
  Check
} from 'lucide-react';
import { InspectionRecord } from '../types/inspection';

interface ExportQrViewProps {
  inspections: InspectionRecord[];
  onClearAllData: () => void;
}

export const ExportQrView: React.FC<ExportQrViewProps> = ({
  inspections,
  onClearAllData,
}) => {
  const [copied, setCopied] = useState(false);
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://visual-checklist.onrender.com';
  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentOrigin)}`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentOrigin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Port Equipment Visual Inspection & CBM Hub',
          text: 'Open the crane visual inspection checklist directly on your mobile device:',
          url: currentOrigin,
        });
      } catch (e) {
        console.log('Share dismissed');
      }
    } else {
      handleCopy();
    }
  };

  const handleDownloadJsonBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(inspections, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `Visual_Inspections_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(`📋 Open Port Equipment Visual Inspection Checklist:\n${currentOrigin}`)}`;

  return (
    <div className="space-y-6">
      
      {/* Mobile Access Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-slate-950/60 p-5 sm:p-6 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-center gap-6">
          
          {/* QR Code */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.1] bg-white p-4 shadow-xl shrink-0">
            <img
              src={dynamicQrUrl}
              alt="Scan QR"
              className="h-44 w-44 object-contain"
            />
            <span className="mt-2 text-[11px] font-bold text-slate-800">
              Scan with Phone Camera
            </span>
          </div>

          {/* Details & Share Actions */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <Smartphone className="h-5 w-5 text-emerald-400" />
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Mobile Companion & Live Sync
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Works seamlessly anywhere on 4G, 5G, or Wi-Fi. No app installation needed.
              </p>
            </div>

            {/* URL Input Box */}
            <div className="flex items-center gap-2 max-w-md mx-auto md:mx-0">
              <input
                type="text"
                readOnly
                value={currentOrigin}
                className="w-full rounded-xl border border-white/[0.1] bg-slate-900 px-3 py-2 text-xs font-mono text-slate-300 outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="touch-press flex items-center gap-1 rounded-xl border border-white/[0.1] bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 shrink-0"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Share Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <button
                type="button"
                onClick={handleNativeShare}
                className="touch-press flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md hover:opacity-90"
              >
                <Share2 className="h-4 w-4" />
                <span>Share App Link</span>
              </button>

              <a
                href={waShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="touch-press flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-glow-pass hover:bg-emerald-500"
              >
                <Send className="h-4 w-4" />
                <span>Share to WhatsApp Group</span>
              </a>
            </div>

          </div>

        </div>
      </div>

      {/* Export & Data Management */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Consolidated Excel Export */}
        <div className="rounded-2xl border border-white/[0.08] bg-slate-950/60 p-5 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Master Consolidated Excel Log</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Download complete multi-crane historical inspection log with separate inspector names and staff ID columns.
            </p>
          </div>
          <a
            href="/api/export/excel-all"
            download
            className="touch-press flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-glow-pass"
          >
            <Download className="h-4 w-4" />
            <span>Download Master Log (.xlsx)</span>
          </a>
        </div>

        {/* JSON Backup & Reset */}
        <div className="rounded-2xl border border-white/[0.08] bg-slate-950/60 p-5 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Download className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-bold text-white">JSON Raw Backup & Storage</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Export all {inspections.length} inspection records as a raw structured JSON file for database migration.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadJsonBackup}
              className="touch-press flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-slate-900 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800"
            >
              <Download className="h-4 w-4" />
              <span>Backup JSON</span>
            </button>
            <button
              type="button"
              onClick={onClearAllData}
              className="touch-press flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20"
              title="Reset inspection database"
            >
              <Trash2 className="h-4 w-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
