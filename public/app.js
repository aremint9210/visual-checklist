/**
 * Visual Inspection Checklist & Condition-Based Maintenance (CBM) System
 * Mobile-First, Touch-Optimized with Offline Sync, Defect Lifecycle & 1-Tap Alerts
 */

(function () {
  'use strict';

  // Built-in Standard Template (Instant 0ms render fallback)
  const DEFAULT_TEMPLATE = {
    title: "Port Equipment Visual Inspection Checklist",
    version: "1.0",
    categories: [
      {
        id: 1,
        name: "Structural & Mechanical Components",
        items: [
          { no: "1.1", description: "Steel structure condition (cracks, heavy rust, deformation, weld integrity)", applicableTo: "ALL", defectTags: ["Cracks", "Heavy Rust", "Deformation", "Weld Damage", "Paint Peeling"] },
          { no: "1.2", description: "Gantry wheel assemblies, bogies, and safety guards", applicableTo: "ALL", defectTags: ["Wheel Wear", "Flange Damage", "Loose Bolts", "Guard Missing", "Abnormal Noise"] },
          { no: "1.3", description: "Trolley structure, rollers, frame, and safety bumpers", applicableTo: "ALL", defectTags: ["Roller Wear", "Frame Crack", "Bumper Damaged", "Misalignment"] },
          { no: "1.4", description: "Boom / Jib structure, hinge pins, and lock mechanisms (QC specific)", applicableTo: "QC", defectTags: ["Hinge Pin Wear", "Locking Fault", "Structure Crack", "Lube Lack"] },
          { no: "1.5", description: "Rubber tyres condition, tread depth, rim integrity, pressure (RTG specific)", applicableTo: "RTG", defectTags: ["Low Pressure", "Tread Worn", "Rim Crack", "Sidewall Damage", "Lug Nut Loose"] },
          { no: "1.6", description: "Walkways, platforms, handrails, ladders, and safety cages", applicableTo: "ALL", defectTags: ["Damaged Handrail", "Loose Grating", "Corrosion", "Slip Hazard", "Obstruction"] }
        ]
      },
      {
        id: 2,
        name: "Wire Ropes & Sheaves System",
        items: [
          { no: "2.1", description: "Hoist wire rope condition (kinking, broken wires, strand fraying, corrosion)", applicableTo: "ALL", defectTags: ["Broken Wires", "Kinking", "Corrosion", "Strand Fraying", "Dry Rope / Lack Lube"] },
          { no: "2.2", description: "Trolley / Boom wire rope tension, condition, and spooling on drums", applicableTo: "ALL", defectTags: ["Slack Rope", "Uneven Spooling", "Rope Crossover", "Groove Wear"] },
          { no: "2.3", description: "Wire rope sheaves, grooves, flanges, and rope retainers", applicableTo: "ALL", defectTags: ["Sheave Flange Chipped", "Groove Wear", "Retainer Missing", "Bearing Noise"] },
          { no: "2.4", description: "Rope anchors, sockets, clamps, and equalizer sheaves", applicableTo: "ALL", defectTags: ["Loose Clamp", "Pin Wear", "Socket Corrosion", "Cotter Pin Missing"] }
        ]
      },
      {
        id: 3,
        name: "Spreader & Lifting Attachment",
        items: [
          { no: "3.1", description: "Spreader main frame integrity and flipper arms condition", applicableTo: "ALL", defectTags: ["Flipper Bent", "Frame Crack", "Cylinder Leak", "Wear Pad Gone"] },
          { no: "3.2", description: "Twistlocks condition, pins, wear indicator, and locking visual flags", applicableTo: "ALL", defectTags: ["Twistlock Worn", "Flag Damaged", "Sensor Fault", "Pin Play"] },
          { no: "3.3", description: "Telescopic beam mechanism, wear pads, and guides", applicableTo: "ALL", defectTags: ["Wear Pad Loose", "Extension Sticking", "Guide Misaligned", "Lube Lack"] },
          { no: "3.4", description: "Hydraulic hoses, cylinders, fittings, and leakages on spreader", applicableTo: "ALL", defectTags: ["Oil Leak", "Hose Abrasion", "Fitting Loose", "Cylinder Weep"] }
        ]
      },
      {
        id: 4,
        name: "Hydraulics, Engine & Mechanical Drives",
        items: [
          { no: "4.1", description: "Main engine / Genset unit oil level, coolants, belts, and leaks (RTG specific)", applicableTo: "RTG", defectTags: ["Low Oil", "Coolant Low", "Belt Cracking", "Fuel Leak", "Exhaust Smoke"] },
          { no: "4.2", description: "Hydraulic power pack (HPU) oil level, pump status, and filter indicators", applicableTo: "ALL", defectTags: ["Low Level", "Filter Clogged", "Pump Noise", "Tank Sweating", "Temp High"] },
          { no: "4.3", description: "Gearboxes (Main Hoist, Trolley, Gantry) oil leaks and mounting integrity", applicableTo: "ALL", defectTags: ["Oil Seepage", "Sight Glass Dirty", "Mounting Loose", "Vibration"] },
          { no: "4.4", description: "Service & Emergency Brakes (thrusters, brake pads, disk/drum condition)", applicableTo: "ALL", defectTags: ["Pad Worn", "Disc Grooved", "Thruster Leak", "Spring Weak", "Air Gap Bad"] }
        ]
      },
      {
        id: 5,
        name: "Electrical Systems & Cabins",
        items: [
          { no: "5.1", description: "High-voltage cable reel (Festoon/E-bar/Cable Drum) & trailing cable condition", applicableTo: "ALL", defectTags: ["Cable Sheath Cut", "Tension Uneven", "Roller Stuck", "Guide Broken"] },
          { no: "5.2", description: "Electrical control panels, junction boxes, and door gaskets", applicableTo: "ALL", defectTags: ["Door Gasket Damaged", "Moisture Inside", "Latch Broken", "Dust Build-up"] },
          { no: "5.3", description: "Operator cabin visual condition, glass cleanliness, wiper, controls, and seat", applicableTo: "ALL", defectTags: ["Wiper Faulty", "Glass Dirty/Cracked", "Joystick Play", "AC Fault", "Seat Damaged"] },
          { no: "5.4", description: "Floodlights, warning beacons, horns, sirens, and indicator lights", applicableTo: "ALL", defectTags: ["Light Blown", "Beacon Dead", "Siren Weak", "Lens Broken"] }
        ]
      },
      {
        id: 6,
        name: "Safety Equipment & Housekeeping",
        items: [
          { no: "6.1", description: "Emergency Stop buttons (cabin, ground level, machinery house)", applicableTo: "ALL", defectTags: ["E-Stop Sticky", "Cover Broken", "Label Faded", "Unresponsive"] },
          { no: "6.2", description: "Fire extinguishers availability, pressure gauge status, and inspection tags", applicableTo: "ALL", defectTags: ["Tag Expired", "Low Pressure", "Missing Extinguisher", "Pin Seal Broken"] },
          { no: "6.3", description: "Limit switches visual condition (Anti-collision, Over-hoist, End-stops)", applicableTo: "ALL", defectTags: ["Arm Bent", "Switch Loose", "Flag Missing", "Wiring Exposed"] },
          { no: "6.4", description: "Overall housekeeping, oil spillage, debris on walkways and engine room", applicableTo: "ALL", defectTags: ["Oil Spillage", "Debris / Trash", "Rag / Tool Left", "Water Ponding"] }
        ]
      }
    ]
  };

  // State
  let template = DEFAULT_TEMPLATE;
  let inspections = [];
  let fleetStats = [];
  let alertSettings = {
    supervisorPhone: '+60123456789',
    supervisorEmail: 'supervisor@port.com'
  };
  let currentOpenDefects = [];

  let currentDraft = {
    equipmentId: '',
    equipmentType: 'QC',
    inspectorName: '',
    inspectionDate: '',
    inspectionTime: '',
    location: '',
    shift: 'Day Shift',
    runningHours: '',
    generalNotes: '',
    items: {}
  };
  let activeTab = 'inspect-tab';
  let historySearchQuery = '';
  let historyStatusFilter = 'ALL';

  // Speech Recognition
  let recognition = null;
  let activeSpeechTargetInput = null;

  // DOM Elements
  const tabs = document.querySelectorAll('.nav-tab');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const checklistContainer = document.getElementById('checklist-categories-container');
  const equipmentInput = document.getElementById('equipment-id-input');
  const equipmentTypeSelect = document.getElementById('equipment-type-select');
  const inspectorInput = document.getElementById('inspector-name-input');
  const dateInput = document.getElementById('inspection-date-input');
  const timeInput = document.getElementById('inspection-time-input');
  const locationInput = document.getElementById('inspection-location-input');
  const shiftSelect = document.getElementById('inspection-shift-select');
  const notesInput = document.getElementById('general-notes-input');

  const progressCount = document.getElementById('progress-count');
  const progressFillBar = document.getElementById('progress-fill-bar');
  const badgeGoodCount = document.getElementById('badge-good-count');
  const badgeSatisfiedCount = document.getElementById('badge-satisfied-count');
  const badgePoorCount = document.getElementById('badge-poor-count');
  const floatingSummary = document.getElementById('floating-status-summary');

  const btnQuickFillGood = document.getElementById('btn-quick-fill-good');
  const btnSaveInspection = document.getElementById('btn-save-inspection');
  const btnResetForm = document.getElementById('btn-reset-form');
  const btnClearEquipment = document.getElementById('btn-clear-equipment');

  // Defect Lifecycle Banner
  const activeDefectsBanner = document.getElementById('active-defects-banner');
  const activeDefectsList = document.getElementById('active-defects-list');
  const defectsBannerCount = document.getElementById('defects-banner-count');
  const defectsBannerHeading = document.getElementById('defects-banner-heading');

  // Voice Dictation
  const btnVoiceGeneral = document.getElementById('btn-voice-dictation-general');

  // History Elements
  const historySearchInput = document.getElementById('history-search-input');
  const btnClearHistorySearch = document.getElementById('btn-clear-history-search');
  const historyListContainer = document.getElementById('history-list-container');
  const historyCountBadge = document.getElementById('history-count-badge');
  const filterPills = document.querySelectorAll('.filter-pill');

  // Fleet Elements
  const fleetGridContainer = document.getElementById('fleet-grid-container');

  // CBM Analytics Elements
  const cbmFleetScore = document.getElementById('cbm-fleet-score');
  const cbmFleetStatus = document.getElementById('cbm-fleet-status');
  const cbmTotalDefects = document.getElementById('cbm-total-defects');
  const cbmHotspotsContainer = document.getElementById('cbm-hotspots-container');
  const cbmRankingContainer = document.getElementById('cbm-ranking-table-container');
  const formAlertSettings = document.getElementById('form-alert-settings');
  const settingPhoneInput = document.getElementById('setting-phone-input');
  const settingEmailInput = document.getElementById('setting-email-input');

  // QR & Mobile Elements
  const btnPhoneQr = document.getElementById('btn-phone-qr');
  const qrModal = document.getElementById('qr-modal');
  const modalQrImg = document.getElementById('modal-qr-img');
  const modalQrUrlText = document.getElementById('modal-qr-url-text');
  const btnCloseQrModal = document.getElementById('btn-close-qr-modal');
  const btnCloseQrFooter = document.getElementById('btn-close-qr-footer');
  const mobileUrlInput = document.getElementById('mobile-url-input');
  const btnCopyMobileUrl = document.getElementById('btn-copy-mobile-url');
  const qrCodeImg = document.getElementById('qr-code-img');

  // Detail Modal Elements
  const detailModal = document.getElementById('detail-modal');
  const btnCloseDetailModal = document.getElementById('btn-close-detail-modal');
  const modalEquipBadge = document.getElementById('modal-equip-badge');
  const modalTitle = document.getElementById('modal-title');
  const modalDetailBody = document.getElementById('modal-detail-body');
  const modalBtnDownloadExcel = document.getElementById('modal-btn-download-excel');
  const modalBtnPrint = document.getElementById('modal-btn-print');

  // Critical Alert Modal Elements (WhatsApp / Email)
  const alertModal = document.getElementById('alert-modal');
  const btnCloseAlertModal = document.getElementById('btn-close-alert-modal');
  const btnDismissAlertModal = document.getElementById('btn-dismiss-alert-modal');
  const alertModalEquip = document.getElementById('alert-modal-equip');
  const alertMessagePreview = document.getElementById('alert-message-preview');
  const btnSendWhatsApp = document.getElementById('btn-send-whatsapp');
  const btnSendEmail = document.getElementById('btn-send-email');

  // Toast Container
  const toastContainer = document.getElementById('toast-container');

  // =========================================================================
  // INITIALIZATION
  // =========================================================================

  function init() {
    // 1. Immediately render checklist template (0ms latency guaranteed)
    renderChecklist();
    setupDefaultFormValues();
    setupTabNavigation();
    setupEventListeners();
    setupSpeechRecognition();
    restoreDraftFromStorage();

    // 2. Load dynamic data in parallel in background without blocking UI
    loadChecklistTemplate();
    loadInspections();
    loadFleetStats();
    loadAlertSettings();
    loadNetworkInfo();
  }

  // Setup Web Speech API for voice dictation
  function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          if (activeSpeechTargetInput) {
            const currentVal = activeSpeechTargetInput.value.trim();
            activeSpeechTargetInput.value = currentVal ? `${currentVal}. ${transcript}` : transcript;
            activeSpeechTargetInput.dispatchEvent(new Event('input', { bubbles: true }));
            showToast(`Transcribed: "${transcript}"`, 'success');
          }
          stopListening();
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          stopListening();
        };

        recognition.onend = () => {
          stopListening();
        };
      } catch (e) {
        console.warn('SpeechRecognition init error:', e);
      }
    }
  }

  function startListening(targetInput, triggerBtn) {
    if (!recognition) {
      showToast('Speech recognition not available on this browser', 'info');
      return;
    }
    activeSpeechTargetInput = targetInput;
    if (triggerBtn) triggerBtn.classList.add('listening');
    try {
      recognition.start();
      showToast('🎙️ Listening... speak now', 'info');
    } catch (e) {
      console.warn('Recognition already started');
    }
  }

  function stopListening() {
    document.querySelectorAll('.listening').forEach(el => el.classList.remove('listening'));
    activeSpeechTargetInput = null;
  }

  function setupDefaultFormValues() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const hh = String(today.getHours()).padStart(2, '0');
    const min = String(today.getMinutes()).padStart(2, '0');

    if (dateInput && !dateInput.value) dateInput.value = `${yyyy}-${mm}-${dd}`;
    if (timeInput && !timeInput.value) timeInput.value = `${hh}:${min}`;

    const savedInspector = localStorage.getItem('cbm_inspector_name');
    if (savedInspector) {
      if (inspectorInput && !inspectorInput.value) inspectorInput.value = savedInspector;
      const feedbackAuthor = document.getElementById('feedback-author-input');
      if (feedbackAuthor && !feedbackAuthor.value) feedbackAuthor.value = savedInspector;
    }
  }

  function setupTabNavigation() {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        switchTab(targetTab);
      });
    });
  }

  function switchTab(tabId) {
    activeTab = tabId;
    tabs.forEach(t => {
      if (t.getAttribute('data-tab') === tabId) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });

    tabPanes.forEach(pane => {
      if (pane.id === tabId) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    if (tabId === 'history-tab') {
      renderHistoryList();
    } else if (tabId === 'fleet-tab') {
      loadFleetStats();
    } else if (tabId === 'cbm-tab') {
      loadCBMAnalytics();
    } else if (tabId === 'feedback-tab') {
      loadFeedbacks();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // =========================================================================
  // API LOADERS (Async Background)
  // =========================================================================

  async function loadChecklistTemplate() {
    try {
      const res = await fetch('/api/checklist-template');
      if (res.ok) {
        const data = await res.json();
        if (data && data.categories && data.categories.length > 0) {
          template = data;
          renderChecklist();
        }
      }
    } catch (err) {
      console.warn('Using built-in template fallback:', err);
    }
  }

  async function loadInspections() {
    try {
      const res = await fetch('/api/inspections');
      if (res.ok) {
        inspections = await res.json();
        renderHistoryList();
      }
    } catch (err) {
      console.error('Failed to load inspections:', err);
    }
  }

  async function loadFleetStats() {
    try {
      const res = await fetch('/api/equipment/stats');
      if (res.ok) {
        fleetStats = await res.json();
        renderFleetGrid();
      }
    } catch (err) {
      console.error('Failed to load fleet stats:', err);
    }
  }

  async function loadAlertSettings() {
    try {
      const res = await fetch('/api/settings/alerts');
      if (res.ok) {
        alertSettings = await res.json();
        if (settingPhoneInput) settingPhoneInput.value = alertSettings.supervisorPhone || '';
        if (settingEmailInput) settingEmailInput.value = alertSettings.supervisorEmail || '';
      }
    } catch (e) {
      console.error('Failed to load alert settings:', e);
    }
  }

  async function loadCBMAnalytics() {
    try {
      const res = await fetch('/api/analytics/cbm-summary');
      if (!res.ok) return;
      const data = await res.json();

      if (cbmFleetScore) cbmFleetScore.textContent = `${data.fleetHealthScore}%`;
      if (cbmFleetStatus) {
        if (data.fleetHealthScore >= 90) {
          cbmFleetStatus.className = 'kpi-badge badge-good';
          cbmFleetStatus.textContent = 'EXCELLENT';
        } else if (data.fleetHealthScore >= 75) {
          cbmFleetStatus.className = 'kpi-badge badge-satisfied';
          cbmFleetStatus.textContent = 'GOOD';
        } else {
          cbmFleetStatus.className = 'kpi-badge badge-poor';
          cbmFleetStatus.textContent = 'ATTENTION NEEDED';
        }
      }
      if (cbmTotalDefects) cbmTotalDefects.textContent = (data.totalPoor || 0) + (data.totalSatisfied || 0);

      if (cbmHotspotsContainer) {
        if (!data.topHotspots || data.topHotspots.length === 0) {
          cbmHotspotsContainer.innerHTML = `<p class="text-muted text-center" style="padding: 20px;">No recurring defects recorded yet.</p>`;
        } else {
          const maxIncidents = Math.max(...data.topHotspots.map(h => h.totalIncidents), 1);
          let hotHtml = '';
          data.topHotspots.forEach(h => {
            const barWidth = Math.round((h.totalIncidents / maxIncidents) * 100);
            hotHtml += `
              <div class="hotspot-item">
                <div class="hotspot-top">
                  <div>
                    <span class="hotspot-title">${h.itemNo} ${escapeHtml(h.description)}</span>
                    <div style="font-size: 11px; color: var(--text-muted);">${escapeHtml(h.category)}</div>
                  </div>
                  <span class="hotspot-incidents">${h.totalIncidents} Incident(s)</span>
                </div>
                <div class="hotspot-bar-track">
                  <div class="hotspot-bar-fill" style="width: ${barWidth}%;"></div>
                </div>
                <div style="font-size: 11px; color: var(--text-secondary); display: flex; justify-content: space-between;">
                  <span>🔴 ${h.poorCount} Poor</span>
                  <span>🟡 ${h.satisfiedCount} Satisfied</span>
                </div>
              </div>
            `;
          });
          cbmHotspotsContainer.innerHTML = hotHtml;
        }
      }

      if (cbmRankingContainer) {
        if (!data.equipmentRankings || data.equipmentRankings.length === 0) {
          cbmRankingContainer.innerHTML = `<p class="text-muted text-center" style="padding: 20px;">No crane ranking data yet.</p>`;
        } else {
          let rankHtml = `
            <table class="ranking-table">
              <thead>
                <tr>
                  <th>Equipment ID</th>
                  <th>Type</th>
                  <th>Inspections</th>
                  <th>Reliability</th>
                  <th>Condition</th>
                </tr>
              </thead>
              <tbody>
          `;

          data.equipmentRankings.forEach(eq => {
            let statusBadge = `<span class="stat-badge badge-good">HEALTHY</span>`;
            if (eq.status === 'ATTENTION_NEEDED') {
              statusBadge = `<span class="stat-badge badge-poor">DEFECT LOGGED</span>`;
            } else if (eq.status === 'GOOD') {
              statusBadge = `<span class="stat-badge badge-satisfied">MONITORING</span>`;
            }

            rankHtml += `
              <tr>
                <td><strong class="font-mono">${escapeHtml(eq.equipmentId)}</strong></td>
                <td><span style="color: var(--text-muted);">${escapeHtml(eq.equipmentType)}</span></td>
                <td>${eq.inspectionsCount}</td>
                <td><strong style="color: ${eq.reliabilityScore >= 90 ? 'var(--color-good)' : eq.reliabilityScore >= 75 ? 'var(--color-satisfied)' : 'var(--color-poor)'}">${eq.reliabilityScore}%</strong></td>
                <td>${statusBadge}</td>
              </tr>
            `;
          });

          rankHtml += `</tbody></table>`;
          cbmRankingContainer.innerHTML = rankHtml;
        }
      }
    } catch (e) {
      console.error('Failed to load CBM analytics:', e);
    }
  }

  async function loadNetworkInfo() {
    try {
      const currentOrigin = window.location.origin;
      if (modalQrUrlText) modalQrUrlText.textContent = currentOrigin;
      if (mobileUrlInput) mobileUrlInput.value = currentOrigin;

      // Online dynamic QR generator fallback
      const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentOrigin)}`;
      if (modalQrImg && !modalQrImg.src.includes('data:image')) modalQrImg.src = dynamicQrUrl;
      if (qrCodeImg && !qrCodeImg.src.includes('data:image')) qrCodeImg.src = dynamicQrUrl;

      const res = await fetch(`/api/network-info?origin=${encodeURIComponent(currentOrigin)}`);
      if (res.ok) {
        const data = await res.json();
        const mobileUrl = data.mobileUrl || currentOrigin;
        if (data.qrCodeDataUrl) {
          if (modalQrImg) modalQrImg.src = data.qrCodeDataUrl;
          if (qrCodeImg) qrCodeImg.src = data.qrCodeDataUrl;
        }
        if (modalQrUrlText) modalQrUrlText.textContent = mobileUrl;
        if (mobileUrlInput) mobileUrlInput.value = mobileUrl;
      }
    } catch (err) {
      console.warn('QR network loader fallback used:', err);
    }
  }

  // =========================================================================
  // DEFECT LIFECYCLE: CARRY FORWARD & RESOLUTION TRACKING
  // =========================================================================

  async function checkEquipmentOpenDefects(equipId) {
    if (!equipId || !activeDefectsBanner) {
      if (activeDefectsBanner) activeDefectsBanner.style.display = 'none';
      return;
    }

    try {
      const res = await fetch(`/api/equipment/${encodeURIComponent(equipId)}/open-defects`);
      if (!res.ok) return;
      const data = await res.json();
      currentOpenDefects = data.openDefects || [];

      if (currentOpenDefects.length > 0) {
        if (defectsBannerHeading) defectsBannerHeading.textContent = `Active Issues on ${equipId} from ${data.lastInspectionDate}`;
        if (defectsBannerCount) defectsBannerCount.textContent = `${currentOpenDefects.length} Issue(s)`;

        let defHtml = '';
        currentOpenDefects.forEach(defect => {
          defHtml += `
            <div class="active-defect-item">
              <div class="defect-item-top">
                <div>
                  <span class="defect-item-no">${defect.itemNo}</span>
                  <span class="defect-item-desc">${escapeHtml(defect.description)}</span>
                </div>
                <span class="stat-badge ${defect.status === 'POOR' ? 'badge-poor' : 'badge-satisfied'}">${defect.status}</span>
              </div>

              ${defect.remark ? `
                <div class="defect-item-remark">
                  💬 Previous Note: <em>"${escapeHtml(defect.remark)}"</em> (by ${escapeHtml(defect.reportedBy || 'Inspector')})
                </div>
              ` : ''}

              <div class="defect-item-actions">
                <button type="button" class="btn btn-emerald btn-sm btn-rectify-defect" data-item-no="${defect.itemNo}">
                  ✅ Mark as Rectified / Repaired
                </button>
              </div>
            </div>
          `;
        });

        if (activeDefectsList) activeDefectsList.innerHTML = defHtml;
        activeDefectsBanner.style.display = 'block';

        document.querySelectorAll('.btn-rectify-defect').forEach(btn => {
          btn.addEventListener('click', () => {
            const itemNo = btn.getAttribute('data-item-no');
            rectifyDefect(itemNo);
          });
        });
      } else {
        activeDefectsBanner.style.display = 'none';
      }
    } catch (e) {
      if (activeDefectsBanner) activeDefectsBanner.style.display = 'none';
    }
  }

  function rectifyDefect(itemNo) {
    if (!currentDraft.items[itemNo]) {
      currentDraft.items[itemNo] = { status: '', remark: '', tags: [], photo: null };
    }
    currentDraft.items[itemNo].status = 'GOOD';
    currentDraft.items[itemNo].remark = `Rectified on ${new Date().toISOString().split('T')[0]}: Verified in good working condition.`;

    showToast(`Marked Item ${itemNo} as RECTIFIED!`, 'success');
    renderChecklist();
    saveDraftToStorage();

    const card = document.getElementById(`item-card-${itemNo.replace('.', '_')}`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // =========================================================================
  // CHECKLIST RENDERING & TICKING LOGIC
  // =========================================================================

  function renderChecklist() {
    if (!checklistContainer || !template || !template.categories) return;

    let html = '';

    template.categories.forEach(cat => {
      const catItems = cat.items || [];
      const totalInCat = catItems.length;

      let checkedInCat = 0;
      catItems.forEach(item => {
        if (currentDraft.items[item.no] && currentDraft.items[item.no].status) {
          checkedInCat++;
        }
      });

      const isCompleted = checkedInCat === totalInCat && totalInCat > 0;

      html += `
        <div class="category-group" data-cat-id="${cat.id}">
          <div class="category-header">
            <div class="category-title-wrap">
              <span class="category-number-badge">${cat.id}</span>
              <span class="category-name">${escapeHtml(cat.name)}</span>
            </div>
            <div class="category-meta">
              <span class="category-count-pill ${isCompleted ? 'completed' : ''}" id="cat-pill-${cat.id}">
                ${checkedInCat}/${totalInCat}
              </span>
              <svg class="category-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          <div class="category-items-list">
      `;

      catItems.forEach(item => {
        const itemState = currentDraft.items[item.no] || { status: '', remark: '', tags: [], photo: null };
        const status = itemState.status || '';
        const hasRemark = itemState.remark && itemState.remark.trim().length > 0;
        const showExpand = status === 'SATISFIED' || status === 'POOR' || hasRemark || itemState.photo;

        html += `
          <div class="checklist-item-card status-${status.toLowerCase()}" id="item-card-${item.no.replace('.', '_')}">
            <div class="item-top-row">
              <div class="item-desc-wrap">
                <span class="item-no-tag">${item.no}</span>
                <span class="item-description">${escapeHtml(item.description)}</span>
              </div>
              ${item.applicableTo !== 'ALL' ? `<span class="item-applies-tag">${item.applicableTo}</span>` : ''}
            </div>

            <div class="rating-buttons-group">
              <button type="button" class="btn-rating btn-good ${status === 'GOOD' ? 'active' : ''}" 
                data-item-no="${item.no}" data-rating="GOOD">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>GOOD</span>
              </button>

              <button type="button" class="btn-rating btn-satisfied ${status === 'SATISFIED' ? 'active' : ''}" 
                data-item-no="${item.no}" data-rating="SATISFIED">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>SATISFIED</span>
              </button>

              <button type="button" class="btn-rating btn-poor ${status === 'POOR' ? 'active' : ''}" 
                data-item-no="${item.no}" data-rating="POOR">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                <span>POOR</span>
              </button>
            </div>

            <div class="item-expand-details" id="expand-${item.no.replace('.', '_')}" style="display: ${showExpand ? 'flex' : 'none'};">
              ${item.defectTags && item.defectTags.length > 0 ? `
                <div class="defect-tags-row">
                  <span class="defect-tags-label">Defects:</span>
                  ${item.defectTags.map(tag => {
                    const isSelected = (itemState.tags || []).includes(tag);
                    return `<button type="button" class="tag-btn ${isSelected ? 'selected' : ''}" 
                      data-item-no="${item.no}" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`;
                  }).join('')}
                </div>
              ` : ''}

              <div class="remark-input-row">
                <input type="text" class="item-remark-input" 
                  id="remark-input-${item.no.replace('.', '_')}"
                  placeholder="Remark / Defect details..." 
                  data-item-no="${item.no}"
                  value="${escapeHtml(itemState.remark || '')}">

                <button type="button" class="btn-mic-inline btn-voice-item" data-item-no="${item.no}" title="Speak Remark">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"></path>
                    <path d="M19 10v2a7 7 0 01-14 0v-2"></path>
                  </svg>
                </button>

                <label class="btn-photo-upload ${itemState.photo ? 'has-photo' : ''}" title="Attach Photo">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                  <input type="file" accept="image/*" capture="environment" class="item-photo-file-input" data-item-no="${item.no}">
                </label>
              </div>

              ${itemState.photo ? `
                <div class="photo-preview-wrap">
                  <img src="${itemState.photo}" alt="Defect Photo" class="photo-preview-thumb">
                  <button type="button" class="btn-remove-photo" data-item-no="${item.no}">Remove Photo</button>
                </div>
              ` : ''}
            </div>

          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    checklistContainer.innerHTML = html;
    attachChecklistEventListeners();
    updateProgressStats();
  }

  function attachChecklistEventListeners() {
    document.querySelectorAll('.category-header').forEach(header => {
      header.addEventListener('click', () => {
        const group = header.closest('.category-group');
        if (group) group.classList.toggle('collapsed');
      });
    });

    document.querySelectorAll('.btn-rating').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemNo = btn.getAttribute('data-item-no');
        const rating = btn.getAttribute('data-rating');
        setItemRating(itemNo, rating);
      });
    });

    document.querySelectorAll('.tag-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemNo = btn.getAttribute('data-item-no');
        const tag = btn.getAttribute('data-tag');
        toggleDefectTag(itemNo, tag);
      });
    });

    document.querySelectorAll('.item-remark-input').forEach(input => {
      input.addEventListener('input', () => {
        const itemNo = input.getAttribute('data-item-no');
        if (!currentDraft.items[itemNo]) currentDraft.items[itemNo] = { status: '', remark: '', tags: [], photo: null };
        currentDraft.items[itemNo].remark = input.value;
        saveDraftToStorage();
      });
    });

    document.querySelectorAll('.btn-voice-item').forEach(micBtn => {
      micBtn.addEventListener('click', () => {
        const itemNo = micBtn.getAttribute('data-item-no');
        const input = document.getElementById(`remark-input-${itemNo.replace('.', '_')}`);
        if (input) {
          startListening(input, micBtn);
        }
      });
    });

    document.querySelectorAll('.item-photo-file-input').forEach(fileInput => {
      fileInput.addEventListener('change', async () => {
        const itemNo = fileInput.getAttribute('data-item-no');
        const file = fileInput.files[0];
        if (file) {
          await handlePhotoUpload(itemNo, file);
        }
      });
    });

    document.querySelectorAll('.btn-remove-photo').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemNo = btn.getAttribute('data-item-no');
        if (currentDraft.items[itemNo]) {
          currentDraft.items[itemNo].photo = null;
          saveDraftToStorage();
          renderChecklist();
        }
      });
    });
  }

  function setItemRating(itemNo, rating) {
    if (!currentDraft.items[itemNo]) {
      currentDraft.items[itemNo] = { status: '', remark: '', tags: [], photo: null };
    }

    const card = document.getElementById(`item-card-${itemNo.replace('.', '_')}`);
    const expandDiv = document.getElementById(`expand-${itemNo.replace('.', '_')}`);

    if (currentDraft.items[itemNo].status === rating) {
      currentDraft.items[itemNo].status = '';
    } else {
      currentDraft.items[itemNo].status = rating;
      if (navigator.vibrate) navigator.vibrate(15);
    }

    const currentStatus = currentDraft.items[itemNo].status;

    if (card) {
      card.querySelectorAll('.btn-rating').forEach(b => {
        if (b.getAttribute('data-rating') === currentStatus) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });

      card.className = `checklist-item-card ${currentStatus ? 'status-' + currentStatus.toLowerCase() : ''}`;
    }

    if (expandDiv) {
      if (currentStatus === 'SATISFIED' || currentStatus === 'POOR') {
        expandDiv.style.display = 'flex';
      } else if (!currentDraft.items[itemNo].remark && !currentDraft.items[itemNo].photo) {
        expandDiv.style.display = 'none';
      }
    }

    updateCategoryPill(itemNo);
    updateProgressStats();
    saveDraftToStorage();
  }

  function toggleDefectTag(itemNo, tag) {
    if (!currentDraft.items[itemNo]) {
      currentDraft.items[itemNo] = { status: '', remark: '', tags: [], photo: null };
    }
    const itemObj = currentDraft.items[itemNo];
    if (!itemObj.tags) itemObj.tags = [];

    const index = itemObj.tags.indexOf(tag);
    if (index > -1) {
      itemObj.tags.splice(index, 1);
    } else {
      itemObj.tags.push(tag);
      if (!itemObj.remark || !itemObj.remark.includes(tag)) {
        itemObj.remark = itemObj.remark ? `${itemObj.remark}, ${tag}` : tag;
        const remarkInput = document.getElementById(`remark-input-${itemNo.replace('.', '_')}`);
        if (remarkInput) remarkInput.value = itemObj.remark;
      }
    }

    saveDraftToStorage();
    renderChecklist();
  }

  async function handlePhotoUpload(itemNo, file) {
    showToast('Uploading photo...', 'info');
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      if (!currentDraft.items[itemNo]) {
        currentDraft.items[itemNo] = { status: '', remark: '', tags: [], photo: null };
      }
      currentDraft.items[itemNo].photo = data.photoUrl;

      showToast('Photo attached successfully', 'success');
      saveDraftToStorage();
      renderChecklist();
    } catch (err) {
      console.error('Photo upload failed:', err);
      showToast('Failed to upload photo', 'error');
    }
  }

  function updateCategoryPill(itemNo) {
    if (!template) return;
    const catId = itemNo.split('.')[0];
    const cat = template.categories.find(c => c.id.toString() === catId);
    if (!cat) return;

    let checked = 0;
    cat.items.forEach(it => {
      if (currentDraft.items[it.no] && currentDraft.items[it.no].status) {
        checked++;
      }
    });

    const pill = document.getElementById(`cat-pill-${catId}`);
    if (pill) {
      pill.textContent = `${checked}/${cat.items.length}`;
      if (checked === cat.items.length && cat.items.length > 0) {
        pill.classList.add('completed');
      } else {
        pill.classList.remove('completed');
      }
    }
  }

  function quickFillAllGood() {
    if (!template || !template.categories) return;

    let updatedCount = 0;
    template.categories.forEach(cat => {
      cat.items.forEach(item => {
        if (!currentDraft.items[item.no] || !currentDraft.items[item.no].status) {
          currentDraft.items[item.no] = {
            status: 'GOOD',
            remark: currentDraft.items[item.no]?.remark || '',
            tags: currentDraft.items[item.no]?.tags || [],
            photo: currentDraft.items[item.no]?.photo || null
          };
          updatedCount++;
        }
      });
    });

    if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
    showToast(`Marked ${updatedCount} items as GOOD`, 'success');
    renderChecklist();
    saveDraftToStorage();
  }

  function updateProgressStats() {
    if (!template) return;

    let total = 0;
    let checked = 0;
    let good = 0;
    let satisfied = 0;
    let poor = 0;

    template.categories.forEach(cat => {
      cat.items.forEach(item => {
        total++;
        const s = currentDraft.items[item.no]?.status;
        if (s) {
          checked++;
          if (s === 'GOOD') good++;
          else if (s === 'SATISFIED') satisfied++;
          else if (s === 'POOR') poor++;
        }
      });
    });

    if (progressCount) progressCount.textContent = `${checked} / ${total}`;
    const pct = total > 0 ? (checked / total) * 100 : 0;
    if (progressFillBar) progressFillBar.style.width = `${pct}%`;

    if (badgeGoodCount) badgeGoodCount.textContent = `${good} Good`;
    if (badgeSatisfiedCount) badgeSatisfiedCount.textContent = `${satisfied} Satisfied`;
    if (badgePoorCount) badgePoorCount.textContent = `${poor} Poor`;

    if (floatingSummary) {
      if (checked === 0) {
        floatingSummary.textContent = 'Ready to inspect';
      } else if (checked < total) {
        floatingSummary.textContent = `${checked}/${total} Checked • ${poor > 0 ? `🔴 ${poor} Poor` : 'In Progress'}`;
      } else {
        floatingSummary.textContent = poor > 0 ? `⚠️ ${poor} Defect(s) Found` : `✅ All ${total} Items Checked`;
      }
    }
  }

  // =========================================================================
  // FORM PERSISTENCE & SUBMISSION WITH 1-TAP CRITICAL ALERTS
  // =========================================================================

  function saveDraftToStorage() {
    if (equipmentInput) currentDraft.equipmentId = equipmentInput.value.trim().toUpperCase();
    if (equipmentTypeSelect) currentDraft.equipmentType = equipmentTypeSelect.value;
    if (inspectorInput) currentDraft.inspectorName = inspectorInput.value.trim();
    if (dateInput) currentDraft.inspectionDate = dateInput.value;
    if (timeInput) currentDraft.inspectionTime = timeInput.value;
    if (locationInput) currentDraft.location = locationInput.value.trim();
    if (shiftSelect) currentDraft.shift = shiftSelect.value;
    if (notesInput) currentDraft.generalNotes = notesInput.value.trim();

    localStorage.setItem('cbm_inspection_draft', JSON.stringify(currentDraft));
    if (currentDraft.inspectorName) {
      localStorage.setItem('cbm_inspector_name', currentDraft.inspectorName);
    }
  }

  function restoreDraftFromStorage() {
    try {
      const saved = localStorage.getItem('cbm_inspection_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        currentDraft = { ...currentDraft, ...parsed };

        if (currentDraft.equipmentId && equipmentInput) {
          equipmentInput.value = currentDraft.equipmentId;
          checkEquipmentOpenDefects(currentDraft.equipmentId);
        }
        if (currentDraft.equipmentType && equipmentTypeSelect) equipmentTypeSelect.value = currentDraft.equipmentType;
        if (currentDraft.inspectorName && inspectorInput) inspectorInput.value = currentDraft.inspectorName;
        if (currentDraft.location && locationInput) locationInput.value = currentDraft.location;
        if (currentDraft.shift && shiftSelect) shiftSelect.value = currentDraft.shift;
        if (currentDraft.generalNotes && notesInput) notesInput.value = currentDraft.generalNotes;

        highlightMatchingEquipmentChip(currentDraft.equipmentId);
        renderChecklist();
      }
    } catch (e) {
      console.error('Error restoring draft:', e);
    }
  }

  async function saveInspection() {
    const equipId = equipmentInput ? equipmentInput.value.trim().toUpperCase() : '';
    if (!equipId) {
      showToast('Please enter an Equipment ID (e.g. Q75)', 'error');
      if (equipmentInput) equipmentInput.focus();
      return;
    }

    saveDraftToStorage();

    if (btnSaveInspection) {
      btnSaveInspection.disabled = true;
      btnSaveInspection.innerHTML = `
        <div class="spinner" style="width:16px;height:16px;margin:0;border-width:2px;"></div>
        <span>Saving...</span>
      `;
    }

    try {
      const payload = {
        ...currentDraft,
        equipmentId: equipId
      };

      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Server error while saving inspection');
      const result = await res.json();
      const savedInsp = result.inspection;

      showToast(`Inspection saved for ${equipId}!`, 'success');

      localStorage.removeItem('cbm_inspection_draft');
      currentDraft.items = {};
      currentDraft.generalNotes = '';
      if (notesInput) notesInput.value = '';

      await loadInspections();
      await loadFleetStats();

      if (savedInsp.summary && (savedInsp.summary.poorCount > 0 || savedInsp.summary.satisfiedCount > 0)) {
        triggerCriticalAlertModal(savedInsp);
      } else {
        if (historySearchInput) {
          historySearchInput.value = equipId;
          historySearchQuery = equipId;
        }
        renderHistoryList();
        switchTab('history-tab');
      }

      renderChecklist();
    } catch (err) {
      console.error('Error saving inspection:', err);
      showToast('Inspection saved locally', 'info');
    } finally {
      if (btnSaveInspection) {
        btnSaveInspection.disabled = false;
        btnSaveInspection.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          <span>Save Inspection</span>
        `;
      }
    }
  }

  function triggerCriticalAlertModal(insp) {
    if (!alertModal) return;
    if (alertModalEquip) alertModalEquip.textContent = insp.equipmentId;

    const defectLines = [];
    if (insp.items) {
      for (const [no, item] of Object.entries(insp.items)) {
        if (item.status === 'POOR' || item.status === 'SATISFIED') {
          defectLines.push(`• Item ${no} [${item.status}]: ${item.remark || 'Flagged for attention'}`);
        }
      }
    }

    const alertText = 
`🚨 CRITICAL DEFECT ALERT - PORT INSPECTION
Equipment: ${insp.equipmentId} (${insp.equipmentType})
Date: ${insp.inspectionDate} ${insp.inspectionTime || ''}
Inspector: ${insp.inspectorName}
Location: ${insp.location || 'Port Yard'} (${insp.shift || 'Shift'})

ATTENTION ITEMS FLAGGED:
${defectLines.join('\n')}

Action Plan / Notes:
${insp.generalNotes || 'Immediate maintenance review requested.'}

🌐 View Full Report: ${window.location.origin}`;

    if (alertMessagePreview) alertMessagePreview.textContent = alertText;

    const cleanPhone = (alertSettings.supervisorPhone || '').replace(/[^0-9+]/g, '');
    const waUrl = `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(alertText)}`;
    if (btnSendWhatsApp) btnSendWhatsApp.href = waUrl;

    const mailSubject = `🚨 CRITICAL DEFECT ALERT: ${insp.equipmentId} (${insp.inspectionDate})`;
    const mailUrl = `mailto:${alertSettings.supervisorEmail || 'supervisor@port.com'}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(alertText)}`;
    if (btnSendEmail) btnSendEmail.href = mailUrl;

    alertModal.classList.add('open');
  }

  function resetChecklistForm() {
    if (confirm('Are you sure you want to reset all checklist items?')) {
      currentDraft.items = {};
      currentDraft.generalNotes = '';
      if (notesInput) notesInput.value = '';
      localStorage.removeItem('cbm_inspection_draft');
      renderChecklist();
      showToast('Form reset', 'info');
    }
  }

  // =========================================================================
  // TRACK BACK & HISTORY VIEW
  // =========================================================================

  function renderHistoryList() {
    if (!historyListContainer || !inspections) return;

    let filtered = [...inspections];

    if (historySearchQuery) {
      const q = historySearchQuery.trim().toUpperCase();
      filtered = filtered.filter(item =>
        (item.equipmentId && item.equipmentId.toUpperCase().includes(q)) ||
        (item.inspectorName && item.inspectorName.toUpperCase().includes(q)) ||
        (item.location && item.location.toUpperCase().includes(q))
      );
    }

    if (historyStatusFilter !== 'ALL') {
      filtered = filtered.filter(item => item.summary?.overallStatus === historyStatusFilter);
    }

    if (historyCountBadge) historyCountBadge.textContent = `${filtered.length} Record(s) Found`;

    if (filtered.length === 0) {
      historyListContainer.innerHTML = `
        <div class="card text-center" style="padding: 40px 20px;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.5" style="margin: 0 auto 12px auto;">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h4 style="font-size: 16px; margin-bottom: 6px;">No Inspection Records Found</h4>
          <p class="text-muted" style="font-size: 13px;">No inspections match "${escapeHtml(historySearchQuery || 'current filter')}". Try searching for <strong>Q75</strong> or complete a new inspection.</p>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach(insp => {
      const status = insp.summary?.overallStatus || 'PASSED';
      let statusBadgeClass = 'badge-good';
      let statusLabel = '🟢 ALL GOOD';

      if (status === 'ATTENTION_REQUIRED') {
        statusBadgeClass = 'badge-poor';
        statusLabel = `🔴 DEFECTS FOUND (${insp.summary?.poorCount || 0})`;
      } else if (status === 'SATISFACTORY_WITH_NOTES') {
        statusBadgeClass = 'badge-satisfied';
        statusLabel = `🟡 NOTES / SATISFIED (${insp.summary?.satisfiedCount || 0})`;
      }

      const defects = [];
      if (insp.items) {
        for (const [no, item] of Object.entries(insp.items)) {
          if (item.status === 'POOR' || item.status === 'SATISFIED') {
            defects.push({ no, status: item.status, remark: item.remark });
          }
        }
      }

      html += `
        <div class="history-card">
          <div class="history-card-top">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="history-equip-badge">${escapeHtml(insp.equipmentId)}</span>
              <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">${escapeHtml(insp.equipmentType || 'QC')}</span>
            </div>
            <span class="history-status-tag ${statusBadgeClass}">${statusLabel}</span>
          </div>

          <div class="history-card-meta">
            <div class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>${insp.inspectionDate} ${insp.inspectionTime || ''}</span>
            </div>

            <div class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>${escapeHtml(insp.inspectorName || 'Inspector')}</span>
            </div>

            <div class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>${escapeHtml(insp.location || 'Yard')} (${escapeHtml(insp.shift || 'Shift')})</span>
            </div>

            <div class="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
              </svg>
              <span>${insp.summary?.goodCount || 0} Good / ${insp.summary?.poorCount || 0} Poor</span>
            </div>
          </div>

          ${defects.length > 0 ? `
            <div class="history-defects-summary">
              <div class="history-defects-title" style="color: ${insp.summary?.poorCount > 0 ? 'var(--color-poor)' : 'var(--color-satisfied)'}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>Attention Items / Notes:</span>
              </div>
              <ul style="padding-left: 18px; margin: 4px 0 0 0;">
                ${defects.map(d => `
                  <li><strong>Item ${d.no} (${d.status}):</strong> ${escapeHtml(d.remark || 'No remark')}</li>
                `).join('')}
              </ul>
            </div>
          ` : ''}

          <div class="history-card-actions">
            <button type="button" class="btn btn-secondary btn-sm btn-view-report" data-id="${insp.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span>View</span>
            </button>

            <a href="/api/export/excel/${insp.id}" class="btn btn-emerald-outline btn-sm" download>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Excel</span>
            </a>

            <button type="button" class="btn btn-poor-outline btn-sm btn-delete-insp" data-id="${insp.id}" title="Delete Inspection">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </div>
      `;
    });

    historyListContainer.innerHTML = html;

    document.querySelectorAll('.btn-view-report').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openDetailModal(id);
      });
    });

    document.querySelectorAll('.btn-delete-insp').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (confirm(`Are you sure you want to permanently delete inspection ${id}?`)) {
          await deleteInspection(id);
        }
      });
    });
  }

  function openDetailModal(id) {
    const insp = inspections.find(item => item.id === id);
    if (!insp || !template || !detailModal) return;

    if (modalEquipBadge) modalEquipBadge.textContent = insp.equipmentId;
    if (modalTitle) modalTitle.textContent = `Report: ${insp.inspectionDate} (${insp.inspectorName})`;
    if (modalBtnDownloadExcel) modalBtnDownloadExcel.href = `/api/export/excel/${insp.id}`;

    let html = `
      <div style="background-color: var(--bg-surface-elevated); padding: 14px; border-radius: var(--radius-md); margin-bottom: 16px;">
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 13px;">
          <div><strong>Date & Time:</strong> ${insp.inspectionDate} ${insp.inspectionTime || ''}</div>
          <div><strong>Inspector:</strong> ${escapeHtml(insp.inspectorName || '')}</div>
          <div><strong>Equipment Type:</strong> ${escapeHtml(insp.equipmentType || 'QC')}</div>
          <div><strong>Location / Shift:</strong> ${escapeHtml(insp.location || '-')} (${escapeHtml(insp.shift || '-')})</div>
        </div>
      </div>

      <h4 style="font-size: 15px; margin-bottom: 10px; font-weight: 700;">Checklist Findings:</h4>
      <div style="display: flex; flex-direction: column; gap: 8px;">
    `;

    template.categories.forEach(cat => {
      html += `
        <div style="background-color: var(--bg-app); border: 1px solid var(--border-medium); border-radius: var(--radius-md); overflow: hidden;">
          <div style="padding: 8px 12px; background-color: var(--bg-surface-elevated); font-weight: 700; font-size: 13px;">
            ${cat.id}. ${escapeHtml(cat.name)}
          </div>
          <div style="padding: 8px 12px; display: flex; flex-direction: column; gap: 6px;">
      `;

      cat.items.forEach(item => {
        const itemResult = (insp.items && insp.items[item.no]) ? insp.items[item.no] : { status: 'NOT CHECKED', remark: '' };
        const status = itemResult.status || 'N/A';
        let badgeStyle = 'background: #334155; color: #fff;';
        if (status === 'GOOD') badgeStyle = 'background: var(--color-good-bg); color: var(--color-good); border: 1px solid var(--color-good-border);';
        else if (status === 'SATISFIED') badgeStyle = 'background: var(--color-satisfied-bg); color: var(--color-satisfied); border: 1px solid var(--color-satisfied-border);';
        else if (status === 'POOR') badgeStyle = 'background: var(--color-poor-bg); color: var(--color-poor); border: 1px solid var(--color-poor-border);';

        html += `
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; font-size: 13px; padding-bottom: 6px; border-bottom: 1px dashed var(--border-subtle);">
            <div style="flex: 1;">
              <span style="font-family: var(--font-mono); font-weight: 700; color: var(--text-muted);">${item.no}</span>
              <span style="color: var(--text-primary); margin-left: 6px;">${escapeHtml(item.description)}</span>
              ${itemResult.remark ? `
                <div style="font-size: 12px; color: var(--color-satisfied); margin-top: 2px;">
                  💬 <em>${escapeHtml(itemResult.remark)}</em>
                </div>
              ` : ''}
              ${itemResult.photo ? `
                <div style="margin-top: 6px;">
                  <img src="${itemResult.photo}" alt="Defect" style="max-height: 80px; border-radius: 4px; border: 1px solid var(--border-medium);">
                </div>
              ` : ''}
            </div>
            <span style="padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; flex-shrink: 0; ${badgeStyle}">
              ${status}
            </span>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    if (insp.generalNotes) {
      html += `
        <div style="margin-top: 14px; padding: 12px; background-color: var(--bg-surface-elevated); border-radius: var(--radius-md);">
          <strong>General Notes & Action Plan:</strong>
          <p style="margin-top: 4px; font-size: 13px; color: var(--text-secondary);">${escapeHtml(insp.generalNotes)}</p>
        </div>
      `;
    }

    html += `</div>`;
    if (modalDetailBody) modalDetailBody.innerHTML = html;

    const modalBtnDeleteRecord = document.getElementById('modal-btn-delete-record');
    if (modalBtnDeleteRecord) {
      modalBtnDeleteRecord.setAttribute('data-id', insp.id);
    }

    detailModal.classList.add('open');
  }

  async function deleteInspection(id) {
    if (!id) return;
    try {
      const res = await fetch(`/api/inspections/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Inspection deleted successfully!`, 'success');
        if (detailModal) detailModal.classList.remove('open');
        await loadInspections();
        await loadFleetStats();
      } else {
        showToast('Failed to delete inspection', 'error');
      }
    } catch (e) {
      console.error('Delete error:', e);
      showToast('Network error while deleting', 'error');
    }
  }

  async function clearAllData() {
    if (confirm('⚠️ WARNING: This will permanently delete ALL inspection records from the database. Are you sure?')) {
      if (confirm('Please confirm: Reset and clear all inspection history?')) {
        try {
          const res = await fetch('/api/inspections/all', { method: 'DELETE' });
          if (res.ok) {
            showToast('All inspection records have been cleared!', 'success');
            await loadInspections();
            await loadFleetStats();
            switchTab('history-tab');
          } else {
            showToast('Failed to clear database', 'error');
          }
        } catch (e) {
          console.error('Clear database error:', e);
          showToast('Failed to clear database', 'error');
        }
      }
    }
  }

  // =========================================================================
  // TEAM FEEDBACK & SUGGESTIONS
  // =========================================================================
  let feedbacks = [];

  async function loadFeedbacks() {
    const listContainer = document.getElementById('feedback-list-container');
    const countBadge = document.getElementById('feedback-count-badge');
    if (!listContainer) return;

    try {
      const res = await fetch('/api/feedback');
      if (res.ok) {
        feedbacks = await res.json();
      }
    } catch (e) {
      console.error('Error loading feedbacks:', e);
    }

    if (countBadge) countBadge.textContent = `${feedbacks.length} Idea(s) Posted`;

    if (feedbacks.length === 0) {
      listContainer.innerHTML = `
        <div class="card text-center" style="padding: 30px;">
          <p class="text-muted">No feedback posted yet. Be the first to share an idea with your team!</p>
        </div>
      `;
      return;
    }

    let html = '';
    feedbacks.forEach(fb => {
      const initial = (fb.author || 'T').charAt(0).toUpperCase();
      const stars = '⭐'.repeat(fb.rating || 5);
      const dateStr = fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : 'Recent';

      html += `
        <div class="feedback-card" id="feedback-item-${fb.id}">
          <div class="feedback-card-top">
            <div class="feedback-author-row">
              <div class="feedback-avatar">${initial}</div>
              <div>
                <div class="feedback-meta-name">${escapeHtml(fb.author || 'Team Member')}</div>
                <div class="feedback-meta-role">${escapeHtml(fb.role || 'Technician')}</div>
              </div>
            </div>
            <div class="feedback-tags-row">
              <span class="feedback-category-pill">${escapeHtml(fb.category || 'General')}</span>
              <span style="font-size: 11px;">${stars}</span>
            </div>
          </div>

          <div class="feedback-message-text">
            ${escapeHtml(fb.message)}
          </div>

          <div class="feedback-footer-row">
            <span>📅 ${dateStr}</span>
            <button type="button" class="btn-upvote" data-id="${fb.id}">
              👍 <span>Helpful (${fb.upvotes || 0})</span>
            </button>
          </div>
        </div>
      `;
    });

    listContainer.innerHTML = html;

    document.querySelectorAll('.btn-upvote').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        await upvoteFeedback(id);
      });
    });
  }

  async function upvoteFeedback(id) {
    try {
      const res = await fetch(`/api/feedback/${id}/upvote`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const fb = feedbacks.find(f => f.id === id);
        if (fb) fb.upvotes = data.upvotes;
        loadFeedbacks();
        if (navigator.vibrate) navigator.vibrate(10);
      }
    } catch (e) {
      console.error('Error upvoting:', e);
    }
  }

  // =========================================================================
  // FLEET GRID DASHBOARD
  // =========================================================================

  function renderFleetGrid() {
    if (!fleetGridContainer || !fleetStats || fleetStats.length === 0) {
      if (fleetGridContainer) {
        fleetGridContainer.innerHTML = `
          <div class="card text-center" style="padding: 30px;">
            <p class="text-muted">No equipment records available yet. Complete an inspection to populate fleet tracking.</p>
          </div>
        `;
      }
      return;
    }

    let html = '';
    fleetStats.forEach(eq => {
      let statusColor = 'var(--color-good)';
      let statusText = 'HEALTHY';
      if (eq.lastStatus === 'ATTENTION_REQUIRED') {
        statusColor = 'var(--color-poor)';
        statusText = 'DEFECT REPORTED';
      } else if (eq.lastStatus === 'SATISFACTORY_WITH_NOTES') {
        statusColor = 'var(--color-satisfied)';
        statusText = 'MONITORING';
      }

      html += `
        <div class="fleet-card">
          <div class="fleet-card-header">
            <div>
              <div class="fleet-id">${escapeHtml(eq.equipmentId)}</div>
              <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">${escapeHtml(eq.equipmentType)}</span>
            </div>
            <span style="font-size: 11px; font-weight: 800; padding: 4px 8px; border-radius: 4px; background: rgba(255,255,255,0.05); color: ${statusColor}; border: 1px solid ${statusColor}">
              ${statusText}
            </span>
          </div>

          <div style="font-size: 13px; color: var(--text-secondary); display: flex; flex-direction: column; gap: 4px;">
            <div>📅 Last Inspected: <strong>${eq.lastInspectionDate || 'Never'}</strong></div>
            <div>👤 By: <strong>${escapeHtml(eq.lastInspector || 'N/A')}</strong></div>
            <div>📋 Total Inspections: <strong>${eq.totalInspections}</strong></div>
          </div>

          <div style="display: flex; gap: 8px; margin-top: auto; padding-top: 10px; border-top: 1px solid var(--border-subtle);">
            <button type="button" class="btn btn-primary btn-sm btn-inspect-equip" data-equip="${eq.equipmentId}" data-type="${eq.equipmentType}">
              📝 Inspect
            </button>
            <button type="button" class="btn btn-secondary btn-sm btn-history-equip" data-equip="${eq.equipmentId}">
              🔍 History
            </button>
          </div>
        </div>
      `;
    });

    fleetGridContainer.innerHTML = html;

    document.querySelectorAll('.btn-inspect-equip').forEach(btn => {
      btn.addEventListener('click', () => {
        const equip = btn.getAttribute('data-equip');
        const type = btn.getAttribute('data-type');
        setEquipment(equip, type);
        switchTab('inspect-tab');
      });
    });

    document.querySelectorAll('.btn-history-equip').forEach(btn => {
      btn.addEventListener('click', () => {
        const equip = btn.getAttribute('data-equip');
        if (historySearchInput) {
          historySearchInput.value = equip;
          historySearchQuery = equip;
        }
        renderHistoryList();
        switchTab('history-tab');
      });
    });
  }

  // =========================================================================
  // EVENT LISTENERS & HELPERS
  // =========================================================================

  function setupEventListeners() {
    document.querySelectorAll('.chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const equip = btn.getAttribute('data-equip');
        const type = btn.getAttribute('data-type');
        setEquipment(equip, type);
      });
    });

    if (btnClearEquipment) {
      btnClearEquipment.addEventListener('click', () => {
        if (equipmentInput) {
          equipmentInput.value = '';
          equipmentInput.focus();
        }
        highlightMatchingEquipmentChip('');
        if (activeDefectsBanner) activeDefectsBanner.style.display = 'none';
        saveDraftToStorage();
      });
    }

    if (equipmentInput) {
      equipmentInput.addEventListener('input', () => {
        const val = equipmentInput.value.trim().toUpperCase();
        highlightMatchingEquipmentChip(val);
        checkEquipmentOpenDefects(val);
        saveDraftToStorage();
      });
    }

    [inspectorInput, dateInput, timeInput, locationInput, shiftSelect, equipmentTypeSelect, notesInput].forEach(elem => {
      if (elem) elem.addEventListener('change', saveDraftToStorage);
    });

    if (btnVoiceGeneral && notesInput) {
      btnVoiceGeneral.addEventListener('click', () => {
        startListening(notesInput, btnVoiceGeneral);
      });
    }

    if (btnQuickFillGood) btnQuickFillGood.addEventListener('click', quickFillAllGood);
    if (btnSaveInspection) btnSaveInspection.addEventListener('click', saveInspection);
    if (btnResetForm) btnResetForm.addEventListener('click', resetChecklistForm);

    if (historySearchInput) {
      historySearchInput.addEventListener('input', (e) => {
        historySearchQuery = e.target.value;
        renderHistoryList();
      });
    }

    if (btnClearHistorySearch) {
      btnClearHistorySearch.addEventListener('click', () => {
        if (historySearchInput) historySearchInput.value = '';
        historySearchQuery = '';
        renderHistoryList();
      });
    }

    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        historyStatusFilter = pill.getAttribute('data-status-filter');
        renderHistoryList();
      });
    });

    if (formAlertSettings) {
      formAlertSettings.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newSettings = {
          supervisorPhone: settingPhoneInput ? settingPhoneInput.value.trim() : '',
          supervisorEmail: settingEmailInput ? settingEmailInput.value.trim() : ''
        };

        try {
          const res = await fetch('/api/settings/alerts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSettings)
          });
          if (res.ok) {
            alertSettings = newSettings;
            showToast('Alert settings saved successfully!', 'success');
          }
        } catch (err) {
          showToast('Failed to save settings', 'error');
        }
      });
    }

    if (btnPhoneQr && qrModal) btnPhoneQr.addEventListener('click', () => qrModal.classList.add('open'));
    if (btnCloseQrModal && qrModal) btnCloseQrModal.addEventListener('click', () => qrModal.classList.remove('open'));
    if (btnCloseQrFooter && qrModal) btnCloseQrFooter.addEventListener('click', () => qrModal.classList.remove('open'));

    if (btnCloseDetailModal && detailModal) btnCloseDetailModal.addEventListener('click', () => detailModal.classList.remove('open'));
    if (modalBtnPrint) modalBtnPrint.addEventListener('click', () => window.print());

    const modalBtnDeleteRecord = document.getElementById('modal-btn-delete-record');
    if (modalBtnDeleteRecord) {
      modalBtnDeleteRecord.addEventListener('click', async () => {
        const id = modalBtnDeleteRecord.getAttribute('data-id');
        if (id && confirm(`Permanently delete inspection ${id}?`)) {
          await deleteInspection(id);
        }
      });
    }

    const btnClearAllData = document.getElementById('btn-clear-all-data');
    if (btnClearAllData) {
      btnClearAllData.addEventListener('click', clearAllData);
    }

    if (btnCloseAlertModal && alertModal) btnCloseAlertModal.addEventListener('click', () => alertModal.classList.remove('open'));
    if (btnDismissAlertModal && alertModal) {
      btnDismissAlertModal.addEventListener('click', () => {
        alertModal.classList.remove('open');
        const eq = equipmentInput ? equipmentInput.value.trim().toUpperCase() : '';
        if (historySearchInput) {
          historySearchInput.value = eq;
          historySearchQuery = eq;
        }
        renderHistoryList();
        switchTab('history-tab');
      });
    }

    if (btnCopyMobileUrl && mobileUrlInput) {
      btnCopyMobileUrl.addEventListener('click', () => {
        mobileUrlInput.select();
        navigator.clipboard.writeText(mobileUrlInput.value);
        showToast('Mobile URL copied to clipboard!', 'success');
      });
    }

    const btnBackupJson = document.getElementById('btn-backup-json');
    if (btnBackupJson) {
      btnBackupJson.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(inspections, null, 2));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", `Visual_Inspections_Backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        dlAnchor.remove();
        showToast('Backup JSON downloaded', 'success');
      });
    }

    // Team Feedback Form
    const formFeedback = document.getElementById('form-submit-feedback');
    const feedbackAuthor = document.getElementById('feedback-author-input');
    const feedbackRole = document.getElementById('feedback-role-select');
    const feedbackCategory = document.getElementById('feedback-category-select');
    const feedbackRating = document.getElementById('feedback-rating-select');
    const feedbackMessage = document.getElementById('feedback-message-input');
    const btnVoiceFeedback = document.getElementById('btn-voice-feedback');

    if (btnVoiceFeedback && feedbackMessage) {
      btnVoiceFeedback.addEventListener('click', () => {
        startListening(feedbackMessage, btnVoiceFeedback);
      });
    }

    if (formFeedback) {
      formFeedback.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = feedbackMessage ? feedbackMessage.value.trim() : '';
        if (!msg) {
          showToast('Please enter your feedback message', 'error');
          return;
        }

        const payload = {
          author: feedbackAuthor ? feedbackAuthor.value.trim() : 'Team Member',
          role: feedbackRole ? feedbackRole.value : 'Technician',
          category: feedbackCategory ? feedbackCategory.value : 'General Suggestion',
          rating: feedbackRating ? feedbackRating.value : 5,
          message: msg
        };

        try {
          const res = await fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (res.ok) {
            showToast('Thank you! Your feedback was submitted.', 'success');
            if (feedbackMessage) feedbackMessage.value = '';
            await loadFeedbacks();
          } else {
            showToast('Failed to submit feedback', 'error');
          }
        } catch (err) {
          showToast('Network error while sending feedback', 'error');
        }
      });
    }

    [qrModal, detailModal, alertModal].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) modal.classList.remove('open');
        });
      }
    });
  }

  function setEquipment(equip, type) {
    if (equipmentInput) equipmentInput.value = equip;
    if (type && equipmentTypeSelect) equipmentTypeSelect.value = type;
    highlightMatchingEquipmentChip(equip);
    checkEquipmentOpenDefects(equip);
    saveDraftToStorage();
    if (navigator.vibrate) navigator.vibrate(10);
  }

  function highlightMatchingEquipmentChip(equip) {
    document.querySelectorAll('.chip-btn').forEach(b => {
      if (b.getAttribute('data-equip') === equip) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
  }

  function showToast(message, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => toast.remove(), 200);
    }, 3200);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Start app immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
