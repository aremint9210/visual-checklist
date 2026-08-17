import React, { useState } from 'react';
import { 
  Search, 
  X, 
  Calendar, 
  User, 
  MapPin, 
  FileSpreadsheet, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Clock,
  Printer
} from 'lucide-react';
import { InspectionRecord, ChecklistCategoryDef } from '../types/inspection';

interface TrackBackHistoryViewProps {
  inspections: InspectionRecord[];
  categories: ChecklistCategoryDef[];
  onDeleteInspection: (id: string) => void;
}

export const TrackBackHistoryView: React.FC<TrackBackHistoryViewProps> = ({
  inspections,
  categories,
  onDeleteInspection,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASSED' | 'SATISFACTORY_WITH_NOTES' | 'ATTENTION_REQUIRED'>('ALL');
  const [selectedInspection, setSelectedInspection] = useState<InspectionRecord | null>(null);

  const q = searchQuery.toLowerCase().trim();
  const filtered = inspections.filter((insp) => {
    const matchStatus = statusFilter === 'ALL' || insp.summary?.overallStatus === statusFilter;
    const matchSearch =
      !q ||
      insp.equipmentId.toLowerCase().includes(q) ||
      insp.inspectorName.toLowerCase().includes(q) ||
      (insp.inspectorStaffId || '').toLowerCase().includes(q) ||
      (insp.location || '').toLowerCase().includes(q) ||
      (insp.generalNotes || '').toLowerCase().includes(q);

    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Header Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-slate-950/60 p-4 sm:p-5 backdrop-blur-xl shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Crane (e.g. Q75), Inspector Name, or ID..."
              className="w-full rounded-xl border border-white/[0.1] bg-slate-900/80 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { id: 'ALL', label: 'All Logs' },
                { id: 'PASSED', label: '✅ Passed' },
                { id: 'ATTENTION_REQUIRED', label: '🔴 Defects' },
                { id: 'SATISFACTORY_WITH_NOTES', label: '🟡 Notes' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={`touch-press whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold border transition-all ${
                  statusFilter === f.id
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-white/[0.08] hover:bg-white/[0.04]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* History Stream */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Audit Records ({filtered.length})
          </span>
          <a
            href="/api/export/excel-all"
            download
            className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Download Consolidated Master Log (.xlsx)</span>
          </a>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-slate-950/40 p-12 text-center text-slate-400">
            <p className="text-sm font-medium">No inspection records match your search criteria.</p>
          </div>
        ) : (
          filtered.map((insp) => {
            const isPassed = insp.summary?.overallStatus === 'PASSED';
            const isAttention = insp.summary?.overallStatus === 'ATTENTION_REQUIRED';

            // Gather attention defect list
            const defectItems = Object.entries(insp.items || {}).filter(
              ([_, it]) => it.status === 'POOR' || it.status === 'SATISFIED'
            );

            return (
              <div
                key={insp.id}
                className="group rounded-2xl border border-white/[0.08] bg-slate-950/50 p-4 sm:p-5 hover:border-white/[0.16] hover:bg-slate-950/80 transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-slate-800 font-mono text-sm font-bold text-white border border-white/[0.1]">
                      {insp.equipmentId}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-300">
                          {insp.equipmentType}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs text-slate-400 font-mono">
                          {insp.inspectionDate} {insp.inspectionTime}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Inspector: <strong className="text-slate-200">{insp.inspectorName}</strong>
                        {insp.inspectorStaffId && (
                          <span className="font-mono ml-1 text-slate-400">({insp.inspectorStaffId})</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
                      isPassed
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : isAttention
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : isAttention ? (
                      <XCircle className="h-3.5 w-3.5" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5" />
                    )}
                    <span>{insp.summary?.overallStatus || 'PASSED'}</span>
                  </span>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400 mb-3 bg-slate-900/40 p-2.5 rounded-xl border border-white/[0.04]">
                  <div>Location: <strong className="text-slate-200">{insp.location || 'N/A'}</strong></div>
                  <div>Shift: <strong className="text-slate-200">{insp.shift || 'N/A'}</strong></div>
                  <div>Condition: <strong className="text-emerald-400">{insp.summary?.goodCount || 0} Good</strong> / <strong className="text-rose-400">{insp.summary?.poorCount || 0} Poor</strong></div>
                  <div>Audit ID: <span className="font-mono text-slate-400">{insp.id.slice(-8)}</span></div>
                </div>

                {/* Defect preview tags */}
                {defectItems.length > 0 && (
                  <div className="mb-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-2.5 text-xs text-rose-300 space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                      <span>Flagged Items:</span>
                    </div>
                    {defectItems.map(([no, it]) => (
                      <div key={no} className="pl-4 text-[11px] text-slate-300">
                        • <strong>Item {no} ({it.status}):</strong> {it.remark || 'No details'}
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setSelectedInspection(insp)}
                    className="touch-press flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Detail</span>
                  </button>

                  <a
                    href={`/api/export/excel/${insp.id}`}
                    download
                    className="touch-press flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    <span>Excel</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Permanently delete inspection ${insp.id}?`)) {
                        onDeleteInspection(insp.id);
                      }
                    }}
                    className="touch-press rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/20 hover:text-rose-400"
                    title="Delete record"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Detailed Inspection Modal */}
      {selectedInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="flex h-full max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/[0.12] bg-slate-950 shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4 bg-slate-900/60">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-emerald-500/20 px-2 py-1 font-mono text-sm font-bold text-emerald-400 border border-emerald-500/30">
                  {selectedInspection.equipmentId}
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Inspection Audit Report</h3>
                  <p className="text-xs text-slate-400">
                    {selectedInspection.inspectionDate} {selectedInspection.inspectionTime} • Inspector: {selectedInspection.inspectorName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInspection(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/[0.08] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              
              {/* Header Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-white/[0.08] text-xs">
                <div><strong>Equipment Type:</strong> <span className="text-slate-300">{selectedInspection.equipmentType}</span></div>
                <div><strong>Inspector Name:</strong> <span className="text-slate-300">{selectedInspection.inspectorName}</span></div>
                <div><strong>Staff ID:</strong> <span className="font-mono text-slate-300">{selectedInspection.inspectorStaffId || 'N/A'}</span></div>
                <div><strong>Location:</strong> <span className="text-slate-300">{selectedInspection.location || 'N/A'}</span></div>
                <div><strong>Shift / Hours:</strong> <span className="text-slate-300">{selectedInspection.shift || 'N/A'}</span></div>
                <div><strong>Overall Status:</strong> <span className="font-bold text-emerald-400">{selectedInspection.summary?.overallStatus}</span></div>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Checklist Findings Breakdown
                </h4>
                {categories.map((cat) => (
                  <div key={cat.id} className="rounded-xl border border-white/[0.08] bg-slate-900/40 overflow-hidden">
                    <div className="bg-slate-900/80 px-3.5 py-2 font-bold text-xs text-white border-b border-white/[0.06]">
                      {cat.id}. {cat.name}
                    </div>
                    <div className="p-3 space-y-2">
                      {(cat.items || []).map((item) => {
                        const itRes = selectedInspection.items?.[item.no];
                        const st = itRes?.status || 'N/A';
                        return (
                          <div key={item.no} className="flex items-start justify-between gap-3 text-xs pb-2 border-b border-white/[0.04] last:border-0 last:pb-0">
                            <div className="flex-1">
                              <span className="font-mono font-bold text-slate-500 mr-2">{item.no}</span>
                              <span className="text-slate-200">{item.description}</span>
                              {itRes?.remark && (
                                <div className="text-[11px] text-amber-300 mt-0.5">
                                  💬 <em>{itRes.remark}</em>
                                </div>
                              )}
                              {itRes?.photo && (
                                <div className="mt-1">
                                  <img src={itRes.photo} alt="Defect" className="h-16 rounded border border-white/[0.1] object-cover" />
                                </div>
                              )}
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                              st === 'GOOD' ? 'bg-emerald-500/20 text-emerald-400' :
                              st === 'SATISFIED' ? 'bg-amber-500/20 text-amber-400' :
                              st === 'POOR' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-500'
                            }`}>
                              {st}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {selectedInspection.generalNotes && (
                <div className="rounded-xl border border-white/[0.08] bg-slate-900/60 p-3.5 text-xs">
                  <div className="font-bold text-white mb-1">General Notes & Action Plan:</div>
                  <p className="text-slate-300">{selectedInspection.generalNotes}</p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-white/[0.08] px-5 py-3 bg-slate-900/80">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
              >
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`/api/export/excel/${selectedInspection.id}`}
                  download
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Download Excel</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
