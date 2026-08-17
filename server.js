const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');
const multer = require('multer');
const ExcelJS = require('exceljs');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

// Directories
const DATA_DIR = path.join(__dirname, 'data');
const TEMPLATE_FILE = path.join(DATA_DIR, 'checklist-template.json');
const INSPECTIONS_FILE = path.join(DATA_DIR, 'inspections.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Setup multer storage for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, `photo-${uniqueSuffix}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Helper: Read JSON file safely
function readJSON(filePath, fallback = []) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

// Helper: Write JSON file safely (atomic write)
function writeJSON(filePath, data) {
  try {
    const tempFile = `${filePath}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, filePath);
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// Helper: Get local network IPv4 addresses
function getLocalIPAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push({
          interface: name,
          ip: net.address
        });
      }
    }
  }
  return addresses;
}

// ==========================================
// API ENDPOINTS
// ==========================================

// 1. Checklist Template
app.get('/api/checklist-template', (req, res) => {
  const template = readJSON(TEMPLATE_FILE, { categories: [] });
  res.json(template);
});

// 2. Network Info & QR Code (supports both local network and public cloud URLs)
app.get('/api/network-info', async (req, res) => {
  try {
    const ips = getLocalIPAddresses();
    const primaryIP = ips.length > 0 ? ips[0].ip : 'localhost';

    // Determine base URL: check client query, proxy headers (Render/Vercel), or local fallback
    let baseUrl = req.query.origin;
    if (!baseUrl) {
      const forwardedHost = req.headers['x-forwarded-host'] || req.headers.host;
      const forwardedProto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
      if (forwardedHost && !forwardedHost.includes('localhost') && !forwardedHost.includes('127.0.0.1')) {
        baseUrl = `${forwardedProto}://${forwardedHost}`;
      } else {
        baseUrl = `http://${primaryIP}:${PORT}`;
      }
    }

    const qrCodeDataUrl = await QRCode.toDataURL(baseUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    res.json({
      port: PORT,
      interfaces: ips,
      primaryIP,
      mobileUrl: baseUrl,
      qrCodeDataUrl,
      isCloud: !baseUrl.includes('localhost') && !baseUrl.includes('172.') && !baseUrl.includes('192.168.') && !baseUrl.includes('10.')
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate network info', details: err.message });
  }
});

// 3. Photo Upload
app.post('/api/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No photo provided' });
  }
  const photoUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, photoUrl, filename: req.file.filename });
});

// 4. Get All Inspections (with search/filter)
app.get('/api/inspections', (req, res) => {
  const { equipmentId, status, inspector, startDate, endDate, limit } = req.query;
  let inspections = readJSON(INSPECTIONS_FILE, []);

  // Filter by Equipment ID (case-insensitive substring or exact)
  if (equipmentId) {
    const query = equipmentId.trim().toUpperCase();
    inspections = inspections.filter(insp =>
      insp.equipmentId && insp.equipmentId.toUpperCase().includes(query)
    );
  }

  // Filter by Status
  if (status && status !== 'ALL') {
    inspections = inspections.filter(insp => insp.summary && insp.summary.overallStatus === status);
  }

  // Filter by Inspector
  if (inspector) {
    const inspQuery = inspector.trim().toLowerCase();
    inspections = inspections.filter(insp =>
      insp.inspectorName && insp.inspectorName.toLowerCase().includes(inspQuery)
    );
  }

  // Filter by Date Range
  if (startDate) {
    inspections = inspections.filter(insp => insp.inspectionDate >= startDate);
  }
  if (endDate) {
    inspections = inspections.filter(insp => insp.inspectionDate <= endDate);
  }

  // Sort descending by timestamp / date
  inspections.sort((a, b) => new Date(b.timestamp || b.inspectionDate) - new Date(a.timestamp || a.inspectionDate));

  if (limit && !isNaN(parseInt(limit))) {
    inspections = inspections.slice(0, parseInt(limit));
  }

  res.json(inspections);
});

// 5. Get Single Inspection
app.get('/api/inspections/:id', (req, res) => {
  const inspections = readJSON(INSPECTIONS_FILE, []);
  const inspection = inspections.find(item => item.id === req.params.id);
  if (!inspection) {
    return res.status(400).json({ error: 'Inspection not found' });
  }
  res.json(inspection);
});

// 6. Create New Inspection
app.post('/api/inspections', (req, res) => {
  try {
    const inspections = readJSON(INSPECTIONS_FILE, []);
    const data = req.body;

    if (!data.equipmentId) {
      return res.status(400).json({ error: 'Equipment ID is required' });
    }

    const inspectionDate = data.inspectionDate || new Date().toISOString().split('T')[0];
    const inspectionTime = data.inspectionTime || new Date().toTimeString().slice(0, 5);
    const timestamp = data.timestamp || new Date().toISOString();
    const cleanEquip = data.equipmentId.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');

    // Generate unique ID
    const uniqueSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const id = data.id || `INSP-${inspectionDate.replace(/-/g, '')}-${cleanEquip}-${uniqueSuffix}`;

    // Calculate item stats
    let goodCount = 0;
    let satisfiedCount = 0;
    let poorCount = 0;
    let totalItems = 0;

    const items = data.items || {};
    for (const [key, item] of Object.entries(items)) {
      totalItems++;
      if (item.status === 'GOOD') goodCount++;
      else if (item.status === 'SATISFIED') satisfiedCount++;
      else if (item.status === 'POOR') poorCount++;
    }

    let overallStatus = 'PASSED';
    if (poorCount > 0) {
      overallStatus = 'ATTENTION_REQUIRED';
    } else if (satisfiedCount > 0) {
      overallStatus = 'SATISFACTORY_WITH_NOTES';
    }

    const newInspection = {
      id,
      equipmentId: cleanEquip,
      equipmentType: data.equipmentType || 'QC',
      inspectorName: data.inspectorName || 'Unassigned',
      inspectionDate,
      inspectionTime,
      timestamp,
      location: data.location || '',
      shift: data.shift || 'Day Shift',
      runningHours: data.runningHours || null,
      generalNotes: data.generalNotes || '',
      signature: data.signature || null,
      summary: {
        totalItems,
        goodCount,
        satisfiedCount,
        poorCount,
        overallStatus
      },
      items
    };

    // Prepend to array
    inspections.unshift(newInspection);
    writeJSON(INSPECTIONS_FILE, inspections);

    res.status(201).json({
      success: true,
      message: 'Inspection saved successfully',
      inspection: newInspection
    });
  } catch (err) {
    console.error('Error saving inspection:', err);
    res.status(500).json({ error: 'Failed to save inspection', details: err.message });
  }
});

// 7. Update Inspection
app.put('/api/inspections/:id', (req, res) => {
  const inspections = readJSON(INSPECTIONS_FILE, []);
  const index = inspections.findIndex(item => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Inspection not found' });
  }

  const updatedData = req.body;
  
  // Recalculate summary if items provided
  if (updatedData.items) {
    let goodCount = 0;
    let satisfiedCount = 0;
    let poorCount = 0;
    let totalItems = 0;

    for (const [key, item] of Object.entries(updatedData.items)) {
      totalItems++;
      if (item.status === 'GOOD') goodCount++;
      else if (item.status === 'SATISFIED') satisfiedCount++;
      else if (item.status === 'POOR') poorCount++;
    }

    let overallStatus = 'PASSED';
    if (poorCount > 0) overallStatus = 'ATTENTION_REQUIRED';
    else if (satisfiedCount > 0) overallStatus = 'SATISFACTORY_WITH_NOTES';

    updatedData.summary = {
      totalItems,
      goodCount,
      satisfiedCount,
      poorCount,
      overallStatus
    };
  }

  inspections[index] = { ...inspections[index], ...updatedData, updatedAt: new Date().toISOString() };
  writeJSON(INSPECTIONS_FILE, inspections);

  res.json({ success: true, message: 'Inspection updated', inspection: inspections[index] });
});

// 8. Delete Inspection
app.delete('/api/inspections/:id', (req, res) => {
  let inspections = readJSON(INSPECTIONS_FILE, []);
  const initialLength = inspections.length;
  inspections = inspections.filter(item => item.id !== req.params.id);

  if (inspections.length === initialLength) {
    return res.status(404).json({ error: 'Inspection not found' });
  }

  writeJSON(INSPECTIONS_FILE, inspections);
  res.json({ success: true, message: 'Inspection deleted' });
});

// 9. Equipment Directory & Historical Stats
app.get('/api/equipment/stats', (req, res) => {
  const inspections = readJSON(INSPECTIONS_FILE, []);
  const equipmentMap = {};

  inspections.forEach(insp => {
    const eq = insp.equipmentId;
    if (!eq) return;

    if (!equipmentMap[eq]) {
      equipmentMap[eq] = {
        equipmentId: eq,
        equipmentType: insp.equipmentType || 'QC',
        totalInspections: 0,
        lastInspectionDate: insp.inspectionDate,
        lastInspectionTime: insp.inspectionTime,
        lastStatus: insp.summary?.overallStatus || 'UNKNOWN',
        lastInspector: insp.inspectorName,
        poorCountTotal: 0,
        satisfiedCountTotal: 0,
        recentDefects: []
      };
    }

    const stat = equipmentMap[eq];
    stat.totalInspections++;
    stat.poorCountTotal += (insp.summary?.poorCount || 0);
    stat.satisfiedCountTotal += (insp.summary?.satisfiedCount || 0);

    // Collect defect history
    if (insp.items) {
      for (const [no, item] of Object.entries(insp.items)) {
        if (item.status === 'POOR' || item.status === 'SATISFIED') {
          stat.recentDefects.push({
            date: insp.inspectionDate,
            itemNo: no,
            status: item.status,
            remark: item.remark,
            tags: item.tags || []
          });
        }
      }
    }
  });

  const equipmentList = Object.values(equipmentMap).sort((a, b) => a.equipmentId.localeCompare(b.equipmentId));
  res.json(equipmentList);
});

// 10. Track Back History for Single Equipment (e.g. Q75)
app.get('/api/equipment/:id/history', (req, res) => {
  const targetId = req.params.id.trim().toUpperCase();
  const inspections = readJSON(INSPECTIONS_FILE, []);
  const history = inspections
    .filter(insp => insp.equipmentId && insp.equipmentId.toUpperCase() === targetId)
    .sort((a, b) => new Date(b.timestamp || b.inspectionDate) - new Date(a.timestamp || a.inspectionDate));

  res.json({
    equipmentId: targetId,
    totalCount: history.length,
    history
  });
});

// 11. Export Single Inspection to Excel (matching VISUAL INSPECTION.xlsx layout)
app.get('/api/export/excel/:id', async (req, res) => {
  try {
    const inspections = readJSON(INSPECTIONS_FILE, []);
    const insp = inspections.find(item => item.id === req.params.id);
    if (!insp) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    const template = readJSON(TEMPLATE_FILE, { categories: [] });
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Visual Inspection System';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Inspection Report', {
      views: [{ showGridLines: true }]
    });

    // Set column widths
    sheet.columns = [
      { key: 'no', width: 8 },
      { key: 'description', width: 65 },
      { key: 'good', width: 14 },
      { key: 'satisfied', width: 14 },
      { key: 'poor', width: 14 },
      { key: 'remark', width: 35 }
    ];

    // Title & Metadata
    sheet.mergeCells('A1:F1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `EQUIPMENT VISUAL INSPECTION REPORT - ${insp.equipmentId}`;
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(1).height = 36;

    // Info header rows
    sheet.addRow(['Equipment ID:', insp.equipmentId, 'Type:', insp.equipmentType, 'Date:', `${insp.inspectionDate} ${insp.inspectionTime || ''}`]);
    sheet.addRow(['Inspector:', insp.inspectorName, 'Location:', insp.location || 'N/A', 'Shift / Hours:', `${insp.shift || 'N/A'} (${insp.runningHours ? insp.runningHours + ' hrs' : '-'})`]);
    sheet.addRow(['Overall Result:', insp.summary?.overallStatus || 'N/A', 'Score:', `GOOD: ${insp.summary?.goodCount || 0} | SATISFIED: ${insp.summary?.satisfiedCount || 0} | POOR: ${insp.summary?.poorCount || 0}`, '', '']);
    
    // Style header rows
    for (let r = 2; r <= 4; r++) {
      const row = sheet.getRow(r);
      row.font = { name: 'Arial', size: 10, bold: true };
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
      row.height = 20;
    }

    sheet.addRow([]); // Blank line

    // Table Header (Row 6)
    const headerRow = sheet.addRow(['NO', 'DESCRIPTION', 'GOOD', 'SATISFIED', 'POOR', 'REMARK']);
    headerRow.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
    headerRow.height = 26;
    ['A6', 'B6', 'C6', 'D6', 'E6', 'F6'].forEach(cellRef => {
      const c = sheet.getCell(cellRef);
      c.alignment = { vertical: 'middle', horizontal: cellRef === 'B6' ? 'left' : 'center' };
      c.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'medium' },
        right: { style: 'thin' }
      };
    });

    // Populate Categories & Items
    template.categories.forEach(cat => {
      // Category header row
      const catRow = sheet.addRow([cat.id.toString(), cat.name, '', '', '', '']);
      catRow.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF0F172A' } };
      catRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      catRow.height = 22;

      cat.items.forEach(item => {
        const itemResult = (insp.items && insp.items[item.no]) ? insp.items[item.no] : { status: '', remark: '' };
        const isGood = itemResult.status === 'GOOD' ? '[ X ]' : '[   ]';
        const isSatisfied = itemResult.status === 'SATISFIED' ? '[ X ]' : '[   ]';
        const isPoor = itemResult.status === 'POOR' ? '[ X ]' : '[   ]';

        const row = sheet.addRow([
          item.no,
          item.description,
          isGood,
          isSatisfied,
          isPoor,
          itemResult.remark || ''
        ]);

        row.font = { name: 'Arial', size: 10 };
        row.height = 22;

        // Alignment and borders
        const cells = [row.getCell(1), row.getCell(2), row.getCell(3), row.getCell(4), row.getCell(5), row.getCell(6)];
        cells.forEach((c, idx) => {
          c.border = {
            top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
            left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
            bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
            right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
          };
          if (idx === 0) c.alignment = { vertical: 'middle', horizontal: 'center' };
          else if (idx === 1) c.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
          else if (idx >= 2 && idx <= 4) {
            c.alignment = { vertical: 'middle', horizontal: 'center' };
            if (idx === 2 && itemResult.status === 'GOOD') {
              c.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF15803D' } };
              c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
            } else if (idx === 3 && itemResult.status === 'SATISFIED') {
              c.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFB45309' } };
              c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
            } else if (idx === 4 && itemResult.status === 'POOR') {
              c.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFB91C1C' } };
              c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
            }
          } else if (idx === 5) {
            c.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
          }
        });
      });
    });

    // Notes footer
    if (insp.generalNotes) {
      sheet.addRow([]);
      const notesHeader = sheet.addRow(['General Notes / Defect Action Plan:', '', '', '', '', '']);
      notesHeader.font = { bold: true };
      const notesContent = sheet.addRow([insp.generalNotes, '', '', '', '', '']);
      sheet.mergeCells(`A${notesContent.number}:F${notesContent.number}`);
    }

    const filename = `Visual_Inspection_${insp.equipmentId}_${insp.inspectionDate}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Error generating Excel:', err);
    res.status(500).json({ error: 'Failed to generate Excel report', details: err.message });
  }
});

// 12. Master Consolidated Excel Export (All Inspections)
app.get('/api/export/excel-all', async (req, res) => {
  try {
    const inspections = readJSON(INSPECTIONS_FILE, []);
    const template = readJSON(TEMPLATE_FILE, { categories: [] });
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Visual Inspection System Master Export';

    // Summary Sheet
    const summarySheet = workbook.addWorksheet('Inspection Log');
    summarySheet.columns = [
      { header: 'ID', key: 'id', width: 26 },
      { header: 'Equipment ID', key: 'equipmentId', width: 15 },
      { header: 'Type', key: 'equipmentType', width: 10 },
      { header: 'Date', key: 'inspectionDate', width: 14 },
      { header: 'Time', key: 'inspectionTime', width: 10 },
      { header: 'Inspector', key: 'inspectorName', width: 22 },
      { header: 'Overall Status', key: 'overallStatus', width: 22 },
      { header: 'Good Items', key: 'goodCount', width: 12 },
      { header: 'Satisfied Items', key: 'satisfiedCount', width: 14 },
      { header: 'Poor Items', key: 'poorCount', width: 12 },
      { header: 'Location', key: 'location', width: 16 },
      { header: 'Notes', key: 'generalNotes', width: 40 }
    ];

    const header = summarySheet.getRow(1);
    header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };

    inspections.forEach(insp => {
      summarySheet.addRow({
        id: insp.id,
        equipmentId: insp.equipmentId,
        equipmentType: insp.equipmentType,
        inspectionDate: insp.inspectionDate,
        inspectionTime: insp.inspectionTime,
        inspectorName: insp.inspectorName,
        overallStatus: insp.summary?.overallStatus,
        goodCount: insp.summary?.goodCount,
        satisfiedCount: insp.summary?.satisfiedCount,
        poorCount: insp.summary?.poorCount,
        location: insp.location,
        generalNotes: insp.generalNotes
      });
    });

    const filename = `All_Visual_Inspections_Log_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Error generating master Excel:', err);
    res.status(500).json({ error: 'Failed to generate master Excel', details: err.message });
  }
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIPAddresses();
  console.log(`\n======================================================`);
  console.log(`🚀 VISUAL INSPECTION SYSTEM RUNNING`);
  console.log(`======================================================`);
  console.log(`💻 Local Computer Access:  http://localhost:${PORT}`);
  ips.forEach(net => {
    console.log(`📱 Phone / Tablet Access:  http://${net.ip}:${PORT}  (${net.interface})`);
  });
  console.log(`======================================================\n`);
});
