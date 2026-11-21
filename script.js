/**
 * Unstuck — Learning Support Companion (V2 Guided Learning Flow)
 * Vanilla JavaScript (No frameworks, No external APIs, LocalStorage persistence)
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // CONSTANTS & TAXONOMY DATA
  // ---------------------------------------------------------------------------

  const STORAGE_KEY = 'unstuck_confusions_v1';

  const STRATEGIES_LIST = [
    'Ask a teacher or classmate.',
    'Ask AI.',
    'Review learning materials.',
    'Practice independently.',
    'Other.'
  ];

  // Q2 (Clarify Step 2): Detailed confusion sub-options
  const Q2_OPTIONS_MAP = {
    meaning: [
      "I don't understand some terms.",
      "I don't understand what this concept means.",
      "I don't understand what the material is saying."
    ],
    logic: [
      "I couldn't follow the explanation.",
      "I don't understand why this conclusion follows.",
      "I understand individual steps, but not the overall reasoning."
    ],
    connection: [
      "I can't connect this to what I already know.",
      "I can't distinguish it from similar concepts.",
      "I don't understand how different ideas relate."
    ],
    application: [
      "I understand the idea but don't know how to use it.",
      "I don't know how to start the task.",
      "I don't understand what the assignment requires."
    ],
    uncertain: [
      "I'm not sure exactly what I don't understand.",
      "I'm not sure whether my understanding is correct.",
      "I feel lost and don't know where to start."
    ]
  };

  // Q3 (Act Step 1): Detailed help preference sub-options
  const Q3_OPTIONS_MAP = {
    explain: [
      "Explain the concept in a different way.",
      "Explain an unfamiliar term.",
      "Walk through the explanation again."
    ],
    example: [
      "Give me a concrete example.",
      "Give me a real-world example.",
      "Show me a counterexample."
    ],
    connect: [
      "Compare two similar concepts.",
      "Explain how different concepts relate.",
      "Connect this topic to something I already know."
    ],
    guide: [
      "Walk me through the steps.",
      "Show me how to apply the concept.",
      "Help me figure out where to start."
    ],
    check: [
      "Check whether my understanding is correct.",
      "Give feedback on my reasoning.",
      "Confirm whether I'm approaching the task correctly."
    ]
  };

  // Date & Time formatting helpers
  function formatDateTime(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${dateStr} · ${timeStr}`;
  }

  function formatDateOnly(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // Initial 2 Realistic Sample Cards
  function createInitialSampleCards() {
    const now = Date.now();
    const t4h = new Date(now - 14400000).toISOString();
    const t3h = new Date(now - 10800000).toISOString();
    const t2h = new Date(now - 7200000).toISOString();
    const t1h = new Date(now - 3600000).toISOString();

    return [
      {
        id: 'sample-1',
        source: 'Slides / PPT',
        note: 'Slide 12 — Schema Theory',
        createdAt: t4h,
        updatedAt: t1h,
        lastActivityAt: t1h,
        lastActiveStage: 'reflect',
        clarify: {
          priorKnowledge: 'I understand that schemas are organized knowledge structures.',
          confusionDetails: ["I don't understand why this conclusion follows."],
          primaryConcern: null
        },
        act: {
          helpPreferences: ['Give me a concrete example.'],
          questionDraft: 'Could you give an example of how schemas help organize new concepts during learning?',
          plannedStrategies: ['Ask a teacher or classmate.', 'Review learning materials.'],
          planUpdatedAt: t3h,
          planHistory: [
            { strategies: ['Ask a teacher or classmate.', 'Review learning materials.'], timestamp: t3h }
          ]
        },
        reflect: {
          actualStrategies: ['Ask a teacher or classmate.'],
          helpfulStrategies: ['Ask a teacher or classmate.'],
          noneHelped: false,
          timeSpent: 'Less than 30 minutes.',
          nextDecision: 'Continue practicing.',
          updatedAt: t2h
        },
        understanding: {
          currentStatus: 'Partially Understood',
          updatedAt: t1h,
          understoodAt: null,
          history: [
            { status: 'Still Confused', timestamp: t3h },
            { status: 'Partially Understood', timestamp: t1h }
          ]
        }
      },
      {
        id: 'sample-2',
        source: "Teacher's Explanation",
        note: 'Gradient descent learning rate alpha',
        createdAt: t4h,
        updatedAt: t3h,
        lastActivityAt: t3h,
        lastActiveStage: 'clarify',
        clarify: {
          priorKnowledge: '',
          confusionDetails: ["I don't understand some terms."],
          primaryConcern: null
        },
        act: {
          helpPreferences: [],
          questionDraft: '',
          plannedStrategies: [],
          planUpdatedAt: null,
          planHistory: []
        },
        reflect: {
          actualStrategies: [],
          helpfulStrategies: [],
          noneHelped: false,
          timeSpent: '',
          nextDecision: '',
          updatedAt: null
        },
        understanding: {
          currentStatus: 'Still Confused',
          updatedAt: t3h,
          understoodAt: null,
          history: [
            { status: 'Still Confused', timestamp: t3h }
          ]
        }
      }
    ];
  }

  // ---------------------------------------------------------------------------
  // STATE & DEBOUNCED AUTOSAVE MANAGER
  // ---------------------------------------------------------------------------

  let confusions = [];
  let currentActiveId = null;
  let currentViewName = 'home';
  let isNewCaptureSession = false;
  let pendingNewSource = '';

  let activeQ2Category = null;
  let activeQ3Category = null;
  let isQuestionSectionOpen = false;
  let isHintOpen = false;
  let isSampleOpen = false;
  let isRevisitInfoOpen = false;
  let isLearningHistoryOpen = false;
  let isUHistoryOpen = false;
  let cardPendingDeleteId = null;

  let pendingSaveTimer = null;
  let pendingSaveCallback = null;

  function scheduleTextSave(callback, delayMs) {
    if (pendingSaveTimer) {
      clearTimeout(pendingSaveTimer);
    }
    pendingSaveCallback = callback;
    pendingSaveTimer = setTimeout(() => {
      flushPendingSave();
    }, delayMs || 250);
  }

  function flushPendingSave() {
    if (pendingSaveTimer) {
      clearTimeout(pendingSaveTimer);
      pendingSaveTimer = null;
    }
    if (typeof pendingSaveCallback === 'function') {
      const cb = pendingSaveCallback;
      pendingSaveCallback = null;
      cb();
    }
  }

  function showSavedIndicator(stageKey) {
    const el = document.getElementById(`save-status-${stageKey}`);
    if (!el) return;
    el.textContent = '✓ Saved';
    el.classList.add('is-saved');
  }

  function clearSavedIndicators() {
    document.querySelectorAll('.autosave-indicator').forEach(el => {
      el.textContent = '';
      el.classList.remove('is-saved');
    });
  }

  // Ensure edits are flushed on browser close / tab switch
  window.addEventListener('beforeunload', flushPendingSave);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushPendingSave();
    }
  });

  // ---------------------------------------------------------------------------
  // STAGE COMPLETION & STATUS HELPERS (Derived strictly from saved activity)
  // ---------------------------------------------------------------------------

  function isCaptureComplete(card) {
    return Boolean(card && card.note && card.note.trim().length > 0);
  }

  function isClarifyComplete(card) {
    if (!card || !card.clarify) return false;
    return Boolean(
      (card.clarify.priorKnowledge && card.clarify.priorKnowledge.trim().length > 0) ||
      (Array.isArray(card.clarify.confusionDetails) && card.clarify.confusionDetails.length > 0)
    );
  }

  function isActComplete(card) {
    if (!card || !card.act) return false;
    return Boolean(
      (Array.isArray(card.act.helpPreferences) && card.act.helpPreferences.length > 0) ||
      (card.act.questionDraft && card.act.questionDraft.trim().length > 0) ||
      (Array.isArray(card.act.plannedStrategies) && card.act.plannedStrategies.length > 0)
    );
  }

  function isReflectComplete(card) {
    if (!card || !card.reflect) return false;
    return Boolean(
      (Array.isArray(card.reflect.actualStrategies) && card.reflect.actualStrategies.length > 0) ||
      (Array.isArray(card.reflect.helpfulStrategies) && card.reflect.helpfulStrategies.length > 0) ||
      Boolean(card.reflect.noneHelped) ||
      Boolean(card.reflect.timeSpent) ||
      Boolean(card.reflect.nextDecision)
    );
  }

  function getUnderstandingBadgeMeta(status) {
    if (status === 'Still Confused') {
      return { label: 'Still Confused', className: 'status-need-help' };
    }
    if (status === 'Partially Understood') {
      return { label: 'Partially Understood', className: 'status-partially-resolved' };
    }
    if (status === 'Understood') {
      return { label: 'Understood', className: 'status-resolved' };
    }
    return { label: 'Not Checked Yet', className: 'status-not-reviewed' };
  }

  function getStageDisplayName(stageKey) {
    const names = {
      capture: '01 Capture',
      clarify: '02 Clarify',
      act: '03 Act',
      reflect: '04 Reflect',
      understanding: 'Understanding Check',
      workspace: 'Workspace Overview'
    };
    return names[stageKey] || 'Workspace Overview';
  }

  function getContinueTarget(card) {
    if (!card) return 'workspace';
    if (!isClarifyComplete(card)) return 'clarify';
    if (!isActComplete(card)) return 'act';
    if (!isReflectComplete(card)) return 'reflect';
    if (!card.understanding || !card.understanding.currentStatus) return 'understanding';
    if (card.lastActiveStage && ['capture', 'clarify', 'act', 'reflect'].includes(card.lastActiveStage)) {
      return card.lastActiveStage;
    }
    return 'workspace';
  }

  // ---------------------------------------------------------------------------
  // STORAGE & BACKWARD-COMPATIBLE MIGRATION
  // ---------------------------------------------------------------------------

  function normalizeConfusion(c) {
    let changed = false;

    // Migrate note / quickNote
    if (typeof c.note !== 'string') {
      c.note = typeof c.quickNote === 'string' ? c.quickNote : '';
      changed = true;
    }
    if (!c.source) {
      c.source = 'General';
      changed = true;
    }
    if (!c.createdAt) {
      c.createdAt = new Date().toISOString();
      changed = true;
    }
    if (!c.updatedAt) {
      c.updatedAt = c.createdAt;
      changed = true;
    }
    if (!c.lastActivityAt) {
      c.lastActivityAt = c.updatedAt || c.createdAt;
      changed = true;
    }
    if (c.lastActiveStage === undefined) {
      c.lastActiveStage = null;
      changed = true;
    }

    // Migrate Clarify nested object
    if (!c.clarify || typeof c.clarify !== 'object') {
      c.clarify = {
        priorKnowledge: typeof c.q1Understanding === 'string' ? c.q1Understanding : '',
        confusionDetails: Array.isArray(c.q2StuckOptions) ? [...c.q2StuckOptions] : [],
        primaryConcern: c.q2PrimaryConcern || null
      };
      changed = true;
    } else {
      if (typeof c.clarify.priorKnowledge !== 'string') { c.clarify.priorKnowledge = ''; changed = true; }
      if (!Array.isArray(c.clarify.confusionDetails)) { c.clarify.confusionDetails = []; changed = true; }
      if (c.clarify.primaryConcern === undefined) { c.clarify.primaryConcern = null; changed = true; }
    }

    // Migrate Act nested object
    if (!c.act || typeof c.act !== 'object') {
      const legacyPlanned = [];
      if (typeof c.actDraftStrategy === 'string' && c.actDraftStrategy.trim()) {
        legacyPlanned.push(c.actDraftStrategy.trim());
      }
      c.act = {
        helpPreferences: Array.isArray(c.q3HelpPreferences) ? [...c.q3HelpPreferences] : [],
        questionDraft: typeof c.studentQuestion === 'string' ? c.studentQuestion : '',
        plannedStrategies: legacyPlanned,
        planUpdatedAt: legacyPlanned.length > 0 ? (c.updatedAt || c.createdAt) : null,
        planHistory: legacyPlanned.length > 0
          ? [{ strategies: [...legacyPlanned], timestamp: c.updatedAt || c.createdAt }]
          : []
      };
      changed = true;
    } else {
      if (!Array.isArray(c.act.helpPreferences)) { c.act.helpPreferences = []; changed = true; }
      if (typeof c.act.questionDraft !== 'string') { c.act.questionDraft = ''; changed = true; }
      if (!Array.isArray(c.act.plannedStrategies)) { c.act.plannedStrategies = []; changed = true; }
      if (c.act.planUpdatedAt === undefined) { c.act.planUpdatedAt = null; changed = true; }
      if (!Array.isArray(c.act.planHistory)) { c.act.planHistory = []; changed = true; }
    }

    // Migrate Reflect nested object (including from earlier V2 attempts if present)
    if (!c.reflect || typeof c.reflect !== 'object') {
      const actualSet = new Set();
      const helpfulSet = new Set();
      let latestReflTime = null;

      if (Array.isArray(c.attempts)) {
        c.attempts.forEach(att => {
          if (att && att.strategy) {
            actualSet.add(att.strategy);
            if (att.reflection && att.reflection.helped) {
              if (att.reflection.helped === 'Yes, I understand now.' || att.reflection.helped === 'Partially.') {
                helpfulSet.add(att.strategy);
              }
              latestReflTime = att.reflection.updatedAt || att.createdAt || latestReflTime;
            }
          }
        });
      }

      c.reflect = {
        actualStrategies: [...actualSet],
        helpfulStrategies: [...helpfulSet],
        noneHelped: false,
        timeSpent: '',
        nextDecision: '',
        updatedAt: latestReflTime
      };
      changed = true;
    } else {
      if (!Array.isArray(c.reflect.actualStrategies)) { c.reflect.actualStrategies = []; changed = true; }
      if (!Array.isArray(c.reflect.helpfulStrategies)) { c.reflect.helpfulStrategies = []; changed = true; }
      // Enforce subset rule
      const validHelpful = c.reflect.helpfulStrategies.filter(s => c.reflect.actualStrategies.includes(s));
      if (validHelpful.length !== c.reflect.helpfulStrategies.length) {
        c.reflect.helpfulStrategies = validHelpful;
        changed = true;
      }
      if (typeof c.reflect.noneHelped !== 'boolean') { c.reflect.noneHelped = false; changed = true; }
      if (typeof c.reflect.timeSpent !== 'string') { c.reflect.timeSpent = ''; changed = true; }
      if (typeof c.reflect.nextDecision !== 'string') { c.reflect.nextDecision = ''; changed = true; }
      if (c.reflect.updatedAt === undefined) { c.reflect.updatedAt = null; changed = true; }
    }

    // Migrate Understanding nested object conservatively (never invent historical dates)
    if (!c.understanding || typeof c.understanding !== 'object') {
      let mappedStatus = null;
      if (c.understandingStatus) {
        mappedStatus = c.understandingStatus;
      } else if (c.status === 'Need Help') {
        mappedStatus = 'Still Confused';
      } else if (c.status === 'Partially Resolved') {
        mappedStatus = 'Partially Understood';
      } else if (c.status === 'Resolved') {
        mappedStatus = 'Understood';
      }

      c.understanding = {
        currentStatus: mappedStatus,
        updatedAt: c.understandingUpdatedAt || c.statusUpdatedAt || null,
        understoodAt: c.understoodAt || null, // Never fabricate for legacy 'Resolved' records
        history: Array.isArray(c.understandingHistory) ? [...c.understandingHistory] : []
      };
      changed = true;
    } else {
      if (c.understanding.currentStatus === undefined) { c.understanding.currentStatus = null; changed = true; }
      if (c.understanding.updatedAt === undefined) { c.understanding.updatedAt = null; changed = true; }
      if (c.understanding.understoodAt === undefined) { c.understanding.understoodAt = null; changed = true; }
      if (!Array.isArray(c.understanding.history)) { c.understanding.history = []; changed = true; }
    }

    return changed;
  }

  function loadConfusions() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        confusions = Array.isArray(parsed) ? parsed : createInitialSampleCards();
      } else {
        confusions = createInitialSampleCards();
        saveConfusions();
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
      confusions = createInitialSampleCards();
    }

    let modified = false;
    confusions.forEach(c => {
      if (normalizeConfusion(c)) modified = true;
    });
    if (modified) saveConfusions();
  }

  function saveConfusions() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(confusions));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  function getActiveConfusion() {
    return confusions.find(c => c.id === currentActiveId) || null;
  }

  function touchCardActivity(card, stageName) {
    const nowIso = new Date().toISOString();
    card.updatedAt = nowIso;
    card.lastActivityAt = nowIso;
    if (stageName) {
      card.lastActiveStage = stageName;
    }
    saveConfusions();
    if (stageName) {
      showSavedIndicator(stageName);
    }
  }

  // ---------------------------------------------------------------------------
  // VIEW NAVIGATION & SHARED WHY-THIS-MATTERS ACCORDION
  // ---------------------------------------------------------------------------

  const viewsMap = {
    home: document.getElementById('view-home'),
    workspace: document.getElementById('view-workspace'),
    capture: document.getElementById('view-capture'),
    clarify: document.getElementById('view-clarify'),
    act: document.getElementById('view-act'),
    reflect: document.getElementById('view-reflect'),
    understanding: document.getElementById('view-understanding'),
    revisit: document.getElementById('view-revisit')
  };

  function collapseAllWhyThisMatters() {
    document.querySelectorAll('.js-why-toggle').forEach(btn => {
      const panelId = btn.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      const chev = btn.querySelector('.why-matters-chevron');
      btn.setAttribute('aria-expanded', 'false');
      if (panel) panel.style.display = 'none';
      if (chev) chev.classList.remove('open');
    });
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.js-why-toggle');
    if (!btn) return;
    const panelId = btn.getAttribute('aria-controls');
    const panel = panelId ? document.getElementById(panelId) : null;
    if (!panel) return;
    const isExpanded = btn.getAttribute('aria-expanded') === 'true';
    const nextState = !isExpanded;
    btn.setAttribute('aria-expanded', nextState ? 'true' : 'false');
    panel.style.display = nextState ? 'block' : 'none';
    const chev = btn.querySelector('.why-matters-chevron');
    if (chev) chev.classList.toggle('open', nextState);
  });

  function showView(viewName, confusionId, options) {
    flushPendingSave();
    clearSavedIndicators();
    collapseAllWhyThisMatters();

    Object.values(viewsMap).forEach(v => {
      if (v) v.classList.remove('active');
    });

    if (confusionId === '__new__') {
      currentActiveId = null;
      isNewCaptureSession = true;
    } else if (confusionId !== undefined && confusionId !== null) {
      currentActiveId = confusionId;
      isNewCaptureSession = false;
    } else if (viewName !== 'capture') {
      isNewCaptureSession = false;
    }

    currentViewName = viewName;
    window.scrollTo({ top: 0, behavior: 'instant' });

    switch (viewName) {
      case 'workspace':
        viewsMap.workspace.classList.add('active');
        renderWorkspaceView();
        break;
      case 'capture':
        viewsMap.capture.classList.add('active');
        renderCaptureView(options);
        break;
      case 'clarify':
        viewsMap.clarify.classList.add('active');
        renderClarifyView();
        break;
      case 'act':
        viewsMap.act.classList.add('active');
        renderActView();
        break;
      case 'reflect':
        viewsMap.reflect.classList.add('active');
        renderReflectView();
        break;
      case 'understanding':
        viewsMap.understanding.classList.add('active');
        renderUnderstandingView();
        break;
      case 'revisit':
        viewsMap.revisit.classList.add('active');
        renderRevisitView();
        break;
      case 'home':
      default:
        currentActiveId = null;
        isNewCaptureSession = false;
        viewsMap.home.classList.add('active');
        renderHomeCards();
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // VIEW 1: HOME — MY CONFUSIONS
  // ---------------------------------------------------------------------------

  const confusionsListEl = document.getElementById('confusions-list');
  const emptyStateEl = document.getElementById('empty-state');

  function renderProgressItem(label, done) {
    return `
      <span class="progress-stage-pill ${done ? 'done' : ''}">
        <span class="progress-stage-icon" aria-hidden="true">${done ? '✓' : ''}</span>
        <span>${escapeHtml(label)}</span>
      </span>
    `;
  }

  function renderHomeCards() {
    confusionsListEl.innerHTML = '';

    if (confusions.length === 0) {
      emptyStateEl.style.display = 'block';
      confusionsListEl.style.display = 'none';
      return;
    }

    emptyStateEl.style.display = 'none';
    confusionsListEl.style.display = 'flex';

    confusions.forEach(card => {
      const cardEl = document.createElement('div');
      cardEl.className = 'confusion-card';
      cardEl.setAttribute('role', 'listitem');
      cardEl.tabIndex = 0;

      const sourceLabel = card.source || 'General';
      const currentStatus = card.understanding ? card.understanding.currentStatus : null;
      const understoodAt = card.understanding ? card.understanding.understoodAt : null;
      const statusMeta = getUnderstandingBadgeMeta(currentStatus);

      let understoodDateHtml = '';
      if (currentStatus === 'Understood' && understoodAt) {
        understoodDateHtml = `<span class="card-understood-date">Understood on ${escapeHtml(formatDateOnly(understoodAt))}</span>`;
      }

      let questionPreviewHtml = '';
      if (card.act && card.act.questionDraft && card.act.questionDraft.trim()) {
        questionPreviewHtml = `
          <div class="card-meta-row" style="color: var(--accent-hover); font-weight: 500;">
            <span>✎ My Question: “${escapeHtml(card.act.questionDraft)}”</span>
          </div>
        `;
      }

      cardEl.innerHTML = `
        <div class="card-top-row">
          <span class="card-source-badge">${escapeHtml(sourceLabel)}</span>
          <div class="card-status-group">
            <span class="status-badge ${statusMeta.className}">${escapeHtml(statusMeta.label)}</span>
            ${understoodDateHtml}
          </div>
        </div>
        <div class="card-note-text">${escapeHtml(card.note)}</div>
        ${questionPreviewHtml}
        <div class="card-progress-row" aria-label="Learning stages progress">
          ${renderProgressItem('Capture', isCaptureComplete(card))}
          <span class="progress-arrow" aria-hidden="true">→</span>
          ${renderProgressItem('Clarify', isClarifyComplete(card))}
          <span class="progress-arrow" aria-hidden="true">→</span>
          ${renderProgressItem('Act', isActComplete(card))}
          <span class="progress-arrow" aria-hidden="true">→</span>
          ${renderProgressItem('Reflect', isReflectComplete(card))}
        </div>
      `;

      cardEl.addEventListener('click', () => showView('workspace', card.id));
      cardEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showView('workspace', card.id);
        }
      });

      confusionsListEl.appendChild(cardEl);
    });
  }

  document.getElementById('btn-open-add').addEventListener('click', () => showView('capture', '__new__'));
  document.getElementById('btn-empty-add').addEventListener('click', () => showView('capture', '__new__'));

  document.getElementById('btn-reset-data').addEventListener('click', () => {
    if (confirm('Reset to the initial 2 sample confusions? This will replace your current cards.')) {
      confusions = createInitialSampleCards();
      saveConfusions();
      renderHomeCards();
      showToast('Sample confusions reloaded');
    }
  });

  // ---------------------------------------------------------------------------
  // VIEW 2: INDIVIDUAL CONFUSION WORKSPACE CONTROLLER
  // ---------------------------------------------------------------------------

  const workspaceSourceBadge = document.getElementById('workspace-source-badge');
  const workspaceActivityDate = document.getElementById('workspace-activity-date');
  const workspaceTitle = document.getElementById('workspace-title');
  const workspaceUnderstandingBadge = document.getElementById('workspace-understanding-badge');
  const workspaceUnderstandingDate = document.getElementById('workspace-understanding-date');
  const btnContinueLearning = document.getElementById('btn-continue-learning');

  function renderWorkspaceView() {
    const card = getActiveConfusion();
    if (!card) {
      showView('home');
      return;
    }

    workspaceSourceBadge.textContent = card.source || 'General';
    workspaceTitle.textContent = card.note;
    workspaceActivityDate.textContent = card.lastActivityAt
      ? `Last activity: ${formatDateOnly(card.lastActivityAt)}`
      : '';

    const u = card.understanding || {};
    const statusMeta = getUnderstandingBadgeMeta(u.currentStatus);
    workspaceUnderstandingBadge.textContent = statusMeta.label;
    workspaceUnderstandingBadge.className = `status-badge ${statusMeta.className}`;

    if (u.currentStatus === 'Understood' && u.understoodAt) {
      workspaceUnderstandingDate.textContent = `Understood on ${formatDateOnly(u.understoodAt)}`;
    } else if (u.currentStatus && u.updatedAt) {
      workspaceUnderstandingDate.textContent = `Updated ${formatDateOnly(u.updatedAt)}`;
    } else {
      workspaceUnderstandingDate.textContent = '';
    }

    const stageCompletion = {
      capture: isCaptureComplete(card),
      clarify: isClarifyComplete(card),
      act: isActComplete(card),
      reflect: isReflectComplete(card)
    };

    document.querySelectorAll('#workspace-stages-grid .stage-tile').forEach(tile => {
      const key = tile.getAttribute('data-stage');
      const done = Boolean(stageCompletion[key]);
      tile.classList.toggle('completed', done);
      const icon = tile.querySelector('.stage-check-icon');
      if (icon) icon.textContent = done ? '✓' : '';
    });

    const target = getContinueTarget(card);
    if (target === 'workspace') {
      btnContinueLearning.textContent = 'Continue Learning →';
    } else {
      btnContinueLearning.textContent = `Continue Learning (${getStageDisplayName(target)}) →`;
    }
  }

  document.getElementById('btn-back-from-workspace').addEventListener('click', () => showView('home'));
  document.getElementById('btn-workspace-home').addEventListener('click', () => showView('home'));
  document.getElementById('btn-open-understanding').addEventListener('click', () => showView('understanding'));
  document.getElementById('btn-open-revisit').addEventListener('click', () => showView('revisit'));

  document.getElementById('workspace-stages-grid').addEventListener('click', (e) => {
    const tile = e.target.closest('.stage-tile');
    if (!tile) return;
    const stage = tile.getAttribute('data-stage');
    if (stage) showView(stage);
  });

  btnContinueLearning.addEventListener('click', () => {
    const card = getActiveConfusion();
    if (!card) return;
    const target = getContinueTarget(card);
    showView(target === 'workspace' ? 'revisit' : target);
  });

  // ---------------------------------------------------------------------------
  // VIEW 3: STAGE 01 — CAPTURE CONTROLLER (Unified New & Edit + Autosave)
  // ---------------------------------------------------------------------------

  const captureCategoryPills = document.getElementById('capture-category-pills');
  const captureInputNote = document.getElementById('capture-input-note');
  const captureCapturedTime = document.getElementById('capture-captured-time');
  const btnBackTopCapture = document.getElementById('btn-back-top-capture');
  const btnCaptureBack = document.getElementById('btn-capture-back');

  function updateCaptureBackLabels() {
    if (!currentActiveId && isNewCaptureSession) {
      btnBackTopCapture.textContent = '← Back to My Confusions';
      btnCaptureBack.textContent = 'Back to My Confusions';
    } else {
      btnBackTopCapture.textContent = '← Back to Overview';
      btnCaptureBack.textContent = 'Back to Overview';
    }
  }

  function renderCaptureView() {
    const card = getActiveConfusion();
    pendingNewSource = '';

    if (card) {
      const selectedCat = card.source === 'General' ? '' : (card.source || '');
      captureCategoryPills.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.getAttribute('data-category') === selectedCat);
      });
      captureInputNote.value = card.note || '';
      if (card.createdAt) {
        captureCapturedTime.style.display = 'block';
        captureCapturedTime.textContent = `Captured: ${formatDateTime(card.createdAt)}`;
      } else {
        captureCapturedTime.style.display = 'none';
      }
    } else {
      // Brand new confusion
      captureCategoryPills.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('selected'));
      captureInputNote.value = '';
      captureCapturedTime.style.display = 'none';
      captureInputNote.focus();
    }

    updateCaptureBackLabels();
  }

  function createNewConfusionFromCapture(noteText) {
    const nowIso = new Date().toISOString();
    const newId = 'c_' + Date.now();
    const newCard = {
      id: newId,
      source: pendingNewSource || 'General',
      note: noteText,
      createdAt: nowIso,
      updatedAt: nowIso,
      lastActivityAt: nowIso,
      lastActiveStage: 'capture',
      clarify: {
        priorKnowledge: '',
        confusionDetails: [],
        primaryConcern: null
      },
      act: {
        helpPreferences: [],
        questionDraft: '',
        plannedStrategies: [],
        planUpdatedAt: null,
        planHistory: []
      },
      reflect: {
        actualStrategies: [],
        helpfulStrategies: [],
        noneHelped: false,
        timeSpent: '',
        nextDecision: '',
        updatedAt: null
      },
      understanding: {
        currentStatus: null,
        updatedAt: null,
        understoodAt: null,
        history: []
      }
    };

    confusions.unshift(newCard);
    currentActiveId = newId;
    isNewCaptureSession = false;
    saveConfusions();
    showSavedIndicator('capture');
    updateCaptureBackLabels();
    captureCapturedTime.style.display = 'block';
    captureCapturedTime.textContent = `Captured: ${formatDateTime(nowIso)}`;
  }

  captureCategoryPills.addEventListener('click', (e) => {
    const btn = e.target.closest('.category-btn');
    if (!btn) return;
    const cat = btn.getAttribute('data-category');
    const card = getActiveConfusion();

    if (card) {
      const nextSource = card.source === cat ? 'General' : cat;
      card.source = nextSource;
      captureCategoryPills.querySelectorAll('.category-btn').forEach(b => {
        b.classList.toggle('selected', b.getAttribute('data-category') === (nextSource === 'General' ? '' : nextSource));
      });
      touchCardActivity(card, 'capture');
    } else {
      pendingNewSource = pendingNewSource === cat ? '' : cat;
      captureCategoryPills.querySelectorAll('.category-btn').forEach(b => {
        b.classList.toggle('selected', b.getAttribute('data-category') === pendingNewSource);
      });
    }
  });

  function persistCaptureNoteNow() {
    const trimmed = captureInputNote.value.trim();
    if (!trimmed) return;
    const card = getActiveConfusion();
    if (card) {
      if (card.note !== trimmed) {
        card.note = trimmed;
        touchCardActivity(card, 'capture');
      }
    } else {
      createNewConfusionFromCapture(trimmed);
    }
  }

  captureInputNote.addEventListener('input', () => {
    scheduleTextSave(persistCaptureNoteNow, 250);
  });

  function handleCaptureBack() {
    flushPendingSave();
    const card = getActiveConfusion();
    if (card) {
      showView('workspace');
    } else {
      showView('home');
    }
  }

  btnBackTopCapture.addEventListener('click', handleCaptureBack);
  btnCaptureBack.addEventListener('click', handleCaptureBack);

  document.getElementById('btn-capture-next').addEventListener('click', () => {
    flushPendingSave();
    const trimmed = captureInputNote.value.trim();
    if (!trimmed) {
      captureInputNote.focus();
      showToast('Please enter a short confusion note first.');
      return;
    }
    if (!getActiveConfusion()) {
      createNewConfusionFromCapture(trimmed);
    }
    showView('clarify');
  });

  // ---------------------------------------------------------------------------
  // VIEW 4: STAGE 02 — CLARIFY CONTROLLER (2 Guided Steps)
  // ---------------------------------------------------------------------------

  const clarifySourceBadgeEl = document.getElementById('clarify-source-badge');
  const clarifyOriginalNoteEl = document.getElementById('clarify-original-note');
  const clarifyDatetimeBadgeEl = document.getElementById('clarify-datetime-badge');

  const q1TextareaEl = document.getElementById('q1-textarea');
  const q2KeywordsContainer = document.getElementById('q2-keywords');
  const q2SubOptionsBox = document.getElementById('q2-sub-options-box');
  const q2SelectedTagsContainer = document.getElementById('q2-selected-tags');
  const q2PrimaryConcernBox = document.getElementById('q2-primary-concern-box');
  const q2PrimaryConcernOptions = document.getElementById('q2-primary-concern-options');

  function renderClarifyView() {
    const card = getActiveConfusion();
    if (!card) {
      showView('home');
      return;
    }

    activeQ2Category = null;
    clarifySourceBadgeEl.textContent = card.source || 'General';
    clarifyOriginalNoteEl.textContent = card.note;
    clarifyDatetimeBadgeEl.textContent = card.createdAt ? `Captured: ${formatDateTime(card.createdAt)}` : '';

    q1TextareaEl.value = (card.clarify && card.clarify.priorKnowledge) || '';

    renderQ2Keywords();
    renderQ2SubOptions();
    renderQ2SelectedTags();
    renderQ2PrimaryConcern();
  }

  q1TextareaEl.addEventListener('input', () => {
    scheduleTextSave(() => {
      const card = getActiveConfusion();
      if (!card) return;
      card.clarify.priorKnowledge = q1TextareaEl.value;
      touchCardActivity(card, 'clarify');
    }, 250);
  });

  function renderQ2Keywords() {
    q2KeywordsContainer.querySelectorAll('.keyword-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-q2-cat') === activeQ2Category);
    });
  }

  q2KeywordsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.keyword-btn');
    if (!btn) return;
    const cat = btn.getAttribute('data-q2-cat');
    activeQ2Category = activeQ2Category === cat ? null : cat;
    renderQ2Keywords();
    renderQ2SubOptions();
  });

  function renderQ2SubOptions() {
    if (!activeQ2Category || !Q2_OPTIONS_MAP[activeQ2Category]) {
      q2SubOptionsBox.style.display = 'none';
      q2SubOptionsBox.innerHTML = '';
      return;
    }

    q2SubOptionsBox.style.display = 'flex';
    q2SubOptionsBox.innerHTML = '';

    const card = getActiveConfusion();
    const selectedList = card ? (card.clarify.confusionDetails || []) : [];

    Q2_OPTIONS_MAP[activeQ2Category].forEach(optText => {
      const isSelected = selectedList.includes(optText);
      const optBtn = document.createElement('button');
      optBtn.type = 'button';
      optBtn.className = 'sub-option-btn' + (isSelected ? ' selected' : '');
      optBtn.textContent = optText;
      optBtn.addEventListener('click', () => handleQ2OptionToggle(optText));
      q2SubOptionsBox.appendChild(optBtn);
    });
  }

  function handleQ2OptionToggle(optText) {
    const card = getActiveConfusion();
    if (!card) return;

    let list = Array.isArray(card.clarify.confusionDetails) ? [...card.clarify.confusionDetails] : [];
    if (list.includes(optText)) {
      list = list.filter(item => item !== optText);
    } else {
      if (list.length >= 2) {
        showToast('You can select up to 2 options. Tap a selected one to replace it.');
        return;
      }
      list.push(optText);
    }

    let primary = card.clarify.primaryConcern;
    if (!list.includes(primary)) primary = null;

    card.clarify.confusionDetails = list;
    card.clarify.primaryConcern = primary;
    touchCardActivity(card, 'clarify');

    renderQ2SubOptions();
    renderQ2SelectedTags();
    renderQ2PrimaryConcern();
  }

  function renderQ2SelectedTags() {
    const card = getActiveConfusion();
    const list = card ? (card.clarify.confusionDetails || []) : [];
    q2SelectedTagsContainer.innerHTML = '';

    list.forEach(optText => {
      const tag = document.createElement('span');
      tag.className = 'selected-tag';
      tag.innerHTML = `
        <span>${escapeHtml(optText)}</span>
        <button type="button" class="remove-tag-btn" aria-label="Remove tag">&times;</button>
      `;
      tag.querySelector('.remove-tag-btn').addEventListener('click', () => handleQ2OptionToggle(optText));
      q2SelectedTagsContainer.appendChild(tag);
    });
  }

  function renderQ2PrimaryConcern() {
    const card = getActiveConfusion();
    const list = card ? (card.clarify.confusionDetails || []) : [];

    if (list.length === 2) {
      q2PrimaryConcernBox.style.display = 'block';
      q2PrimaryConcernOptions.innerHTML = '';
      list.forEach((optText) => {
        const isChecked = card.clarify.primaryConcern === optText;
        const label = document.createElement('label');
        label.className = 'radio-row';
        label.innerHTML = `
          <input type="radio" name="q2_primary_radio" value="${escapeHtml(optText)}" ${isChecked ? 'checked' : ''} />
          <span>${escapeHtml(optText)}</span>
        `;
        label.querySelector('input').addEventListener('change', () => {
          card.clarify.primaryConcern = optText;
          touchCardActivity(card, 'clarify');
        });
        q2PrimaryConcernOptions.appendChild(label);
      });
    } else {
      q2PrimaryConcernBox.style.display = 'none';
      q2PrimaryConcernOptions.innerHTML = '';
    }
  }

  document.getElementById('btn-back-top-clarify').addEventListener('click', () => showView('workspace'));
  document.getElementById('btn-clarify-back').addEventListener('click', () => showView('workspace'));
  document.getElementById('btn-clarify-next').addEventListener('click', () => showView('act'));

  // ---------------------------------------------------------------------------
  // VIEW 5: STAGE 03 — ACT CONTROLLER (Help Pref + Prepare Question + Plan)
  // ---------------------------------------------------------------------------

  const actSourceBadge = document.getElementById('act-source-badge');
  const actOriginalNote = document.getElementById('act-original-note');

  const q3KeywordsContainer = document.getElementById('q3-keywords');
  const q3SubOptionsBox = document.getElementById('q3-sub-options-box');
  const q3SelectedTagsContainer = document.getElementById('q3-selected-tags');

  const btnToggleQuestionSection = document.getElementById('btn-toggle-question-section');
  const questionSectionChevron = document.getElementById('question-section-chevron');
  const questionSectionBody = document.getElementById('question-section-body');
  const questionSavedIndicator = document.getElementById('question-saved-indicator');
  const studentQuestionTextarea = document.getElementById('student-question-textarea');

  const btnToggleHint = document.getElementById('btn-toggle-hint');
  const hintContainer = document.getElementById('hint-container');
  const hintSectionsList = document.getElementById('hint-sections-list');

  const btnToggleSample = document.getElementById('btn-toggle-sample');
  const sampleQuestionContainer = document.getElementById('sample-question-container');
  const sampleQuestionText = document.getElementById('sample-question-text');
  const btnCopySample = document.getElementById('btn-copy-sample');

  const actPlannedOptions = document.getElementById('act-planned-options');
  const actPlanUpdatedNote = document.getElementById('act-plan-updated-note');
  const recommendationsContent = document.getElementById('recommendations-content');

  function renderActView() {
    const card = getActiveConfusion();
    if (!card) {
      showView('home');
      return;
    }

    activeQ3Category = null;
    isQuestionSectionOpen = false;
    isHintOpen = false;
    isSampleOpen = false;

    actSourceBadge.textContent = card.source || 'General';
    actOriginalNote.textContent = card.note;

    renderQ3Keywords();
    renderQ3SubOptions();
    renderQ3SelectedTags();

    updateQuestionSectionCollapse();
    studentQuestionTextarea.value = (card.act && card.act.questionDraft) || '';
    updateQuestionSavedBadge();
    hintContainer.style.display = 'none';
    sampleQuestionContainer.style.display = 'none';

    renderPlannedStrategies(card);
    renderSubtleRecommendations(card);
  }

  // --- Act Step 1: Help Preferences ---
  function renderQ3Keywords() {
    q3KeywordsContainer.querySelectorAll('.keyword-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-q3-cat') === activeQ3Category);
    });
  }

  q3KeywordsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.keyword-btn');
    if (!btn) return;
    const cat = btn.getAttribute('data-q3-cat');
    activeQ3Category = activeQ3Category === cat ? null : cat;
    renderQ3Keywords();
    renderQ3SubOptions();
  });

  function renderQ3SubOptions() {
    if (!activeQ3Category || !Q3_OPTIONS_MAP[activeQ3Category]) {
      q3SubOptionsBox.style.display = 'none';
      q3SubOptionsBox.innerHTML = '';
      return;
    }

    q3SubOptionsBox.style.display = 'flex';
    q3SubOptionsBox.innerHTML = '';

    const card = getActiveConfusion();
    const currentList = card ? (card.act.helpPreferences || []) : [];

    Q3_OPTIONS_MAP[activeQ3Category].forEach(optText => {
      const isSelected = currentList.includes(optText);
      const optBtn = document.createElement('button');
      optBtn.type = 'button';
      optBtn.className = 'sub-option-btn' + (isSelected ? ' selected' : '');
      optBtn.textContent = optText;
      optBtn.addEventListener('click', () => handleQ3OptionToggle(optText));
      q3SubOptionsBox.appendChild(optBtn);
    });
  }

  function handleQ3OptionToggle(optText) {
    const card = getActiveConfusion();
    if (!card) return;

    let list = Array.isArray(card.act.helpPreferences) ? [...card.act.helpPreferences] : [];
    if (list.includes(optText)) {
      list = list.filter(item => item !== optText);
    } else {
      if (list.length >= 2) {
        showToast('You can select up to 2 help preferences. Tap a selected one to replace it.');
        return;
      }
      list.push(optText);
    }

    card.act.helpPreferences = list;
    touchCardActivity(card, 'act');

    renderQ3SubOptions();
    renderQ3SelectedTags();
    renderSubtleRecommendations(card);
    if (isHintOpen) renderHints();
  }

  function renderQ3SelectedTags() {
    const card = getActiveConfusion();
    const list = card ? (card.act.helpPreferences || []) : [];
    q3SelectedTagsContainer.innerHTML = '';

    list.forEach(optText => {
      const tag = document.createElement('span');
      tag.className = 'selected-tag';
      tag.innerHTML = `
        <span>${escapeHtml(optText)}</span>
        <button type="button" class="remove-tag-btn" aria-label="Remove tag">&times;</button>
      `;
      tag.querySelector('.remove-tag-btn').addEventListener('click', () => handleQ3OptionToggle(optText));
      q3SelectedTagsContainer.appendChild(tag);
    });
  }

  // --- Act Step 2: Prepare Your Question (Collapsed by default, autosaving) ---
  function updateQuestionSectionCollapse() {
    const actionBadge = document.querySelector('.collapsible-arrow-badge');
    if (isQuestionSectionOpen) {
      questionSectionBody.style.display = 'block';
      questionSectionChevron.classList.add('open');
      btnToggleQuestionSection.setAttribute('aria-expanded', 'true');
      if (actionBadge) actionBadge.textContent = 'Close ▴';
    } else {
      questionSectionBody.style.display = 'none';
      questionSectionChevron.classList.remove('open');
      btnToggleQuestionSection.setAttribute('aria-expanded', 'false');
      if (actionBadge) actionBadge.textContent = 'Open ▾';
    }
  }

  function updateQuestionSavedBadge() {
    const card = getActiveConfusion();
    const hasQuestion = card && card.act && card.act.questionDraft && card.act.questionDraft.trim().length > 0;
    questionSavedIndicator.style.display = hasQuestion ? 'inline-block' : 'none';
  }

  btnToggleQuestionSection.addEventListener('click', () => {
    isQuestionSectionOpen = !isQuestionSectionOpen;
    updateQuestionSectionCollapse();
  });

  studentQuestionTextarea.addEventListener('input', () => {
    scheduleTextSave(() => {
      const card = getActiveConfusion();
      if (!card) return;
      card.act.questionDraft = studentQuestionTextarea.value;
      touchCardActivity(card, 'act');
      updateQuestionSavedBadge();
    }, 250);
  });

  btnToggleHint.addEventListener('click', () => {
    isHintOpen = !isHintOpen;
    if (isHintOpen) {
      hintContainer.style.display = 'block';
      renderHints();
    } else {
      hintContainer.style.display = 'none';
    }
  });

  function renderHints() {
    const card = getActiveConfusion();
    if (!card) return;

    hintSectionsList.innerHTML = '';
    let hasAnyResponse = false;

    if (card.clarify && card.clarify.priorKnowledge && card.clarify.priorKnowledge.trim()) {
      hasAnyResponse = true;
      const block = document.createElement('div');
      block.className = 'hint-block';
      block.innerHTML = `
        <span class="hint-block-label">&bull; What I know</span>
        <p class="hint-block-content">${escapeHtml(card.clarify.priorKnowledge.trim())}</p>
      `;
      hintSectionsList.appendChild(block);
    }

    if (card.clarify && card.clarify.confusionDetails && card.clarify.confusionDetails.length > 0) {
      hasAnyResponse = true;
      const block = document.createElement('div');
      block.className = 'hint-block';
      const itemsHtml = card.clarify.confusionDetails.map(opt => `<div>${escapeHtml(opt)}</div>`).join('');
      block.innerHTML = `
        <span class="hint-block-label">&bull; Where I'm stuck</span>
        <div class="hint-block-content">${itemsHtml}</div>
      `;
      hintSectionsList.appendChild(block);
    }

    if (card.act && card.act.helpPreferences && card.act.helpPreferences.length > 0) {
      hasAnyResponse = true;
      const block = document.createElement('div');
      block.className = 'hint-block';
      const itemsHtml = card.act.helpPreferences.map(opt => `<div>${escapeHtml(opt)}</div>`).join('');
      block.innerHTML = `
        <span class="hint-block-label">&bull; What I need</span>
        <div class="hint-block-content">${itemsHtml}</div>
      `;
      hintSectionsList.appendChild(block);
    }

    if (!hasAnyResponse) {
      const emptyNote = document.createElement('div');
      emptyNote.className = 'hint-block';
      emptyNote.innerHTML = `
        <p class="hint-block-content" style="color: var(--text-muted); font-style: italic;">
          No notes added yet. Anything you share in Clarify or Step 1 above will appear here to help you build your question.
        </p>
      `;
      hintSectionsList.appendChild(emptyNote);
    }
  }

  btnToggleSample.addEventListener('click', () => {
    isSampleOpen = !isSampleOpen;
    if (isSampleOpen) {
      sampleQuestionContainer.style.display = 'block';
      renderSampleQuestion();
    } else {
      sampleQuestionContainer.style.display = 'none';
    }
  });

  function renderSampleQuestion() {
    const card = getActiveConfusion();
    if (!card) return;
    sampleQuestionText.textContent = buildRuleBasedSampleQuestion(card);
  }

  function buildRuleBasedSampleQuestion(card) {
    const topic = card.note.trim();
    const prior = (card.clarify && card.clarify.priorKnowledge) ? card.clarify.priorKnowledge.trim() : '';

    let stuck = '';
    if (card.clarify && card.clarify.primaryConcern) {
      stuck = card.clarify.primaryConcern;
    } else if (card.clarify && card.clarify.confusionDetails && card.clarify.confusionDetails.length > 0) {
      stuck = card.clarify.confusionDetails[0];
    }

    const helpList = (card.act && Array.isArray(card.act.helpPreferences)) ? card.act.helpPreferences : [];

    const helpRequestMap = {
      "Explain the concept in a different way.": "Could you explain this concept in a different way?",
      "Explain an unfamiliar term.": "Could you help clarify what this unfamiliar term means?",
      "Walk through the explanation again.": "Could you walk through that explanation one more time?",
      "Give me a concrete example.": "Could you give a concrete example to help illustrate this?",
      "Give me a real-world example.": "Could you share a real-world example of how this applies?",
      "Show me a counterexample.": "Could you show a counterexample to clarify the boundaries?",
      "Compare two similar concepts.": "Could you clarify how this differs from similar concepts we covered?",
      "Explain how different concepts relate.": "Could you explain how these concepts connect to each other?",
      "Connect this topic to something I already know.": "Could you help connect this to what we learned previously?",
      "Walk me through the steps.": "Could you walk through the intermediate steps to make sure I followed?",
      "Show me how to apply the concept.": "Could you show how to approach applying this in practice?",
      "Help me figure out where to start.": "Could you help point me toward where to start?",
      "Check whether my understanding is correct.": "Could you check whether I am interpreting this correctly?",
      "Give feedback on my reasoning.": "Could you give quick feedback on whether my reasoning makes sense?",
      "Confirm whether I'm approaching the task correctly.": "Could you confirm whether my approach is on the right track?"
    };

    const helpActionShortMap = {
      "Explain the concept in a different way.": "explain it in a different way",
      "Explain an unfamiliar term.": "clarify what this term means",
      "Walk through the explanation again.": "walk through the explanation again",
      "Give me a concrete example.": "give a concrete example",
      "Give me a real-world example.": "provide a real-world example",
      "Show me a counterexample.": "show a counterexample",
      "Compare two similar concepts.": "compare this with similar concepts",
      "Explain how different concepts relate.": "explain how these concepts connect",
      "Connect this topic to something I already know.": "connect this to our earlier material",
      "Walk me through the steps.": "walk through the steps together",
      "Show me how to apply the concept.": "show how to apply this in practice",
      "Help me figure out where to start.": "point me toward where to start",
      "Check whether my understanding is correct.": "check whether my interpretation is correct",
      "Give feedback on my reasoning.": "give feedback on my reasoning",
      "Confirm whether I'm approaching the task correctly.": "confirm if my approach is on track"
    };

    let closingAsk = "Could you help me clarify this?";
    if (helpList.length === 1) {
      closingAsk = helpRequestMap[helpList[0]] || "Could you help me clarify this?";
    } else if (helpList.length >= 2) {
      const a1 = helpActionShortMap[helpList[0]] || helpList[0].toLowerCase().replace(/\.$/, '');
      const a2 = helpActionShortMap[helpList[1]] || helpList[1].toLowerCase().replace(/\.$/, '');
      closingAsk = `Could you ${a1}, and also ${a2}?`;
    }

    const stuckPhraseMap = {
      "I don't understand some terms.": `I'm having trouble understanding some of the terms used in "${topic}"`,
      "I don't understand what this concept means.": `I'm not quite clear on what the concept behind "${topic}" means`,
      "I don't understand what the material is saying.": `I'm struggling to unpack what the material is conveying about "${topic}"`,
      "I couldn't follow the explanation.": `I couldn't quite follow the explanation for "${topic}"`,
      "I don't understand why this conclusion follows.": `I don't completely see why this conclusion follows for "${topic}"`,
      "I understand individual steps, but not the overall reasoning.": `I can follow the individual steps for "${topic}", but I'm missing the overall reasoning`,
      "I can't connect this to what I already know.": `I'm having trouble connecting "${topic}" to what we covered previously`,
      "I can't distinguish it from similar concepts.": `I'm having trouble distinguishing "${topic}" from related concepts`,
      "I don't understand how different ideas relate.": `I don't quite see how the different ideas connect in "${topic}"`,
      "I understand the idea but don't know how to use it.": `I understand the idea behind "${topic}", but I'm unsure how to put it into practice`,
      "I don't know how to start the task.": `I'm stuck on how to get started with the task for "${topic}"`,
      "I don't understand what the assignment requires.": `I'm unclear on what is expected for "${topic}"`,
      "I'm not sure exactly what I don't understand.": `I'm feeling stuck on "${topic}", but I'm not sure where the breakdown happened`,
      "I'm not sure whether my understanding is correct.": `I think I might understand "${topic}", but I want to make sure I'm not misinterpreting it`,
      "I feel lost and don't know where to start.": `I'm feeling a bit lost on "${topic}" and don't know where to start`
    };

    const stuckLead = stuckPhraseMap[stuck] || `I'm having trouble with "${topic}"`;

    if (prior && stuck) {
      const priorClean = prior.replace(/^I understand that\s*/i, '');
      return `I understand that ${priorClean}, but ${stuckLead.charAt(0).toLowerCase() + stuckLead.slice(1)}. ${closingAsk}`;
    }

    if (prior && !stuck) {
      const priorClean = prior.replace(/^I understand that\s*/i, '');
      return `I understand that ${priorClean}, but I'm feeling a bit stuck on "${topic}". ${closingAsk}`;
    }

    if (stuck) {
      if (stuck === "I'm not sure exactly what I don't understand." || stuck === "I feel lost and don't know where to start.") {
        return `I'm having trouble with "${topic}", but I'm not sure exactly where I'm getting stuck. Could you help me work through it?`;
      }
      return `${stuckLead}. ${closingAsk}`;
    }

    if (helpList.length > 0) {
      return `I'm having trouble with "${topic}". ${closingAsk}`;
    }

    return `I'm having trouble understanding "${topic}". Could you help me clarify it?`;
  }

  btnCopySample.addEventListener('click', () => {
    const text = sampleQuestionText.textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      showToast('Sample question copied to clipboard!');
    }).catch(() => {
      showToast('Failed to copy. Please select and copy manually.');
    });
  });

  // --- Act Step 3: Planned Strategies (Checkboxes, separate from actual usage) ---
  function renderPlannedStrategies(card) {
    const planned = (card.act && Array.isArray(card.act.plannedStrategies)) ? card.act.plannedStrategies : [];
    actPlannedOptions.querySelectorAll('.checkbox-card-row').forEach(label => {
      const input = label.querySelector('input[type="checkbox"]');
      const isChecked = planned.includes(input.value);
      input.checked = isChecked;
      label.classList.toggle('checked', isChecked);
    });

    if (card.act && card.act.planUpdatedAt) {
      actPlanUpdatedNote.style.display = 'block';
      actPlanUpdatedNote.textContent = `Plan updated: ${formatDateTime(card.act.planUpdatedAt)}`;
    } else {
      actPlanUpdatedNote.style.display = 'none';
    }
  }

  actPlannedOptions.addEventListener('change', (e) => {
    const input = e.target;
    if (!input || input.type !== 'checkbox') return;
    const card = getActiveConfusion();
    if (!card) return;

    const checked = [];
    actPlannedOptions.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      if (cb.checked) checked.push(cb.value);
    });

    const nowIso = new Date().toISOString();
    card.act.plannedStrategies = checked;
    card.act.planUpdatedAt = nowIso;

    // Keep lightweight chronological plan history without flooding rapid clicks within 60s
    const hist = Array.isArray(card.act.planHistory) ? card.act.planHistory : [];
    const lastPlan = hist.length > 0 ? hist[hist.length - 1] : null;
    if (lastPlan && (Date.now() - new Date(lastPlan.timestamp).getTime() < 60000)) {
      lastPlan.strategies = [...checked];
      lastPlan.timestamp = nowIso;
    } else if (checked.length > 0) {
      hist.push({ strategies: [...checked], timestamp: nowIso });
    }
    card.act.planHistory = hist;

    touchCardActivity(card, 'act');
    renderPlannedStrategies(card);
  });

  // --- Subtle Reference Suggestions inside Act Step 3 ---
  function renderSubtleRecommendations(card) {
    if (!card) return;

    let primaryCat = null;
    const stuckList = (card.clarify && card.clarify.confusionDetails) || [];
    for (const [catKey, options] of Object.entries(Q2_OPTIONS_MAP)) {
      if (stuckList.some(s => options.includes(s))) {
        primaryCat = catKey;
        break;
      }
    }

    const recMap = {
      meaning: "Ask the instructor or a classmate for a simpler, everyday analogy, or review the course glossary definitions.",
      logic: "Ask for a step-by-step walkthrough or work through another concrete example slowly together.",
      connection: "Try comparing the two concepts side by side, or sketch a quick 2-box concept diagram showing how they link.",
      application: "Ask to see one completed worked example, or walk through just the very first step during office hours.",
      uncertain: "Ask someone to help identify the very first sentence or slide where you started to feel lost."
    };

    const helpList = (card.act && Array.isArray(card.act.helpPreferences)) ? card.act.helpPreferences : [];
    let html = '';

    if (helpList.length > 0) {
      html += `<div class="subtle-ref-item"><strong>Your requested help:</strong> ${helpList.map(h => escapeHtml(h)).join(' · ')}</div>`;
    }

    const suggestion = (primaryCat && recMap[primaryCat])
      ? recMap[primaryCat]
      : "Ask someone to help you pinpoint where the explanation first stopped making sense.";

    html += `<div class="subtle-ref-item">${escapeHtml(suggestion)}</div>`;
    recommendationsContent.innerHTML = html;
  }

  document.getElementById('btn-back-top-act').addEventListener('click', () => showView('workspace'));
  document.getElementById('btn-act-back').addEventListener('click', () => showView('workspace'));
  document.getElementById('btn-act-next').addEventListener('click', () => showView('reflect'));

  // ---------------------------------------------------------------------------
  // VIEW 6: STAGE 04 — REFLECT CONTROLLER (3 Guided Steps)
  // ---------------------------------------------------------------------------

  const reflectSourceBadge = document.getElementById('reflect-source-badge');
  const reflectOriginalNote = document.getElementById('reflect-original-note');
  const reflectMatrixEl = document.getElementById('reflect-strategy-matrix');
  const reflectNoneHelpedCheckbox = document.getElementById('reflect-none-helped-checkbox');
  const reflectTimeOptions = document.getElementById('reflect-time-options');
  const reflectDecisionOptions = document.getElementById('reflect-decision-options');
  const reflectContextualLinkBox = document.getElementById('reflect-contextual-link-box');
  const btnReflectContextualJump = document.getElementById('btn-reflect-contextual-jump');

  function renderReflectView() {
    const card = getActiveConfusion();
    if (!card) {
      showView('home');
      return;
    }

    reflectSourceBadge.textContent = card.source || 'General';
    reflectOriginalNote.textContent = card.note;

    renderReflectMatrix(card);
    renderReflectTimeAndDecision(card);
  }

  function renderReflectMatrix(card) {
    const refl = card.reflect || {};
    const actual = Array.isArray(refl.actualStrategies) ? refl.actualStrategies : [];
    const helpful = Array.isArray(refl.helpfulStrategies) ? refl.helpfulStrategies : [];
    const noneHelped = Boolean(refl.noneHelped);

    reflectMatrixEl.innerHTML = '';

    STRATEGIES_LIST.forEach(strategy => {
      const isUsed = actual.includes(strategy);
      const isHelpful = isUsed && helpful.includes(strategy);

      const row = document.createElement('div');
      row.className = 'reflect-matrix-row' + (isUsed ? ' is-used' : '');

      const usedLabel = document.createElement('label');
      usedLabel.className = 'reflect-used-label';
      usedLabel.innerHTML = `
        <input type="checkbox" ${isUsed ? 'checked' : ''} />
        <span>${escapeHtml(strategy)}</span>
      `;

      usedLabel.querySelector('input').addEventListener('change', (e) => {
        const checked = e.target.checked;
        let nextActual = [...(card.reflect.actualStrategies || [])];
        let nextHelpful = [...(card.reflect.helpfulStrategies || [])];

        if (checked) {
          if (!nextActual.includes(strategy)) nextActual.push(strategy);
        } else {
          nextActual = nextActual.filter(s => s !== strategy);
          // Prevent contradictory data: unchecking Actually Used removes Helped Me
          nextHelpful = nextHelpful.filter(s => s !== strategy);
        }

        card.reflect.actualStrategies = nextActual;
        card.reflect.helpfulStrategies = nextHelpful;
        card.reflect.updatedAt = new Date().toISOString();
        touchCardActivity(card, 'reflect');
        renderReflectMatrix(card);
      });

      const helpedBtn = document.createElement('button');
      helpedBtn.type = 'button';
      helpedBtn.className = 'reflect-helped-btn' + (isHelpful ? ' selected' : '');
      helpedBtn.disabled = !isUsed;
      helpedBtn.setAttribute('aria-pressed', isHelpful ? 'true' : 'false');
      helpedBtn.textContent = isHelpful ? '✓ Helped me' : 'Helped me';

      helpedBtn.addEventListener('click', () => {
        if (!isUsed) return;
        let nextHelpful = [...(card.reflect.helpfulStrategies || [])];
        if (nextHelpful.includes(strategy)) {
          nextHelpful = nextHelpful.filter(s => s !== strategy);
        } else {
          nextHelpful.push(strategy);
          card.reflect.noneHelped = false;
        }
        card.reflect.helpfulStrategies = nextHelpful;
        card.reflect.updatedAt = new Date().toISOString();
        touchCardActivity(card, 'reflect');
        renderReflectMatrix(card);
      });

      row.appendChild(usedLabel);
      row.appendChild(helpedBtn);
      reflectMatrixEl.appendChild(row);
    });

    reflectNoneHelpedCheckbox.checked = noneHelped;
    const noneLabel = reflectNoneHelpedCheckbox.closest('.checkbox-card-row');
    if (noneLabel) noneLabel.classList.toggle('checked', noneHelped);
  }

  reflectNoneHelpedCheckbox.addEventListener('change', () => {
    const card = getActiveConfusion();
    if (!card) return;
    const isNone = reflectNoneHelpedCheckbox.checked;
    card.reflect.noneHelped = isNone;
    if (isNone) {
      card.reflect.helpfulStrategies = [];
    }
    card.reflect.updatedAt = new Date().toISOString();
    touchCardActivity(card, 'reflect');
    renderReflectMatrix(card);
  });

  function renderReflectTimeAndDecision(card) {
    const refl = card.reflect || {};

    reflectTimeOptions.querySelectorAll('.sub-option-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.getAttribute('data-time') === refl.timeSpent);
    });

    reflectDecisionOptions.querySelectorAll('.sub-option-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.getAttribute('data-decision') === refl.nextDecision);
    });

    if (refl.nextDecision === 'Try another strategy.') {
      reflectContextualLinkBox.style.display = 'block';
      btnReflectContextualJump.textContent = 'Go to Act to choose another strategy →';
      btnReflectContextualJump.onclick = () => showView('act');
    } else if (refl.nextDecision === 'Rethink my question.') {
      reflectContextualLinkBox.style.display = 'block';
      btnReflectContextualJump.textContent = 'Go to Clarify to revisit your gap →';
      btnReflectContextualJump.onclick = () => showView('clarify');
    } else {
      reflectContextualLinkBox.style.display = 'none';
      btnReflectContextualJump.onclick = null;
    }
  }

  reflectTimeOptions.addEventListener('click', (e) => {
    const btn = e.target.closest('.sub-option-btn');
    if (!btn) return;
    const card = getActiveConfusion();
    if (!card) return;
    const val = btn.getAttribute('data-time');
    card.reflect.timeSpent = card.reflect.timeSpent === val ? '' : val;
    card.reflect.updatedAt = new Date().toISOString();
    touchCardActivity(card, 'reflect');
    renderReflectTimeAndDecision(card);
  });

  reflectDecisionOptions.addEventListener('click', (e) => {
    const btn = e.target.closest('.sub-option-btn');
    if (!btn) return;
    const card = getActiveConfusion();
    if (!card) return;
    const val = btn.getAttribute('data-decision');
    card.reflect.nextDecision = card.reflect.nextDecision === val ? '' : val;
    card.reflect.updatedAt = new Date().toISOString();
    touchCardActivity(card, 'reflect');
    renderReflectTimeAndDecision(card);
  });

  document.getElementById('btn-back-top-reflect').addEventListener('click', () => showView('workspace'));
  document.getElementById('btn-reflect-back').addEventListener('click', () => showView('workspace'));
  document.getElementById('btn-reflect-next').addEventListener('click', () => showView('understanding'));

  // ---------------------------------------------------------------------------
  // VIEW 7: UNDERSTANDING CHECK CONTROLLER
  // ---------------------------------------------------------------------------

  const understandingSourceBadge = document.getElementById('understanding-source-badge');
  const understandingOriginalNote = document.getElementById('understanding-original-note');
  const understandingOptions = document.getElementById('understanding-options');
  const understandingUnderstoodPanel = document.getElementById('understanding-understood-panel');
  const understandingMoveForwardPanel = document.getElementById('understanding-move-forward-panel');
  const understandingRecordedDateText = document.getElementById('understanding-recorded-date-text');
  const understandingHistoryCard = document.getElementById('understanding-history-card');
  const btnToggleUHistory = document.getElementById('btn-toggle-u-history');
  const uHistoryChevron = document.getElementById('u-history-chevron');
  const uHistoryList = document.getElementById('u-history-list');

  function renderUnderstandingView() {
    const card = getActiveConfusion();
    if (!card) {
      showView('home');
      return;
    }

    isUHistoryOpen = false;
    uHistoryList.style.display = 'none';
    uHistoryChevron.classList.remove('open');
    btnToggleUHistory.setAttribute('aria-expanded', 'false');

    understandingSourceBadge.textContent = card.source || 'General';
    understandingOriginalNote.textContent = card.note;
    renderUnderstandingPanels(card);
  }

  function renderUnderstandingPanels(card) {
    const u = card.understanding || {};
    const current = u.currentStatus;

    understandingOptions.querySelectorAll('.sub-option-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.getAttribute('data-understanding') === current);
    });

    if (current === 'Understood') {
      understandingUnderstoodPanel.style.display = 'block';
      understandingMoveForwardPanel.style.display = 'none';
      understandingRecordedDateText.textContent = u.understoodAt
        ? `Understood on ${formatDateTime(u.understoodAt)}`
        : 'Marked as Understood.';
    } else if (current === 'Partially Understood' || current === 'Still Confused') {
      understandingUnderstoodPanel.style.display = 'none';
      understandingMoveForwardPanel.style.display = 'block';
    } else {
      understandingUnderstoodPanel.style.display = 'none';
      understandingMoveForwardPanel.style.display = 'none';
    }

    const hist = Array.isArray(u.history) ? u.history : [];
    if (hist.length > 0) {
      understandingHistoryCard.style.display = 'block';
      uHistoryList.innerHTML = [...hist].reverse().map(item => `
        <div class="history-entry">
          <div class="history-entry-top">
            <span class="history-entry-title">${escapeHtml(item.status)}</span>
            <span class="card-date-time">${escapeHtml(formatDateTime(item.timestamp))}</span>
          </div>
        </div>
      `).join('');
    } else {
      understandingHistoryCard.style.display = 'none';
    }
  }

  understandingOptions.addEventListener('click', (e) => {
    const btn = e.target.closest('.sub-option-btn');
    if (!btn) return;
    const card = getActiveConfusion();
    if (!card) return;

    const statusValue = btn.getAttribute('data-understanding');
    const nowIso = new Date().toISOString();
    const hist = Array.isArray(card.understanding.history) ? [...card.understanding.history] : [];
    const lastEntry = hist.length > 0 ? hist[hist.length - 1] : null;

    // Avoid spamming duplicate history if user accidentally clicks rapidly within 10s,
    // unless status actually changed from a different saved assessment or >60s elapsed
    if (lastEntry && (Date.now() - new Date(lastEntry.timestamp).getTime() < 10000) && lastEntry.status !== statusValue) {
      lastEntry.status = statusValue;
      lastEntry.timestamp = nowIso;
    } else if (!lastEntry || lastEntry.status !== statusValue || (Date.now() - new Date(lastEntry.timestamp).getTime() >= 60000)) {
      hist.push({ status: statusValue, timestamp: nowIso });
    }

    card.understanding.currentStatus = statusValue;
    card.understanding.updatedAt = nowIso;
    card.understanding.history = hist;

    if (statusValue === 'Understood') {
      card.understanding.understoodAt = nowIso;
    }

    // Do not overwrite lastActiveStage (Capture/Clarify/Act/Reflect) with understanding
    touchCardActivity(card, null);
    showSavedIndicator('understanding');
    renderUnderstandingPanels(card);
  });

  btnToggleUHistory.addEventListener('click', () => {
    isUHistoryOpen = !isUHistoryOpen;
    uHistoryList.style.display = isUHistoryOpen ? 'flex' : 'none';
    uHistoryChevron.classList.toggle('open', isUHistoryOpen);
    btnToggleUHistory.setAttribute('aria-expanded', isUHistoryOpen ? 'true' : 'false');
  });

  document.getElementById('btn-move-try-another').addEventListener('click', () => showView('act'));
  document.getElementById('btn-move-rethink-question').addEventListener('click', () => showView('clarify'));
  document.getElementById('btn-back-top-understanding').addEventListener('click', () => showView('workspace'));
  document.getElementById('btn-understanding-overview').addEventListener('click', () => showView('workspace'));

  // ---------------------------------------------------------------------------
  // VIEW 8: QUICK REVISIT CONTROLLER
  // ---------------------------------------------------------------------------

  const btnToggleRevisitInfo = document.getElementById('btn-toggle-revisit-info');
  const revisitInfoBox = document.getElementById('revisit-info-box');
  const revisitSnapshotList = document.getElementById('revisit-snapshot-list');
  const btnToggleLearningHistory = document.getElementById('btn-toggle-learning-history');
  const learningHistoryChevron = document.getElementById('learning-history-chevron');
  const learningHistoryList = document.getElementById('learning-history-list');

  function getLastMeaningfulStageLabel(card) {
    if (card.lastActiveStage) return getStageDisplayName(card.lastActiveStage);
    if (isReflectComplete(card)) return '04 Reflect';
    if (isActComplete(card)) return '03 Act';
    if (isClarifyComplete(card)) return '02 Clarify';
    if (isCaptureComplete(card)) return '01 Capture';
    return 'Not started';
  }

  function renderRevisitView() {
    const card = getActiveConfusion();
    if (!card) {
      showView('home');
      return;
    }

    isRevisitInfoOpen = false;
    isLearningHistoryOpen = false;
    revisitInfoBox.style.display = 'none';
    btnToggleRevisitInfo.setAttribute('aria-expanded', 'false');
    learningHistoryList.style.display = 'none';
    learningHistoryChevron.classList.remove('open');
    btnToggleLearningHistory.setAttribute('aria-expanded', 'false');

    const act = card.act || {};
    const refl = card.reflect || {};
    const u = card.understanding || {};
    const statusMeta = getUnderstandingBadgeMeta(u.currentStatus);

    const rows = [
      {
        term: 'Original confusion',
        val: `${card.note} (${card.source || 'General'})`,
        muted: false
      },
      {
        term: 'Last meaningful stage',
        val: getLastMeaningfulStageLabel(card),
        muted: false
      }
    ];

    // Help preference or planned strategies, if available
    const planParts = [];
    if (Array.isArray(act.helpPreferences) && act.helpPreferences.length > 0) {
      planParts.push(`Help wanted: ${act.helpPreferences.join(' · ')}`);
    }
    if (Array.isArray(act.plannedStrategies) && act.plannedStrategies.length > 0) {
      planParts.push(`Planned: ${act.plannedStrategies.join(' · ')}`);
    }
    if (planParts.length > 0) {
      rows.push({
        term: 'Help preference & planned strategies',
        val: planParts.join(' | '),
        muted: false
      });
    }

    // Actual strategies used, if available
    if (Array.isArray(refl.actualStrategies) && refl.actualStrategies.length > 0) {
      rows.push({
        term: 'Actual strategies used',
        val: refl.actualStrategies.join(' · '),
        muted: false
      });
    }

    // Strategies marked helpful
    if (refl.noneHelped) {
      rows.push({
        term: 'Strategies marked helpful',
        val: 'None of these helped yet.',
        muted: false
      });
    } else if (Array.isArray(refl.helpfulStrategies) && refl.helpfulStrategies.length > 0) {
      rows.push({
        term: 'Strategies marked helpful',
        val: refl.helpfulStrategies.join(' · '),
        muted: false
      });
    }

    // Latest reflection decision
    if (refl.nextDecision || refl.timeSpent) {
      const decParts = [];
      if (refl.nextDecision) decParts.push(`Next: ${refl.nextDecision}`);
      if (refl.timeSpent) decParts.push(`Time spent: ${refl.timeSpent}`);
      rows.push({
        term: 'Latest reflection decision',
        val: decParts.join(' · '),
        muted: false
      });
    }

    rows.push({
      term: 'Current understanding status',
      val: statusMeta.label,
      muted: !u.currentStatus
    });

    if (card.lastActivityAt) {
      rows.push({
        term: 'Last activity date',
        val: formatDateTime(card.lastActivityAt),
        muted: false
      });
    }

    if (u.understoodAt) {
      rows.push({
        term: 'Understanding date',
        val: `Understood on ${formatDateTime(u.understoodAt)}`,
        muted: false
      });
    }

    revisitSnapshotList.innerHTML = rows.map(r => `
      <div class="snapshot-row">
        <dt class="snapshot-term">${escapeHtml(r.term)}</dt>
        <dd class="snapshot-val ${r.muted ? 'muted' : ''}">${escapeHtml(r.val)}</dd>
      </div>
    `).join('');

    renderLearningHistoryList(card);
  }

  function renderLearningHistoryList(card) {
    const events = [];

    if (card.createdAt) {
      events.push({
        timestamp: card.createdAt,
        type: 'Capture',
        title: card.note,
        note: `Source: ${card.source || 'General'}`
      });
    }

    // Strategy planning updates
    const planHist = (card.act && Array.isArray(card.act.planHistory)) ? card.act.planHistory : [];
    if (planHist.length > 0) {
      planHist.forEach(p => {
        if (Array.isArray(p.strategies) && p.strategies.length > 0) {
          events.push({
            timestamp: p.timestamp,
            type: 'Strategy Plan',
            title: p.strategies.join(' · '),
            note: 'Planned strategies updated'
          });
        }
      });
    } else if (card.act && card.act.planUpdatedAt && card.act.plannedStrategies && card.act.plannedStrategies.length > 0) {
      events.push({
        timestamp: card.act.planUpdatedAt,
        type: 'Strategy Plan',
        title: card.act.plannedStrategies.join(' · '),
        note: 'Planned strategies updated'
      });
    }

    // Reflection record
    const refl = card.reflect || {};
    if (refl.updatedAt && isReflectComplete(card)) {
      const titleParts = [];
      if (refl.actualStrategies && refl.actualStrategies.length > 0) {
        titleParts.push(`Used: ${refl.actualStrategies.join(', ')}`);
      }
      if (refl.helpfulStrategies && refl.helpfulStrategies.length > 0) {
        titleParts.push(`Helped: ${refl.helpfulStrategies.join(', ')}`);
      } else if (refl.noneHelped) {
        titleParts.push('None helped');
      }
      const noteParts = [];
      if (refl.timeSpent) noteParts.push(`Time: ${refl.timeSpent}`);
      if (refl.nextDecision) noteParts.push(`Next: ${refl.nextDecision}`);

      events.push({
        timestamp: refl.updatedAt,
        type: 'Reflection',
        title: titleParts.join(' · ') || 'Reflection updated',
        note: noteParts.join(' · ')
      });
    }

    // Understanding status changes
    const uHist = (card.understanding && Array.isArray(card.understanding.history)) ? card.understanding.history : [];
    uHist.forEach(h => {
      events.push({
        timestamp: h.timestamp,
        type: 'Understanding Check',
        title: h.status,
        note: ''
      });
    });

    events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (events.length === 0) {
      learningHistoryList.innerHTML = `<div class="history-entry"><div class="history-entry-note">No learning history recorded yet.</div></div>`;
      return;
    }

    learningHistoryList.innerHTML = events.map(ev => `
      <div class="history-entry">
        <div class="history-entry-top">
          <span class="history-entry-type">${escapeHtml(ev.type)}</span>
          <span class="card-date-time">${escapeHtml(formatDateTime(ev.timestamp))}</span>
        </div>
        <div class="history-entry-title">${escapeHtml(ev.title)}</div>
        ${ev.note ? `<div class="history-entry-note">${escapeHtml(ev.note)}</div>` : ''}
      </div>
    `).join('');
  }

  btnToggleRevisitInfo.addEventListener('click', () => {
    isRevisitInfoOpen = !isRevisitInfoOpen;
    revisitInfoBox.style.display = isRevisitInfoOpen ? 'block' : 'none';
    btnToggleRevisitInfo.setAttribute('aria-expanded', isRevisitInfoOpen ? 'true' : 'false');
  });

  btnToggleLearningHistory.addEventListener('click', () => {
    isLearningHistoryOpen = !isLearningHistoryOpen;
    learningHistoryList.style.display = isLearningHistoryOpen ? 'flex' : 'none';
    learningHistoryChevron.classList.toggle('open', isLearningHistoryOpen);
    btnToggleLearningHistory.setAttribute('aria-expanded', isLearningHistoryOpen ? 'true' : 'false');
  });

  document.getElementById('btn-revisit-continue').addEventListener('click', () => {
    const card = getActiveConfusion();
    if (!card) {
      showView('home');
      return;
    }
    const target = (card.lastActiveStage && ['capture', 'clarify', 'act', 'reflect'].includes(card.lastActiveStage))
      ? card.lastActiveStage
      : 'workspace';
    showView(target);
  });

  document.getElementById('btn-revisit-overview').addEventListener('click', () => showView('workspace'));
  document.getElementById('btn-back-from-revisit').addEventListener('click', () => showView('workspace'));

  // ---------------------------------------------------------------------------
  // DELETE MODAL CONTROLLER
  // ---------------------------------------------------------------------------

  const modalDeleteEl = document.getElementById('modal-delete');
  const btnDeleteConfusionEl = document.getElementById('btn-delete-confusion');
  const btnCancelDeleteEl = document.getElementById('btn-cancel-delete');
  const btnConfirmDeleteEl = document.getElementById('btn-confirm-delete');

  btnDeleteConfusionEl.addEventListener('click', () => {
    cardPendingDeleteId = currentActiveId;
    modalDeleteEl.classList.add('active');
  });

  btnCancelDeleteEl.addEventListener('click', () => {
    cardPendingDeleteId = null;
    modalDeleteEl.classList.remove('active');
  });

  btnConfirmDeleteEl.addEventListener('click', () => {
    if (!cardPendingDeleteId) return;
    confusions = confusions.filter(c => c.id !== cardPendingDeleteId);
    saveConfusions();
    cardPendingDeleteId = null;
    modalDeleteEl.classList.remove('active');
    showView('home');
    showToast('Confusion card deleted');
  });

  modalDeleteEl.addEventListener('click', (e) => {
    if (e.target === modalDeleteEl) {
      modalDeleteEl.classList.remove('active');
      cardPendingDeleteId = null;
    }
  });

  // ---------------------------------------------------------------------------
  // TOAST & UTILITIES
  // ---------------------------------------------------------------------------

  const toastEl = document.getElementById('app-toast');
  let toastTimer = null;

  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.classList.add('show');
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2400);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ---------------------------------------------------------------------------
  // INITIALIZATION
  // ---------------------------------------------------------------------------

  function init() {
    loadConfusions();
    showView('home');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
