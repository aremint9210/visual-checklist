import React, { useState, useEffect, useRef } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  BottomNav, 
  NavTabId 
} from './components/BottomNav';
import { 
  CommandPalette 
} from './components/CommandPalette';
import { 
  ChecklistItemCard 
} from './components/ChecklistItemCard';
import { 
  ProgressTracker 
} from './components/ProgressTracker';
import { 
  OpenDefectsBanner 
} from './components/OpenDefectsBanner';
import { 
  CriticalDefectModal 
} from './components/CriticalDefectModal';
import { 
  TrackBackHistoryView 
} from './components/TrackBackHistoryView';
import { 
  FleetHealthView 
} from './components/FleetHealthView';
import { 
  CbmAnalyticsView 
} from './components/CbmAnalyticsView';
import { 
  ExportQrView 
} from './components/ExportQrView';
import { 
  TeamFeedbackView 
} from './components/TeamFeedbackView';
import { 
  InspectionTemplate, 
  InspectionRecord, 
  ItemEvaluation, 
  EquipmentStat, 
  CbmSummary, 
  FeedbackRecord, 
  OpenDefect 
} from './types/inspection';
import { 
  Zap, 
  Mic, 
  Search, 
  X, 
  Sparkles, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Layers, 
  CheckCircle2, 
  QrCode,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Default embedded template for instant 0ms load
const DEFAULT_TEMPLATE: InspectionTemplate = {
  categories: [
    {
      id: 1,
      name: "Structural Components",
      items: [
        { no: "1.1", description: "Boom structure (Main Girder, Boom hinge, Latch hook, Forestay)", applicableTo: "QC", defectTags: ["Cracks", "Corrosion", "Loose Bolts", "Deformation"] },
        { no: "1.2", description: "Legs, Portal Beam, Sill Beam, and Diagonal Bracing condition", applicableTo: "ALL", defectTags: ["Impact Damage", "Weld Cracks", "Paint Peel", "Rust"] },
        { no: "1.3", description: "Gantry frame, Bogie pins, Equalizer beams, and Gantry structure", applicableTo: "ALL", defectTags: ["Pin Wear", "Bogie Crack", "Structural Bend"] },
        { no: "1.4", description: "Trolley frame, Bumpers, Buffers, and Safety lugs", applicableTo: "ALL", defectTags: ["Buffer Broken", "Lug Missing", "Frame Crack"] },
        { no: "1.5", description: "Walkways, Catwalks, Handrails, Stairs, and Safety Cages", applicableTo: "ALL", defectTags: ["Handrail Broken", "Grating Loose", "Trip Hazard"] },
        { no: "1.6", description: "Machinery house structure, Roof cladding, and Weather sealing", applicableTo: "ALL", defectTags: ["Roof Leak", "Door Damaged", "Corrosion Hole"] }
      ]
    },
    {
      id: 2,
      name: "Wire Ropes & Sheaves",
      items: [
        { no: "2.1", description: "Main Hoist wire rope (Broken wires, wear, corrosion, deformation, lubrication)", applicableTo: "ALL", defectTags: ["Broken Strands", "Kinking", "Birdcaging", "Dry/No Lube", "Diameter Reduction"] },
        { no: "2.2", description: "Boom hoist / Luffing wire rope condition and termination clamps", applicableTo: "QC", defectTags: ["Clamp Loose", "Broken Wires", "Wear"] },
        { no: "2.3", description: "Trolley traverse / Cathead wire ropes condition & tension", applicableTo: "ALL", defectTags: ["Slack Rope", "Sheave Wear", "Frayed"] },
        { no: "2.4", description: "All sheaves (grooves, flanges, bearings, rope jump guards, alignment)", applicableTo: "ALL", defectTags: ["Flange Chipped", "Groove Worn", "Guard Missing", "Bearing Noise"] }
      ]
    },
    {
      id: 3,
      name: "Spreader & Headblock",
      items: [
        { no: "3.1", description: "Twistlocks (pins, bearings, indicator lights, mechanical interlocks)", applicableTo: "ALL", defectTags: ["Twistlock Stuck", "Indicator Fault", "Crack on Pin", "Interlock Broken"] },
        { no: "3.2", description: "Flipper arms, motors, shock absorbers, and hinge pins", applicableTo: "ALL", defectTags: ["Flipper Bent", "Hinge Loose", "Hydraulic Leak", "Motor Dead"] },
        { no: "3.3", description: "Telescopic beams, wear pads, drive chains/belts, and slide guides", applicableTo: "ALL", defectTags: ["Pad Worn", "Chain Slack", "Guide Jammed"] },
        { no: "3.4", description: "Headblock sheaves, landing pins, and electrical umbilical cable", applicableTo: "ALL", defectTags: ["Cable Damaged", "Sheave Noise", "Landing Pin Worn"] }
      ]
    },
    {
      id: 4,
      name: "Mechanical & Hydraulic Drives",
      items: [
        { no: "4.1", description: "Main engine / Genset unit oil level, coolants, belts, and leaks (RTG)", applicableTo: "RTG", defectTags: ["Low Oil", "Coolant Low", "Belt Cracking", "Fuel Leak"] },
        { no: "4.2", description: "Hydraulic power pack (HPU) oil level, pump status, and filter indicators", applicableTo: "ALL", defectTags: ["Low Level", "Filter Clogged", "Pump Noise", "Tank Sweating"] },
        { no: "4.3", description: "Gearboxes (Main Hoist, Trolley, Gantry) oil leaks and mounting integrity", applicableTo: "ALL", defectTags: ["Oil Seepage", "Mounting Loose", "Vibration"] },
        { no: "4.4", description: "Service & Emergency Brakes (thrusters, brake pads, disk/drum condition)", applicableTo: "ALL", defectTags: ["Pad Worn", "Disc Grooved", "Thruster Leak", "Spring Weak"] }
      ]
    },
    {
      id: 5,
      name: "Electrical Systems & Cabins",
      items: [
        { no: "5.1", description: "High-voltage cable reel (Festoon/E-bar/Cable Drum) & trailing cable", applicableTo: "ALL", defectTags: ["Cable Sheath Cut", "Tension Uneven", "Roller Stuck"] },
        { no: "5.2", description: "Electrical control panels, junction boxes, and door gaskets", applicableTo: "ALL", defectTags: ["Door Gasket Damaged", "Moisture Inside", "Latch Broken"] },
        { no: "5.3", description: "Operator cabin visual condition, glass cleanliness, wiper, controls, and seat", applicableTo: "ALL", defectTags: ["Wiper Faulty", "Glass Dirty/Cracked", "Joystick Play"] },
        { no: "5.4", description: "Floodlights, warning beacons, horns, sirens, and indicator lights", applicableTo: "ALL", defectTags: ["Light Blown", "Beacon Dead", "Siren Weak"] }
      ]
    },
    {
      id: 6,
      name: "Safety Equipment & Housekeeping",
      items: [
        { no: "6.1", description: "Emergency Stop buttons (cabin, ground level, machinery house)", applicableTo: "ALL", defectTags: ["E-Stop Sticky", "Cover Broken", "Unresponsive"] },
        { no: "6.2", description: "Fire extinguishers availability, pressure gauge status, and tags", applicableTo: "ALL", defectTags: ["Tag Expired", "Low Pressure", "Missing Extinguisher"] },
        { no: "6.3", description: "Limit switches visual condition (Anti-collision, Over-hoist, End-stops)", applicableTo: "ALL", defectTags: ["Arm Bent", "Switch Loose", "Flag Missing"] },
        { no: "6.4", description: "Overall housekeeping, oil spillage, debris on walkways and engine room", applicableTo: "ALL", defectTags: ["Oil Spillage", "Debris / Trash", "Rag Left"] }
      ]
    }
  ]
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTabId>('inspect');
  const [template, setTemplate] = useState<InspectionTemplate>(DEFAULT_TEMPLATE);
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [fleetStats, setFleetStats] = useState<EquipmentStat[]>([]);
  const [cbmData, setCbmData] = useState<CbmSummary | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [openDefects, setOpenDefects] = useState<OpenDefect[]>([]);
  const [lastOpenDefectDate, setLastOpenDefectDate] = useState<string>('');

  // Draft form state
  const [equipmentId, setEquipmentId] = useState('Q75');
  const [equipmentType, setEquipmentType] = useState('QC');
  const [inspectorName, setInspectorName] = useState('Aremi');
  const [inspectorStaffId, setInspectorStaffId] = useState('STF-8421');
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [inspectionTime, setInspectionTime] = useState(new Date().toTimeString().slice(0, 5));
  const [location, setLocation] = useState('Berth 4');
  const [shift, setShift] = useState('Day Shift');
  const [generalNotes, setGeneralNotes] = useState('');
  const [itemEvaluations, setItemEvaluations] = useState<Record<string, ItemEvaluation>>({});

  // UI state
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<number | 'ALL'>('ALL');
  const [checklistSearch, setChecklistSearch] = useState('');
  const [viewFilter, setViewFilter] = useState<'ALL' | 'UNCHECKED' | 'DEFECTS'>('ALL');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [criticalModalRecord, setCriticalModalRecord] = useState<InspectionRecord | null>(null);
  const [supervisorPhone, setSupervisorPhone] = useState('+60123456789');
  const [supervisorEmail, setSupervisorEmail] = useState('supervisor@port.com');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Speech recognition state
  const [isListening, setIsListening] = useState(false);
  const [activeSpeechTarget, setActiveSpeechTarget] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Fetch initial data
  useEffect(() => {
    fetchTemplate();
    fetchInspections();
    fetchFleetStats();
    fetchCbmAnalytics();
    fetchFeedbacks();
    fetchAlertSettings();

    // Check open defects for initial equipment
    checkOpenDefects(equipmentId);

    // Restore draft from local storage
    const savedDraft = localStorage.getItem('cbm_inspection_draft_v2');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.equipmentId) setEquipmentId(parsed.equipmentId);
        if (parsed.equipmentType) setEquipmentType(parsed.equipmentType);
        if (parsed.inspectorName) setInspectorName(parsed.inspectorName);
        if (parsed.inspectorStaffId) setInspectorStaffId(parsed.inspectorStaffId);
        if (parsed.location) setLocation(parsed.location);
        if (parsed.shift) setShift(parsed.shift);
        if (parsed.generalNotes) setGeneralNotes(parsed.generalNotes);
        if (parsed.items) setItemEvaluations(parsed.items);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Sync draft to local storage
  useEffect(() => {
    const draft = {
      equipmentId,
      equipmentType,
      inspectorName,
      inspectorStaffId,
      inspectionDate,
      inspectionTime,
      location,
      shift,
      generalNotes,
      items: itemEvaluations,
    };
    localStorage.setItem('cbm_inspection_draft_v2', JSON.stringify(draft));
    if (inspectorName) localStorage.setItem('cbm_inspector_name', inspectorName);
    if (inspectorStaffId) localStorage.setItem('cbm_inspector_staff_id', inspectorStaffId);
  }, [equipmentId, equipmentType, inspectorName, inspectorStaffId, inspectionDate, inspectionTime, location, shift, generalNotes, itemEvaluations]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchTemplate = async () => {
    try {
      const res = await fetch('/api/checklist-template');
      if (res.ok) {
        const data = await res.json();
        if (data.categories?.length > 0) setTemplate(data);
      }
    } catch (e) {}
  };

  const fetchInspections = async () => {
    try {
      const res = await fetch('/api/inspections');
      if (res.ok) setInspections(await res.json());
    } catch (e) {}
  };

  const fetchFleetStats = async () => {
    try {
      const res = await fetch('/api/equipment/stats');
      if (res.ok) setFleetStats(await res.json());
    } catch (e) {}
  };

  const fetchCbmAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics/cbm-summary');
      if (res.ok) setCbmData(await res.json());
    } catch (e) {}
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch('/api/feedback');
      if (res.ok) setFeedbacks(await res.json());
    } catch (e) {}
  };

  const fetchAlertSettings = async () => {
    try {
      const res = await fetch('/api/settings/alerts');
      if (res.ok) {
        const data = await res.json();
        if (data.supervisorPhone) setSupervisorPhone(data.supervisorPhone);
        if (data.supervisorEmail) setSupervisorEmail(data.supervisorEmail);
      }
    } catch (e) {}
  };

  const checkOpenDefects = async (equip: string) => {
    if (!equip) return;
    try {
      const res = await fetch(`/api/equipment/${encodeURIComponent(equip)}/open-defects`);
      if (res.ok) {
        const data = await res.json();
        setOpenDefects(data.openDefects || []);
        setLastOpenDefectDate(data.lastInspectionDate || '');
      }
    } catch (e) {}
  };

  const handleEquipmentChange = (newEquip: string, newType?: string) => {
    const clean = newEquip.toUpperCase();
    setEquipmentId(clean);
    if (newType) setEquipmentType(newType);
    checkOpenDefects(clean);
  };

  const handleUpdateItem = (itemNo: string, updated: Partial<ItemEvaluation>) => {
    setItemEvaluations((prev) => ({
      ...prev,
      [itemNo]: {
        ...(prev[itemNo] || { status: '', remark: '', tags: [], photo: null, defectPins: [] }),
        ...updated,
      },
    }));
  };

  const handleQuickFillGood = () => {
    const updated: Record<string, ItemEvaluation> = { ...itemEvaluations };
    let count = 0;
    template.categories.forEach((cat) => {
      (cat.items || []).forEach((item) => {
        if (!updated[item.no]?.status) {
          updated[item.no] = {
            ...(updated[item.no] || { remark: '', tags: [], photo: null, defectPins: [] }),
            status: 'GOOD',
          };
          count++;
        }
      });
    });

    setItemEvaluations(updated);
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([20, 50, 20]);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
    showToast(`Marked ${count} items as PASS!`);
  };

  const handleCategoryAllGood = (catId: number) => {
    const cat = template.categories.find((c) => c.id === catId);
    if (!cat) return;

    const updated: Record<string, ItemEvaluation> = { ...itemEvaluations };
    (cat.items || []).forEach((item) => {
      updated[item.no] = {
        ...(updated[item.no] || { remark: '', tags: [], photo: null, defectPins: [] }),
        status: 'GOOD',
      };
    });

    setItemEvaluations(updated);
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(25);
    showToast(`Marked all items in "${cat.name}" as PASS!`);
  };

  const handleRectifyDefect = (itemNo: string) => {
    handleUpdateItem(itemNo, {
      status: 'GOOD',
      remark: `Rectified on ${new Date().toISOString().split('T')[0]}: Verified in good working order.`,
    });
    setOpenDefects((prev) => prev.filter((d) => d.itemNo !== itemNo));
    showToast(`Marked Item ${itemNo} as RECTIFIED!`);
  };

  const handleSaveInspection = async () => {
    if (!equipmentId) {
      showToast('Please enter an Equipment ID (e.g. Q75)');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        equipmentId,
        equipmentType,
        inspectorName,
        inspectorStaffId,
        inspectionDate,
        inspectionTime,
        location,
        shift,
        generalNotes,
        items: itemEvaluations,
      };

      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const saved = data.inspection;

        // Reset draft
        setItemEvaluations({});
        setGeneralNotes('');
        localStorage.removeItem('cbm_inspection_draft_v2');

        await fetchInspections();
        await fetchFleetStats();
        await fetchCbmAnalytics();

        confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 } });

        // Trigger critical alert modal if poor defects found
        if (saved.summary?.poorCount > 0) {
          setCriticalModalRecord(saved);
        } else {
          showToast(`Inspection saved successfully for ${equipmentId}!`);
          setActiveTab('history');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save inspection to cloud');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteInspection = async (id: string) => {
    try {
      const res = await fetch(`/api/inspections/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Inspection deleted');
        await fetchInspections();
        await fetchFleetStats();
        await fetchCbmAnalytics();
      }
    } catch (err) {}
  };

  const handleClearAllData = async () => {
    if (confirm('Are you sure you want to reset all inspection records? This cannot be undone.')) {
      try {
        const res = await fetch('/api/inspections/all', { method: 'DELETE' });
        if (res.ok) {
          showToast('Database reset');
          await fetchInspections();
          await fetchFleetStats();
          await fetchCbmAnalytics();
        }
      } catch (err) {}
    }
  };

  // Voice speech synthesis
  const toggleVoice = (target: string) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported on this browser. Try Google Chrome or Safari.');
      return;
    }

    if (isListening && activeSpeechTarget === target) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setActiveSpeechTarget(null);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsListening(true);
      setActiveSpeechTarget(target);
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
    };

    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (target === 'generalNotes') {
        setGeneralNotes((prev) => (prev ? `${prev} ${transcript}` : transcript));
      } else {
        handleUpdateItem(target, {
          remark: itemEvaluations[target]?.remark ? `${itemEvaluations[target].remark} ${transcript}` : transcript,
        });
      }
      showToast(`🎙️ Recorded: "${transcript}"`);
    };

    rec.onerror = () => {
      setIsListening(false);
      setActiveSpeechTarget(null);
    };

    rec.onend = () => {
      setIsListening(false);
      setActiveSpeechTarget(null);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  // Count progress
  let totalItems = 0;
  let checkedCount = 0;
  let goodCount = 0;
  let satisfiedCount = 0;
  let poorCount = 0;

  template.categories.forEach((cat) => {
    (cat.items || []).forEach((item) => {
      totalItems++;
      const s = itemEvaluations[item.no]?.status;
      if (s) {
        checkedCount++;
        if (s === 'GOOD') goodCount++;
        else if (s === 'SATISFIED') satisfiedCount++;
        else if (s === 'POOR') poorCount++;
      }
    });
  });

  const quickCranes = ['Q75', 'Q76', 'Q71', 'Q72', 'Q73', 'Q74', 'RTG01', 'RTG02', 'RTG03'];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 pb-28 md:pb-12">
      
      {/* App Header */}
      <Header
        onOpenSearch={() => setIsCommandPaletteOpen(true)}
        onOpenQr={() => setIsQrModalOpen(true)}
        isOnline={true}
        selectedEquipment={equipmentId}
      />

      {/* Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        openDefectCount={openDefects.length}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 rounded-xl bg-slate-900 border border-emerald-500/40 px-4 py-2.5 text-xs font-semibold text-emerald-300 shadow-2xl backdrop-blur-xl animate-fade-in flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Pane */}
      <main className="mx-auto max-w-5xl px-3.5 sm:px-6 py-6">
        
        {/* ========================================================= */}
        {/* TAB 1: INSPECT (Mobile Ticking Stream) */}
        {/* ========================================================= */}
        {activeTab === 'inspect' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Setup & Equipment Details Card */}
            <div className="rounded-2xl border border-white/[0.08] bg-slate-950/60 p-4 sm:p-5 backdrop-blur-xl shadow-lg">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    NEW AUDIT
                  </span>
                  <h2 className="text-sm sm:text-base font-bold text-white">Crane & Inspector Metadata</h2>
                </div>

                <button
                  type="button"
                  onClick={handleQuickFillGood}
                  className="touch-press flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 shadow-sm"
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>Mark All Pass</span>
                </button>
              </div>

              {/* Equipment ID Input & Chips */}
              <div className="space-y-2 mb-4">
                <label className="text-xs font-semibold text-slate-300">
                  Equipment ID <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={equipmentId}
                    onChange={(e) => handleEquipmentChange(e.target.value)}
                    placeholder="e.g. Q75, Q76, RTG02"
                    className="w-full rounded-xl border border-white/[0.1] bg-slate-900/90 px-3.5 py-2.5 font-mono text-sm font-bold text-white uppercase placeholder-slate-500 outline-none focus:border-emerald-500/50"
                  />
                  {equipmentId && (
                    <button
                      type="button"
                      onClick={() => handleEquipmentChange('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Quick Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-500 mr-1">Quick Select:</span>
                  {quickCranes.map((crane) => (
                    <button
                      key={crane}
                      type="button"
                      onClick={() => handleEquipmentChange(crane, crane.startsWith('RTG') ? 'RTG' : 'QC')}
                      className={`touch-press rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition-all border ${
                        equipmentId === crane
                          ? 'bg-emerald-500 text-white border-emerald-400 shadow-glow-pass'
                          : 'bg-slate-900 text-slate-400 border-white/[0.08] hover:border-white/[0.2] hover:text-white'
                      }`}
                    >
                      {crane}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inspector Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-white/[0.06]">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Inspector Name</label>
                  <input
                    type="text"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    placeholder="e.g. Aremi"
                    className="w-full rounded-xl border border-white/[0.1] bg-slate-900/80 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Staff / Inspector ID</label>
                  <input
                    type="text"
                    value={inspectorStaffId}
                    onChange={(e) => setInspectorStaffId(e.target.value)}
                    placeholder="e.g. STF-8421"
                    className="w-full rounded-xl border border-white/[0.1] bg-slate-900/80 px-3 py-2 text-xs font-mono text-white outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Location / Berth</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Berth 4"
                    className="w-full rounded-xl border border-white/[0.1] bg-slate-900/80 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Shift / Time</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.1] bg-slate-900/80 px-2.5 py-2 text-xs text-white outline-none"
                  >
                    <option value="Day Shift">Day Shift</option>
                    <option value="Night Shift">Night Shift</option>
                    <option value="Maintenance Standby">Maintenance Standby</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Active Defect Carry-Forward Banner */}
            <OpenDefectsBanner
              equipmentId={equipmentId}
              defects={openDefects}
              lastInspectionDate={lastOpenDefectDate}
              onRectify={handleRectifyDefect}
            />

            {/* Search & Quick Filter Bar */}
            <div className="rounded-2xl border border-white/[0.08] bg-slate-950/60 p-3 sm:p-4 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={checklistSearch}
                  onChange={(e) => setChecklistSearch(e.target.value)}
                  placeholder="🔍 Search items (e.g. rope, brakes, oil, spreader, cabin)..."
                  className="w-full rounded-xl border border-white/[0.1] bg-slate-900 pl-10 pr-10 py-2 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500/50"
                />
                {checklistSearch && (
                  <button
                    onClick={() => setChecklistSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {(
                  [
                    { id: 'ALL', label: `All (${totalItems})` },
                    { id: 'UNCHECKED', label: `⏳ Unchecked (${totalItems - checkedCount})` },
                    { id: 'DEFECTS', label: `⚠️ Flagged (${poorCount + satisfiedCount})` },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setViewFilter(f.id)}
                    className={`touch-press whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${
                      viewFilter === f.id
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-white/[0.08] hover:bg-white/[0.04]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Quick Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategoryTab('ALL')}
                className={`touch-press whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all border ${
                  selectedCategoryTab === 'ALL'
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-glow-pass'
                    : 'bg-slate-900/80 text-slate-400 border-white/[0.08] hover:text-white'
                }`}
              >
                All Sections
              </button>
              {template.categories.map((cat) => {
                const totalInCat = cat.items?.length || 0;
                let checkedInCat = 0;
                cat.items?.forEach((it) => {
                  if (itemEvaluations[it.no]?.status) checkedInCat++;
                });

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryTab(cat.id)}
                    className={`touch-press whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all border flex items-center gap-1.5 ${
                      selectedCategoryTab === cat.id
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-glow-pass'
                        : 'bg-slate-900/80 text-slate-400 border-white/[0.08] hover:text-white'
                    }`}
                  >
                    <span>{cat.id}. {cat.name}</span>
                    <span className="font-mono text-[10px] opacity-75">
                      ({checkedInCat}/{totalInCat})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Checklist Stream Container */}
            <div className="space-y-6">
              {template.categories
                .filter((cat) => selectedCategoryTab === 'ALL' || selectedCategoryTab === cat.id)
                .map((cat) => {
                  const q = checklistSearch.toLowerCase().trim();
                  const filteredItems = (cat.items || []).filter((item) => {
                    const st = itemEvaluations[item.no]?.status;
                    if (viewFilter === 'UNCHECKED' && st) return false;
                    if (viewFilter === 'DEFECTS' && st !== 'POOR' && st !== 'SATISFIED') return false;

                    if (!q) return true;
                    return (
                      item.no.toLowerCase().includes(q) ||
                      item.description.toLowerCase().includes(q) ||
                      (item.defectTags || []).some((t) => t.toLowerCase().includes(q)) ||
                      (itemEvaluations[item.no]?.remark || '').toLowerCase().includes(q)
                    );
                  });

                  if (filteredItems.length === 0 && (q || viewFilter !== 'ALL')) {
                    return null;
                  }

                  let catChecked = 0;
                  cat.items?.forEach((it) => {
                    if (itemEvaluations[it.no]?.status) catChecked++;
                  });

                  return (
                    <div key={cat.id} className="rounded-2xl border border-white/[0.08] bg-slate-950/40 p-4 sm:p-5 space-y-4">
                      
                      {/* Section Header with 1-Tap All Good */}
                      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 font-mono text-xs font-bold text-emerald-400">
                            {cat.id}
                          </span>
                          <h3 className="text-sm font-bold text-white">{cat.name}</h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCategoryAllGood(cat.id)}
                            className="touch-press flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-bold text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
                          >
                            <Zap className="h-3 w-3" />
                            <span>⚡ All Good</span>
                          </button>
                          <span className="rounded-full bg-slate-900 border border-white/[0.08] px-2 py-0.5 font-mono text-[11px] text-slate-400">
                            {catChecked}/{cat.items?.length || 0}
                          </span>
                        </div>
                      </div>

                      {/* Items Stream */}
                      <div className="space-y-3">
                        {filteredItems.map((item) => (
                          <ChecklistItemCard
                            key={item.no}
                            item={item}
                            evaluation={itemEvaluations[item.no] || { status: '', remark: '' }}
                            onUpdateEvaluation={handleUpdateItem}
                            isListening={isListening && activeSpeechTarget === item.no}
                            onToggleVoice={() => toggleVoice(item.no)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* General Notes & Voice Dictation Card */}
            <div className="rounded-2xl border border-white/[0.08] bg-slate-950/60 p-4 sm:p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-white">General Notes & Work Order Recommendations</h3>
                  <p className="text-xs text-slate-400">Add overall maintenance findings or spare parts needed.</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleVoice('generalNotes')}
                  className={`touch-press flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                    isListening && activeSpeechTarget === 'generalNotes'
                      ? 'bg-rose-500 text-white border-rose-400 shadow-glow-fail animate-pulse'
                      : 'bg-slate-900 text-slate-300 border-white/[0.1] hover:bg-slate-800 hover:text-emerald-400'
                  }`}
                >
                  <Mic className="h-3.5 w-3.5" />
                  <span>{isListening && activeSpeechTarget === 'generalNotes' ? 'Listening...' : 'Speak Notes'}</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="e.g. Hoist wire rope 2.1 ordered for replacement. Gantry brakes adjusted on Berth 4."
                className="w-full rounded-xl border border-white/[0.1] bg-slate-900/90 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Floating Sticky Progress Tracker */}
            <ProgressTracker
              total={totalItems}
              checked={checkedCount}
              goodCount={goodCount}
              satisfiedCount={satisfiedCount}
              poorCount={poorCount}
              onQuickFillGood={handleQuickFillGood}
              onSave={handleSaveInspection}
              onReset={() => {
                if (confirm('Reset current inspection draft?')) {
                  setItemEvaluations({});
                  setGeneralNotes('');
                  showToast('Draft reset');
                }
              }}
              isSaving={isSaving}
            />

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: TRACK BACK (History & Audit Log) */}
        {/* ========================================================= */}
        {activeTab === 'history' && (
          <div className="animate-fade-in">
            <TrackBackHistoryView
              inspections={inspections}
              categories={template.categories}
              onDeleteInspection={handleDeleteInspection}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: FLEET (Equipment Status Matrix) */}
        {/* ========================================================= */}
        {activeTab === 'fleet' && (
          <div className="animate-fade-in">
            <FleetHealthView
              fleetStats={fleetStats}
              onSelectEquipment={(eqId, eqType) => {
                handleEquipmentChange(eqId, eqType);
                setActiveTab('inspect');
                showToast(`Switched to ${eqId}`);
              }}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: CBM ANALYTICS */}
        {/* ========================================================= */}
        {activeTab === 'cbm' && (
          <div className="animate-fade-in">
            <CbmAnalyticsView
              cbmData={cbmData}
              supervisorPhone={supervisorPhone}
              supervisorEmail={supervisorEmail}
              onSaveAlertSettings={async (phone, email) => {
                try {
                  const res = await fetch('/api/settings/alerts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ supervisorPhone: phone, supervisorEmail: email }),
                  });
                  if (res.ok) {
                    setSupervisorPhone(phone);
                    setSupervisorEmail(email);
                    showToast('Alert dispatcher settings saved!');
                  }
                } catch (e) {}
              }}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: EXPORT & QR */}
        {/* ========================================================= */}
        {activeTab === 'export' && (
          <div className="animate-fade-in">
            <ExportQrView
              inspections={inspections}
              onClearAllData={handleClearAllData}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: TEAM FEEDBACK */}
        {/* ========================================================= */}
        {activeTab === 'feedback' && (
          <div className="animate-fade-in">
            <TeamFeedbackView
              feedbacks={feedbacks}
              onAddFeedback={async (payload) => {
                const res = await fetch('/api/feedback', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
                });
                if (res.ok) {
                  await fetchFeedbacks();
                  showToast('Feedback submitted!');
                }
              }}
              onUpvoteFeedback={async (id) => {
                const res = await fetch(`/api/feedback/${id}/upvote`, { method: 'POST' });
                if (res.ok) {
                  await fetchFeedbacks();
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
                }
              }}
              isListening={isListening && activeSpeechTarget === 'feedback'}
              onToggleVoice={() => toggleVoice('feedback')}
            />
          </div>
        )}

      </main>

      {/* Command Palette (Cmd+K) Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        categories={template.categories}
        onSelectItem={(itemNo) => {
          setActiveTab('inspect');
          setSelectedCategoryTab('ALL');
          setTimeout(() => {
            const el = document.getElementById(`item-card-${itemNo.replace('.', '_')}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        }}
        onNavigateTab={setActiveTab}
        onQuickFillGood={handleQuickFillGood}
        onOpenQr={() => setIsQrModalOpen(true)}
      />

      {/* Critical Defect Modal */}
      <CriticalDefectModal
        isOpen={!!criticalModalRecord}
        onClose={() => setCriticalModalRecord(null)}
        inspection={criticalModalRecord}
        supervisorPhone={supervisorPhone}
        supervisorEmail={supervisorEmail}
      />

      {/* Quick QR Modal Popup */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-white/[0.12] bg-slate-950 p-5 shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <QrCode className="h-4 w-4 text-emerald-400" />
                <span>Mobile Access QR</span>
              </h3>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-white p-3 rounded-2xl inline-block shadow-lg mx-auto">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(window.location.origin)}`}
                alt="QR Code"
                className="h-48 w-48 object-contain"
              />
            </div>

            <p className="text-xs text-slate-400 font-mono">
              {window.location.origin}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={async () => {
                  if (navigator.share) {
                    await navigator.share({
                      title: 'Port Inspection App',
                      url: window.location.origin,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.origin);
                    showToast('Link copied to clipboard!');
                  }
                }}
                className="touch-press flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-bold text-white shadow-sm"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Share Link</span>
              </button>

              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="touch-press rounded-xl border border-white/[0.1] bg-slate-900 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
