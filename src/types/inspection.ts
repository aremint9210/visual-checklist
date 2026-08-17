export type ItemStatus = 'GOOD' | 'SATISFIED' | 'POOR' | '';

export interface DefectPin {
  id: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  label: string;
  severity: 'CRITICAL' | 'WARNING' | 'MINOR';
}

export interface ItemEvaluation {
  status: ItemStatus;
  remark: string;
  tags?: string[];
  photo?: string | null;
  defectPins?: DefectPin[];
}

export interface ChecklistItemDef {
  no: string;
  description: string;
  applicableTo: 'ALL' | 'QC' | 'RTG' | 'RMG';
  defectTags?: string[];
}

export interface ChecklistCategoryDef {
  id: number;
  name: string;
  items: ChecklistItemDef[];
}

export interface InspectionTemplate {
  categories: ChecklistCategoryDef[];
}

export interface InspectionSummary {
  totalItems: number;
  goodCount: number;
  satisfiedCount: number;
  poorCount: number;
  overallStatus: 'PASSED' | 'SATISFACTORY_WITH_NOTES' | 'ATTENTION_REQUIRED';
}

export interface InspectionRecord {
  id: string;
  equipmentId: string;
  equipmentType: string;
  inspectorName: string;
  inspectorStaffId?: string;
  inspectionDate: string;
  inspectionTime: string;
  timestamp: string;
  location?: string;
  shift?: string;
  runningHours?: number | null;
  generalNotes?: string;
  summary: InspectionSummary;
  items: Record<string, ItemEvaluation>;
}

export interface EquipmentStat {
  equipmentId: string;
  equipmentType: string;
  totalInspections: number;
  passedCount: number;
  defectCount: number;
  reliabilityRate: number;
  lastInspectionDate: string;
  lastInspector: string;
  lastInspectorStaffId?: string;
  status: 'HEALTHY' | 'DEFECT_LOGGED' | 'MONITORING';
}

export interface DefectHotspot {
  itemNo: string;
  description: string;
  category: string;
  poorCount: number;
  satisfiedCount: number;
  totalIncidents: number;
}

export interface CbmSummary {
  fleetHealthScore: number;
  totalInspections: number;
  totalPoor: number;
  totalSatisfied: number;
  topHotspots: DefectHotspot[];
  equipmentRankings: {
    equipmentId: string;
    equipmentType: string;
    inspectionsCount: number;
    reliabilityScore: number;
    status: string;
  }[];
}

export interface FeedbackRecord {
  id: string;
  author: string;
  role: string;
  category: string;
  rating: number;
  message: string;
  upvotes: number;
  createdAt: string;
}

export interface OpenDefect {
  itemNo: string;
  description: string;
  status: 'POOR' | 'SATISFIED';
  remark: string;
  reportedBy: string;
  reportedDate: string;
}
