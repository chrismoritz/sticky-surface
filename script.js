/* ==========================================================================
   Aurelia GT — Sticky Surface Prototype
   One reusable sticky component, reconfigured entirely through state.
   ========================================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const embedded = new URLSearchParams(location.search).get('embedded') === '1';

  /* ------------------------------------------------------------------ *
   * Reference data
   * ------------------------------------------------------------------ */

  const NAV_SECTIONS = [
    { id: 'design', label: 'Design' },
    { id: 'interior', label: 'Interior' },
    { id: 'technology', label: 'Technology' },
    { id: 'performance', label: 'Performance' },
  ];

  const ALL_SECTIONS = [
    { id: 'hero', label: 'Overview' },
    { id: 'overview', label: 'Overview' },
    { id: 'design', label: 'Design' },
    { id: 'interior', label: 'Interior' },
    { id: 'technology', label: 'Technology' },
    { id: 'performance', label: 'Performance' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'shopping', label: 'Shopping' },
  ];

  const CONTEXTUAL_CTA = {
    hero: 'Schedule a Test Drive',
    overview: 'Schedule a Test Drive',
    design: 'Explore Gallery',
    interior: 'Interior Features',
    technology: 'Learn About DriveSense',
    performance: 'View Specs',
    gallery: 'Explore Gallery',
    shopping: 'Search Inventory',
  };

  const ROTATING_MESSAGES = [
    'Explore Formula 1',
    'Meet our latest concept',
    'Search available inventory',
    'Discover current offers',
  ];

  const SUGGESTED_PROMPTS = [
    'Help me find a vehicle',
    'What EVs are available?',
    'Find a dealer',
  ];

  const CHAT_WINDOW_GREETING = "Hi! I'm here to help with anything about the Aurelia GT — test drives, trims, or your nearest dealer.";
  const CHAT_WINDOW_REPLIES = [
    'Got it — let me pull that up for you.',
    "Good question. I'll connect you with a product specialist who can go deeper.",
    "Thanks, I've noted that down.",
  ];

  const INVENTORY = [
    '2026 Aurelia GT — Slate Grey, RWD',
    '2026 Aurelia GT — Performance, AWD',
    '2026 Aurelia GT — Alpine White, AWD',
    '2025 Aurelia GT — Certified Pre-Owned',
    'V-ONE Concept — Not yet available',
  ];

  // Drives entrance, minimize/restore, and other CSS-transition timing —
  // see the --dur-fast/--dur-med custom properties in styles.css.
  const ANIM_SPEEDS = {
    snappy: { fast: '110ms', med: '180ms' },
    standard: { fast: '160ms', med: '260ms' },
    relaxed: { fast: '220ms', med: '420ms' },
  };

  const PRESETS = [
    {
      id: 'current-state',
      label: 'Current State',
      hint: 'Basic footer + separate chat bubble',
      version: 'today',
      group: 'baseline',
      patch: { legacyMode: true, presentation: 'full-width', chat: 'off', search: 'off', scrollSpy: 'off' },
    },
    {
      id: 'tesla-inspired',
      label: 'Tesla-Inspired',
      hint: 'Schedule a Test Drive | Ask a Question',
      version: 'v1',
      group: 'compositions',
      patch: {
        legacyMode: false, presentation: 'floating', scrollSpy: 'off',
        primaryType: 'message-cta', primary: { message: '', cta: { label: 'Schedule a Test Drive' } },
        chat: 'question', search: 'off',
      },
    },
    {
      id: 'hvb-chat',
      label: 'HVB + Chat',
      hint: 'Search Inventory | Chat',
      version: 'v1',
      group: 'utilities',
      patch: {
        legacyMode: false, scrollSpy: 'off',
        primaryType: 'message-cta', primary: { message: '', cta: { label: 'Search Inventory', href: '#shopping' } },
        chat: 'label', search: 'off',
      },
    },
    {
      id: 'brand-story',
      label: 'Brand Story',
      hint: 'Formula 1 | Explore the Team',
      version: 'v1',
      group: 'compositions',
      patch: {
        legacyMode: false, scrollSpy: 'off', ctaStyle: 'text-link',
        primaryType: 'message-cta', primary: { message: 'Formula 1', cta: { label: 'Explore the Team' } },
        chat: 'off', search: 'off',
      },
    },
    {
      id: 'search-utility',
      label: 'Search Utility',
      hint: 'Search [input field]',
      version: 'v1',
      group: 'utilities',
      patch: { legacyMode: false, scrollSpy: 'off', primaryType: 'search-inline', chat: 'off', search: 'off' },
    },
    {
      id: 'message-cta',
      label: 'Message + CTA',
      hint: 'Discover the latest | Explore',
      version: 'v1',
      group: 'compositions',
      patch: {
        legacyMode: false, scrollSpy: 'off',
        primaryType: 'message-cta', primary: { message: 'Discover the latest', cta: { label: 'Explore' } },
        chat: 'off', search: 'off',
      },
    },
    {
      id: 'section-navigator',
      label: 'Section Navigator',
      hint: 'Design | Interior | Technology | Performance',
      version: 'v2',
      group: 'compositions',
      patch: { legacyMode: false, scrollSpy: 'navigation', chat: 'off', search: 'off' },
    },
    {
      id: 'survey-integration',
      label: 'Survey Integration',
      hint: 'Help us improve our site | Take Survey | ×',
      version: 'v2',
      group: 'prompts',
      patch: {
        legacyMode: false, scrollSpy: 'off',
        primaryType: 'message-cta', primary: { message: 'Discover the latest', cta: { label: 'Explore' } },
        chat: 'off', search: 'off',
      },
      after() { scheduleSurvey(); },
    },
    {
      id: 'quote-prompt',
      label: 'Quote Prompt (Returning Visitor)',
      hint: 'Welcome back | Get My Quote | ×',
      version: 'v2',
      group: 'prompts',
      patch: {
        legacyMode: false, scrollSpy: 'off',
        primaryType: 'message-cta', primary: { message: 'Discover the latest', cta: { label: 'Explore' } },
        chat: 'off', search: 'off',
      },
      after() {
        state.hasQualifyingAction = true;
        state.quoteDismissed = false;
        state.quoteSubmitted = false;
        scheduleQuote();
      },
      note: 'Simulates a visitor who clicked a CTA on an earlier visit and has just returned to the tab.',
    },
    {
      id: 'mobile-compact',
      label: 'Mobile Compact',
      hint: 'Test Drive | Chat — reduced arrangement',
      version: 'v1',
      group: 'compositions',
      patch: {
        legacyMode: false, presentation: 'compact', scrollSpy: 'off',
        primaryType: 'message-cta', primary: { message: '', cta: { label: 'Test Drive' } },
        chat: 'icon', search: 'off',
      },
      note: 'Narrow the browser window to see the mobile composition live.',
    },
    {
      id: 'stress-test',
      label: 'Persistent UI Stress Test',
      hint: 'Everything at once — why orchestration matters',
      version: 'v2',
      group: 'stress',
      patch: {
        legacyMode: false, scrollSpy: 'navigation',
        primaryType: 'message-cta', primary: { message: '', cta: { label: 'Schedule a Test Drive' } },
        chat: 'question', search: 'icon',
      },
      after() {
        state.hasQualifyingAction = true;
        state.quoteDismissed = false;
        state.quoteSubmitted = false;
        triggerPrivacy();
        scheduleSurvey();
        scheduleQuote();
      },
    },
    {
      id: 'chat-search',
      label: 'Chat + Search',
      hint: 'Test Drive | Ask a Question | Search — each utility in its own color',
      version: 'v1',
      group: 'utilities',
      patch: {
        legacyMode: false, presentation: 'floating', scrollSpy: 'off',
        primaryType: 'message-cta', primary: { message: '', cta: { label: 'Test Drive' } },
        chat: 'question', search: 'label',
      },
      note: 'Focus the chat field or open Search: the whole surface tints to that utility\'s color. Send a question to hand off to the corner chat window; Esc or clicking away closes things.',
    },
    {
      id: 'survey-quote-handoff',
      label: 'Survey → Quote Handoff',
      hint: 'Survey arrives, then a returning-visitor Quote takes over',
      version: 'v2',
      group: 'prompts',
      patch: {
        legacyMode: false, presentation: 'floating', scrollSpy: 'off',
        primaryType: 'message-cta', primary: { message: 'Discover the latest', cta: { label: 'Explore' } },
        chat: 'off', search: 'off',
      },
      after() {
        state.hasQualifyingAction = true;
        state.quoteDismissed = false;
        state.quoteSubmitted = false;
        scheduleSurvey();
        // Staggered so the takeover itself is visible: the Survey settles in
        // first, then the higher-priority Quote animates over it.
        scheduleOverlay('quote', promptDelayMs() + HANDOFF_GAP_MS, 'return visit');
      },
      note: 'The Survey arrives after the Prompt delay; a few seconds later the returning-visitor Quote takes over (it outranks Survey). Dismiss the Quote and the Survey comes back after a short beat.',
    },
    {
      id: 'kitchen-sink',
      label: 'Kitchen Sink (Overload)',
      hint: 'Nav + Chat + Search all at once — the busy edge case',
      version: 'edge-case',
      group: 'stress',
      patch: {
        legacyMode: false, presentation: 'full-width', scrollSpy: 'navigation',
        chat: 'suggested', search: 'compact',
      },
      note: 'Everything is asking for room at once. Try "Busy / Overflow Edge Cases" → Auto-collapse to compare raw overflow against priority-ordered collapsing.',
    },
  ];

  const PRESET_GROUPS = [
    { id: 'baseline', label: 'Baseline' },
    { id: 'compositions', label: 'Compositions' },
    { id: 'utilities', label: 'Chat & search', hint: 'Each utility has its own color' },
    { id: 'prompts', label: 'Intercept prompts', hint: 'Arrive after the Prompt delay' },
    { id: 'stress', label: 'Orchestration & edge cases' },
  ];

  // Gap between the Survey and the Quote in the handoff preset.
  const HANDOFF_GAP_MS = 4000;

  /* ------------------------------------------------------------------ *
   * State
   * ------------------------------------------------------------------ */

  const state = {
    legacyMode: true,
    presentation: 'full-width',
    surface: 'opaque',
    visibility: 'always',
    sectionReachTarget: 'design',
    entrance: 'fade',
    animSpeed: 'standard',
    dismissMode: 'persistent',
    messageMode: 'static',
    rotatorIndex: 0,
    chat: 'off',
    search: 'off',
    device: 'desktop',
    scrollSpy: 'off',
    activeSection: 'hero',
    primaryType: 'message-cta',
    primary: { message: 'Explore current offers on the Aurelia GT.', cta: { label: 'Shop Now' } },
    ctaStyle: 'button',

    autoCollapse: false,
    navCollapsed: false,
    utilitiesCollapsed: false,
    panelExpanded: false,

    activePreset: 'current-state',
    scrollVisible: false,
    minimized: false,
    dismissed: false,
    fullyDismissed: false,
    everShown: false,

    activeInteraction: null, // 'chat' | 'search' | null
    flyout: null, // 'chat' | 'search' | null

    chatWindowOpen: false,
    chatWindowMessages: [],

    privacyActive: false,
    surveyActive: false,
    pendingSurvey: false,
    priorComposition: null,

    hasQualifyingAction: false,
    quoteActive: false,
    pendingQuote: false,
    quoteDismissed: false,
    quoteSubmitted: false,
    promptDelay: 'standard', // how long Survey/Quote wait before arriving

    rotationPaused: false,
  };

  /* ------------------------------------------------------------------ *
   * DOM references
   * ------------------------------------------------------------------ */

  const $sticky = document.getElementById('sticky');
  const $stickyBar = document.getElementById('stickyBar');
  const $primary = document.getElementById('stickyPrimary');
  const $utilities = document.getElementById('stickyUtilities');
  const $flyout = document.getElementById('stickyFlyout');
  const $minimizeBtn = document.getElementById('stickyMinimize');
  const $dismissBtn = document.getElementById('stickyDismiss');
  const $restoreBtn = document.getElementById('stickyRestore');
  const $collapseInner = document.getElementById('stickyCollapseInner');
  const $restoreCollapseInner = document.getElementById('stickyRestoreCollapseInner');

  const $legacyFooter = document.getElementById('legacyFooter');
  const $legacyChatFab = document.getElementById('legacyChatFab');

  const $privacyBar = document.getElementById('privacyBar');
  const $privacyAccept = document.getElementById('privacyAccept');
  const $privacyDecline = document.getElementById('privacyDecline');

  const $panel = document.getElementById('controlPanel');
  const $panelToggle = document.getElementById('panelToggle');
  const $panelClose = document.getElementById('panelClose');
  const $presetButtons = document.getElementById('presetButtons');
  const $eventLog = document.getElementById('eventLog');
  const $liveRegion = document.getElementById('liveRegion');
  const $activeLayerReadout = document.getElementById('activeLayerReadout');

  const $autoCollapseToggle = document.getElementById('autoCollapseToggle');
  const $crowdingBadge = document.getElementById('crowdingBadge');

  const $chaosOverlay = document.getElementById('chaosOverlay');

  const $frameOverlay = document.getElementById('frameOverlay');
  const $frameOverlayLabel = document.getElementById('frameOverlayLabel');
  const $deviceBezel = document.getElementById('deviceBezel');
  const $deviceFrame = document.getElementById('deviceFrame');

  const $chatWindow = document.getElementById('chatWindow');
  const $chatWindowMessages = document.getElementById('chatWindowMessages');
  const $chatWindowInput = document.getElementById('chatWindowInput');
  const $chatWindowSend = document.getElementById('chatWindowSend');
  const $chatWindowClose = document.getElementById('chatWindowClose');

  /* ------------------------------------------------------------------ *
   * Event log
   * ------------------------------------------------------------------ */

  // A "qualifying action" is the kind of intent signal that would make a
  // real site follow up with a quote prompt on return visit: engaging a
  // CTA, opening chat or search, or reaching the Shopping section.
  function markQualifyingAction(type, detail) {
    if (state.hasQualifyingAction) return;
    const qualifies = type === 'cta_clicked' || type === 'chat_opened' || type === 'search_opened'
      || (type === 'section_changed' && detail === 'Shopping');
    if (qualifies) state.hasQualifyingAction = true;
  }

  function log(type, detail) {
    markQualifyingAction(type, detail);
    const li = document.createElement('li');
    const time = document.createElement('time');
    time.textContent = new Date().toLocaleTimeString([], { hour12: false });
    const label = document.createElement('span');
    label.textContent = detail ? `${type} — ${detail}` : type;
    li.append(time, label);
    $eventLog.appendChild(li);
    while ($eventLog.children.length > 60) $eventLog.removeChild($eventLog.firstElementChild);
    renderActiveLayer();
  }

  document.getElementById('clearLog').addEventListener('click', () => {
    $eventLog.innerHTML = '';
  });

  /* ------------------------------------------------------------------ *
   * Active-layer readout — makes the priority model's current decision
   * visible in real time, instead of only inferable from behavior.
   * ------------------------------------------------------------------ */

  function computeActiveLayerLabel() {
    if (state.privacyActive) return 'Required UI — Privacy notice';
    if (state.activeInteraction === 'chat' || state.chatWindowOpen) return 'Active interaction — Chat';
    if (state.activeInteraction === 'search') return 'Active interaction — Search';
    if (state.flyout === 'chat') return 'Requested utility — Chat prompts open';
    if (state.flyout === 'quote') return 'Requested utility — Quote form open';
    if (state.flyout === 'search' || state.flyout === 'nav-overflow') return 'Requested utility — open';
    if (state.quoteActive) return 'Lead capture — Request a Quote';
    if (state.surveyActive) return 'Survey / optional engagement';
    if (state.scrollSpy === 'contextual') return `Contextual content — ${sectionLabel(state.activeSection)}`;
    if (state.scrollSpy === 'navigation') return 'Contextual content — section navigation';
    if (state.scrollSpy === 'orientation') return 'Contextual content — orientation';
    if (state.pendingQuote) return 'Primary content (quote prompt waiting)';
    if (state.pendingSurvey) return 'Primary content (survey waiting)';
    return 'Primary persistent content';
  }

  // Mirrors computeActiveLayerLabel()'s precedence, just collapsed down to
  // which color key the readout should borrow — so the dev panel's summary
  // uses the same chat/search/survey/quote/privacy hues as the live surface.
  function computeActiveLayerKind() {
    if (state.privacyActive) return 'privacy';
    if (state.activeInteraction === 'chat' || state.chatWindowOpen) return 'chat';
    if (state.activeInteraction === 'search') return 'search';
    if (state.flyout === 'chat') return 'chat';
    if (state.flyout === 'quote') return 'quote';
    if (state.flyout === 'search') return 'search';
    if (state.quoteActive) return 'quote';
    if (state.surveyActive) return 'survey';
    return null;
  }

  function renderActiveLayer() {
    const kind = computeActiveLayerKind();

    // Drives the surface's own background tint — every colorable state
    // (chat/search/survey/quote) gets one, not just Survey/Quote's
    // primary-zone takeover, so no state is left on the plain neutral
    // background while something specific is happening.
    if (kind && kind !== 'privacy') $sticky.dataset.kind = kind;
    else delete $sticky.dataset.kind;

    if (!$activeLayerReadout) return;
    const arriving = Object.entries(scheduled).map(([k, v]) =>
      `${k === 'quote' ? 'Quote prompt' : 'Survey'} arriving in ${Math.max(0, (v.dueAt - performance.now()) / 1000).toFixed(1)}s`);
    $activeLayerReadout.innerHTML = `Active layer: <strong>${computeActiveLayerLabel()}</strong>`
      + arriving.map((t) => `<span class="active-layer__next">${t}</span>`).join('');
    if (kind) $activeLayerReadout.dataset.kind = kind;
    else delete $activeLayerReadout.dataset.kind;
  }

  /* ------------------------------------------------------------------ *
   * Sticky offset (adjusts when required UI like the privacy bar is shown)
   * ------------------------------------------------------------------ */

  function updateStickyOffset() {
    const offset = state.privacyActive ? $privacyBar.offsetHeight : 0;
    document.documentElement.style.setProperty('--sticky-offset-bottom', offset + 'px');
    if (state.chatWindowOpen) positionChatWindow();
  }

  /* ------------------------------------------------------------------ *
   * Rendering: the sticky bar shell (presentation, visibility, surface)
   * ------------------------------------------------------------------ */

  // Removes + re-adds the entrance class (with a forced reflow in between)
  // so the CSS animation restarts. Used both when the component newly
  // becomes visible and when a preset changes while it's already visible —
  // replaying the entrance is a deliberate cue that the content changed.
  function triggerEntrance() {
    $sticky.classList.remove('enter-fade', 'enter-slide');
    if (!prefersReducedMotion && state.entrance !== 'none') {
      void $sticky.offsetWidth;
      $sticky.classList.add(state.entrance === 'slide' ? 'enter-slide' : 'enter-fade');
    }
  }

  function applyVisibility() {
    // "shouldShow" governs whether the component occupies the persistent
    // layer at all. "collapsed" governs whether it's showing full content
    // or just a restore pill — dismissing with a restore affordance keeps
    // the component in the layer, just collapsed, so the pill stays visible.
    const shouldShow = state.legacyMode ? false : state.scrollVisible && !state.fullyDismissed;
    const collapsed = state.minimized || (state.dismissed && state.dismissMode === 'dismissible-restore');

    const wasVisible = $sticky.dataset.visible === 'true';
    $sticky.dataset.visible = String(shouldShow);

    if (shouldShow && !wasVisible) {
      triggerEntrance();
      log('sticky_shown', state.activePreset);
      state.everShown = true;
    }

    $sticky.dataset.minimized = String(collapsed);
    $sticky.dataset.presentation = state.presentation;
    $sticky.dataset.surface = state.surface;
    $sticky.dataset.survey = String(state.surveyActive);
    $sticky.dataset.quote = String(state.quoteActive);

    $legacyFooter.hidden = !state.legacyMode;
    $legacyChatFab.hidden = !state.legacyMode;
  }

  function applyControlsVisibility() {
    const showMinimize = state.dismissMode === 'minimizable';
    const showDismiss = state.dismissMode === 'dismissible-restore' || state.dismissMode === 'fully-dismissible';
    $minimizeBtn.hidden = !showMinimize;
    $dismissBtn.hidden = !showDismiss;

    // The restore handle stays in the DOM at all times now (its visibility
    // is animated via the collapse transition, not a hidden-attribute
    // jump-cut) — inert keeps whichever side is visually collapsed from
    // being focusable or clickable while it's invisible.
    const collapsed = state.minimized || (state.dismissed && state.dismissMode === 'dismissible-restore');
    $collapseInner.inert = collapsed;
    $restoreCollapseInner.inert = !collapsed;
  }

  /* ------------------------------------------------------------------ *
   * Rendering: primary zone
   * ------------------------------------------------------------------ */

  function sectionLabel(id) {
    const found = ALL_SECTIONS.find((s) => s.id === id);
    return found ? found.label : 'Overview';
  }

  function renderPrimary() {
    $primary.innerHTML = '';
    $primary.classList.toggle('is-fluid', !state.surveyActive && !state.quoteActive && state.scrollSpy === 'off' && state.primaryType === 'search-inline');

    if (state.quoteActive) return renderQuotePrimary();
    if (state.surveyActive) return renderSurveyPrimary();
    if (state.scrollSpy === 'navigation') return renderNavPrimary();
    if (state.scrollSpy === 'orientation') return renderOrientationPrimary();
    if (state.primaryType === 'search-inline') return renderSearchInlinePrimary();
    return renderMessageCtaPrimary();
  }

  function renderSurveyPrimary() {
    const wrap = document.createElement('div');
    wrap.className = 'primary-prompt primary-prompt--survey';

    const p = document.createElement('p');
    p.textContent = 'Help us improve our site';
    wrap.appendChild(p);

    const takeSurvey = document.createElement('button');
    takeSurvey.type = 'button';
    takeSurvey.className = 'btn btn--primary btn--small';
    takeSurvey.textContent = 'Take Survey';
    takeSurvey.addEventListener('click', () => {
      log('cta_clicked', 'take_survey (mock)');
      dismissSurvey();
    });
    wrap.appendChild(takeSurvey);

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'sticky__icon-btn';
    close.setAttribute('aria-label', 'Dismiss survey');
    close.innerHTML = closeIcon();
    close.addEventListener('click', () => dismissSurvey());
    wrap.appendChild(close);

    $primary.appendChild(wrap);
  }

  function renderQuotePrimary() {
    const wrap = document.createElement('div');
    wrap.className = 'primary-prompt primary-prompt--quote';

    const p = document.createElement('p');
    p.textContent = 'Welcome back. Ready for pricing on the Aurelia GT?';
    wrap.appendChild(p);

    const getQuote = document.createElement('button');
    getQuote.type = 'button';
    getQuote.className = 'btn btn--primary btn--small';
    getQuote.textContent = 'Get My Quote';
    getQuote.addEventListener('click', () => {
      log('cta_clicked', 'get_my_quote');
      openFlyout('quote');
    });
    wrap.appendChild(getQuote);

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'sticky__icon-btn';
    close.setAttribute('aria-label', 'Dismiss quote prompt');
    close.innerHTML = closeIcon();
    close.addEventListener('click', () => dismissQuote());
    wrap.appendChild(close);

    $primary.appendChild(wrap);
  }

  function renderNavPrimary() {
    const nav = document.createElement('nav');
    nav.className = 'primary-nav';
    nav.setAttribute('aria-label', 'Section navigation');

    const activeMatch = NAV_SECTIONS.filter((s) => s.id === state.activeSection);
    const items = state.navCollapsed ? (activeMatch.length ? activeMatch : [NAV_SECTIONS[0]]) : NAV_SECTIONS;

    items.forEach((s) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = s.label;
      if (state.activeSection === s.id) btn.setAttribute('aria-current', 'true');
      btn.addEventListener('click', () => {
        document.getElementById(s.id).scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        log('section_changed', `nav click → ${s.label}`);
      });
      nav.appendChild(btn);
    });

    if (state.navCollapsed) {
      const more = document.createElement('button');
      more.type = 'button';
      more.className = 'primary-nav__more';
      more.setAttribute('aria-haspopup', 'true');
      more.textContent = 'More ▾';
      more.addEventListener('click', () => openNavOverflow());
      nav.appendChild(more);
    }

    $primary.appendChild(nav);
  }

  function openNavOverflow() {
    state.flyout = 'nav-overflow';
    $flyout.hidden = false;
    $flyout.innerHTML = '';
    const title = document.createElement('p');
    title.className = 'flyout-title';
    title.textContent = 'More sections (collapsed to make room)';
    $flyout.appendChild(title);
    const chips = document.createElement('div');
    chips.className = 'flyout-chips';
    NAV_SECTIONS.forEach((s) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = s.label;
      b.addEventListener('click', () => {
        document.getElementById(s.id).scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        log('section_changed', `nav overflow click → ${s.label}`);
        closeFlyout();
      });
      chips.appendChild(b);
    });
    $flyout.appendChild(chips);
    log('nav_overflow_opened');
  }

  function renderOrientationPrimary() {
    const wrap = document.createElement('div');
    wrap.className = 'primary-orientation';
    wrap.innerHTML = `Viewing: <strong>${sectionLabel(state.activeSection)}</strong>`;
    $primary.appendChild(wrap);
  }

  function renderSearchInlinePrimary() {
    const wrap = document.createElement('div');
    wrap.className = 'primary-search-inline';

    const field = buildSearchField('Search inventory, specs, or dealers');
    wrap.appendChild(field);
    $primary.appendChild(wrap);
  }

  function renderMessageCtaPrimary() {
    const data = state.primary || {};
    let ctaLabel = data.cta ? data.cta.label : null;

    if (state.scrollSpy === 'contextual') {
      ctaLabel = CONTEXTUAL_CTA[state.activeSection] || ctaLabel;
    }

    let messageText = data.message || '';
    if (state.messageMode === 'rotating') {
      messageText = prefersReducedMotion
        ? ROTATING_MESSAGES[0]
        : ROTATING_MESSAGES[state.rotatorIndex % ROTATING_MESSAGES.length];
    } else if (state.messageMode === 'manual') {
      messageText = ROTATING_MESSAGES[state.rotatorIndex % ROTATING_MESSAGES.length];
    } else if (state.messageMode === 'ticker' && prefersReducedMotion) {
      messageText = ROTATING_MESSAGES[0];
    }

    if (state.messageMode === 'ticker' && !prefersReducedMotion) {
      const ticker = document.createElement('div');
      ticker.className = 'ticker';
      const track = document.createElement('div');
      track.className = 'ticker__track';
      const items = ROTATING_MESSAGES.concat(ROTATING_MESSAGES);
      items.forEach((msg) => {
        const span = document.createElement('span');
        span.textContent = msg;
        track.appendChild(span);
      });
      ticker.appendChild(track);
      $primary.appendChild(ticker);
    } else if (state.messageMode === 'manual') {
      const wrap = document.createElement('div');
      wrap.className = 'rotator';

      const prev = document.createElement('button');
      prev.type = 'button';
      prev.className = 'rotator__btn';
      prev.setAttribute('aria-label', 'Previous message');
      prev.textContent = '‹';
      prev.addEventListener('click', () => {
        state.rotatorIndex = (state.rotatorIndex - 1 + ROTATING_MESSAGES.length) % ROTATING_MESSAGES.length;
        renderPrimary();
      });

      const msg = document.createElement('p');
      msg.className = 'rotator__msg';
      msg.textContent = messageText;

      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'rotator__btn';
      next.setAttribute('aria-label', 'Next message');
      next.textContent = '›';
      next.addEventListener('click', () => {
        state.rotatorIndex = (state.rotatorIndex + 1) % ROTATING_MESSAGES.length;
        renderPrimary();
      });

      wrap.append(prev, msg, next);
      $primary.appendChild(wrap);
    } else if (messageText) {
      const p = document.createElement('p');
      p.className = 'primary-message';
      p.textContent = messageText;
      $primary.appendChild(p);
    }

    if (ctaLabel) {
      const cta = document.createElement('a');
      cta.href = (data.cta && data.cta.href) || '#shopping';
      cta.addEventListener('click', () => log('cta_clicked', ctaLabel));

      if (state.ctaStyle === 'text-link') {
        cta.className = 'cta-textlink';
        cta.innerHTML = `${ctaLabel} <span aria-hidden="true">&rarr;</span>`;
        $primary.appendChild(cta);
      } else {
        cta.className = 'btn btn--primary btn--small';
        cta.textContent = ctaLabel;
        const wrap = document.createElement('div');
        wrap.className = 'primary-ctas';
        wrap.appendChild(cta);
        $primary.appendChild(wrap);
      }
    }
  }

  /* ------------------------------------------------------------------ *
   * Message rotation timer
   * ------------------------------------------------------------------ */

  let rotationTimer = null;
  function setupRotationTimer() {
    if (rotationTimer) clearInterval(rotationTimer);
    rotationTimer = null;
    if (prefersReducedMotion) return;
    if (state.messageMode !== 'rotating') return;
    rotationTimer = setInterval(() => {
      if (state.rotationPaused || state.activeInteraction) return;
      state.rotatorIndex = (state.rotatorIndex + 1) % ROTATING_MESSAGES.length;
      renderPrimary();
    }, 4200);
  }

  $sticky.addEventListener('mouseenter', () => { state.rotationPaused = true; });
  $sticky.addEventListener('mouseleave', () => { state.rotationPaused = false; });
  $sticky.addEventListener('focusin', () => { state.rotationPaused = true; });
  $sticky.addEventListener('focusout', () => { state.rotationPaused = false; });

  /* ------------------------------------------------------------------ *
   * Rendering: utilities zone (chat + search)
   * ------------------------------------------------------------------ */

  function chatIcon() {
    return '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 4h16v12H7l-3 3V4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  }
  function closeIcon() {
    return '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  }
  function searchIcon() {
    return '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M20 20l-4.3-4.3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  }

  function renderUtilities() {
    $utilities.innerHTML = '';
    $utilities.classList.toggle('is-collapsed', state.utilitiesCollapsed);
    if (state.legacyMode) { closeFlyout(); return; }

    if (state.chat !== 'off') $utilities.appendChild(buildChatWidget());
    if (state.search !== 'off') $utilities.appendChild(buildSearchWidget());
  }

  function buildChatWidget() {
    const wrap = document.createElement('div');
    wrap.className = 'chat-widget';

    if (state.chat === 'question') {
      wrap.appendChild(buildChatInputField());
    } else {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chat-trigger' + (state.chat === 'icon' ? ' chat-trigger--icon-only' : '');
      btn.setAttribute('aria-label', 'Chat');
      btn.setAttribute('aria-haspopup', state.chat === 'suggested' ? 'true' : 'false');
      let inner = chatIcon();
      if (state.chat === 'label') inner += '<span>Ask Us</span>';
      if (state.chat === 'suggested') inner += '<span>Ask a Question</span>';
      btn.innerHTML = inner;
      btn.addEventListener('click', () => {
        log('chat_opened', state.chat);
        if (state.chat === 'suggested') {
          openFlyout('chat');
        } else if (state.chat === 'label') {
          openChatWindow();
        }
      });
      wrap.appendChild(btn);
    }

    if (state.device === 'apple') {
      const badge = document.createElement('span');
      badge.className = 'device-badge';
      badge.textContent = 'iMessage available';
      wrap.appendChild(badge);
    } else if (state.device === 'android') {
      const badge = document.createElement('span');
      badge.className = 'device-badge';
      badge.textContent = 'In-app only';
      wrap.appendChild(badge);
    }

    return wrap;
  }

  function buildChatInputField() {
    const field = document.createElement('div');
    field.className = 'chat-input-field';
    field.innerHTML = chatIcon();

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Ask a question…';
    input.setAttribute('aria-label', 'Ask a question');
    input.addEventListener('focus', () => {
      state.activeInteraction = 'chat';
      log('chat_opened', 'question field focused');
    });
    input.addEventListener('blur', () => {
      state.activeInteraction = null;
      renderActiveLayer();
      maybeReleasePendingOverlays();
    });
    field.appendChild(input);

    const send = document.createElement('button');
    send.type = 'button';
    send.setAttribute('aria-label', 'Ask a question — opens chat window');
    // Two icons, one shown per breakpoint: a send arrow next to the text field
    // on wider screens; on phones (where CSS hides the field) a chat bubble.
    send.innerHTML = '<svg class="icon-send" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      + chatIcon().replace('<svg ', '<svg class="icon-open-chat" ');
    const handoff = () => {
      const text = input.value.trim();
      log('cta_clicked', 'chat_send (mock)');
      openChatWindow(text || null);
      input.value = '';
    };
    send.addEventListener('click', handoff);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); handoff(); }
    });
    field.appendChild(send);

    if (state.device === 'apple') {
      const imsg = document.createElement('button');
      imsg.type = 'button';
      imsg.className = 'imessage-btn';
      imsg.setAttribute('aria-label', 'Continue in Apple Messages (simulated)');
      imsg.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M4 4h16v12H7l-3 3V4z" fill="currentColor"/></svg>';
      imsg.addEventListener('click', () => log('chat_opened', 'imessage handoff (simulated)'));
      field.appendChild(imsg);
    }

    return field;
  }

  /* ------------------------------------------------------------------ *
   * Corner chat window — a conventional bottom-right widget that the
   * sticky bar's "Ask a question" field hands off to, rather than trying
   * to hold a whole conversation inline in the persistent surface.
   * ------------------------------------------------------------------ */

  let chatReplyIndex = 0;

  // Keeps the corner window sitting just above the sticky surface instead of
  // on top of it, so the entry point that opened it stays visible.
  function positionChatWindow() {
    let lift = 0;
    if ($sticky.dataset.visible === 'true') {
      const top = $sticky.querySelector('.sticky__surface').getBoundingClientRect().top;
      lift = Math.max(0, window.innerHeight - top);
    } else if (state.privacyActive) {
      lift = $privacyBar.offsetHeight;
    }
    document.documentElement.style.setProperty('--chat-lift', lift + 'px');
  }

  if ('ResizeObserver' in window) {
    new ResizeObserver(() => { if (state.chatWindowOpen) positionChatWindow(); })
      .observe($sticky.querySelector('.sticky__surface'));
  }
  window.addEventListener('resize', () => { if (state.chatWindowOpen) positionChatWindow(); });
  // The sticky glides up/down when the privacy notice comes and goes; re-measure once it lands.
  $sticky.addEventListener('transitionend', (e) => {
    if (e.target === $sticky && e.propertyName === 'bottom' && state.chatWindowOpen) positionChatWindow();
  });

  function openChatWindow(initialMessage) {
    if (!state.chatWindowOpen) {
      state.chatWindowOpen = true;
      positionChatWindow();
      if (state.chatWindowMessages.length === 0) pushChatWindowMessage('assistant', CHAT_WINDOW_GREETING);
      $chatWindow.hidden = false;
      $chatWindow.classList.remove('is-entering');
      if (!prefersReducedMotion) {
        void $chatWindow.offsetWidth;
        $chatWindow.classList.add('is-entering');
      }
      log('chat_opened', 'corner window');
    }
    if (initialMessage) {
      pushChatWindowMessage('user', initialMessage);
      respondInChatWindow();
    }
    renderChatWindowMessages();
    requestAnimationFrame(() => $chatWindowInput.focus());
  }

  function closeChatWindow() {
    const hadFocus = $chatWindow.contains(document.activeElement);
    state.chatWindowOpen = false;
    $chatWindow.hidden = true;
    log('chat_closed', 'corner window');
    maybeReleasePendingOverlays();
    // Return focus to the sticky bar's chat entry point (looked up fresh —
    // a re-render may have replaced the original element). Deliberately the
    // send/trigger button, not the text field: focusing the field would
    // count as reopening chat.
    if (hadFocus) {
      const entry = $utilities.querySelector('.chat-input-field button, .chat-trigger');
      if (entry) entry.focus({ preventScroll: true });
    }
  }

  function pushChatWindowMessage(from, text) {
    state.chatWindowMessages.push({ from, text });
  }

  function respondInChatWindow() {
    const reply = CHAT_WINDOW_REPLIES[chatReplyIndex % CHAT_WINDOW_REPLIES.length];
    chatReplyIndex += 1;
    setTimeout(() => {
      if (!state.chatWindowOpen) return;
      pushChatWindowMessage('assistant', reply);
      renderChatWindowMessages();
    }, 500);
  }

  function renderChatWindowMessages() {
    $chatWindowMessages.innerHTML = '';
    state.chatWindowMessages.forEach((m) => {
      const div = document.createElement('div');
      div.className = 'chat-window__msg chat-window__msg--' + m.from;
      div.textContent = m.text;
      $chatWindowMessages.appendChild(div);
    });
    $chatWindowMessages.scrollTop = $chatWindowMessages.scrollHeight;
  }

  function submitChatWindowMessage() {
    const text = $chatWindowInput.value.trim();
    if (!text) return;
    pushChatWindowMessage('user', text);
    $chatWindowInput.value = '';
    renderChatWindowMessages();
    respondInChatWindow();
    log('cta_clicked', 'chat_window_send (mock)');
  }

  $chatWindowSend.addEventListener('click', submitChatWindowMessage);
  $chatWindowInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); submitChatWindowMessage(); }
  });
  $chatWindowClose.addEventListener('click', closeChatWindow);

  function buildSearchWidget() {
    if (state.search === 'compact') return buildSearchField('Search');
    if (state.search === 'expandable') return buildExpandableSearch();

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'search-trigger' + (state.search === 'icon' ? ' search-trigger--icon-only' : '');
    btn.setAttribute('aria-label', 'Search');
    btn.innerHTML = searchIcon() + (state.search === 'label' ? '<span>Search</span>' : '');
    btn.addEventListener('click', () => {
      log('search_opened', state.search);
      openFlyout('search');
    });
    return btn;
  }

  function buildExpandableSearch() {
    const wrap = document.createElement('div');
    wrap.className = 'chat-widget';
    let expanded = false;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'search-trigger search-trigger--icon-only';
    btn.setAttribute('aria-label', 'Expand search');
    btn.innerHTML = searchIcon();

    btn.addEventListener('click', () => {
      expanded = true;
      wrap.innerHTML = '';
      const field = buildSearchField('Search', true);
      wrap.appendChild(field);
      log('search_opened', 'expandable');
    });

    wrap.appendChild(btn);
    return wrap;
  }

  function buildSearchField(placeholder, autofocus) {
    const field = document.createElement('div');
    field.className = 'search-field';
    field.innerHTML = searchIcon();

    const input = document.createElement('input');
    input.type = 'search';
    input.placeholder = placeholder;
    input.setAttribute('aria-label', 'Search');
    input.addEventListener('focus', () => {
      state.activeInteraction = 'search';
      log('search_opened', 'field focused');
    });
    input.addEventListener('input', () => renderSearchResults(input.value));
    input.addEventListener('blur', () => {
      state.activeInteraction = null;
      renderActiveLayer();
      maybeReleasePendingOverlays();
    });
    field.appendChild(input);
    if (autofocus) requestAnimationFrame(() => input.focus());
    return field;
  }

  function renderSearchResults(query) {
    const q = query.trim().toLowerCase();
    const matches = q ? INVENTORY.filter((item) => item.toLowerCase().includes(q)) : INVENTORY.slice(0, 3);
    // Ensures the flyout is open without going back through openFlyout(),
    // which delegates to this function for the 'search' kind — calling
    // each other would recurse forever.
    state.flyout = 'search';
    $flyout.hidden = false;
    $flyout.dataset.kind = 'search';
    $flyout.innerHTML = '';
    const title = document.createElement('p');
    title.className = 'flyout-title';
    title.textContent = q ? `Results for "${query}"` : 'Suggested';
    $flyout.appendChild(title);

    const list = document.createElement('div');
    list.className = 'flyout-results';
    if (matches.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'flyout-empty';
      empty.textContent = 'No matches in this mock inventory.';
      list.appendChild(empty);
    } else {
      matches.forEach((item) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = item;
        b.addEventListener('click', () => log('cta_clicked', `search_result: ${item}`));
        list.appendChild(b);
      });
    }
    $flyout.appendChild(list);
    renderActiveLayer();
  }

  function openFlyout(kind) {
    state.flyout = kind;
    $flyout.hidden = false;
    $flyout.dataset.kind = kind;
    if (kind === 'chat') {
      $flyout.innerHTML = '';
      const title = document.createElement('p');
      title.className = 'flyout-title';
      title.textContent = 'Suggested prompts';
      $flyout.appendChild(title);
      const chips = document.createElement('div');
      chips.className = 'flyout-chips';
      SUGGESTED_PROMPTS.forEach((prompt) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = prompt;
        b.addEventListener('click', () => log('cta_clicked', `prompt: ${prompt}`));
        chips.appendChild(b);
      });
      $flyout.appendChild(chips);
    } else if (kind === 'search') {
      renderSearchResults('');
    } else if (kind === 'quote') {
      renderQuoteForm();
    }
    renderActiveLayer();
  }

  function renderQuoteForm() {
    $flyout.innerHTML = '';

    if (state.quoteSubmitted) {
      const title = document.createElement('p');
      title.className = 'flyout-title';
      title.textContent = 'Request received';
      $flyout.appendChild(title);
      const msg = document.createElement('p');
      msg.className = 'flyout-empty';
      msg.textContent = 'Thanks — a product specialist will follow up shortly.';
      $flyout.appendChild(msg);
      return;
    }

    const title = document.createElement('p');
    title.className = 'flyout-title';
    title.textContent = 'Request a Quote';
    $flyout.appendChild(title);

    const form = document.createElement('form');
    form.className = 'quote-form';
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitQuote();
    });

    [
      { id: 'quoteName', label: 'Name', type: 'text' },
      { id: 'quoteEmail', label: 'Email', type: 'email' },
      { id: 'quoteZip', label: 'ZIP code', type: 'text' },
    ].forEach((f) => {
      const field = document.createElement('label');
      field.className = 'quote-form__field';
      field.textContent = f.label;
      const input = document.createElement('input');
      input.type = f.type;
      input.id = f.id;
      input.required = true;
      field.appendChild(input);
      form.appendChild(field);
    });

    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'btn btn--primary btn--small';
    submit.textContent = 'Submit';
    form.appendChild(submit);

    $flyout.appendChild(form);
  }

  function closeFlyout() {
    state.flyout = null;
    $flyout.hidden = true;
    $flyout.innerHTML = '';
    delete $flyout.dataset.kind;
    renderActiveLayer();
  }

  /* ------------------------------------------------------------------ *
   * Crowding / auto-collapse — the "busy edge case" mechanism.
   * When several things want the same real estate, collapse the lowest
   * priority content first (section navigation), then utilities, rather
   * than letting the bar silently overflow or wrap.
   * ------------------------------------------------------------------ */

  // Two checks, because flexbox hides crowding at different levels: section
  // nav has its own overflow-x:auto so it silently absorbs excess pills via
  // internal scroll rather than pushing its parent wider — that has to be
  // measured on the nav element itself. Other compositions (message + CTA +
  // utilities) don't have that internal escape hatch, so a real squeeze
  // shows up as $stickyBar overflowing its own box.
  // Checks every element that can silently truncate its own content (via
  // overflow:hidden + ellipsis) rather than visibly breaking the layout —
  // scrollWidth still reports an element's true, untruncated content width
  // even while clipped, so comparing it to clientWidth catches "this got
  // cut off" even when nothing actually overflows its box. Nav additionally
  // gets its own overflow-x:auto, which absorbs excess pills into internal
  // scroll instead of truncating — same idea, checked the same way. Without
  // this broader check, only extreme cases (nav genuinely out of room, the
  // whole bar overflowing) would ever prompt the floating panel to grow;
  // everyday cases — a message or CTA a bit longer than usual — would just
  // quietly ellipsize instead, even with plenty of viewport room to spare.
  const TRUNCATABLE_SELECTOR = '.primary-nav, .primary-message, .primary-ctas .btn, .cta-textlink, .rotator__msg, .primary-prompt p';

  function barIsOverflowing() {
    const anyTruncated = Array.from($stickyBar.querySelectorAll(TRUNCATABLE_SELECTOR))
      .some((el) => el.scrollWidth > el.clientWidth + 1);
    const barCrowded = $stickyBar.scrollWidth > $stickyBar.clientWidth + 1;
    return anyTruncated || barCrowded;
  }

  function getDurFastMs() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--dur-fast');
    return parseFloat(raw) || 160;
  }

  function getDurMedMs() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--dur-med');
    return parseFloat(raw) || 260;
  }

  // "Floating panel" / "compact pill" for event log and badge text — the
  // only two presentations opportunistic expansion applies to.
  function presentationLabel() {
    return state.presentation === 'compact' ? 'compact pill' : 'floating panel';
  }

  function evaluateCrowding() {
    requestAnimationFrame(() => {
      // Opportunistic expansion (floating and compact only — full-width
      // already spans the viewport, nothing to expand into): let the panel
      // take more width before ever hiding content. Always on, independent
      // of the Auto-collapse toggle below — growing the container can't
      // lose information the way collapsing content can, so there's no
      // tradeoff to gate behind a demo switch.
      const expandable = state.presentation === 'floating' || state.presentation === 'compact';
      if (expandable && !state.panelExpanded && barIsOverflowing()) {
        state.panelExpanded = true;
        $sticky.dataset.expanded = 'true';
        log('sticky_variant_changed', `${presentationLabel()} expanded for content`);
        // The width transition needs to settle before collapse decisions
        // below can trust the layout, so re-run this check once it has.
        setTimeout(evaluateCrowding, getDurMedMs() + 40);
        return;
      }

      if (!state.autoCollapse) {
        const changed = state.navCollapsed || state.utilitiesCollapsed;
        state.navCollapsed = false;
        state.utilitiesCollapsed = false;
        if (changed) { renderPrimary(); renderUtilities(); }
        updateCrowdingBadge(false, 0);
        return;
      }

      if (barIsOverflowing() && !state.navCollapsed && state.scrollSpy === 'navigation') {
        state.navCollapsed = true;
        renderPrimary();
      }
      if (barIsOverflowing() && !state.utilitiesCollapsed) {
        state.utilitiesCollapsed = true;
        renderUtilities();
      }

      const collapsedCount = (state.navCollapsed ? 1 : 0) + (state.utilitiesCollapsed ? 1 : 0);
      updateCrowdingBadge(barIsOverflowing(), collapsedCount);
    });
  }

  function updateCrowdingBadge(isOverflowing, collapsedCount) {
    if (!$crowdingBadge) return;
    $crowdingBadge.classList.toggle('is-overflowing', isOverflowing);
    const expandedNote = state.panelExpanded ? ` ${presentationLabel().replace(/^\w/, (c) => c.toUpperCase())} expanded to make room.` : '';
    if (isOverflowing) {
      $crowdingBadge.textContent = collapsedCount > 0
        ? `Still tight after collapsing ${collapsedCount} item${collapsedCount > 1 ? 's' : ''} — consider trimming utilities.${expandedNote}`
        : `Overflowing — enable auto-collapse, or reduce nav/utilities.${expandedNote}`;
    } else if (collapsedCount > 0) {
      $crowdingBadge.textContent = `Fits — ${collapsedCount} lower-priority item${collapsedCount > 1 ? 's' : ''} collapsed to make room.${expandedNote}`;
    } else {
      $crowdingBadge.textContent = state.panelExpanded ? `Fits — ${presentationLabel()} expanded to make room.` : 'Fits available space.';
    }
  }

  $autoCollapseToggle.addEventListener('change', () => {
    state.autoCollapse = $autoCollapseToggle.checked;
    evaluateCrowding();
  });

  /* ------------------------------------------------------------------ *
   * Minimize / dismiss / restore
   * ------------------------------------------------------------------ */

  $minimizeBtn.addEventListener('click', () => {
    state.minimized = true;
    log('sticky_minimized', state.activePreset);
    applyVisibility();
    applyControlsVisibility();
  });

  $dismissBtn.addEventListener('click', () => {
    state.dismissed = true;
    if (state.dismissMode === 'fully-dismissible') state.fullyDismissed = true;
    log('sticky_dismissed', state.dismissMode);
    applyVisibility();
    applyControlsVisibility();
  });

  $restoreBtn.addEventListener('click', () => {
    state.minimized = false;
    state.dismissed = false;
    log('sticky_restored', state.activePreset);
    applyVisibility();
    applyControlsVisibility();
  });

  /* ------------------------------------------------------------------ *
   * Survey (reuses the sticky layer) + Privacy (required UI, highest priority)
   * ------------------------------------------------------------------ */

  // Survey and Quote both take over the primary zone, so they share a
  // single snapshot of "what was there before" — whichever one released
  // last restores it, and neither clobbers a snapshot the other already took.
  function captureCompositionIfNeeded() {
    if (state.priorComposition) return;
    state.priorComposition = {
      primaryType: state.primaryType,
      primary: state.primary,
      scrollSpy: state.scrollSpy,
    };
  }

  function restoreCompositionIfIdle() {
    if (state.surveyActive || state.quoteActive) return;
    if (state.priorComposition) {
      state.primaryType = state.priorComposition.primaryType;
      state.primary = state.priorComposition.primary;
      state.scrollSpy = state.priorComposition.scrollSpy;
      state.priorComposition = null;
    }
  }

  /* ------------------------------------------------------------------ *
   * Sequencing — Survey/Quote arrive after a delay, and any takeover of
   * the primary zone animates instead of cutting.
   * ------------------------------------------------------------------ */

  const PROMPT_DELAYS = { immediate: 0, short: 1500, standard: 3000, long: 6000 };
  const RELEASE_BEAT_MS = 900;
  const scheduled = {}; // 'survey' | 'quote' -> { timer, dueAt }
  let countdownTimer = null;

  function promptDelayMs() {
    return PROMPT_DELAYS[state.promptDelay] ?? PROMPT_DELAYS.standard;
  }

  function scheduleOverlay(kind, ms, reason) {
    if (scheduled[kind]) return;
    const fire = kind === 'quote' ? triggerQuote : triggerSurvey;
    if (!ms) { fire(); return; }
    scheduled[kind] = {
      dueAt: performance.now() + ms,
      timer: setTimeout(() => { delete scheduled[kind]; fire(); }, ms),
    };
    log(`${kind}_scheduled`, `${reason || 'arriving'} in ${(ms / 1000).toFixed(1)}s`);
    // Keeps the panel's countdown ticking while anything is on its way.
    if (!countdownTimer) {
      countdownTimer = setInterval(() => {
        renderActiveLayer();
        if (!Object.keys(scheduled).length) { clearInterval(countdownTimer); countdownTimer = null; }
      }, 200);
    }
  }

  function scheduleSurvey() {
    if (state.surveyActive) return;
    scheduleOverlay('survey', promptDelayMs());
  }

  function scheduleQuote() {
    if (state.quoteActive || state.quoteDismissed || state.quoteSubmitted) return;
    scheduleOverlay('quote', promptDelayMs());
  }

  function cancelScheduledOverlays() {
    Object.keys(scheduled).forEach((kind) => { clearTimeout(scheduled[kind].timer); delete scheduled[kind]; });
  }

  // Animated takeover: the old primary content fades/sinks out, the render
  // happens, the new content rises in, and the surface animates between its
  // old and new size (FLIP) instead of snapping. State is always mutated
  // synchronously by the caller; only the DOM render is deferred — so calls
  // arriving mid-transition coalesce into one render of the latest state
  // (a Survey that's immediately preempted by a Quote never flashes on).
  let swapTimer = null;
  let swapNeedsFull = false;
  let swapCleanupTimer = null;
  const $surface = $sticky.querySelector('.sticky__surface');

  function swapPrimary(full) {
    swapNeedsFull = swapNeedsFull || full;
    if (prefersReducedMotion || $sticky.dataset.visible !== 'true') { finishSwap(); return; }
    if (swapTimer) return;
    clearTimeout(swapCleanupTimer);
    $primary.classList.remove('is-swapping-in');
    $primary.classList.add('is-swapping-out');
    swapTimer = setTimeout(finishSwap, getDurFastMs());
  }

  function finishSwap() {
    clearTimeout(swapTimer);
    swapTimer = null;
    const full = swapNeedsFull;
    swapNeedsFull = false;

    const wasVisible = $sticky.dataset.visible === 'true';
    const wasMinimized = $sticky.dataset.minimized;
    const first = $surface.getBoundingClientRect();

    // Suppress the max-width transition while settling the new size (the
    // FLIP below animates it instead), but keep the background cross-fade.
    $surface.style.transitionProperty = 'background-color';
    if (full) fullRender(); else renderPrimary();
    settleExpansionNow();
    const last = $surface.getBoundingClientRect();
    $surface.style.transitionProperty = '';

    $primary.classList.remove('is-swapping-out');
    if (!prefersReducedMotion && wasVisible) {
      void $primary.offsetWidth;
      $primary.classList.add('is-swapping-in');
      swapCleanupTimer = setTimeout(() => $primary.classList.remove('is-swapping-in'), 1000);
      const sizeChanged = Math.abs(first.width - last.width) > 1 || Math.abs(first.height - last.height) > 1;
      // Skip when minimize/restore is changing at the same time — that
      // sequence already animates the surface's height on its own.
      if (first.width && sizeChanged && wasMinimized === $sticky.dataset.minimized) {
        $surface.animate(
          [{ width: `${first.width}px`, height: `${first.height}px` }, { width: `${last.width}px`, height: `${last.height}px` }],
          { duration: getDurMedMs(), easing: 'cubic-bezier(.2,.7,.2,1)' },
        );
      }
    }
    if (!full) evaluateCrowding();
  }

  function cancelSwap() {
    clearTimeout(swapTimer);
    clearTimeout(swapCleanupTimer);
    swapTimer = null;
    swapNeedsFull = false;
    $primary.classList.remove('is-swapping-out', 'is-swapping-in');
  }

  // Same decision as evaluateCrowding()'s expansion branch, made
  // synchronously so the FLIP can target the surface's final width.
  function settleExpansionNow() {
    const expandable = state.presentation === 'floating' || state.presentation === 'compact';
    if (!expandable || state.panelExpanded || $sticky.dataset.visible !== 'true' || !barIsOverflowing()) return;
    state.panelExpanded = true;
    $sticky.dataset.expanded = 'true';
    log('sticky_variant_changed', `${presentationLabel()} expanded for content`);
  }

  function triggerSurvey() {
    if (state.privacyActive) {
      state.pendingSurvey = true;
      log('survey_triggered', 'waiting — privacy notice active');
      return;
    }
    if (state.activeInteraction || state.chatWindowOpen) {
      state.pendingSurvey = true;
      log('survey_triggered', 'waiting — interaction in use');
      return;
    }
    if (state.quoteActive) {
      state.pendingSurvey = true;
      log('survey_triggered', 'waiting — quote prompt active');
      return;
    }
    if (state.surveyActive) return;

    captureCompositionIfNeeded();
    state.surveyActive = true;
    state.dismissed = false;
    state.minimized = false;
    state.scrollVisible = true;
    log('survey_triggered', 'shown in persistent layer');
    swapPrimary(true);
  }

  function dismissSurvey() {
    state.surveyActive = false;
    restoreCompositionIfIdle();
    log('survey_dismissed');
    swapPrimary(true);
    maybeReleasePendingOverlays();
  }

  // A returning visitor with a qualifying action (a CTA click, opening
  // chat/search, or reaching Shopping) sees this as the highest-priority
  // optional engagement — it outranks Survey, which just gets bumped to
  // pending and resumes once the quote prompt clears.
  function triggerQuote() {
    if (state.quoteActive || state.quoteDismissed || state.quoteSubmitted) return;
    if (state.privacyActive) {
      state.pendingQuote = true;
      log('quote_triggered', 'waiting — privacy notice active');
      return;
    }
    if (state.activeInteraction || state.chatWindowOpen) {
      state.pendingQuote = true;
      log('quote_triggered', 'waiting — interaction in use');
      return;
    }

    if (state.surveyActive) {
      state.surveyActive = false;
      state.pendingSurvey = true;
      log('survey_preempted', 'quote prompt has priority');
    }

    captureCompositionIfNeeded();
    state.quoteActive = true;
    state.dismissed = false;
    state.minimized = false;
    state.scrollVisible = true;
    closeFlyout();
    log('quote_triggered', 'shown in persistent layer — returning visitor');
    swapPrimary(true);
  }

  function dismissQuote() {
    state.quoteActive = false;
    state.quoteDismissed = true;
    closeFlyout();
    restoreCompositionIfIdle();
    log('quote_dismissed');
    swapPrimary(true);
    maybeReleasePendingOverlays();
  }

  // Leaves the "Get My Quote" prompt and its flyout confirmation on screen
  // briefly (like the chat window's mock reply) instead of snapping straight
  // back to whatever was showing before, so the confirmation is actually legible.
  function submitQuote() {
    state.quoteSubmitted = true;
    log('cta_clicked', 'quote_submit (mock)');
    renderQuoteForm();
    setTimeout(() => {
      if (!state.quoteActive) return;
      state.quoteActive = false;
      closeFlyout();
      restoreCompositionIfIdle();
      swapPrimary(true);
      renderActiveLayer();
      maybeReleasePendingOverlays();
    }, 1400);
  }

  // Returning to the tab after a qualifying action is what a real site
  // would use to decide "this visitor is worth a quote prompt."
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && state.hasQualifyingAction) scheduleQuote();
  });

  // A held-back prompt comes in after a short beat once its blocker clears,
  // rather than in the same instant — so "privacy accepted" / "chat closed"
  // and "here's the prompt" read as two moments, not one jump.
  function maybeReleasePendingOverlays() {
    if (state.privacyActive || state.activeInteraction || state.chatWindowOpen) return;
    const beat = promptDelayMs() ? RELEASE_BEAT_MS : 0;
    if (state.pendingQuote) {
      state.pendingQuote = false;
      scheduleOverlay('quote', beat, 'released');
      return;
    }
    if (state.pendingSurvey) {
      state.pendingSurvey = false;
      scheduleOverlay('survey', beat, 'released');
    }
  }

  function triggerPrivacy() {
    if (state.privacyActive) return;
    state.privacyActive = true;
    $privacyBar.hidden = false;
    $privacyBar.classList.add('is-entering');
    log('privacy_shown');
    updateStickyOffset();
  }

  function resolvePrivacy(result) {
    state.privacyActive = false;
    $privacyBar.hidden = true;
    $privacyBar.classList.remove('is-entering');
    log('privacy_' + result);
    updateStickyOffset();
    maybeReleasePendingOverlays();
  }

  $privacyAccept.addEventListener('click', () => resolvePrivacy('accepted'));
  $privacyDecline.addEventListener('click', () => resolvePrivacy('declined'));

  document.getElementById('triggerPrivacy').addEventListener('click', triggerPrivacy);
  document.getElementById('triggerSurvey').addEventListener('click', scheduleSurvey);
  document.getElementById('triggerQuote').addEventListener('click', () => {
    state.hasQualifyingAction = true;
    state.quoteDismissed = false;
    state.quoteSubmitted = false;
    scheduleQuote();
  });
  document.getElementById('promptDelaySelect').addEventListener('change', (e) => {
    state.promptDelay = e.target.value;
    log('prompt_delay_changed', e.target.selectedOptions[0].textContent);
  });
  document.getElementById('triggerStress').addEventListener('click', () => applyPreset('stress-test'));

  /* ------------------------------------------------------------------ *
   * Scroll handling: visibility trigger + scroll spy (rAF throttled)
   * ------------------------------------------------------------------ */

  const $hero = document.getElementById('hero');
  const sectionEls = ALL_SECTIONS
    .map((s) => document.getElementById(s.id))
    .filter((el, i, arr) => el && arr.indexOf(el) === i);

  let scrollTicking = false;
  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      evaluateScroll();
      scrollTicking = false;
    });
  }

  function evaluateScroll() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 100;
    const heroPast = $hero.getBoundingClientRect().bottom <= 0;

    let shouldShow;
    switch (state.visibility) {
      case 'always': shouldShow = true; break;
      case 'scroll10': shouldShow = scrollPercent >= 10; break;
      case 'scroll25': shouldShow = scrollPercent >= 25; break;
      case 'hero-exit': shouldShow = heroPast; break;
      case 'section-reach': {
        const target = document.getElementById(state.sectionReachTarget);
        shouldShow = target ? target.getBoundingClientRect().top <= window.innerHeight * 0.75 : false;
        break;
      }
      default: shouldShow = true;
    }

    if (shouldShow !== state.scrollVisible) {
      state.scrollVisible = shouldShow;
      applyVisibility();
    }

    // Scroll spy: find the section most in view
    let current = state.activeSection;
    let best = null;
    sectionEls.forEach((secEl) => {
      const rect = secEl.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.5) best = secEl.id;
    });
    if (best) current = best;

    if (current !== state.activeSection) {
      state.activeSection = current;
      log('section_changed', sectionLabel(current));
      if (!state.activeInteraction && state.scrollSpy !== 'off' && !state.surveyActive && !state.quoteActive) {
        // Section nav just moves its highlight — fading the whole nav on every
        // section change would be noise. Label changes (contextual CTA,
        // "Viewing: …") are a real content swap, so those cross-fade.
        if (state.scrollSpy === 'navigation') renderPrimary();
        else swapPrimary(false);
      }
    }

    evaluateCrowding();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ------------------------------------------------------------------ *
   * Preset application
   * ------------------------------------------------------------------ */

  function applyPreset(id) {
    const preset = PRESETS.find((p) => p.id === id);
    if (!preset) return;

    // A preset is a fresh scene: nothing from the previous one should arrive
    // or finish animating on top of it.
    cancelScheduledOverlays();
    cancelSwap();

    Object.assign(state, {
      legacyMode: false,
      surveyActive: false,
      quoteActive: false,
      priorComposition: null,
      minimized: false,
      dismissed: false,
      fullyDismissed: false,
      flyout: null,
      ctaStyle: 'button',
    }, preset.patch);

    state.activePreset = id;
    closeFlyout();
    log('sticky_variant_changed', preset.label);

    syncControlsFromState();
    fullRender();
    evaluateScroll();

    // fullRender/evaluateScroll already trigger the entrance animation if
    // the component just BECAME visible; this covers the more common case
    // where it was already visible and the preset simply swapped content.
    if ($sticky.dataset.visible === 'true') triggerEntrance();

    if (preset.after) preset.after();
    if (preset.note) announce(preset.note);
  }

  function announce(msg) {
    $liveRegion.textContent = msg;
  }

  const VERSION_TAGS = {
    today: { cls: 'tag--today', label: 'Today' },
    v1: { cls: 'tag--v1', label: 'V1' },
    v2: { cls: 'tag--v2', label: 'V2' },
    'edge-case': { cls: 'tag--edge', label: 'Edge case' },
  };

  function buildPresetButtons() {
    $presetButtons.innerHTML = '';
    PRESET_GROUPS.forEach((group) => {
      const members = PRESETS.filter((preset) => preset.group === group.id);
      if (!members.length) return;
      const heading = document.createElement('p');
      heading.className = 'preset-group';
      heading.innerHTML = group.label + (group.hint ? ` <span>· ${group.hint}</span>` : '');
      $presetButtons.appendChild(heading);
      members.forEach((preset) => {
        const tag = VERSION_TAGS[preset.version];
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'preset-btn';
        btn.dataset.preset = preset.id;
        btn.innerHTML = `<strong>${preset.label}${tag ? ` <span class="tag ${tag.cls}">${tag.label}</span>` : ''}</strong><span>${preset.hint}</span>`;
        btn.addEventListener('click', () => {
          setActiveFlowStep(null); // hand-picked preset: no longer "on" a flow step
          applyPreset(preset.id);
        });
        $presetButtons.appendChild(btn);
      });
    });
  }

  function markActivePresetButton() {
    $presetButtons.querySelectorAll('.preset-btn').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.preset === state.activePreset);
    });
  }

  /* ------------------------------------------------------------------ *
   * Control panel wiring
   * ------------------------------------------------------------------ */

  function radios(name) { return Array.from(document.querySelectorAll(`input[name="${name}"]`)); }

  radios('presentation').forEach((r) => r.addEventListener('change', () => {
    if (!r.checked) return;
    state.presentation = r.value;
    log('sticky_variant_changed', 'presentation → ' + r.value);
    applyVisibility();
    evaluateCrowding();
  }));

  radios('surface').forEach((r) => r.addEventListener('change', () => {
    if (!r.checked) return;
    state.surface = r.value;
    applyVisibility();
  }));

  radios('ctastyle').forEach((r) => r.addEventListener('change', () => {
    if (!r.checked) return;
    state.ctaStyle = r.value;
    renderPrimary();
    evaluateCrowding();
  }));

  radios('dismiss').forEach((r) => r.addEventListener('change', () => {
    if (!r.checked) return;
    state.dismissMode = r.value;
    state.minimized = false;
    state.dismissed = false;
    state.fullyDismissed = false;
    applyVisibility();
    applyControlsVisibility();
  }));

  radios('message').forEach((r) => r.addEventListener('change', () => {
    if (!r.checked) return;
    state.messageMode = r.value;
    state.rotatorIndex = 0;
    renderPrimary();
    setupRotationTimer();
  }));

  radios('chat').forEach((r) => r.addEventListener('change', () => {
    if (!r.checked) return;
    state.chat = r.value;
    renderUtilities();
    evaluateCrowding();
  }));

  radios('device').forEach((r) => r.addEventListener('change', () => {
    if (!r.checked) return;
    state.device = r.value;
    renderUtilities();
    log('device_simulated', r.value);
  }));

  radios('search').forEach((r) => r.addEventListener('change', () => {
    if (!r.checked) return;
    state.search = r.value;
    renderUtilities();
    evaluateCrowding();
  }));

  radios('scrollspy').forEach((r) => r.addEventListener('change', () => {
    if (!r.checked) return;
    state.scrollSpy = r.value;
    renderPrimary();
    evaluateCrowding();
  }));

  const $visibilitySelect = document.getElementById('visibilitySelect');
  const $sectionReachField = document.getElementById('sectionReachField');
  const $sectionReachSelect = document.getElementById('sectionReachSelect');
  $visibilitySelect.addEventListener('change', () => {
    state.visibility = $visibilitySelect.value;
    $sectionReachField.hidden = state.visibility !== 'section-reach';
    evaluateScroll();
  });
  $sectionReachSelect.addEventListener('change', () => {
    state.sectionReachTarget = $sectionReachSelect.value;
    evaluateScroll();
  });

  document.getElementById('entranceSelect').addEventListener('change', (e) => {
    state.entrance = e.target.value;
  });

  function applyAnimSpeed(value) {
    const speed = ANIM_SPEEDS[value] || ANIM_SPEEDS.standard;
    document.documentElement.style.setProperty('--dur-fast', speed.fast);
    document.documentElement.style.setProperty('--dur-med', speed.med);
  }

  radios('animspeed').forEach((r) => r.addEventListener('change', () => {
    if (!r.checked) return;
    state.animSpeed = r.value;
    applyAnimSpeed(r.value);
    log('animation_speed_changed', r.value);
  }));

  const $marketSelect = document.getElementById('marketSelect');
  const $languageSelect = document.getElementById('languageSelect');
  const $provinceField = document.getElementById('provinceField');
  $marketSelect.addEventListener('change', () => {
    $provinceField.hidden = $marketSelect.value !== 'ca';
    log('market_selected (V3 concept)', $marketSelect.value);
  });
  $languageSelect.addEventListener('change', () => log('language_selected (V3 concept)', $languageSelect.value));

  /* ------------------------------------------------------------------ *
   * Guided demo flow
   * ------------------------------------------------------------------ */

  document.getElementById('flowButtons').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-flow]');
    if (!btn) return;
    runFlowStep(Number(btn.dataset.flow));
  });

  const FLOW_NOTES = {
    1: 'The problem: a promo footer and an unrelated chat bubble, each built separately, competing for the same corner.',
    2: 'One coordinated surface: the test-drive CTA and an inline "Ask a question" field. Send a question to hand off to the corner chat window.',
    3: 'Same component, new content every time — click through the presets below.',
    4: 'Same content, different shell — try Full-width / Floating / Compact and the surface finishes.',
    5: 'Scroll the page: the CTA follows each section and cross-fades as it changes; messages rotate.',
    6: 'Each utility has its own color. Focus the chat field (blue) or open Search (teal) and the whole surface tints to match. Esc or clicking away closes things.',
    7: 'Watch the readout at the top count down. The Survey arrives after the Prompt delay, then the returning-visitor Quote animates over it. Dismiss the Quote and the Survey comes back.',
    8: 'Privacy shows first and wins; the Survey and Quote are scheduled behind it. Accept the notice and the Quote follows after a short beat, then the Survey after that.',
  };
  const $flowNote = document.getElementById('flowNote');

  function setActiveFlowStep(step) {
    document.querySelectorAll('#flowButtons button[data-flow]').forEach((b) => {
      const on = Number(b.dataset.flow) === step;
      b.classList.toggle('is-active', on);
      if (on) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    $flowNote.hidden = !step;
    $flowNote.textContent = step ? FLOW_NOTES[step] : '';
  }

  function runFlowStep(step) {
    log('demo_flow_step', String(step));
    // Step 5 turns on message rotation; presets deliberately don't reset it
    // (so it can be tried across presets by hand), but each flow step should
    // show its own scenario cleanly rather than inherit rotating messages.
    if (step !== 5 && state.messageMode !== 'static') {
      state.messageMode = 'static';
      setRadio('message', 'static');
    }
    switch (step) {
      case 1:
        applyPreset('current-state');
        break;
      case 2:
        applyPreset('tesla-inspired');
        setRadio('presentation', 'floating');
        state.presentation = 'floating';
        setRadio('chat', 'question');
        state.chat = 'question';
        setSelect('visibilitySelect', 'always');
        state.visibility = 'always';
        renderUtilities();
        applyVisibility();
        break;
      case 3:
        applyPreset('brand-story');
        openPanelSections([0]); // Content Presets
        openPanel();
        announce('Try the preset buttons to swap Search Inventory, F1, Chat, or Search.');
        break;
      case 4:
        setRadio('presentation', 'compact');
        state.presentation = 'compact';
        renderPrimary();
        setupRotationTimer();
        applyVisibility();
        openPanelSections([1]); // Presentation
        openPanel();
        break;
      case 5:
        applyPreset('section-navigator');
        setRadio('message', 'rotating');
        state.messageMode = 'rotating';
        setRadio('scrollspy', 'contextual');
        state.scrollSpy = 'contextual';
        setupRotationTimer();
        renderPrimary();
        openPanelSections([4, 7]); // Message Rotation, Scroll Spy
        openPanel();
        break;
      case 6:
        applyPreset('chat-search');
        openPanelSections([0]); // Content Presets — shows the "Chat & search" group
        openPanel();
        break;
      case 7:
        applyPreset('survey-quote-handoff');
        openPanelSections([9]); // Orchestration Demos — the Prompt delay control
        openPanel();
        break;
      case 8:
        applyPreset('stress-test');
        openPanelSections([8, 9]); // Busy/Overflow Edge Cases, Orchestration Demos
        openPanel();
        break;
    }
    // After the step's own work, since applyPreset/openPanel don't touch it.
    setActiveFlowStep(step);
  }

  function openPanelSections(indices) {
    document.querySelectorAll('#controlPanel details').forEach((d, i) => { d.open = indices.includes(i); });
  }

  function setRadio(name, value) {
    const el = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (el) el.checked = true;
  }
  function setSelect(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
  }

  function syncControlsFromState() {
    setRadio('presentation', state.presentation);
    setRadio('surface', state.surface);
    setRadio('ctastyle', state.ctaStyle);
    setRadio('dismiss', state.dismissMode);
    setRadio('message', state.messageMode);
    setRadio('chat', state.chat);
    setRadio('search', state.search);
    setRadio('device', state.device);
    setRadio('scrollspy', state.scrollSpy);
    setRadio('animspeed', state.animSpeed);
    setSelect('visibilitySelect', state.visibility);
    setSelect('promptDelaySelect', state.promptDelay);
    applyAnimSpeed(state.animSpeed);
    markActivePresetButton();
    applyControlsVisibility();
  }

  /* ------------------------------------------------------------------ *
   * Uncoordinated chaos comparison
   * ------------------------------------------------------------------ */

  document.getElementById('triggerChaos').addEventListener('click', () => {
    $chaosOverlay.hidden = false;
    log('chaos_shown', 'uncoordinated comparison');
  });
  document.getElementById('chaosClose').addEventListener('click', () => {
    $chaosOverlay.hidden = true;
    log('chaos_closed');
  });

  /* ------------------------------------------------------------------ *
   * Custom content override — preview alternate copy live
   * ------------------------------------------------------------------ */

  const $overrideMessage = document.getElementById('overrideMessage');
  const $overrideCta = document.getElementById('overrideCta');

  document.getElementById('applyOverride').addEventListener('click', () => {
    const message = $overrideMessage.value.trim();
    const ctaLabel = $overrideCta.value.trim();
    if (!message && !ctaLabel) return;

    const existing = state.primary || {};
    state.primaryType = 'message-cta';
    state.scrollSpy = 'off';
    state.primary = {
      message: message || existing.message || '',
      cta: (ctaLabel || (existing.cta && existing.cta.label))
        ? { label: ctaLabel || existing.cta.label, href: existing.cta && existing.cta.href }
        : null,
    };
    renderPrimary();
    evaluateCrowding();
    log('content_override_applied', [message && `message: "${message}"`, ctaLabel && `cta: "${ctaLabel}"`].filter(Boolean).join(', '));
  });

  document.getElementById('clearOverride').addEventListener('click', () => {
    $overrideMessage.value = '';
    $overrideCta.value = '';
    applyPreset(state.activePreset);
    log('content_override_cleared');
  });

  /* ------------------------------------------------------------------ *
   * Shareable configuration link
   * ------------------------------------------------------------------ */

  const PARAM_FIELD_MAP = {
    pr: 'presentation', sf: 'surface', cs: 'ctaStyle', vis: 'visibility',
    ent: 'entrance', an: 'animSpeed', dm: 'dismissMode', mm: 'messageMode',
    ch: 'chat', se: 'search', dv: 'device', ss: 'scrollSpy', pd: 'promptDelay',
  };

  function currentStateParams() {
    const p = new URLSearchParams();
    p.set('p', state.activePreset);
    Object.entries(PARAM_FIELD_MAP).forEach(([key, field]) => p.set(key, state[field]));
    if (state.visibility === 'section-reach') p.set('srt', state.sectionReachTarget);
    return p;
  }

  function applyParamsToState(params) {
    const presetId = params.get('p');
    if (!PRESETS.some((preset) => preset.id === presetId)) return false;
    // Before applyPreset, so a preset that schedules a prompt uses the shared delay.
    if (params.has('pd')) state.promptDelay = params.get('pd');
    applyPreset(presetId);
    Object.entries(PARAM_FIELD_MAP).forEach(([key, field]) => { if (params.has(key)) state[field] = params.get(key); });
    if (params.has('srt')) state.sectionReachTarget = params.get('srt');
    syncControlsFromState();
    fullRender();
    evaluateScroll();
    return true;
  }

  document.getElementById('copyLinkBtn').addEventListener('click', async (e) => {
    const url = `${location.origin}${location.pathname}?${currentStateParams().toString()}`;
    const btn = e.currentTarget;
    try {
      await navigator.clipboard.writeText(url);
    } catch (err) {
      window.prompt('Copy this link:', url);
    }
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = original; }, 1500);
    log('link_copied');
  });

  /* ------------------------------------------------------------------ *
   * Device frame preview — a real, independently-rendered instance of
   * this page at common device viewport sizes.
   * ------------------------------------------------------------------ */

  const DEVICE_DIMS = {
    apple: { w: 390, h: 844, label: 'iPhone (Apple)' },
    android: { w: 412, h: 915, label: 'Android' },
    desktop: { w: 1280, h: 800, label: 'Desktop' },
  };

  function openFramePreview(device) {
    const dims = DEVICE_DIMS[device];
    if (!dims) return;
    $deviceBezel.dataset.device = device;
    $deviceBezel.style.width = dims.w + 'px';
    $deviceBezel.style.height = dims.h + 'px';
    const scale = Math.min(1, (window.innerWidth - 80) / dims.w, (window.innerHeight - 140) / dims.h);
    $deviceBezel.style.transform = `scale(${scale})`;
    $frameOverlayLabel.textContent = `${dims.label} · ${dims.w}×${dims.h}`;
    $deviceFrame.src = `index.html?embedded=1&${currentStateParams().toString()}`;
    $frameOverlay.hidden = false;
    document.getElementById('frameOverlayClose').focus();
    log('device_frame_opened', device);
  }

  function closeFramePreview() {
    $frameOverlay.hidden = true;
    $deviceFrame.src = 'about:blank';
    log('device_frame_closed');
  }

  document.querySelectorAll('[data-frame]').forEach((btn) => {
    btn.addEventListener('click', () => openFramePreview(btn.dataset.frame));
  });
  document.getElementById('frameOverlayClose').addEventListener('click', closeFramePreview);

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!$frameOverlay.hidden) closeFramePreview();
    else if (!$chaosOverlay.hidden) { $chaosOverlay.hidden = true; log('chaos_closed'); }
    else if (state.chatWindowOpen && $chatWindow.contains(document.activeElement)) closeChatWindow();
    else if (state.flyout) { closeFlyout(); log('flyout_closed', 'escape'); }
    else if (state.chatWindowOpen) closeChatWindow();
  });

  // Clicking away dismisses prompts/results, like any popover. The quote
  // form is exempt: an accidental click shouldn't throw away what someone
  // has typed — Escape or the prompt's × still close it deliberately.
  document.addEventListener('pointerdown', (e) => {
    if (!state.flyout || state.flyout === 'quote') return;
    const t = e.target;
    if ($sticky.contains(t) || $chatWindow.contains(t) || $panel.contains(t) || $panelToggle.contains(t)) return;
    closeFlyout();
    log('flyout_closed', 'outside click');
  });

  /* ------------------------------------------------------------------ *
   * Panel open/close
   * ------------------------------------------------------------------ */

  function openPanel() {
    $panel.hidden = false;
    $panelToggle.hidden = true;
    $panelToggle.setAttribute('aria-expanded', 'true');
  }
  function closePanel() {
    $panel.hidden = true;
    $panelToggle.hidden = false;
    $panelToggle.setAttribute('aria-expanded', 'false');
  }
  $panelToggle.addEventListener('click', () => ($panel.hidden ? openPanel() : closePanel()));
  $panelClose.addEventListener('click', closePanel);

  /* ------------------------------------------------------------------ *
   * Full render
   * ------------------------------------------------------------------ */

  function fullRender() {
    state.navCollapsed = false;
    state.utilitiesCollapsed = false;
    state.panelExpanded = false;
    $sticky.dataset.expanded = 'false';
    renderPrimary();
    renderUtilities();
    applyVisibility();
    applyControlsVisibility();
    setupRotationTimer();
    evaluateCrowding();
  }

  /* ------------------------------------------------------------------ *
   * Init
   * ------------------------------------------------------------------ */

  buildPresetButtons();

  const initialParams = new URLSearchParams(location.search);
  if (!applyParamsToState(initialParams)) {
    syncControlsFromState();
    fullRender();
    evaluateScroll();
  }
  updateStickyOffset();

  window.addEventListener('resize', updateStickyOffset);

  // Embedded device-frame preview: a real instance of this same page,
  // stripped of the dev-only chrome so it reads as a clean customer view.
  if (embedded) {
    $panelToggle.remove();
    $panel.remove();
  }
})();
