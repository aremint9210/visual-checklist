# Port Equipment Visual Inspection & Asset Tracking System

A mobile-first, responsive visual inspection web app designed for port cranes (QC, RTG, RMG) and yard machinery. Based directly on the standardized **VISUAL INSPECTION.xlsx** checklist.

---

## 🚀 Quick Start (1-Click)

1. Double-click **`start_app.bat`** (or run `node server.js` in terminal).
2. The web dashboard will open automatically in your browser at `http://localhost:3000`.

---

## 📱 How to Use on Your Phone

1. Make sure your phone is connected to the same **Wi-Fi or Hotspot** as your computer.
2. Open the dashboard on your computer and tap the **QR Code icon (📱)** in the top right.
3. **Scan the QR Code** with your phone camera.
4. Your phone will immediately open the checklist interface.
5. *(Optional)* On your phone browser (Safari/Chrome), tap **"Add to Home Screen"** to use it like a native mobile app!

---

## 🔍 Key Features

### 1. Mobile-Optimized Ticking (`Inspect` Tab)
- **All 6 Categories & 23 Items** from `VISUAL INSPECTION.xlsx`:
  - 1. Structural & Mechanical Components
  - 2. Wire Ropes & Sheaves System
  - 3. Spreader & Lifting Attachment
  - 4. Hydraulics, Engine & Mechanical Drives
  - 5. Electrical Systems & Cabins
  - 6. Safety Equipment & Housekeeping
- **Instant 3-Way Buttons**: `GOOD` (Green), `SATISFIED` (Amber), `POOR` (Red).
- **⚡ "Mark All Good" Button**: Pre-fills the entire checklist in 1 tap so you only have to adjust items that have issues!
- **Quick Defect Tags & Remarks**: Tap defect chips (e.g. *Broken Wires*, *Oil Leak*, *Cracks*) to auto-populate notes.
- **Photo Attachments**: Take photos of defects directly using your phone's camera.
- **Auto-Save Draft**: Never lose your inputs even if the phone screen locks or network disconnects.

### 2. Track Back & Search History (`Track Back` Tab)
- **Track by Equipment ID**: Type `Q75`, `Q76`, `RTG02`, etc., to view all past inspections for that machine.
- **Timeline & Health History**: See exactly what was inspected yesterday vs today.
- **Color-Coded Status**: Instantly spot if a crane had `POOR` or `SATISFIED` items.
- **Full Report Modal**: Review every individual rating, inspector notes, and attached photos.

### 3. Excel & Data Export (`Excel Export` Tab)
- **Single Inspection Export**: Download an exact `.xlsx` file formatted identically to the original `VISUAL INSPECTION.xlsx` template with checkmarks `[X]` placed in the GOOD/SATISFIED/POOR columns.
- **Master Consolidated Excel**: Download an entire historical log sheet of all crane inspections.
- **JSON Database Backup**: One-click raw database download.

---

## 📂 Data Storage Location

All inspection data is saved in:
- `data/inspections.json` (Structured historical inspection logs)
- `public/uploads/` (Uploaded defect photos)

To backup your data, simply copy the `data/` folder or download the backup file from the app.
