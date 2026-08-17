/**
 * Visual Inspection Checklist & Condition-Based Maintenance (CBM) System
 * Features:
 * 1. Mobile-First Inspection Form & 1-Tap Ticking
 * 2. Defect Lifecycle & Active Carry-Forward Issue Tracking
 * 3. 1-Tap WhatsApp & Email Critical Alert Dispatcher
 * 4. Voice-to-Text Speech Recognition (🎙️)
 * 5. CBM Predictive Analytics, Failure Hotspots & Crane Reliability Ranking
 * 6. Historical Track Back & Excel Export (.xlsx)
 */

(function () {
  'use strict';

  // State
  let template = null;
  let inspections = [];
  let fleetStats = [];
  let alertSettings = {
    supervisorPhone: '+60123456789',
    supervisorEmail: 'supervisor@port.com',
    enableWhatsAppAlerts: true,
    enableEmailAlerts: true
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

  // Speech Recognition state
  let recognition = null;
  let activeSpeechTargetInput = null;

  // DOM Elements - Navigation & Core Form
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

  async function init() {
    setupSpeechRecognition();
    setupTabNavigation();
    setupDefaultFormValues();
    setupEventListeners();
    await loadChecklistTemplate();
    await loadInspections();
    await loadFleetStats();
    await loadAlertSettings();
    await loadNetworkInfo();
    restoreDraftFromStorage();
  }

  // Setup Web Speech API for voice dictation
  function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
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
        showToast(`Voice error: ${event.error}`, 'error');
        stopListening();
      };

      recognition.onend = () => {
        stopListening();
      };
    } else {
      if (btnVoiceGeneral) {
        btnVoiceGeneral.title = 'Speech-to-text not supported in this browser';
      }
    }
  }

  function startListening(targetInput, triggerBtn) {
    if (!recognition) {
      showToast('Speech recognition is not supported on this browser (Try Chrome or Safari)', 'info');
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

    dateInput.value = `${yyyy}-${mm}-${dd}`;
    timeInput.value = `${hh}:${min}`;

    const savedInspector = localStorage.getItem('cbm_inspector_name');
    if (savedInspector) {
      inspectorInput.value = savedInspector;
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
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // =========================================================================
  // API LOADERS
  // =========================================================================

  async function loadChecklistTemplate() {
    try {
      const res = await fetch('/api/checklist-template');
      template = await res.json();
      renderChecklist();
    } catch (err) {
      console.error('Failed to load checklist template:', err);
      showToast('Could not load template from server', 'error');
    }
  }

  async function loadInspections() {
    try {
      const res = await fetch('/api/inspections');
      inspections = await res.json();
      renderHistoryList();
    } catch (err) {
      console.error('Failed to load inspections:', err);
    }
  }

  async function loadFleetStats() {
    try {
      const res = await fetch('/api/equipment/stats');
      fleetStats = await res.json();
      renderFleetGrid();
    } catch (err) {
      console.error('Failed to load fleet stats:', err);
    }
  }

  async function loadAlertSettings() {
    try {
      const res = await fetch('/api/settings/alerts');
      alertSettings = await res.json();
      if (settingPhoneInput) settingPhoneInput.value = alertSettings.supervisorPhone || '';
      if (settingEmailInput) settingEmailInput.value = alertSettings.supervisorEmail || '';
    } catch (e) {
      console.error('Failed to load alert settings:', e);
    }
  }

  async function loadCBMAnalytics() {
    try {
      const res = await fetch('/api/analytics/cbm-summary');
      const data = await res.json();

      // Update KPI Cards
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
      if (cbmTotalDefects) cbmTotalDefects.textContent = data.totalPoor + data.totalSatisfied;

      // Render Failure Hotspots
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

      // Render Crane Reliability Rankings Table
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
      const res = await fetch(`/api/network-info?origin=${encodeURIComponent(currentOrigin)}`);
      const data = await res.json();
      const mobileUrl = data.mobileUrl || currentOrigin;
      if (data.qrCodeDataUrl) {
        modalQrImg.src = data.qrCodeDataUrl;
        if (qrCodeImg) qrCodeImg.src = data.qrCodeDataUrl;
      }
      modalQrUrlText.textContent = mobileUrl;
      if (mobileUrlInput) mobileUrlInput.value = mobileUrl;
    } catch (err) {
      console.error('Failed to load network info:', err);
    }
  }

  // =========================================================================
  // DEFECT LIFECYCLE: CARRY FORWARD & RESOLUTION TRACKING
  // =========================================================================

  async function checkEquipmentOpenDefects(equipId) {
    if (!equipId) {
      activeDefectsBanner.style.display = 'none';
      return;
    }

    try {
      const res = await fetch(`/api/equipment/${encodeURIComponent(equipId)}/open-defects`);
      const data = await res.json();
      currentOpenDefects = data.openDefects || [];

      if (currentOpenDefects.length > 0) {
        defectsBannerHeading.textContent = `Active Issues on ${equipId} from ${data.lastInspectionDate}`;
        defectsBannerCount.textContent = `${currentOpenDefects.length} Issue(s)`;

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

        activeDefectsList.innerHTML = defHtml;
        activeDefectsBanner.style.display = 'block';

        // Attach Rectify Listeners
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
      console.error('Failed to check open defects:', e);
      activeDefectsBanner.style.display = 'none';
    }
  }

  function rectifyDefect(itemNo) {
    // Set item rating to GOOD
    if (!currentDraft.items[itemNo]) {
      currentDraft.items[itemNo] = { status: '', remark: '', tags: [], photo: null };
    }
    currentDraft.items[itemNo].status = 'GOOD';
    currentDraft.items[itemNo].remark = `Rectified on ${new Date().toISOString().split('T')[0]}: Verified in good working condition.`;

    showToast(`Marked Item ${itemNo} as RECTIFIED!`, 'success');
    renderChecklist();
    saveDraftToStorage();

    // Scroll to item
    const card = document.getElementById(`item-card-${itemNo.replace('.', '_')}`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // =========================================================================
  // CHECKLIST RENDERING & TICKING LOGIC
  // =========================================================================

  function renderChecklist() {
    if (!template || !template.categories) return;

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

            <!-- 3-Way Rating Buttons -->
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

            <!-- Item Remark, Voice Mic & Defect Tags Drawer -->
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

                <!-- Voice Mic for item remark -->
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
        group.classList.toggle('collapsed');
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

    // Voice Dictation for item remarks
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

    card.querySelectorAll('.btn-rating').forEach(b => {
      if (b.getAttribute('data-rating') === currentStatus) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    card.className = `checklist-item-card ${currentStatus ? 'status-' + currentStatus.toLowerCase() : ''}`;

    if (currentStatus === 'SATISFIED' || currentStatus === 'POOR') {
      expandDiv.style.display = 'flex';
    } else if (!currentDraft.items[itemNo].remark && !currentDraft.items[itemNo].photo) {
      expandDiv.style.display = 'none';
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

    progressCount.textContent = `${checked} / ${total}`;
    const pct = total > 0 ? (checked / total) * 100 : 0;
    progressFillBar.style.width = `${pct}%`;

    badgeGoodCount.textContent = `${good} Good`;
    badgeSatisfiedCount.textContent = `${satisfied} Satisfied`;
    badgePoorCount.textContent = `${poor} Poor`;

    if (checked === 0) {
      floatingSummary.textContent = 'Ready to inspect';
    } else if (checked < total) {
      floatingSummary.textContent = `${checked}/${total} Checked • ${poor > 0 ? `🔴 ${poor} Poor` : 'In Progress'}`;
    } else {
      floatingSummary.textContent = poor > 0 ? `⚠️ ${poor} Defect(s) Found` : `✅ All ${total} Items Checked`;
    }
  }

  // =========================================================================
  // FORM PERSISTENCE & SUBMISSION WITH 1-TAP CRITICAL ALERTS
  // =========================================================================

  function saveDraftToStorage() {
    currentDraft.equipmentId = equipmentInput.value.trim().toUpperCase();
    currentDraft.equipmentType = equipmentTypeSelect.value;
    currentDraft.inspectorName = inspectorInput.value.trim();
    currentDraft.inspectionDate = dateInput.value;
    currentDraft.inspectionTime = timeInput.value;
    currentDraft.location = locationInput.value.trim();
    currentDraft.shift = shiftSelect.value;
    currentDraft.generalNotes = notesInput.value.trim();

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

        if (currentDraft.equipmentId) {
          equipmentInput.value = currentDraft.equipmentId;
          checkEquipmentOpenDefects(currentDraft.equipmentId);
        }
        if (currentDraft.equipmentType) equipmentTypeSelect.value = currentDraft.equipmentType;
        if (currentDraft.inspectorName) inspectorInput.value = currentDraft.inspectorName;
        if (currentDraft.location) locationInput.value = currentDraft.location;
        if (currentDraft.shift) shiftSelect.value = currentDraft.shift;
        if (currentDraft.generalNotes) notesInput.value = currentDraft.generalNotes;

        highlightMatchingEquipmentChip(currentDraft.equipmentId);
        renderChecklist();
      }
    } catch (e) {
      console.error('Error restoring draft:', e);
    }
  }

  async function saveInspection() {
    const equipId = equipmentInput.value.trim().toUpperCase();
    if (!equipId) {
      showToast('Please enter an Equipment ID (e.g. Q75)', 'error');
      equipmentInput.focus();
      return;
    }

    saveDraftToStorage();

    btnSaveInspection.disabled = true;
    btnSaveInspection.innerHTML = `
      <div class="spinner" style="width:16px;height:16px;margin:0;border-width:2px;"></div>
      <span>Saving...</span>
    `;

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

      // Clear draft
      localStorage.removeItem('cbm_inspection_draft');
      currentDraft.items = {};
      currentDraft.generalNotes = '';
      notesInput.value = '';

      // Reload inspections & stats
      await loadInspections();
      await loadFleetStats();

      // Check if critical defects were found: Trigger 1-Tap Alert Modal!
      if (savedInsp.summary && (savedInsp.summary.poorCount > 0 || savedInsp.summary.satisfiedCount > 0)) {
        triggerCriticalAlertModal(savedInsp);
      } else {
        // Switch to history tab
        historySearchInput.value = equipId;
        historySearchQuery = equipId;
        renderHistoryList();
        switchTab('history-tab');
      }

      renderChecklist();
    } catch (err) {
      console.error('Error saving inspection:', err);
      showToast('Inspection saved locally', 'info');
    } finally {
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

  // Trigger 1-Tap WhatsApp & Email Modal
  function triggerCriticalAlertModal(insp) {
    alertModalEquip.textContent = insp.equipmentId;

    // Collect defect list
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

    alertMessagePreview.textContent = alertText;

    // Build WhatsApp URL
    const cleanPhone = (alertSettings.supervisorPhone || '').replace(/[^0-9+]/g, '');
    const waUrl = `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(alertText)}`;
    btnSendWhatsApp.href = waUrl;

    // Build Email URL
    const mailSubject = `🚨 CRITICAL DEFECT ALERT: ${insp.equipmentId} (${insp.inspectionDate})`;
    const mailUrl = `mailto:${alertSettings.supervisorEmail || 'supervisor@port.com'}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(alertText)}`;
    btnSendEmail.href = mailUrl;

    alertModal.classList.add('open');
  }

  function resetChecklistForm() {
    if (confirm('Are you sure you want to reset all checklist items?')) {
      currentDraft.items = {};
      currentDraft.generalNotes = '';
      notesInput.value = '';
      localStorage.removeItem('cbm_inspection_draft');
      renderChecklist();
      showToast('Form reset', 'info');
    }
  }

  // =========================================================================
  // TRACK BACK & HISTORY VIEW
  // =========================================================================

  function renderHistoryList() {
    if (!inspections) return;

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

    historyCountBadge.textContent = `${filtered.length} Record(s) Found`;

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
              <span>View Checklist</span>
            </button>

            <a href="/api/export/excel/${insp.id}" class="btn btn-emerald-outline btn-sm" download>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Excel (.xlsx)</span>
            </a>
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
  }

  function openDetailModal(id) {
    const insp = inspections.find(item => item.id === id);
    if (!insp || !template) return;

    modalEquipBadge.textContent = insp.equipmentId;
    modalTitle.textContent = `Report: ${insp.inspectionDate} (${insp.inspectorName})`;
    modalBtnDownloadExcel.href = `/api/export/excel/${insp.id}`;

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
    modalDetailBody.innerHTML = html;
    detailModal.classList.add('open');
  }

  // =========================================================================
  // FLEET GRID DASHBOARD
  // =========================================================================

  function renderFleetGrid() {
    if (!fleetStats || fleetStats.length === 0) {
      fleetGridContainer.innerHTML = `
        <div class="card text-center" style="padding: 30px;">
          <p class="text-muted">No equipment records available yet. Complete an inspection to populate fleet tracking.</p>
        </div>
      `;
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
        historySearchInput.value = equip;
        historySearchQuery = equip;
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

    btnClearEquipment.addEventListener('click', () => {
      equipmentInput.value = '';
      equipmentInput.focus();
      highlightMatchingEquipmentChip('');
      activeDefectsBanner.style.display = 'none';
      saveDraftToStorage();
    });

    equipmentInput.addEventListener('input', () => {
      const val = equipmentInput.value.trim().toUpperCase();
      highlightMatchingEquipmentChip(val);
      checkEquipmentOpenDefects(val);
      saveDraftToStorage();
    });

    [inspectorInput, dateInput, timeInput, locationInput, shiftSelect, equipmentTypeSelect, notesInput].forEach(elem => {
      elem.addEventListener('change', saveDraftToStorage);
    });

    // Voice Dictation for General Notes
    if (btnVoiceGeneral) {
      btnVoiceGeneral.addEventListener('click', () => {
        startListening(notesInput, btnVoiceGeneral);
      });
    }

    btnQuickFillGood.addEventListener('click', quickFillAllGood);
    btnSaveInspection.addEventListener('click', saveInspection);
    btnResetForm.addEventListener('click', resetChecklistForm);

    historySearchInput.addEventListener('input', (e) => {
      historySearchQuery = e.target.value;
      renderHistoryList();
    });

    btnClearHistorySearch.addEventListener('click', () => {
      historySearchInput.value = '';
      historySearchQuery = '';
      renderHistoryList();
    });

    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        historyStatusFilter = pill.getAttribute('data-status-filter');
        renderHistoryList();
      });
    });

    // Alert Settings Form
    if (formAlertSettings) {
      formAlertSettings.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newSettings = {
          supervisorPhone: settingPhoneInput.value.trim(),
          supervisorEmail: settingEmailInput.value.trim(),
          enableWhatsAppAlerts: true,
          enableEmailAlerts: true
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

    // Modal Close buttons
    btnPhoneQr.addEventListener('click', () => qrModal.classList.add('open'));
    btnCloseQrModal.addEventListener('click', () => qrModal.classList.remove('open'));
    btnCloseQrFooter.addEventListener('click', () => qrModal.classList.remove('open'));

    btnCloseDetailModal.addEventListener('click', () => detailModal.classList.remove('open'));
    modalBtnPrint.addEventListener('click', () => window.print());

    // Alert Modal Buttons
    if (btnCloseAlertModal) btnCloseAlertModal.addEventListener('click', () => alertModal.classList.remove('open'));
    if (btnDismissAlertModal) {
      btnDismissAlertModal.addEventListener('click', () => {
        alertModal.classList.remove('open');
        // Switch to history tab
        historySearchInput.value = equipmentInput.value.trim().toUpperCase();
        historySearchQuery = historySearchInput.value;
        renderHistoryList();
        switchTab('history-tab');
      });
    }

    btnCopyMobileUrl.addEventListener('click', () => {
      mobileUrlInput.select();
      navigator.clipboard.writeText(mobileUrlInput.value);
      showToast('Mobile URL copied to clipboard!', 'success');
    });

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

    [qrModal, detailModal, alertModal].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) modal.classList.remove('open');
        });
      }
    });
  }

  function setEquipment(equip, type) {
    equipmentInput.value = equip;
    if (type) equipmentTypeSelect.value = type;
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

  document.addEventListener('DOMContentLoaded', init);
})();
