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

  // Scroll Spy's contextual mode: each section nominates its next best
  // action in the page's own markup ([data-next-action]), so it works with
  // JavaScript off: a plain link, or a native <details> holding the full
  // "show more" content. With JavaScript on, those are read here and the
  // fallback copies (.section-action) removed; the sticky surface carries
  // them instead. A link goes somewhere (→); a "more" opens that same
  // content in a modal, in place (+), where the button becomes its close:
  // the Floating Show More Button pattern.
  const { actions: CONTEXTUAL_ACTIONS, more: MORE_CONTENT } = readSectionActions();
  const contextualAction = (id) => CONTEXTUAL_ACTIONS[id] || CONTEXTUAL_ACTIONS.overview
    || Object.values(CONTEXTUAL_ACTIONS)[0] || { kind: 'link', label: 'Schedule a Test Drive', href: '#shopping' };

  function readSectionActions() {
    const actions = {};
    const more = {};
    document.querySelectorAll('[data-next-action]').forEach((el) => {
      const section = el.closest('section[id]');
      if (!section) return;
      const label = (el.querySelector('.section-action__label') || el).textContent.trim();
      const body = el.tagName === 'DETAILS' && el.querySelector('[data-more]');
      if (body) {
        const key = body.dataset.more;
        more[key] = {
          eyebrow: body.querySelector('.more__eyebrow')?.textContent.trim() || label,
          title: body.querySelector('.more__title')?.textContent.trim() || label,
          node: body,
        };
        actions[section.id] = { kind: 'more', label, modal: key };
      } else {
        actions[section.id] = { kind: 'link', label, href: el.getAttribute('href') };
      }
    });
    // The fallback copies go; ordinary page content that is also a section's
    // next best action (Shopping's Search Inventory button) stays.
    document.querySelectorAll('.section-action').forEach((el) => el.remove());
    return { actions, more };
  }

  // Small images ("logo bugs") a message can carry beside its copy.
  // Placeholders: inline SVG so the prototype stays self-contained. A real
  // asset just needs `src` instead of `svg` (rendered as an <img>).
  const LOGO_BUGS = {
    'solstice-racing': {
      alt: 'Solstice Racing team logo',
      svg: `<svg viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="20" fill="#0c0c0d"/>
        <circle cx="20" cy="20" r="16.5" fill="none" stroke="#c9a96e" stroke-width="1"/>
        <text x="20" y="22.5" text-anchor="middle" font-family="-apple-system, 'Helvetica Neue', Arial, sans-serif" font-size="12.5" font-weight="800" letter-spacing="-.4" fill="#fff">SR</text>
        <g fill="#fff"><rect x="13" y="26" width="2.8" height="2.8"/><rect x="18.6" y="26" width="2.8" height="2.8"/><rect x="24.2" y="26" width="2.8" height="2.8"/><rect x="15.8" y="28.8" width="2.8" height="2.8"/><rect x="21.4" y="28.8" width="2.8" height="2.8"/></g>
      </svg>`,
    },
  };

  function buildLogoBug(key) {
    const bug = LOGO_BUGS[key];
    if (!bug) return null;
    return bug.src
      ? h('img', { class: 'logo-bug', src: bug.src, alt: bug.alt, width: 40, height: 40 })
      : h('span', { class: 'logo-bug', role: 'img', 'aria-label': bug.alt, innerHTML: bug.svg });
  }

  const ROTATING_MESSAGES = [
    'Explore Formula 1',
    'Meet our latest concept',
    'Search available inventory',
    'Discover current offers',
  ];

  // An ancillary, time-boxed partner message (fictional satellite-radio provider).
  const NOTICE = {
    message: 'Free listening weekend: Starwave Satellite Radio is on in every Aurelia GT through Sunday.',
    cta: 'Learn more',
  };
  const NOTICE_DURATIONS = { short: 5000, standard: 8000, long: 12000 };

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
      hint: 'Logo bug | Formula 1 headline + line | Explore the Team',
      version: 'v1',
      group: 'compositions',
      patch: {
        legacyMode: false, scrollSpy: 'off', ctaStyle: 'text-link',
        primaryType: 'message-cta',
        primary: {
          badge: 'solstice-racing',
          message: 'Formula 1: Solstice Racing is on the grid',
          sub: "The engineers behind Aurelia GT's dual motors now race at the sport's top level.",
          cta: { label: 'Explore the Team' },
        },
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
      patch: { legacyMode: false, presentation: 'floating', scrollSpy: 'navigation', chat: 'off', search: 'off' },
      note: 'Click a section to jump to it; the highlight follows as you scroll the page.',
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
      note: 'Simulates a visitor who clicked a CTA on an earlier visit and has just returned to the tab. Get My Quote opens the four-step request form: vehicle, your information, dealer, review.',
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
      id: 'scroll-spy',
      label: 'Scroll Spy: Contextual CTA',
      hint: 'A next best action for the section in view',
      version: 'v2',
      group: 'compositions',
      patch: {
        // Just the button: no standing label, since the action itself says
        // where the visitor is (the "Floating Show More Button", generalized).
        legacyMode: false, presentation: 'floating', scrollSpy: 'contextual',
        primaryType: 'message-cta', primary: { message: '', cta: { label: 'Schedule a Test Drive' } },
        chat: 'off', search: 'off',
      },
      note: 'Scroll the page: the button morphs into the next best action for each section, either a link (→) or a "show more" that opens in place (+). The Scroll Spy panel section also has orientation and section-navigation modes.',
    },
    {
      id: 'timed-notice',
      label: 'Timed Notice',
      hint: 'Free listening weekend — closes itself',
      version: 'v2',
      group: 'prompts',
      patch: {
        legacyMode: false, presentation: 'floating', scrollSpy: 'off',
        primaryType: 'message-cta', primary: { message: 'Discover the latest', cta: { label: 'Explore' } },
        chat: 'off', search: 'off',
      },
      after() { scheduleOverlay('notice', promptDelayMs()); },
      note: 'A partner message arrives after the Prompt delay and closes itself when the line along the top of the bar runs out. Hover or focus the bar to pause it.',
    },
    {
      id: 'personalized-offer',
      label: 'Personalized Offer',
      hint: '$500 private offer — a pop-up that moves into the bar',
      version: 'v2',
      group: 'prompts',
      patch: {
        legacyMode: false, presentation: 'floating', scrollSpy: 'off',
        primaryType: 'message-cta', primary: { message: 'Discover the latest', cta: { label: 'Explore' } },
        chat: 'off', search: 'off',
      },
      after() { scheduleOverlay('offer', promptDelayMs()); },
      note: 'After the Prompt delay a personalized $500 offer opens as a pop-up, then moves down into the bar a few seconds later, or as soon as it is closed.',
    },
    {
      id: 'scroll-spy-chat',
      label: 'Scroll Spy + Chat',
      hint: 'The chat field suggests questions for the section in view',
      version: 'v2',
      group: 'utilities',
      patch: {
        legacyMode: false, presentation: 'floating', scrollSpy: 'contextual',
        primaryType: 'message-cta', primary: { message: '', cta: { label: 'Schedule a Test Drive' } },
        chat: 'question', search: 'off',
      },
      note: 'Scroll the page: the empty chat field cycles through questions people ask about the section in view, alongside the section\'s next best action.',
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
    halo: 'off', // 'on': frosted halo behind the floating panel or compact pill
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
    moreOpen: null, // key of the open "show more" modal, if any
    offer: null, // personalized offer: { phase: 'popup' | 'docked' | 'dismissed', claimed }
    offerPrior: null, // the composition the offer replaced in the bar
    pendingOffer: false,
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
    noticeActive: false, // the timed, auto-closing ancillary notice
    pendingNotice: false,
    noticeDuration: 'standard',
    quoteDraft: null, // in-progress multi-step quote form (survives closing the panel)
    surveyDraft: null, // the survey's step and answers while it's showing (kept if the panel closes)
    surveySubmitted: false,
    vehicleInterest: null, // vehicle the visitor clicked in search results, used to pre-fill the quote

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
  const $noticeTimer = document.getElementById('stickyTimer');
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

  // Someone is in the middle of something: prompts wait until they're done.
  function interactionBusy() {
    return !!(state.activeInteraction || state.chatWindowOpen || state.moreOpen);
  }

  function computeActiveLayerLabel() {
    if (state.privacyActive) return 'Required UI — Privacy notice';
    if (state.moreOpen) return `Active interaction — Show more: ${MORE_CONTENT[state.moreOpen].eyebrow}`;
    if (offerVisible()) return 'Personalized pop-up — moves into the bar';
    if (state.activeInteraction === 'chat' || state.chatWindowOpen) return 'Active interaction — Chat';
    if (state.activeInteraction === 'search') return 'Active interaction — Search';
    if (state.flyout === 'chat') return 'Requested utility — Chat prompts open';
    if (state.flyout === 'quote') return 'Requested utility — Quote form open';
    if (state.flyout === 'survey') return 'Requested utility — Survey open';
    if (state.flyout === 'search' || state.flyout === 'nav-overflow') return 'Requested utility — open';
    if (state.quoteActive) return 'Lead capture — Request a Quote';
    if (state.surveyActive) return 'Survey / optional engagement';
    if (state.noticeActive) return 'Ancillary notice — closes itself';
    if (state.flyout === 'offer' || state.primaryType === 'offer') return 'Personalized content — $500 private offer';
    if (state.scrollSpy === 'contextual') return `Contextual content — ${sectionLabel(state.activeSection)}`;
    if (state.scrollSpy === 'navigation') return 'Contextual content — section navigation';
    if (state.scrollSpy === 'orientation') return 'Contextual content — orientation';
    if (state.pendingQuote) return 'Primary content (quote prompt waiting)';
    if (state.pendingSurvey) return 'Primary content (survey waiting)';
    if (state.pendingNotice) return 'Primary content (notice waiting)';
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
    if (state.flyout === 'survey') return 'survey';
    if (state.flyout === 'search') return 'search';
    if (state.quoteActive) return 'quote';
    if (state.surveyActive) return 'survey';
    if (state.noticeActive) return 'notice';
    if (state.flyout === 'offer' || state.primaryType === 'offer' || offerVisible()) return 'offer';
    return null;
  }

  function renderActiveLayer() {
    const kind = computeActiveLayerKind();
    syncFormHead();

    // Drives the surface's own background tint — every colorable state
    // (chat/search/survey/quote) gets one, not just Survey/Quote's
    // primary-zone takeover, so no state is left on the plain neutral
    // background while something specific is happening.
    if (kind && kind !== 'privacy') $sticky.dataset.kind = kind;
    else delete $sticky.dataset.kind;

    renderDemoNotes();
    scheduleHandoverCheck();
    if (!$activeLayerReadout) return;
    const arriving = Object.entries(scheduled).map(([k, v]) =>
      `${promptName(k)} arriving in ${Math.max(0, (v.dueAt - performance.now()) / 1000).toFixed(1)}s`);
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
  const ENTRANCES = ['fade', 'slide', 'rise'];
  function triggerEntrance() {
    $sticky.classList.remove('enter-fade', 'enter-slide', 'enter-rise');
    if (!prefersReducedMotion && state.entrance !== 'none') {
      void $sticky.offsetWidth;
      $sticky.classList.add(`enter-${ENTRANCES.includes(state.entrance) ? state.entrance : 'fade'}`);
    }
  }

  function applyVisibility() {
    // "shouldShow" governs whether the component occupies the persistent
    // layer at all. "collapsed" governs whether it's showing full content
    // or just a restore pill — dismissing with a restore affordance keeps
    // the component in the layer, just collapsed, so the pill stays visible.
    const shouldShow = state.legacyMode ? false : state.scrollVisible && !state.fullyDismissed && !endDockHidesBar() && !startDockHidesBar();
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
    $sticky.dataset.halo = state.halo === 'on' ? 'on' : 'off';
    $sticky.dataset.survey = String(state.surveyActive);
    $sticky.dataset.quote = String(state.quoteActive);
    $sticky.dataset.notice = String(state.noticeActive);

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
    // A prompt or panel arriving while the button is docked at either end
    // of the page (in the masthead, or the last section) brings the bar back
    // to host it.
    if (endDockHidesBar && endDockHidesBar() && handoverBlocked()) resetEndDock();
    if (startDockHidesBar() && handoverBlocked()) resetStartDock();
    $primary.innerHTML = '';
    $primary.classList.toggle('is-fluid', !state.surveyActive && !state.quoteActive && !state.noticeActive && state.scrollSpy === 'off' && state.primaryType === 'search-inline');

    if (state.quoteActive) return renderQuotePrimary();
    if (state.surveyActive) return renderSurveyPrimary();
    if (state.noticeActive) return renderNoticePrimary();
    if (state.scrollSpy === 'navigation') return renderNavPrimary();
    if (state.scrollSpy === 'orientation') return renderOrientationPrimary();
    if (state.primaryType === 'offer') return renderOfferPrimary();
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
    takeSurvey.textContent = surveyCtaLabel();
    takeSurvey.setAttribute('aria-controls', 'stickyFlyout');
    takeSurvey.setAttribute('aria-expanded', String(state.flyout === 'survey'));
    // Opens the survey in place — in the same panel as chat prompts and the
    // quote form — rather than a new tab or a vendor modal.
    takeSurvey.addEventListener('click', () => {
      const first = $surface.getBoundingClientRect();
      if (state.flyout === 'survey') {
        closeFlyout();
        animateSurfaceResize(first);
        return;
      }
      log('cta_clicked', 'take_survey');
      openFlyout('survey');
      animateSurfaceResize(first);
      document.getElementById('surveyQuestion')?.focus({ preventScroll: true });
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
    $primary.appendChild(formHead('survey'));
  }

  function renderNoticePrimary() {
    const wrap = document.createElement('div');
    wrap.className = 'primary-prompt primary-prompt--notice';

    const p = document.createElement('p');
    p.textContent = NOTICE.message;
    const sr = document.createElement('span');
    sr.className = 'visually-hidden';
    sr.textContent = ' This message closes on its own; it pauses while you interact with it.';
    p.appendChild(sr);
    wrap.appendChild(p);

    const cta = document.createElement('a');
    cta.href = '#technology';
    cta.className = 'cta-textlink';
    cta.innerHTML = `${NOTICE.cta} <span aria-hidden="true">&rarr;</span>`;
    cta.addEventListener('click', () => {
      log('cta_clicked', 'notice: learn more');
      dismissNotice('acted on');
    });
    wrap.appendChild(cta);

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'sticky__icon-btn';
    close.setAttribute('aria-label', 'Dismiss notice');
    close.innerHTML = closeIcon();
    close.addEventListener('click', () => dismissNotice('dismissed'));
    wrap.appendChild(close);

    $primary.appendChild(wrap);
  }

  // The quote prompt is the highest-value optional moment, so it gets the
  // strongest treatment: a dark card inside the surface with a price-tag
  // badge, a supporting line, and a bright CTA that glints on arrival,
  // where the survey is a quiet one-liner with a small violet dot.
  const ICON_TAG = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1.4 1.4 0 0 1 0 2l-6.2 6.2a1.4 1.4 0 0 1-2 0z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="8.2" cy="8.2" r="1.6" fill="currentColor"/></svg>';

  function quoteStartingPrice() {
    const trims = QUOTE_CATALOG[2026]?.['Aurelia GT']?.trims || {};
    const min = Math.min(...Object.values(trims));
    return Number.isFinite(min) ? `$${min.toLocaleString('en-US')}` : null;
  }

  function quoteSubline() {
    if (state.quoteDraft && state.quoteDraft.step > 0) return `Pick up where you left off: step ${state.quoteDraft.step + 1} of 4.`;
    if (state.offer?.claimed) return `Your ${OFFER.amount} private offer (${OFFER.code}) will be applied.`;
    const price = quoteStartingPrice();
    return `A personalized dealer quote in about 2 minutes${price ? ` · From ${price} MSRP` : ''}`;
  }

  function renderQuotePrimary() {
    const getQuote = h('button', {
      type: 'button', class: 'btn btn--primary btn--small quote-cta',
      'aria-controls': 'stickyFlyout', 'aria-expanded': String(state.flyout === 'quote'),
      onclick: () => {
        const first = $surface.getBoundingClientRect();
        if (state.flyout === 'quote') {
          closeFlyout();
          animateSurfaceResize(first);
          return;
        }
        log('cta_clicked', quoteCtaLabel() === 'Get My Quote' ? 'get_my_quote' : 'continue_my_quote');
        openFlyout('quote');
        animateSurfaceResize(first);
        focusQuoteHeading();
      },
    },
    h('span', { class: 'quote-cta__label', text: quoteCtaLabel() }),
    h('span', { class: 'quote-cta__icon', 'aria-hidden': 'true', innerHTML: ICON_ARROW }));

    $primary.appendChild(h('div', { class: 'primary-prompt primary-prompt--quote' },
      h('span', { class: 'quote-badge', 'aria-hidden': 'true', innerHTML: ICON_TAG }),
      h('div', { class: 'quote-copy' },
        h('p', { class: 'quote-copy__title', text: 'Welcome back. Ready for pricing on the Aurelia GT?' }),
        h('p', { class: 'quote-copy__sub', text: quoteSubline() })),
      getQuote,
      h('button', { type: 'button', class: 'sticky__icon-btn', 'aria-label': 'Dismiss quote prompt', innerHTML: closeIcon(), onclick: () => dismissQuote() })));
    $primary.appendChild(formHead('quote'));
  }

  // While the quote form or survey is open, the bar's top row is just a
  // header for it: what it is, and a way to close it (answers are kept).
  // The prompt's banner, chat, search and the bar's own controls step aside
  // until it closes (CSS, keyed on data-form, so nothing re-renders).
  function formHead(kind) {
    const quote = kind === 'quote';
    return h('div', { class: `form-head form-head--${kind}` },
      quote
        ? h('span', { class: 'quote-badge form-head__badge', 'aria-hidden': 'true', innerHTML: ICON_TAG })
        : h('span', { class: 'form-head__dot', 'aria-hidden': 'true' }),
      h('p', { class: 'form-head__title' },
        quote ? 'Request a Quote' : 'Quick survey',
        quote ? null : h('span', { class: 'form-head__sub', text: ` · ${SURVEY_STEPS.length} short steps · about a minute` })),
      h('button', {
        type: 'button', class: 'form-head__close', 'aria-controls': 'stickyFlyout', 'aria-expanded': 'true',
        'aria-label': quote ? 'Close the quote form (your answers are kept)' : 'Close the survey (your answers are kept)',
        title: 'Close (your answers are kept)',
        innerHTML: closeIcon(),
        onclick: () => closeFormPanel(kind, 'close button'),
      }));
  }

  function closeFormPanel(kind, how) {
    const first = $surface.getBoundingClientRect();
    closeFlyout();
    animateSurfaceResize(first);
    log('flyout_closed', `${kind} — ${how}, answers kept`);
    $primary.querySelector(kind === 'quote' ? '.primary-prompt--quote .quote-cta' : '.primary-prompt--survey .btn--primary')
      ?.focus({ preventScroll: true });
  }

  function syncFormHead() {
    const kind = state.flyout === 'quote' || state.flyout === 'survey' ? state.flyout : null;
    if (kind && $primary.querySelector(`.form-head--${kind}`)) $sticky.dataset.form = kind;
    else delete $sticky.dataset.form;
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
      if (state.activeSection === s.id) btn.setAttribute('aria-current', 'location');
      btn.addEventListener('click', () => {
        // Highlight the destination right away and hold it there while the
        // page scrolls, instead of flickering through every section passed.
        navLock = { id: s.id, until: performance.now() + 1600 };
        state.activeSection = s.id;
        renderPrimary();
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

    // Where the strip scrolls sideways (phones), keep the highlighted link in view.
    const current = nav.querySelector('[aria-current]');
    if (current && nav.scrollWidth > nav.clientWidth) {
      const nr = nav.getBoundingClientRect();
      const cr = current.getBoundingClientRect();
      nav.scrollLeft += (cr.left + cr.width / 2) - (nr.left + nr.width / 2);
    }
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
      ctaLabel = contextualAction(state.activeSection).label;
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
        rotateMessage(-1);
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
        rotateMessage(1);
      });

      wrap.append(prev, msg, next);
      $primary.appendChild(wrap);
    } else if (messageText) {
      const p = document.createElement('p');
      p.className = 'primary-message';
      p.textContent = messageText;
      // Optional richer composition: a logo bug and a supporting line beside
      // the headline (static messages only; rotation swaps the headline).
      const feature = state.messageMode === 'static' && (data.badge || data.sub);
      if (feature) {
        $primary.appendChild(h('div', { class: 'primary-feature' },
          buildLogoBug(data.badge),
          h('div', { class: 'primary-feature__copy' },
            p,
            data.sub ? h('p', { class: 'primary-sub', text: data.sub }) : null)));
      } else {
        $primary.appendChild(p);
      }
    }

    if (ctaLabel && state.scrollSpy === 'contextual' && state.ctaStyle !== 'text-link') {
      $primary.appendChild(h('div', { class: 'primary-ctas' }, buildContextualCta(contextualAction(state.activeSection))));
    } else if (ctaLabel) {
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
      rotateMessage(1);
    }, 4200);
  }

  // Rolls the message to the next (or previous) one in place: the old line
  // lifts away as the new one rises in, and the message's width glides
  // between the two lengths, so the surface's edge and border follow it
  // instead of jumping — the border also deepens briefly to mark the change.
  // Only the message moves; the CTA (and a focused ‹ › button) stay put.
  const ROLL_MS = 820;
  const ROLL_EASE = 'cubic-bezier(.22,.8,.22,1)';
  const GLIDE_EASE = 'cubic-bezier(.65,0,.35,1)'; // ease-in-out: the edge starts and lands softly
  let rollAnims = [];
  let rollToken = 0;

  function rotateMessage(delta) {
    const n = ROTATING_MESSAGES.length;
    state.rotatorIndex = (state.rotatorIndex + delta + n) % n;
    finishRoll();
    const el = $primary.querySelector('.primary-message, .rotator__msg');
    if (!el || prefersReducedMotion || $sticky.dataset.visible !== 'true' || swapTimer) {
      renderPrimary();
      evaluateCrowding();
      return;
    }
    const text = ROTATING_MESSAGES[state.rotatorIndex];
    const oldText = el.textContent;
    const firstW = el.getBoundingClientRect().width;
    const incoming = h('span', { class: 'msg-roll__in', text });
    el.replaceChildren(incoming);
    el.classList.add('is-rolling');
    const lastW = el.getBoundingClientRect().width;
    const outgoing = h('span', { class: 'msg-roll__out', 'aria-hidden': 'true', text: oldText });
    el.append(outgoing);

    // Growing: the edge leads, so the longer line is never clipped as it
    // arrives. Shrinking: the edge waits for the old line to clear first.
    const grows = lastW >= firstW;
    const glide = grows
      ? { duration: ROLL_MS * 0.7, easing: GLIDE_EASE }
      : { duration: ROLL_MS * 0.72, delay: ROLL_MS * 0.28, easing: GLIDE_EASE, fill: 'backwards' };
    const token = ++rollToken;
    rollAnims = [
      el.animate([{ width: `${firstW}px` }, { width: `${lastW}px` }], glide),
      outgoing.animate(
        [{ opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }, { opacity: 0, transform: 'translateY(-65%)', filter: 'blur(3px)' }],
        { duration: ROLL_MS * 0.42, easing: 'cubic-bezier(.4,0,.8,.4)', fill: 'forwards' }),
      incoming.animate(
        [{ opacity: 0, transform: 'translateY(65%)', filter: 'blur(3px)' }, { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }],
        { duration: ROLL_MS * 0.66, delay: ROLL_MS * 0.34, easing: ROLL_EASE, fill: 'backwards' }),
    ];
    traceBorder();
    Promise.all(rollAnims.slice(0, 3).map((a) => a.finished)).then(() => {
      if (token === rollToken) finishRoll();
    }, () => {});
  }

  // A soft highlight runs once around the inside of the surface's border
  // as the message changes (CSS: .is-tracing). Drawn inside the card, so
  // it reads over the dark hero and the white page alike.
  function traceBorder() {
    $surface.classList.remove('is-tracing');
    void $surface.offsetWidth;
    $surface.classList.add('is-tracing');
  }
  // On $sticky ($surface is declared further down); the event bubbles up.
  $sticky.addEventListener('animationend', (e) => {
    if (e.animationName === 'borderTrace') e.target.classList.remove('is-tracing');
  });

  // Settles a roll still in flight (a new one starting, or the roll ending):
  // back to plain text, so ellipsis and crowding checks behave as usual.
  function finishRoll() {
    if (!rollAnims.length) return;
    rollAnims.forEach((a) => a.cancel());
    rollAnims = [];
    rollToken++;
    const el = $primary.querySelector('.is-rolling');
    if (el) {
      el.textContent = el.querySelector('.msg-roll__in')?.textContent || el.textContent;
      el.classList.remove('is-rolling');
    }
    evaluateCrowding();
  }

  $sticky.addEventListener('mouseenter', () => { state.rotationPaused = true; pauseNotice('hover'); });
  $sticky.addEventListener('mouseleave', () => { state.rotationPaused = false; resumeNotice('hover'); });
  $sticky.addEventListener('focusin', () => { state.rotationPaused = true; pauseNotice('focus'); });
  $sticky.addEventListener('focusout', () => { state.rotationPaused = false; resumeNotice('focus'); });

  /* ------------------------------------------------------------------ *
   * Contextual next best action (Scroll Spy "Contextual CTA")
   *
   * One button whose job changes with the section in view. A "link"
   * action goes somewhere; a "more" action opens deeper content on the
   * section's topic in a modal, and the button itself becomes that
   * modal's close, in the same spot (the Floating Show More Button).
   * Between sections the button morphs rather than cross-fading: the
   * label clears, it collapses to its icon, then grows into the next
   * action with the new label arriving last.
   * ------------------------------------------------------------------ */

  const ICON_PLUS = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
  const ICON_ARROW = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const actionKey = (a) => `${a.kind}:${a.label}`;

  function buildContextualCta(action) {
    const more = action.kind === 'more';
    const open = more && state.moreOpen === action.modal;
    const el = h(more ? 'button' : 'a', {
      class: `btn btn--small cta-action cta-action--${action.kind}${open ? ' is-close' : ''}`,
      'data-key': actionKey(action),
      onclick: (e) => {
        if (!more) { log('cta_clicked', action.label); return; }
        e.preventDefault();
        if (state.moreOpen) closeMoreModal('button');
        else openMoreModal(action.modal);
      },
    },
    h('span', { class: 'cta-action__label', text: action.label }),
    h('span', { class: 'cta-action__icon', 'aria-hidden': 'true', innerHTML: more ? ICON_PLUS : ICON_ARROW }));
    if (more) {
      el.type = 'button';
      el.setAttribute('aria-haspopup', 'dialog');
      el.setAttribute('aria-controls', 'moreModal');
      el.setAttribute('aria-expanded', String(open));
      if (open) el.setAttribute('aria-label', `Close: ${MORE_CONTENT[action.modal].eyebrow}`);
    } else {
      el.href = action.href;
    }
    return el;
  }

  let ctaMorph = null; // { stage: 'out' | 'in', anims }
  let morphToken = 0;
  const MORPH_EASE = 'cubic-bezier(.2,.8,.2,1)';

  let closeStateTimer = null;

  function cancelCtaMorph() {
    clearTimeout(closeStateTimer);
    // Always clear the class-driven states too, so nothing can leave the
    // label hidden once a morph or open/close has been interrupted.
    $primary.querySelectorAll('.cta-action').forEach((el) => el.classList.remove('is-morphing', 'is-label-out', 'is-label-in'));
    if (!ctaMorph) return;
    morphToken++;
    ctaMorph.anims.forEach((a) => a.cancel());
    ctaMorph = null;
  }

  // Returns false when there's no contextual button to morph (the caller
  // then falls back to the usual cross-fade).
  function morphContextualCta() {
    const el = $primary.querySelector('.cta-action');
    if (!el || prefersReducedMotion || $sticky.dataset.visible !== 'true') return false;
    if (state.moreOpen) return true; // the modal's close stays put; resolved on close
    if (ctaMorph && ctaMorph.stage === 'out') return true; // the swap reads the latest section
    const next = contextualAction(state.activeSection);
    if (!ctaMorph && el.dataset.key === actionKey(next)) return true;

    const w0 = el.getBoundingClientRect().width;
    cancelCtaMorph();
    const size = el.offsetHeight;
    const label = el.querySelector('.cta-action__label');
    el.classList.add('is-morphing');
    const token = ++morphToken;
    const anims = [
      label.animate([{ opacity: 1, filter: 'blur(0)' }, { opacity: 0, filter: 'blur(2px)' }], { duration: 150, easing: 'ease-out', fill: 'forwards' }),
      el.animate([{ width: `${w0}px` }, { width: `${size}px` }], { duration: 260, delay: 90, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }),
    ];
    ctaMorph = { stage: 'out', anims };
    anims[1].finished.then(() => { if (token === morphToken) expandContextualCta(el, size, token); }, () => {});
    return true;
  }

  function expandContextualCta(old, size, token) {
    if (!old.isConnected) { ctaMorph = null; return; } // re-rendered in the meantime
    const hadFocus = old === document.activeElement;
    const oldBg = getComputedStyle(old).backgroundColor;
    const oldColor = getComputedStyle(old).color;
    const el = buildContextualCta(contextualAction(state.activeSection));
    el.classList.add('is-morphing');
    old.replaceWith(el);
    ctaMorph.anims.forEach((a) => a.cancel());
    const w1 = el.getBoundingClientRect().width;
    const cs = getComputedStyle(el);
    if (hadFocus) el.focus({ preventScroll: true });
    const label = el.querySelector('.cta-action__label');
    const icon = el.querySelector('.cta-action__icon');
    const anims = [
      el.animate([
        { width: `${size}px`, backgroundColor: oldBg, color: oldColor },
        { width: `${size}px`, backgroundColor: cs.backgroundColor, color: cs.color, offset: 0.3 },
        { width: `${w1}px`, backgroundColor: cs.backgroundColor, color: cs.color },
      ], { duration: 520, easing: MORPH_EASE }),
      icon.animate([{ transform: 'scale(.4) rotate(-90deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 280, easing: MORPH_EASE }),
      label.animate([{ opacity: 0, transform: 'translateX(8px)', filter: 'blur(2px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 260, delay: 300, easing: MORPH_EASE, fill: 'backwards' }),
    ];
    ctaMorph = { stage: 'in', anims };
    Promise.all(anims.map((a) => a.finished)).then(() => {
      if (token !== morphToken) return;
      el.classList.remove('is-morphing');
      ctaMorph = null;
      evaluateCrowding();
      scheduleHandoverCheck(); // a hand-over may have been waiting on this morph
    }, () => {});
    renderActiveLayer();
  }

  // The "more" button turning into the modal's close (and back): the label
  // clears, the button collapses to its icon, and the + turns into an ×.
  // The label's visibility is driven only by classes (is-close hides it,
  // is-label-out fades it, is-label-in fades it back), never by a script
  // animation's fill, so its resting state is always "visible" unless the
  // modal is open. Only the width glide uses the Web Animations API.
  function setCtaCloseState(open) {
    const el = $primary.querySelector('.cta-action--more');
    if (!el) return;
    cancelCtaMorph();
    el.setAttribute('aria-expanded', String(open));
    if (open) el.setAttribute('aria-label', `Close: ${MORE_CONTENT[state.moreOpen].eyebrow}`);
    else el.removeAttribute('aria-label');
    if (prefersReducedMotion) { el.classList.toggle('is-close', open); return; }

    const token = ++morphToken;
    const glide = () => {
      if (token !== morphToken || !el.isConnected) return;
      const first = el.getBoundingClientRect().width;
      el.classList.remove('is-label-out');
      el.classList.toggle('is-close', open);
      const last = el.getBoundingClientRect().width;
      if (!open) el.classList.add('is-label-in');
      el.classList.add('is-morphing');
      const anim = el.animate([{ width: `${first}px` }, { width: `${last}px` }], { duration: open ? 300 : 460, easing: MORPH_EASE });
      ctaMorph = { stage: 'in', anims: [anim] };
      // Time-based cleanup (not tied to the animation's promise), so the
      // button always settles even if an animation is dropped.
      closeStateTimer = setTimeout(() => {
        if (token !== morphToken) return;
        anim.cancel();
        el.classList.remove('is-morphing', 'is-label-in');
        ctaMorph = null;
        if (!open) {
          // The page may have been resized under the modal; catch up.
          if (el.dataset.key !== actionKey(contextualAction(state.activeSection))) morphContextualCta();
          evaluateCrowding();
        }
      }, open ? 320 : 540);
    };

    if (open) {
      // Clear the label first, then collapse to the icon.
      el.classList.add('is-label-out');
      ctaMorph = { stage: 'in', anims: [] };
      closeStateTimer = setTimeout(glide, 130);
    } else {
      glide();
    }
  }

  /* ---- The "show more" modal ---- */

  const $moreModal = document.getElementById('moreModal');
  const $moreScroller = document.getElementById('moreModalScroller');
  const $moreCard = document.getElementById('moreModalCard');
  let moreOpenedAt = 0;
  let moreCloseTimer = null;

  // The modal shows the same content the no-JS page has inline, cloned
  // from the markup; only the heading levels move up (it's the dialog's
  // own title now, not a sub-heading of the section).
  function renderMoreModal(c) {
    const content = c.node.cloneNode(true);
    const promote = (from, to) => content.querySelectorAll(from).forEach((old) => {
      const el = document.createElement(to);
      el.className = old.className;
      el.append(...old.childNodes);
      old.replaceWith(el);
    });
    promote('h3', 'h2');
    promote('h4', 'h3');
    const title = content.querySelector('.more__title');
    title.id = 'moreModalTitle';
    title.tabIndex = -1;
    content.querySelectorAll('.more__next a').forEach((a) => a.addEventListener('click', () => {
      log('cta_clicked', `${a.textContent.trim()} (from show more)`);
      closeMoreModal('next step', { instant: true });
    }));
    $moreCard.replaceChildren(
      h('button', { type: 'button', class: 'more-modal__x', 'aria-label': 'Close', innerHTML: closeIcon(), onclick: () => closeMoreModal('close button') }),
      ...content.childNodes);
  }

  function lockPage(lock) {
    const root = document.documentElement;
    // Keep the scrollbar's space only where there is one; reserving it on
    // overlay-scrollbar devices narrows the page and makes it reflow.
    const hasScrollbar = window.innerWidth > root.clientWidth;
    root.style.overflow = lock ? 'hidden' : '';
    root.style.scrollbarGutter = lock && hasScrollbar ? 'stable' : '';
    document.querySelector('.site').inert = lock;
    root.classList.toggle('more-open', lock);
  }

  function openMoreModal(key) {
    const c = MORE_CONTENT[key];
    if (!c || state.moreOpen) return;
    clearTimeout(moreCloseTimer);
    state.moreOpen = key;
    moreOpenedAt = performance.now();
    renderMoreModal(c);
    $moreModal.hidden = false;
    $moreModal.classList.remove('is-closing');
    $moreScroller.scrollTop = 0; // after un-hiding: a hidden scroller ignores it
    lockPage(true);
    setCtaCloseState(true);
    requestAnimationFrame(() => document.getElementById('moreModalTitle').focus({ preventScroll: true }));
    log('show_more_opened', `${sectionLabel(state.activeSection)} — ${c.eyebrow}`);
    renderActiveLayer();
    renderDemoNotes();
  }

  function closeMoreModal(how, { instant = false } = {}) {
    if (!state.moreOpen) return;
    const key = state.moreOpen;
    const focusWasInside = $moreModal.contains(document.activeElement) || document.activeElement?.classList.contains('cta-action');
    state.moreOpen = null;
    log('show_more_closed', `${MORE_CONTENT[key].eyebrow} — ${how}, after ${((performance.now() - moreOpenedAt) / 1000).toFixed(1)}s`);
    const finish = () => {
      $moreModal.hidden = true;
      $moreModal.classList.remove('is-closing');
      $moreCard.replaceChildren();
    };
    lockPage(false);
    if (instant || prefersReducedMotion) finish();
    else {
      $moreModal.classList.add('is-closing');
      moreCloseTimer = setTimeout(finish, 280);
    }
    setCtaCloseState(false);
    if (focusWasInside && how !== 'next step') $primary.querySelector('.cta-action')?.focus({ preventScroll: true });
    renderActiveLayer();
    renderDemoNotes();
    maybeReleasePendingOverlays();
  }

  $moreScroller.addEventListener('click', (e) => {
    // Outside the card (the dimmed page) closes, like any modal.
    if (!$moreCard.contains(e.target)) closeMoreModal('outside click');
  });

  // Keep Tab inside the modal, plus the floating close in the bar.
  document.addEventListener('keydown', (e) => {
    if (!state.moreOpen || e.key !== 'Tab') return;
    const items = [...$moreCard.querySelectorAll('a[href], button:not([disabled])'), $primary.querySelector('.cta-action')].filter(Boolean);
    if (!items.length) return;
    // Handled every time: the floating close lives outside the dialog in the
    // DOM, so the browser's own order would never reach it.
    e.preventDefault();
    const i = items.indexOf(document.activeElement);
    const n = items.length;
    items[i === -1 ? (e.shiftKey ? n - 1 : 0) : (i + (e.shiftKey ? n - 1 : 1)) % n].focus();
  });

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
    renderDemoNotes();
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
      syncChatHints();
    });
    input.addEventListener('blur', () => {
      state.activeInteraction = null;
      renderActiveLayer();
      maybeReleasePendingOverlays();
      syncChatHints();
    });
    input.addEventListener('input', () => syncChatHints());
    // The input shares its slot with the rotating example questions (shown
    // while Scroll Spy is on and the field is empty and idle).
    field.appendChild(h('span', { class: 'chat-input-wrap' },
      input,
      h('span', { class: 'chat-hint', 'aria-hidden': 'true' })));

    const send = document.createElement('button');
    send.type = 'button';
    send.setAttribute('aria-label', 'Ask a question — opens chat window');
    // Two icons, one shown per breakpoint: a send arrow next to the text field
    // on wider screens; on phones (where CSS hides the field) a chat bubble.
    send.innerHTML = '<svg class="icon-send" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      + chatIcon().replace('<svg ', '<svg class="icon-open-chat" ');
    const handoff = () => {
      // Sending with nothing typed asks the example question on show.
      const typed = input.value.trim();
      const text = typed || (field.dataset.hints === 'on' ? currentChatHint() : '');
      if (!typed && text) log('chat_hint_used', `${sectionLabel(state.activeSection)}: ${text}`);
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

    // Filled in (and started rotating, where it applies) once it's in the bar.
    requestAnimationFrame(() => syncChatHints());
    return field;
  }

  /* ------------------------------------------------------------------ *
   * A deliberate end to the pinned experience
   *
   * When the floating button's action is also the main button of the
   * section's own call-to-action row (Shopping's "Search Inventory"), the
   * pinned experience ends there: as that row rises above the bar, the
   * floating button flies up into its in-page twin and splits into the
   * row's buttons, and the bar steps away. Scroll back up and the buttons
   * merge and fly back down into the bar. Until then the row's buttons
   * keep their place in the layout but stay invisible, so the page never
   * shows the same button twice. With reduced motion it's a plain swap.
   * ------------------------------------------------------------------ */

  // `var` (hoisted): evaluateScroll() runs this during setup.
  var endDock = { phase: 'pinned', row: null, main: null, barTop: 0, ghosts: [] };
  const END_FLY_MS = 520;
  const END_SPLIT_MS = 420;

  // The section row whose main button is the floating button's action.
  function endDockRow() {
    if (state.scrollSpy !== 'contextual' || state.legacyMode || state.ctaStyle === 'text-link') return null;
    const main = document.querySelector('.hero__ctas [data-next-action]');
    const row = main?.closest('.hero__ctas');
    const section = row?.closest('section[id]');
    if (!row || !section) return null;
    const action = contextualAction(section.id);
    return action.kind === 'link' && action.label === main.textContent.trim() ? { row, main, section } : null;
  }

  // Only a bar that holds nothing but the floating button can hand over to
  // the page; anything else (a prompt, chat, an open panel) keeps it pinned.
  function handoverBlocked() {
    return !!(state.surveyActive || state.quoteActive || state.noticeActive || state.primaryType === 'offer'
      || state.flyout || state.moreOpen || state.minimized || state.fullyDismissed || !state.scrollVisible
      || $utilities.children.length || state.chatWindowOpen);
  }

  function setRowWaiting(row, waiting) {
    row?.classList.toggle('is-dock-waiting', waiting);
  }

  function clearEndGhosts() {
    endDock.ghosts.forEach((g) => g.remove());
    endDock.ghosts = [];
  }

  // A copy of an element, positioned on the page at a given rect.
  function endGhost(rect, ...children) {
    const g = h('div', { class: 'end-ghost', 'aria-hidden': 'true' }, ...children);
    Object.assign(g.style, { left: `${rect.left + window.scrollX}px`, top: `${rect.top + window.scrollY}px`, width: `${rect.width}px`, height: `${rect.height}px` });
    document.body.append(g);
    endDock.ghosts.push(g);
    return g;
  }
  const pageBox = (r) => ({ left: `${r.left + window.scrollX}px`, top: `${r.top + window.scrollY}px`, width: `${r.width}px`, height: `${r.height}px` });
  const copyOf = (el) => { const c = el.cloneNode(true); c.removeAttribute('id'); c.removeAttribute('data-next-action'); c.tabIndex = -1; return c; };

  function evaluateEndDock() {
    if (!endDock || !$utilities) return;
    const target = endDockRow();
    // Not this kind of scene (or a busy bar): make sure nothing is held back.
    if (!target || (handoverBlocked() && endDock.phase === 'pinned')) {
      if (endDock.phase === 'docked' || endDock.phase === 'docking') resetEndDock();
      document.querySelectorAll('.hero__ctas.is-dock-waiting').forEach((r) => r.classList.remove('is-dock-waiting'));
      return;
    }
    if (endDock.phase === 'docking' || endDock.phase === 'undocking') return;
    const rowRect = target.row.getBoundingClientRect();
    const rowMid = rowRect.top + rowRect.height / 2;
    if (endDock.phase === 'pinned') {
      // Never two copies of the same button on screen: the row's buttons
      // wait (invisibly, in place) only while the bar shows the same action.
      const sameAction = state.activeSection === target.section.id;
      setRowWaiting(target.row, sameAction);
      const barTop = $surface.getBoundingClientRect().top;
      if (sameAction && $sticky.dataset.visible === 'true' && rowMid <= barTop) {
        // Reached the bar mid-morph (a quick scroll): settle the button on
        // the row's action at once rather than leave the row's slot empty.
        const want = actionKey(contextualAction(target.section.id));
        if (ctaMorph || $primary.querySelector('.cta-action')?.dataset.key !== want) { cancelCtaMorph(); renderPrimary(); }
        dockAtEnd(target, barTop);
      }
    } else if (endDock.phase === 'docked') {
      // Back below where the bar sits: hand the button back to it.
      if (rowMid > endDock.barTop + 24) undockFromEnd(target);
    }
  }

  function dockAtEnd(target, barTop) {
    const cta = $primary.querySelector('.cta-action');
    if (!cta) return;
    endDock = { ...endDock, phase: prefersReducedMotion ? 'docked' : 'docking', row: target.row, main: target.main, barTop };
    log('sticky_end_docked', `${sectionLabel(target.section.id)} — the floating button joins the page's own buttons`);
    if (prefersReducedMotion) { setRowWaiting(target.row, false); applyVisibility(); renderDemoNotes(); return; }

    const from = cta.getBoundingClientRect();
    const others = [...target.row.children].filter((el) => el !== target.main);
    // The flying button: the bar's button cross-fading into its in-page twin.
    const barCopy = h('div', { class: 'primary-ctas end-ghost__layer' }, copyOf(cta));
    const pageCopy = h('div', { class: 'end-ghost__layer' }, copyOf(target.main));
    const fly = endGhost(from, barCopy, pageCopy);
    const surfaceFade = $sticky.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: 'ease-out', fill: 'forwards' });
    cta.style.visibility = 'hidden';

    const mainRect = target.main.getBoundingClientRect();
    fly.animate([pageBox(from), pageBox(mainRect)], { duration: END_FLY_MS, easing: 'cubic-bezier(.3,.7,.2,1)', fill: 'forwards' });
    barCopy.animate([{ opacity: 1 }, { opacity: 0 }], { duration: END_FLY_MS * 0.6, easing: 'ease-in', fill: 'forwards' });
    pageCopy.animate([{ opacity: 0 }, { opacity: 1 }], { duration: END_FLY_MS * 0.6, delay: END_FLY_MS * 0.25, easing: 'ease-out', fill: 'both' });
    // Then it splits: each other button slides out of it to its own place.
    const splits = others.map((el) => {
      const g = endGhost(mainRect, h('div', { class: 'end-ghost__layer' }, copyOf(el)));
      return g.animate([{ ...pageBox(mainRect), opacity: 0 }, { ...pageBox(el.getBoundingClientRect()), opacity: 1 }],
        { duration: END_SPLIT_MS, delay: END_FLY_MS - 80, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' });
    });
    surfaceFade.finished.then(() => {
      applyVisibility(); // the bar steps away for real (endDockHidesBar)
      surfaceFade.cancel();
      cta.style.visibility = '';
    }, () => {});
    Promise.all([...splits.map((a) => a.finished), new Promise((r) => setTimeout(r, END_FLY_MS))]).then(() => {
      if (endDock.phase !== 'docking') return;
      setRowWaiting(target.row, false);
      clearEndGhosts();
      endDock.phase = 'docked';
      renderDemoNotes();
      evaluateEndDock(); // the visitor may already have scrolled back up
    }, () => {});
  }

  function undockFromEnd(target) {
    const row = endDock.row || target.row;
    const main = endDock.main || target.main;
    endDock.phase = prefersReducedMotion ? 'pinned' : 'undocking';
    log('sticky_end_undocked', 'scrolled back up — the button returns to the bar');
    if (prefersReducedMotion) { setRowWaiting(row, true); applyVisibility(); renderDemoNotes(); return; }

    const mainRect = main.getBoundingClientRect();
    const others = [...row.children].filter((el) => el !== main).map((el) => ({ el, rect: el.getBoundingClientRect() }));
    setRowWaiting(row, true);
    // Bring the bar back invisibly so we know where its button sits.
    $sticky.classList.add('is-receiving');
    applyVisibility();
    const cta = $primary.querySelector('.cta-action');
    const to = cta ? cta.getBoundingClientRect() : $surface.getBoundingClientRect();
    others.forEach(({ el, rect }) => {
      const g = endGhost(rect, h('div', { class: 'end-ghost__layer' }, copyOf(el)));
      g.animate([{ ...pageBox(rect), opacity: 1 }, { ...pageBox(mainRect), opacity: 0 }], { duration: 300, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' });
    });
    const pageCopy = h('div', { class: 'end-ghost__layer' }, copyOf(main));
    const barCopy = h('div', { class: 'primary-ctas end-ghost__layer' }, cta ? copyOf(cta) : null);
    const fly = endGhost(mainRect, pageCopy, barCopy);
    barCopy.style.opacity = '0';
    const flight = fly.animate([pageBox(mainRect), pageBox(to)], { duration: END_FLY_MS, delay: 200, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both' });
    pageCopy.animate([{ opacity: 1 }, { opacity: 0 }], { duration: END_FLY_MS * 0.6, delay: 260, fill: 'forwards' });
    barCopy.animate([{ opacity: 0 }, { opacity: 1 }], { duration: END_FLY_MS * 0.6, delay: 320, fill: 'forwards' });
    flight.finished.then(() => {
      if (endDock.phase !== 'undocking') return;
      $sticky.classList.remove('is-receiving');
      clearEndGhosts();
      endDock.phase = 'pinned';
      renderDemoNotes();
      evaluateEndDock();
    }, () => {});
  }

  // A scene change (preset, flow step, busy bar): no animation, just put
  // everything back where it belongs.
  function resetEndDock() {
    if (!endDock) return;
    clearEndGhosts();
    $sticky?.classList.remove('is-receiving');
    document.querySelectorAll('.hero__ctas.is-dock-waiting').forEach((r) => r.classList.remove('is-dock-waiting'));
    const was = endDock.phase;
    endDock = { phase: 'pinned', row: null, main: null, barTop: 0, ghosts: [] };
    if (was !== 'pinned') applyVisibility();
  }

  // Re-checked once a prompt, panel or takeover settles (not just on
  // scroll): e.g. a survey dismissed with the page's buttons already in
  // view hands straight over to them instead of leaving two of the same.
  var endDockCheck = 0;
  function scheduleHandoverCheck() {
    if (endDockCheck) return;
    endDockCheck = requestAnimationFrame(() => { endDockCheck = 0; evaluateEndDock(); evaluateStartDock(); });
  }

  function endDockHidesBar() {
    return !!endDock && (endDock.phase === 'docked' || endDock.phase === 'docking');
  }

  /* ------------------------------------------------------------------ *
   * A deliberate beginning — the same hand-over at the top of the page
   *
   * In the first view the masthead's own two buttons are the only calls to
   * action; the bar waits. Once the masthead is 60% out of view,
   * the two merge into one, which moves down into the bar and becomes the
   * floating button (the section's next best action from then on). Scroll
   * back up and it flies back and splits into them as the bar steps away.
   * Like the end, only a bar holding nothing but the floating button takes
   * part, and only when the bar is set to be always visible (any other
   * "Show when" trigger keeps its own entrance).
   * ------------------------------------------------------------------ */

  // `var` (hoisted): applyVisibility() and renderPrimary() read these during setup.
  var startDock = { phase: 'pinned', settle: true, ghosts: [], fade: null };
  var START_AT = 0.6; // share of the masthead out of view
  var START_FLY_MS = 620;
  var START_MERGE_MS = 300;

  function startDockRow() {
    if (state.scrollSpy !== 'contextual' || state.legacyMode || state.ctaStyle === 'text-link' || state.visibility !== 'always') return null;
    const hero = document.getElementById('hero');
    const row = hero?.querySelector('.hero__ctas');
    const main = row?.querySelector('.btn--primary') || row?.firstElementChild;
    return row && main ? { hero, row, main } : null;
  }

  // How much of the masthead is out of view (0 → 1).
  function heroOffShare(hero) {
    const r = hero.getBoundingClientRect();
    if (!r.height) return 1;
    const seen = Math.max(0, Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0));
    return 1 - seen / r.height;
  }

  function setStartWaiting(waiting) {
    document.querySelector('#hero .hero__ctas')?.classList.toggle('is-start-waiting', waiting);
  }

  function clearStartGhosts() {
    startDock.ghosts.forEach((g) => g.remove());
    startDock.ghosts = [];
  }

  // Ghosts here are fixed to the viewport, since one end of each flight is
  // the (fixed) bar; glide() re-reads both ends every frame, so the masthead
  // end stays on its mark while the page scrolls.
  function placeGhost(g, r) {
    Object.assign(g.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
  }
  function startGhost(rect, ...children) {
    const g = h('div', { class: 'end-ghost end-ghost--fixed', 'aria-hidden': 'true' }, ...children);
    placeGhost(g, rect);
    document.body.append(g);
    startDock.ghosts.push(g);
    return g;
  }
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  const easeOut = (t) => 1 - (1 - t) ** 3;
  function glide(g, from, to, { ms, delay = 0, ease = easeInOut, fade = null }) {
    return new Promise((resolve) => {
      const t0 = performance.now() + delay;
      const frame = (now) => {
        if (!g.isConnected) return resolve(false);
        const t = Math.min(1, Math.max(0, (now - t0) / ms));
        const e = ease(t);
        const a = from();
        const b = to();
        const mix = (k) => a[k] + (b[k] - a[k]) * e;
        placeGhost(g, { left: mix('left'), top: mix('top'), width: mix('width'), height: mix('height') });
        if (fade) g.style.opacity = String(fade[0] + (fade[1] - fade[0]) * e);
        if (t < 1) requestAnimationFrame(frame);
        else resolve(true);
      };
      frame(performance.now());
    });
  }
  // The masthead's buttons are white-on-dark only inside the masthead, so
  // their copies carry their computed look with them.
  const LOOK_PROPS = ['backgroundColor', 'color', 'borderStyle', 'borderWidth', 'borderColor', 'borderRadius',
    'fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'boxShadow', 'opacity'];
  function styledCopy(el) {
    const c = copyOf(el);
    const cs = getComputedStyle(el);
    LOOK_PROPS.forEach((k) => { c.style[k] = cs[k]; });
    return c;
  }

  function evaluateStartDock() {
    if (!startDock || !$utilities) return;
    const target = startDockRow();
    if (!target || handoverBlocked()) {
      if (startDock.phase !== 'pinned') resetStartDock();
      else setStartWaiting(false);
      startDock.settle = false;
      return;
    }
    if (startDock.phase === 'merging' || startDock.phase === 'splitting') return;
    const off = heroOffShare(target.hero);
    // A fresh scene (or the first look at the page) opens in the right
    // place, without a flight.
    if (startDock.settle || $sticky.dataset.visible !== 'true' && startDock.phase === 'pinned') {
      startDock.settle = false;
      if (off < START_AT) toPage();
      else setStartWaiting(true);
      return;
    }
    if (startDock.phase === 'pinned') {
      setStartWaiting(true);
      if (off < START_AT - 0.04) splitToHero(target);
    } else if (startDock.phase === 'page') {
      setStartWaiting(false);
      if (off >= START_AT) mergeIntoBar(target);
    }
  }

  function toPage() {
    startDock.phase = 'page';
    setStartWaiting(false);
    applyVisibility();
    renderDemoNotes();
    syncScrollCue();
  }

  function toPinned() {
    startDock.phase = 'pinned';
    setStartWaiting(true);
    $sticky.classList.remove('is-receiving');
    applyVisibility();
    renderDemoNotes();
    syncScrollCue();
  }

  function mergeIntoBar(target) {
    startDock.phase = 'merging';
    syncScrollCue(); // the hint has done its job
    log('sticky_start_merged', "the masthead's buttons merge into the floating button");
    // The bar's button settles on this section's action before anything
    // flies to it (it may have been mid-morph while the bar was away).
    const want = actionKey(contextualAction(state.activeSection));
    if (ctaMorph || $primary.querySelector('.cta-action')?.dataset.key !== want) { cancelCtaMorph(); renderPrimary(); }
    if (prefersReducedMotion) { toPinned(); return; }

    const mainRect = () => target.main.getBoundingClientRect();
    const others = [...target.row.children].filter((el) => el !== target.main);
    const othersCopies = others.map((el) => ({ el, copy: styledCopy(el) }));
    const pageCopy = h('div', { class: 'end-ghost__layer' }, styledCopy(target.main));
    setStartWaiting(true);
    // The bar is laid out (so its button can be targeted) but stays
    // invisible until the button lands, then fades in around it.
    $sticky.classList.add('is-receiving');
    applyVisibility();
    const cta = $primary.querySelector('.cta-action');
    const barRect = () => (cta?.isConnected ? cta : $surface).getBoundingClientRect();

    // First the masthead's buttons merge into its main one…
    othersCopies.forEach(({ el, copy }) => {
      const g = startGhost(el.getBoundingClientRect(), h('div', { class: 'end-ghost__layer' }, copy));
      glide(g, () => el.getBoundingClientRect(), mainRect, { ms: START_MERGE_MS, fade: [1, 0] });
    });
    // …which then flies down into the bar, becoming the floating button.
    const barCopy = h('div', { class: 'primary-ctas end-ghost__layer' }, cta ? copyOf(cta) : null);
    barCopy.style.opacity = '0';
    const fly = startGhost(mainRect(), pageCopy, barCopy);
    const lift = START_MERGE_MS - 60;
    // The bar's (dark) button takes over while still over the dark masthead,
    // so the flight stays visible over the light page below; the masthead's
    // copy fades out underneath it, never showing two labels at once.
    barCopy.animate([{ opacity: 0 }, { opacity: 1 }], { duration: START_FLY_MS * 0.28, delay: lift + START_FLY_MS * 0.04, fill: 'forwards' });
    pageCopy.animate([{ opacity: 1 }, { opacity: 0 }], { duration: START_FLY_MS * 0.15, delay: lift + START_FLY_MS * 0.3, fill: 'forwards' });
    glide(fly, mainRect, barRect, { ms: START_FLY_MS, delay: lift }).then(() => {
      if (startDock.phase !== 'merging') return;
      clearStartGhosts();
      toPinned();
      evaluateStartDock(); // the visitor may already have scrolled back up
    });
  }

  function splitToHero(target) {
    startDock.phase = 'splitting';
    log('sticky_start_split', 'back at the masthead — the floating button splits into its buttons');
    if (prefersReducedMotion) { toPage(); return; }

    const cta = $primary.querySelector('.cta-action');
    const from = (cta || $surface).getBoundingClientRect(); // the bar is fixed: its spot holds still
    const mainRect = () => target.main.getBoundingClientRect();
    const others = [...target.row.children].filter((el) => el !== target.main);
    // Copies are taken while the masthead's buttons can still be measured.
    const copies = others.map((el) => ({ el, copy: styledCopy(el) }));
    const barCopy = h('div', { class: 'primary-ctas end-ghost__layer' }, cta ? copyOf(cta) : null);
    const pageCopy = h('div', { class: 'end-ghost__layer' }, styledCopy(target.main));
    pageCopy.style.opacity = '0';
    const fly = startGhost(from, barCopy, pageCopy);
    if (cta) cta.style.visibility = 'hidden';
    const fade = $sticky.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: 'ease-out', fill: 'forwards' });
    startDock.fade = fade;
    fade.finished.then(() => {
      applyVisibility(); // the bar steps away for real (startDockHidesBar)
      fade.cancel();
      if (cta) cta.style.visibility = '';
    }, () => {});
    // The reverse: the masthead's copy (on top) arrives near the masthead.
    pageCopy.animate([{ opacity: 0 }, { opacity: 1 }], { duration: START_FLY_MS * 0.28, delay: START_FLY_MS * 0.55, fill: 'forwards' });
    barCopy.animate([{ opacity: 1 }, { opacity: 0 }], { duration: START_FLY_MS * 0.15, delay: START_FLY_MS * 0.82, fill: 'forwards' });
    glide(fly, () => from, mainRect, { ms: START_FLY_MS }).then((landed) => {
      if (!landed || startDock.phase !== 'splitting') return false;
      // Then it splits: each other button slides out of it to its own place.
      return Promise.all(copies.map(({ el, copy }) => {
        const g = startGhost(mainRect(), h('div', { class: 'end-ghost__layer' }, copy));
        g.style.opacity = '0';
        return glide(g, mainRect, () => el.getBoundingClientRect(), { ms: START_MERGE_MS + 80, ease: easeOut, fade: [0, 1] });
      })).then(() => true);
    }).then((done) => {
      if (!done || startDock.phase !== 'splitting') return;
      clearStartGhosts();
      toPage();
      evaluateStartDock(); // the visitor may already have scrolled back down
    });
  }

  // A scene change or a busy bar: no animation, just put everything back.
  // `settle` lets the next check place a fresh scene without a flight.
  function resetStartDock({ settle = false } = {}) {
    if (!startDock) return;
    clearStartGhosts();
    startDock.fade?.cancel();
    $sticky?.classList.remove('is-receiving');
    $primary?.querySelector('.cta-action')?.style.removeProperty('visibility');
    setStartWaiting(false);
    const was = startDock.phase;
    startDock = { phase: 'pinned', settle, ghosts: [], fade: null };
    if (was !== 'pinned') { applyVisibility(); renderDemoNotes(); syncScrollCue(); }
  }

  function startDockHidesBar() {
    return !!startDock && (startDock.phase === 'page' || startDock.phase === 'splitting');
  }

  // Still in the masthead, with the bar waiting to take over.
  function startDockWaiting() {
    return !!startDock && startDock.phase === 'page';
  }

  /* ------------------------------------------------------------------ *
   * Contextual chat hints — while Scroll Spy is tracking the section in
   * view, the empty "Ask a question" field cycles through questions real
   * shoppers ask about that kind of content, instead of a generic prompt.
   * Section changes roll straight to that section's first question; the
   * rotation stops the moment the field is focused or has text (the
   * current example then becomes the placeholder), pauses while the bar
   * is hovered or focused, and holds still with reduced motion. Sending
   * with the field empty asks the example on show.
   * ------------------------------------------------------------------ */

  var CHAT_HINTS = {
    hero: ['How much is the Aurelia GT?', "What's the real-world range?", 'Can I test drive one this weekend?'],
    overview: ['How much is the Aurelia GT?', "What's the real-world range?", 'How far can it go on one charge?'],
    design: ['What colors does it come in?', 'Are the 21-inch wheels standard?', 'Is the glass roof tinted?'],
    interior: ['Is the wood trim available in ash?', 'Do the rear seats fold flat?', 'Are the seats ventilated?'],
    technology: ['Does DriveSense work on back roads?', 'Does it support wireless CarPlay?', 'How do over-the-air updates work?'],
    performance: ['How long does it take to charge?', 'Is the Performance trim worth it?', 'How does it handle in snow?'],
    gallery: ['Can I see it in Slate Grey?', 'Is there a 360° interior view?', 'How big is the trunk?'],
    shopping: ['Is there one in stock near me?', 'What lease deals are available?', 'Can I trade in my current car?'],
  };
  const CHAT_HINT_MS = 3600;
  // `var` (hoisted): evaluateScroll() can reach syncChatHints() during setup.
  var chatHintIndex = 0;
  var chatHintSection = null;
  var chatHintAnims = [];

  function chatHintsFor(section) { return (CHAT_HINTS && CHAT_HINTS[section]) || (CHAT_HINTS && CHAT_HINTS.hero) || ['Ask a question…']; }
  function currentChatHint() { return chatHintsFor(state.activeSection)[chatHintIndex % chatHintsFor(state.activeSection).length]; }

  function chatHintField() {
    const field = $utilities.querySelector('.chat-input-field');
    const input = field?.querySelector('input');
    // Hidden on phones, where the field collapses to a single chat button.
    return field && input && input.offsetParent ? { field, input, hint: field.querySelector('.chat-hint') } : null;
  }

  // Shows (or hides) the example question to match the current state;
  // `roll` animates the change from the previous one.
  function syncChatHints({ roll = false } = {}) {
    const f = chatHintField();
    if (!f) return;
    const on = state.scrollSpy !== 'off';
    const idle = document.activeElement !== f.input && !f.input.value;
    if (chatHintSection !== state.activeSection) { chatHintSection = state.activeSection; chatHintIndex = 0; roll = true; }
    const text = currentChatHint();
    f.field.dataset.hints = on ? 'on' : 'off';
    // Focused (or typed in): the example becomes the placeholder instead.
    f.input.placeholder = on ? (idle ? '' : text) : 'Ask a question…';
    f.hint.hidden = !on || !idle;
    if (f.hint.hidden) return;
    const shown = f.hint.querySelector('.chat-hint__text:not(.is-leaving)');
    if (shown && shown.textContent === text) return;
    const next = h('span', { class: 'chat-hint__text', text });
    if (!shown || !roll || prefersReducedMotion) { f.hint.replaceChildren(next); return; }
    chatHintAnims.forEach((a) => a.cancel());
    f.hint.querySelectorAll('.is-leaving').forEach((el) => el.remove());
    shown.classList.add('is-leaving');
    f.hint.append(next);
    chatHintAnims = [
      shown.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-70%)' }], { duration: 260, easing: 'cubic-bezier(.4,0,.8,.4)', fill: 'forwards' }),
      next.animate([{ opacity: 0, transform: 'translateY(70%)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 420, delay: 120, easing: 'cubic-bezier(.22,.8,.22,1)', fill: 'backwards' }),
    ];
    chatHintAnims[0].finished.then(() => shown.remove(), () => shown.remove());
  }

  setInterval(() => {
    if (prefersReducedMotion || document.hidden || state.rotationPaused || state.flyout || state.moreOpen) return;
    const f = chatHintField();
    if (!f || f.field.dataset.hints !== 'on' || f.hint.hidden || $sticky.dataset.visible !== 'true') return;
    chatHintIndex = (chatHintIndex + 1) % chatHintsFor(state.activeSection).length;
    syncChatHints({ roll: true });
  }, CHAT_HINT_MS);

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
        b.addEventListener('click', () => {
          log('cta_clicked', `search_result: ${item}`);
          const interest = vehicleInterestFrom(item);
          if (interest) state.vehicleInterest = interest;
        });
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
    } else if (kind === 'survey') {
      renderSurveyForm();
    } else if (kind === 'offer') {
      renderOfferClaim();
    }
    renderActiveLayer();
    syncQuoteCta();
  }

  /* ------------------------------------------------------------------ *
   * Request a Quote — multi-step lead form. Mirrors the full production
   * field set (vehicle, contact + consent, dealer, optional details), but
   * sequenced so only one short group is on screen at a time, with every
   * answer the page already knows pre-filled.
   * ------------------------------------------------------------------ */

  const QUOTE_CATALOG = {
    2026: {
      'Aurelia GT': { drivetrains: ['RWD', 'AWD'], trims: { 'Grand Touring': 69595, Performance: 84995, Signature: 92495 } },
      Meridian: { drivetrains: ['AWD'], trims: { Luxe: 58995, Sport: 64495 } },
    },
    2025: {
      'Aurelia GT': { drivetrains: ['RWD', 'AWD'], trims: { 'Grand Touring': 67995, Performance: 82995 } },
    },
  };
  const AWD_PREMIUM = 3000;

  const DEALERS = [
    { id: 'sf', name: 'Solstice San Francisco', city: 'San Francisco', state: 'CA', zip: '94103' },
    { id: 'marin', name: 'Solstice of Marin', city: 'San Rafael', state: 'CA', zip: '94901' },
    { id: 'bayview', name: 'Bayview Solstice', city: 'Oakland', state: 'CA', zip: '94607' },
    { id: 'pa', name: 'Solstice Palo Alto', city: 'Palo Alto', state: 'CA', zip: '94301' },
    { id: 'weho', name: 'Solstice West Hollywood', city: 'Los Angeles', state: 'CA', zip: '90069' },
    { id: 'bk', name: 'Solstice of Brooklyn', city: 'Brooklyn', state: 'NY', zip: '11201' },
    { id: 'nyc', name: 'Solstice Manhattan', city: 'New York', state: 'NY', zip: '10013' },
    { id: 'chi', name: 'Lakeshore Solstice', city: 'Chicago', state: 'IL', zip: '60611' },
    { id: 'atx', name: 'Solstice Austin', city: 'Austin', state: 'TX', zip: '78701' },
  ];

  const QUOTE_STEPS = ['Vehicle', 'Your information', 'Dealer', 'Review & send'];
  const QUOTE_CONFIRM_MS = 2600;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  // Small element builder for this form only — keeps the markup readable.
  // Text always goes in via textContent/append, never innerHTML, since
  // much of it is visitor-typed.
  function h(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (value == null || value === false) return;
      if (key === 'class') node.className = value;
      else if (key === 'text') node.textContent = value;
      else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
      else if (key in node) node[key] = value;
      else node.setAttribute(key, value === true ? '' : value);
    });
    children.flat().forEach((child) => { if (child != null && child !== false) node.append(child); });
    return node;
  }

  // Keeps a vehicle selection valid after an upstream choice changes
  // (year → model → drivetrain + trim), like the dependent dropdowns on
  // the production form.
  function normalizeVehicle(v) {
    const years = Object.keys(QUOTE_CATALOG).sort().reverse();
    if (!years.includes(v.year)) v.year = years[0];
    const models = Object.keys(QUOTE_CATALOG[v.year]);
    if (!models.includes(v.model)) v.model = models[0];
    const spec = QUOTE_CATALOG[v.year][v.model];
    if (!spec.drivetrains.includes(v.drivetrain)) v.drivetrain = spec.drivetrains[spec.drivetrains.length - 1];
    if (!(v.trim in spec.trims)) v.trim = Object.keys(spec.trims)[0];
    return v;
  }

  function vehiclePrice(v) {
    const spec = QUOTE_CATALOG[v.year][v.model];
    return spec.trims[v.trim] + (v.drivetrain === 'AWD' && spec.drivetrains.includes('RWD') ? AWD_PREMIUM : 0);
  }

  function vehicleLabel(v) { return `${v.year} ${v.model} ${v.trim}`; }

  // "2026 Aurelia GT — Performance, AWD" → { year, model, trim, drivetrain }
  function vehicleInterestFrom(text) {
    const year = (text.match(/^(\d{4})/) || [])[1];
    if (!year || !QUOTE_CATALOG[year]) return null;
    const model = Object.keys(QUOTE_CATALOG[year]).find((m) => text.includes(m));
    if (!model) return null;
    const interest = { year, model };
    const drivetrain = (text.match(/\b(RWD|AWD)\b/) || [])[1];
    if (drivetrain) interest.drivetrain = drivetrain;
    const trim = Object.keys(QUOTE_CATALOG[year][model].trims).find((t) => text.includes(t));
    if (trim) interest.trim = trim;
    return interest;
  }

  function newQuoteDraft() {
    const pageVehicle = { year: '2026', model: 'Aurelia GT', drivetrain: 'AWD', trim: 'Grand Touring' };
    return {
      step: 0,
      vehicleSource: state.vehicleInterest ? 'search' : 'page',
      vehicle: normalizeVehicle({ ...pageVehicle, ...(state.vehicleInterest || {}) }),
      contact: { first: '', last: '', email: '', phone: '', zip: '', pref: 'email' },
      dealerQuery: '', // the search that produced the current list
      dealerInput: '', // what's typed in the search box right now
      dealerSeedZip: '',
      dealerId: null,
      optional: { open: false, down: '', trade: '', accessories: false, eligibility: 'none', notes: '' },
      errors: {},
    };
  }

  // Rough but plausible: same 3-digit ZIP prefix is local, same first
  // digit is regional, anything else is far away.
  function dealerMiles(zip, dealer) {
    if (!/^\d{5}$/.test(zip)) return null;
    const diff = Math.abs(Number(zip) - Number(dealer.zip));
    if (zip.slice(0, 3) === dealer.zip.slice(0, 3)) return 2 + (diff % 11);
    if (zip[0] === dealer.zip[0]) return 18 + (diff % 47);
    return 400 + (diff % 2100);
  }

  // City/State, ZIP, or dealer name — the same three ways the production
  // search accepts.
  function findDealers(query) {
    const d = state.quoteDraft;
    const q = query.trim();
    const origin = /^\d{5}$/.test(q) ? q : d.contact.zip.trim();
    const needle = /^\d{5}$/.test(q) ? '' : q.toLowerCase();
    return DEALERS
      .filter((dealer) => !needle || `${dealer.name} ${dealer.city}, ${dealer.state} ${dealer.zip}`.toLowerCase().includes(needle))
      .map((dealer) => ({ ...dealer, miles: dealerMiles(origin, dealer) }))
      .sort((a, b) => (a.miles ?? 0) - (b.miles ?? 0))
      .slice(0, needle ? 5 : 3);
  }

  function selectedDealer() {
    const d = state.quoteDraft;
    return d && DEALERS.find((dealer) => dealer.id === d.dealerId);
  }

  function validateQuoteStep(step) {
    const d = state.quoteDraft;
    const c = d.contact;
    const errors = {};
    if (step === 1) {
      if (!c.first.trim()) errors.first = 'Enter your first name.';
      if (!c.last.trim()) errors.last = 'Enter your last name.';
      if (!EMAIL_RE.test(c.email.trim())) errors.email = 'Enter a valid email address, like name@example.com.';
      const digits = c.phone.replace(/\D/g, '');
      if (c.pref === 'phone' && !digits) errors.phone = 'Add a phone number, or choose email as your contact preference.';
      else if (digits && digits.length !== 10) errors.phone = 'Enter a 10-digit phone number.';
      if (!/^\d{5}$/.test(c.zip.trim())) errors.zip = 'Enter a 5-digit ZIP code.';
    }
    if (step === 2 && !selectedDealer()) errors.dealer = 'Choose a dealer to send your request to.';
    d.errors = errors;
    return Object.keys(errors).length === 0;
  }

  function goToQuoteStep(target) {
    const d = state.quoteDraft;
    if (target > d.step && !validateQuoteStep(d.step)) {
      log('quote_validation', `missing/invalid: ${Object.keys(d.errors).join(', ')}`);
      renderQuoteForm({ animate: true, focus: 'error' });
      return;
    }
    d.errors = {};
    const direction = target > d.step ? 'forward' : 'back';
    if (target === 2) seedDealerSearch();
    d.step = target;
    log('quote_step', `${target + 1}. ${QUOTE_STEPS[target]}`);
    renderQuoteForm({ animate: true, focus: 'heading', direction });
  }

  // The dealer step follows the ZIP from the previous step — unless the
  // visitor has since searched for something else themselves.
  function seedDealerSearch() {
    const d = state.quoteDraft;
    const zip = d.contact.zip.trim();
    if (!d.dealerQuery || d.dealerQuery === d.dealerSeedZip) {
      d.dealerQuery = zip;
      d.dealerInput = zip;
      d.dealerSeedZip = zip;
    }
  }

  function sendQuote() {
    const d = state.quoteDraft;
    for (const step of [1, 2]) {
      if (!validateQuoteStep(step)) { d.step = step; renderQuoteForm({ animate: true, focus: 'error' }); return; }
    }
    submitQuote();
  }

  // A visitor who got partway through before closing the panel picks up
  // where they left off.
  function quoteCtaLabel() {
    return state.quoteDraft && state.quoteDraft.step > 0 ? 'Continue My Quote' : 'Get My Quote';
  }

  // The prompt's button is rendered once per takeover, so keep its label and
  // expanded state in step with the panel as it opens and closes.
  function syncQuoteCta() {
    const survey = $primary.querySelector('.primary-prompt--survey .btn--primary');
    if (survey) {
      survey.setAttribute('aria-expanded', String(state.flyout === 'survey'));
      if (state.flyout !== 'survey') survey.textContent = surveyCtaLabel();
    }
    const btn = $primary.querySelector('.primary-prompt--quote .btn--primary');
    if (!btn) return;
    btn.setAttribute('aria-expanded', String(state.flyout === 'quote'));
    if (state.flyout !== 'quote') {
      const label = btn.querySelector('.quote-cta__label');
      if (label) label.textContent = quoteCtaLabel(); else btn.textContent = quoteCtaLabel();
      const sub = $primary.querySelector('.quote-copy__sub');
      if (sub) sub.textContent = quoteSubline();
    }
  }

  function focusQuoteHeading() {
    document.getElementById('quoteStepHeading')?.focus({ preventScroll: true });
  }

  /* ------------------------------------------------------------------ *
   * Intercept survey — what "Take Survey" opens.
   *
   * Modeled on a typical automaker site-intercept survey: 12 questions,
   * one per screen, plus an intro and a thank-you (14 screens). Here the
   * same questions fit four short steps:
   *   - related questions share a step (the two "has this visit changed…"
   *     questions become one two-row grid; the shopping-stage and timing
   *     questions sit together at the end, marked optional);
   *   - the "what got in the way?" follow-up appears only after "Partly"
   *     or "No", inline, rather than as its own screen;
   *   - the visit's purpose is pre-filled from what the visitor did on the
   *     page, labelled as a guess they can change;
   *   - nothing is required, and "Send now" on every step sends whatever
   *     has been answered;
   *   - closing the panel keeps the answers ("Continue Survey").
   * Vendor- and brand-neutral: the brand is this prototype's fictional one.
   * ------------------------------------------------------------------ */

  const SURVEY_STEPS = ['Your visit', 'Your experience', 'Looking ahead', 'About you'];
  const SURVEY_CONFIRM_MS = 2200;
  const SURVEY_Q = {
    purpose: {
      label: 'What brought you here today?',
      options: [['build', 'Build & price'], ['features', 'Features & specs'], ['pricing', 'Pricing & offers'], ['lineup', 'Explore the lineup'],
        ['dealer', 'Find a dealer'], ['inventory', 'Search inventory'], ['owner', 'Owner services'], ['support', 'Get help'], ['other', 'Something else']],
    },
    done: { label: 'Did you get it done?', options: [['yes', 'Yes'], ['partly', 'Partly'], ['no', 'No']] },
    overall: { label: 'Overall, how was the site today?', low: 'Very poor', high: 'Outstanding' },
    impact: {
      label: 'Because of this visit, your…',
      rows: [['intent', 'Interest in buying'], ['opinion', 'Opinion of Solstice']],
      options: [['lower', 'Lower'], ['same', 'Same'], ['higher', 'Higher']],
    },
    nps: { label: 'How likely are you to recommend Solstice to a friend?', low: 'Not at all likely', high: 'Extremely likely' },
    compare: {
      label: 'Compared with other automaker sites, this one was…',
      options: [['1', 'Much worse'], ['2', 'Worse'], ['3', 'About the same'], ['4', 'Better'], ['5', 'Much better']],
      none: ['none', "Haven't visited others"],
    },
    next: {
      label: "What's next for you?",
      hint: 'Pick any',
      options: [['research', 'Keep researching'], ['dealer', 'Contact a dealer'], ['inventory', 'Search inventory'], ['buy', 'Buy online'],
        ['quote', 'Request a quote'], ['drive', 'Book a test drive'], ['other', 'Something else'], ['nothing', 'Nothing yet']],
    },
    timing: {
      label: 'When might you buy or lease?',
      options: [['1m', 'This month'], ['3m', '2–3 months'], ['6m', '4–6 months'], ['12m', '7–12 months'], ['24m', '1–2 years'], ['later', '2+ years'], ['no', 'Not planning to']],
    },
    stage: { label: 'Where are you in shopping?', options: [['looking', 'Just looking'], ['shortlist', 'Narrowing it down'], ['ready', 'Ready to buy']] },
  };

  // A best guess at the visit's purpose from what the visitor actually did.
  function guessSurveyPurpose() {
    if (state.quoteDraft || state.quoteSubmitted) return 'pricing';
    const sec = state.activeSection;
    if (sec === 'shopping') return 'inventory';
    if (['design', 'interior', 'technology', 'performance'].includes(sec)) return 'features';
    if (sec === 'gallery') return 'lineup';
    return null;
  }

  function newSurveyDraft() {
    const guess = guessSurveyPurpose();
    return { step: 0, guessed: guess, a: { purpose: guess, next: [] } };
  }

  function surveyCtaLabel() {
    const d = state.surveyDraft;
    return d && (d.step > 0 || Object.keys(d.a).some((k) => k !== 'purpose' && k !== 'next' && d.a[k] != null) || d.a.next?.length) ? 'Continue Survey' : 'Take Survey';
  }

  // One question as a row of tappable chips (radio or checkbox inputs, so
  // keyboard and screen-reader behavior come for free).
  function surveyChips(key, q, { multi = false, wide = false, extra = null } = {}) {
    const d = state.surveyDraft;
    const id = `sq-${key}`;
    const isOn = (v) => (multi ? d.a[key].includes(v) : d.a[key] === v);
    const opts = extra ? [...q.options, extra] : q.options;
    return h('fieldset', { class: `sq${wide ? ' sq--wide' : ''}` },
      h('legend', { class: 'sq__label', id }, q.label,
        q.hint ? h('span', { class: 'sq__hint', text: ` · ${q.hint}` }) : null,
        key === 'purpose' && d.guessed && d.a.purpose === d.guessed ? h('span', { class: 'sq__guess', text: 'Our guess from your visit' }) : null),
      h('div', { class: `sq-chips${q.segmented ? ' sq-chips--seg' : ''}` },
        opts.map(([v, text]) => h('label', { class: 'sq-chip' },
          h('input', {
            type: multi ? 'checkbox' : 'radio', name: id, value: v, checked: isOn(v),
            onchange: (e) => {
              if (multi) {
                const set = new Set(d.a[key]);
                if (e.target.checked) set.add(v); else set.delete(v);
                // "Nothing yet" can't go with anything else.
                if (e.target.checked && v === 'nothing') { set.clear(); set.add('nothing'); }
                if (e.target.checked && v !== 'nothing') set.delete('nothing');
                d.a[key] = [...set];
                renderSurveyForm({ keepFocus: `${id}:${v}` });
              } else {
                d.a[key] = v;
                renderSurveyForm({ keepFocus: `${id}:${v}` });
              }
            },
          }),
          h('span', { text })))));
  }

  // 0–10 scale (the overall rating and recommend questions).
  function surveyScale(key, q) {
    const d = state.surveyDraft;
    const id = `sq-${key}`;
    return h('fieldset', { class: 'sq' },
      h('legend', { class: 'sq__label', text: q.label }),
      h('div', { class: 'sq-scale' },
        Array.from({ length: 11 }, (_, n) => h('label', { class: 'sq-scale__n' },
          h('input', { type: 'radio', name: id, value: n, checked: d.a[key] === n, 'aria-label': `${n}${n === 0 ? ` — ${q.low}` : n === 10 ? ` — ${q.high}` : ''}`,
            onchange: () => { d.a[key] = n; renderSurveyForm({ keepFocus: `${id}:${n}` }); } }),
          h('span', { 'aria-hidden': 'true', text: n })))),
      h('div', { class: 'sq-scale__ends', 'aria-hidden': 'true' }, h('span', { text: `0 · ${q.low}` }), h('span', { text: `${q.high} · 10` })));
  }

  // Two "has this visit changed…" questions as one compact grid.
  function surveyImpact() {
    const d = state.surveyDraft;
    const q = SURVEY_Q.impact;
    return h('div', { class: 'sq', role: 'group', 'aria-labelledby': 'sq-impact' },
      h('p', { class: 'sq__label', id: 'sq-impact', text: q.label }),
      h('div', { class: 'sq-grid' },
        q.rows.map(([key, rowLabel]) => h('fieldset', { class: 'sq-grid__row' },
          h('legend', { class: 'sq-grid__label', text: rowLabel }),
          h('div', { class: 'sq-chips sq-chips--seg' },
            q.options.map(([v, text]) => h('label', { class: 'sq-chip' },
              h('input', { type: 'radio', name: `sq-${key}`, value: v, checked: d.a[key] === v,
                onchange: () => { d.a[key] = v; renderSurveyForm({ keepFocus: `sq-${key}:${v}` }); } }),
              h('span', { text }))))))));
  }

  function surveyText(key, label, placeholder) {
    const d = state.surveyDraft;
    return h('div', { class: 'qf qf--notes sq-text' },
      h('label', { htmlFor: `sq-${key}` }, label, ' ', h('span', { class: 'qf-opt', text: '(optional)' })),
      h('textarea', { id: `sq-${key}`, rows: 2, placeholder: placeholder || '', value: d.a[key] || '', oninput: (e) => { d.a[key] = e.target.value; } }));
  }

  function surveyStepBody(step) {
    const a = state.surveyDraft.a;
    const Q = SURVEY_Q;
    if (step === 0) {
      return [
        h('p', { class: 'sq-intro', text: 'About this website only: design, navigation, content.' }),
        surveyChips('purpose', Q.purpose),
        a.purpose === 'other' ? surveyText('purposeOther', 'What were you looking for?') : null,
        surveyChips('done', { ...Q.done, segmented: true }),
        a.done === 'partly' || a.done === 'no' ? surveyText('blocker', 'What got in the way?') : null,
      ];
    }
    if (step === 1) return [surveyScale('overall', Q.overall), surveyImpact()];
    if (step === 2) {
      return [
        surveyScale('nps', Q.nps),
        surveyChips('compare', Q.compare, { extra: Q.compare.none }),
        surveyChips('next', Q.next, { multi: true }),
        a.next.includes('other') ? surveyText('nextOther', 'What else are you planning?') : null,
      ];
    }
    return [
      surveyChips('timing', Q.timing),
      surveyChips('stage', { ...Q.stage, segmented: true }),
      surveyText('comment', 'Anything we could do better?'),
    ];
  }

  function goToSurveyStep(step) {
    const d = state.surveyDraft;
    const dir = step > d.step ? 'forward' : 'back';
    d.step = step;
    log('survey_step', `${step + 1} of ${SURVEY_STEPS.length} · ${SURVEY_STEPS[step]}`);
    renderSurveyForm({ animate: true, direction: dir, focus: 'heading' });
  }

  function renderSurveyForm(opts = {}) {
    const first = opts.animate ? $surface.getBoundingClientRect() : null;
    const scrollTop = $flyout.scrollTop;
    $flyout.innerHTML = '';
    if (!state.surveyDraft) state.surveyDraft = newSurveyDraft();
    const d = state.surveyDraft;

    if (state.surveySubmitted) {
      $flyout.append(h('div', { class: 'survey-flow quote-done', role: 'status' },
        h('p', { class: 'flyout-title', text: 'Thank you' }),
        h('p', { class: 'quote-done__msg', text: 'Your answers go straight to the team that builds this site.' })));
      animateSurfaceResize(first);
      return;
    }

    const isLast = d.step === SURVEY_STEPS.length - 1;
    const form = h('form', {
      class: `quote-step${opts.direction ? ` is-entering-${opts.direction}` : ''}`,
      noValidate: true,
      onsubmit: (e) => { e.preventDefault(); if (isLast) submitSurvey(); else goToSurveyStep(d.step + 1); },
    },
    surveyStepBody(d.step),
    h('div', { class: 'quote-nav survey-nav' },
      d.step > 0 ? h('button', { type: 'button', class: 'quote-link', text: 'Back', onclick: () => goToSurveyStep(d.step - 1) }) : h('span'),
      h('div', { class: 'survey-nav__end' },
        isLast ? null : h('button', { type: 'button', class: 'quote-link', text: 'Send now', onclick: () => submitSurvey({ early: true }) }),
        h('button', { type: 'submit', class: 'btn btn--primary btn--small', text: isLast ? 'Send feedback' : 'Next' }))));

    $flyout.append(h('div', { class: 'survey-flow' },
      h('ol', { class: 'quote-progress survey-progress', 'aria-label': 'Progress' },
        SURVEY_STEPS.map((name, i) => h('li', { class: i < d.step ? 'is-done' : i === d.step ? 'is-current' : '', 'aria-current': i === d.step ? 'step' : null, text: name }))),
      h('h3', { class: 'quote-step-title', id: 'surveyQuestion', tabIndex: -1,
        text: `Step ${d.step + 1} of ${SURVEY_STEPS.length} · ${SURVEY_STEPS[d.step]}${d.step === SURVEY_STEPS.length - 1 ? ' (optional)' : ''}` }),
      form));

    if (opts.keepFocus) {
      // Re-rendered after an answer: keep the visitor's place.
      $flyout.scrollTop = scrollTop;
      const [name, v] = opts.keepFocus.split(':');
      $flyout.querySelector(`input[name="${name}"][value="${v}"]`)?.focus({ preventScroll: true });
    } else {
      $flyout.scrollTop = 0;
    }
    animateSurfaceResize(first);
    if (opts.focus === 'heading') document.getElementById('surveyQuestion')?.focus({ preventScroll: true });
    syncQuoteCta();
  }

  function surveySummary(a) {
    const keys = ['purpose', 'done', 'overall', 'intent', 'opinion', 'nps', 'compare', 'next', 'timing', 'stage', 'comment'];
    const answered = keys.filter((k) => (Array.isArray(a[k]) ? a[k].length : a[k] != null && a[k] !== ''));
    const bits = [];
    if (a.purpose) bits.push(`purpose: ${a.purpose}`);
    if (a.done) bits.push(`done: ${a.done}`);
    if (a.overall != null) bits.push(`overall ${a.overall}/10`);
    if (a.nps != null) bits.push(`recommend ${a.nps}/10`);
    return `${answered.length} of ${keys.length} answered${bits.length ? ` · ${bits.join(' · ')}` : ''}`;
  }

  function submitSurvey({ early = false } = {}) {
    const d = state.surveyDraft;
    // Follow-ups whose question is no longer showing aren't sent.
    if (d.a.done !== 'partly' && d.a.done !== 'no') delete d.a.blocker;
    if (d.a.purpose !== 'other') delete d.a.purposeOther;
    if (!d.a.next.includes('other')) delete d.a.nextOther;
    state.surveySubmitted = true;
    log('survey_submitted', `${surveySummary(d.a)}${early ? ` (sent at step ${d.step + 1})` : ''}`);
    renderSurveyForm({ animate: true });
    // Same pattern as the quote: long enough to read the thank-you, then
    // the survey hands the space back on its own.
    setTimeout(() => {
      if (!state.surveyActive || !state.surveySubmitted) return;
      state.surveyActive = false;
      state.surveySubmitted = false;
      state.surveyDraft = null;
      closeFlyout();
      restoreCompositionIfIdle();
      swapPrimary(true);
      renderActiveLayer();
      maybeReleasePendingOverlays();
    }, SURVEY_CONFIRM_MS);
  }

  function renderQuoteForm(opts = {}) {
    const first = opts.animate ? $surface.getBoundingClientRect() : null;
    $flyout.innerHTML = '';

    if (state.quoteSubmitted) {
      $flyout.append(renderQuoteConfirmation());
      animateSurfaceResize(first);
      return;
    }

    if (!state.quoteDraft) state.quoteDraft = newQuoteDraft();
    const d = state.quoteDraft;

    const bodies = [renderQuoteVehicleStep, renderQuoteContactStep, renderQuoteDealerStep, renderQuoteReviewStep];
    const isLast = d.step === QUOTE_STEPS.length - 1;
    const form = h('form', {
      class: `quote-step${opts.direction ? ` is-entering-${opts.direction}` : ''}`,
      noValidate: true,
      onsubmit: (e) => {
        e.preventDefault();
        if (isLast) sendQuote(); else goToQuoteStep(d.step + 1);
      },
    },
    bodies[d.step](),
    h('div', { class: 'quote-nav' },
      d.step > 0 ? h('button', { type: 'button', class: 'quote-link', text: 'Back', onclick: () => goToQuoteStep(d.step - 1) }) : h('span'),
      h('button', { type: 'submit', class: 'btn btn--primary btn--small', text: isLast ? 'Send request' : 'Continue' })));

    $flyout.append(h('div', { class: 'quote-flow' },
      h('ol', { class: 'quote-progress', 'aria-label': 'Progress' },
        QUOTE_STEPS.map((name, i) => h('li', {
          class: i < d.step ? 'is-done' : i === d.step ? 'is-current' : '',
          'aria-current': i === d.step ? 'step' : null,
          text: name,
        }))),
      h('h3', { class: 'quote-step-title', id: 'quoteStepHeading', tabIndex: -1, text: `Step ${d.step + 1} of ${QUOTE_STEPS.length} · ${QUOTE_STEPS[d.step]}` }),
      form));

    $flyout.scrollTop = 0;
    animateSurfaceResize(first);
    if (opts.focus === 'heading') focusQuoteHeading();
    if (opts.focus === 'error') $flyout.querySelector('[aria-invalid="true"], .qf-error')?.focus?.({ preventScroll: false });
  }

  function quoteField(key, label, { type = 'text', required, autocomplete, inputMode, placeholder, hint } = {}) {
    const d = state.quoteDraft;
    const id = `quote${key[0].toUpperCase()}${key.slice(1)}`;
    const err = d.errors[key];
    const describedBy = [err && `${id}-err`, hint && `${id}-hint`].filter(Boolean).join(' ') || null;
    return h('div', { class: `qf${err ? ' is-invalid' : ''}` },
      h('label', { htmlFor: id }, label, required
        ? h('span', { class: 'qf-req', 'aria-hidden': 'true', text: ' *' })
        : h('span', { class: 'qf-opt', text: ' (optional)' })),
      h('input', {
        id, type, value: d.contact[key], autocomplete, inputMode, placeholder, required: !!required,
        'aria-invalid': err ? 'true' : null,
        'aria-describedby': describedBy,
        oninput: (e) => {
          d.contact[key] = e.target.value;
          // Clear the error as soon as they start fixing it, without a re-render.
          if (d.errors[key]) {
            delete d.errors[key];
            e.target.removeAttribute('aria-invalid');
            e.target.closest('.qf').classList.remove('is-invalid');
            document.getElementById(`${id}-err`)?.remove();
          }
        },
      }),
      hint ? h('span', { class: 'qf-hint', id: `${id}-hint`, text: hint }) : null,
      err ? h('span', { class: 'qf-error', id: `${id}-err`, text: err }) : null);
  }

  function quoteSelect(key, label, options) {
    const v = state.quoteDraft.vehicle;
    const id = `quote${key[0].toUpperCase()}${key.slice(1)}`;
    return h('div', { class: 'qf' },
      h('label', { htmlFor: id, text: label }),
      h('select', {
        id,
        onchange: (e) => {
          v[key] = e.target.value;
          normalizeVehicle(v);
          renderQuoteForm();
          document.getElementById(id)?.focus();
        },
      }, options.map((o) => h('option', { value: o, text: o, selected: o === v[key] }))));
  }

  function quoteChoices(name, legend, options, current, onChange) {
    return h('fieldset', { class: 'qf-choice' },
      h('legend', { text: legend }),
      options.map(([value, text]) => h('label', {},
        h('input', { type: 'radio', name: `quote-${name}`, value, checked: value === current, onchange: () => onChange(value) }),
        text)));
  }

  function renderQuoteVehicleStep() {
    const d = state.quoteDraft;
    const v = d.vehicle;
    const spec = QUOTE_CATALOG[v.year][v.model];
    return h('div', {},
      h('p', { class: 'quote-hint', text: d.vehicleSource === 'search'
        ? 'Pre-selected from the vehicle you picked in search. Change anything below.'
        : "Pre-selected from the vehicle you're viewing. Change anything below." }),
      h('div', { class: 'quote-grid' },
        quoteSelect('year', 'Model year', Object.keys(QUOTE_CATALOG).sort().reverse()),
        quoteSelect('model', 'Model', Object.keys(QUOTE_CATALOG[v.year])),
        quoteSelect('drivetrain', 'Drivetrain', spec.drivetrains),
        quoteSelect('trim', 'Trim', Object.keys(spec.trims))),
      h('div', { class: 'quote-vehicle', 'aria-live': 'polite' },
        h('div', { class: `quote-vehicle__thumb ${v.model === 'Meridian' ? 'gradient-d' : 'gradient-a'}`, role: 'img', 'aria-label': `${v.model} (illustrative)` }),
        h('div', {},
          h('strong', { text: `${vehicleLabel(v)} · ${v.drivetrain}` }),
          h('span', { class: 'quote-vehicle__price', text: `Starting MSRP ${usd.format(vehiclePrice(v))}†` }),
          h('small', { text: 'Your selected dealer will provide you with their best selling price on this vehicle.' }),
          h('small', { text: 'Image may not reflect exact vehicle or options selected.' }))));
  }

  function renderQuoteContactStep() {
    const d = state.quoteDraft;
    const c = d.contact;
    const phoneRequired = c.pref === 'phone';
    return h('div', {},
      h('p', { class: 'quote-legal' },
        'By providing my contact information below, I consent that Solstice Motors and/or a Solstice dealer can contact me with offers and product information. ',
        h('a', { href: '#privacy', text: 'Privacy Statement' })),
      h('div', { class: 'quote-grid' },
        quoteField('first', 'First name', { required: true, autocomplete: 'given-name' }),
        quoteField('last', 'Last name', { required: true, autocomplete: 'family-name' }),
        quoteField('email', 'Email', { type: 'email', required: true, autocomplete: 'email', inputMode: 'email' }),
        quoteField('phone', 'Phone', { type: 'tel', required: phoneRequired, autocomplete: 'tel', inputMode: 'tel' }),
        quoteField('zip', 'ZIP code', { required: true, autocomplete: 'postal-code', inputMode: 'numeric', hint: 'Used to find your nearest dealers next.' })),
      quoteChoices('pref', 'Contact preference', [['email', 'Email'], ['phone', 'Telephone']], c.pref, (value) => {
        c.pref = value;
        if (value === 'email' && d.errors.phone && !c.phone.trim()) delete d.errors.phone;
        renderQuoteForm();
        $flyout.querySelector(`input[name="quote-pref"][value="${value}"]`)?.focus();
      }));
  }

  function renderQuoteDealerStep() {
    const d = state.quoteDraft;
    const results = findDealers(d.dealerQuery);
    // Keep the visitor's pick if it's still listed; otherwise default to the nearest.
    if (!results.some((r) => r.id === d.dealerId)) d.dealerId = results.length ? results[0].id : null;
    const runSearch = () => {
      d.dealerQuery = d.dealerInput.trim();
      log('quote_dealer_search', d.dealerQuery || '(nearest)');
      renderQuoteForm({ animate: true });
      document.getElementById('quoteDealerSearch')?.focus();
    };
    const zipLabel = /^\d{5}$/.test(d.dealerQuery) ? d.dealerQuery : d.contact.zip;
    return h('div', {},
      h('p', { class: 'quote-hint', text: /^\d{5}$/.test(d.dealerQuery) || !d.dealerQuery
        ? `Nearest dealers to ${zipLabel}. The closest is selected for you.`
        : `Dealers matching “${d.dealerQuery}”.` }),
      h('div', { class: 'quote-dealer-search' },
        h('label', { htmlFor: 'quoteDealerSearch', class: 'visually-hidden', text: 'Search dealers by city and state, ZIP code, or dealer name' }),
        h('input', {
          id: 'quoteDealerSearch', type: 'search', value: d.dealerInput, placeholder: 'City/State, ZIP code, or dealer name',
          oninput: (e) => { d.dealerInput = e.target.value; },
          // Enter searches here instead of submitting the step.
          onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); runSearch(); } },
        }),
        h('button', { type: 'button', class: 'btn btn--small quote-secondary', text: 'Update', onclick: runSearch })),
      results.length
        ? h('div', { class: 'quote-dealers', role: 'radiogroup', 'aria-label': 'Dealers' },
          results.map((dealer) => h('label', { class: 'quote-dealer' },
            h('input', { type: 'radio', name: 'quote-dealer', value: dealer.id, checked: dealer.id === d.dealerId, onchange: () => { d.dealerId = dealer.id; } }),
            h('span', {},
              h('span', { class: 'quote-dealer__name', text: dealer.name }),
              h('span', { class: 'quote-dealer__meta', text: `${dealer.city}, ${dealer.state} ${dealer.zip}` })),
            dealer.miles != null ? h('span', { class: 'quote-dealer__miles', text: `${dealer.miles} mi` }) : null)))
        : h('p', { class: 'quote-empty', text: `No dealers match “${d.dealerQuery}”. Try a city, state, or ZIP code.` }),
      d.errors.dealer ? h('p', { class: 'qf-error', tabIndex: -1, text: d.errors.dealer }) : null);
  }

  function renderQuoteReviewStep() {
    const d = state.quoteDraft;
    const c = d.contact;
    const o = d.optional;
    const dealer = selectedDealer();
    const row = (term, detail, step) => h('div', { class: 'quote-review__row' },
      h('div', {}, h('dt', { text: term }), h('dd', { text: detail })),
      h('button', { type: 'button', class: 'quote-link', text: 'Edit', 'aria-label': `Edit ${term.toLowerCase()}`, onclick: () => goToQuoteStep(step) }));
    const contactBy = c.pref === 'phone' ? `prefers a call at ${c.phone}` : 'prefers email';
    const optionalId = 'quoteOptional';
    return h('div', {},
      h('dl', { class: 'quote-review' },
        row('Vehicle', `${vehicleLabel(d.vehicle)} · ${d.vehicle.drivetrain} · from ${usd.format(vehiclePrice(d.vehicle))}`, 0),
        row('You', `${c.first} ${c.last} · ${c.email} · ${contactBy}`, 1),
        row('Dealer', dealer ? `${dealer.name}, ${dealer.city}` : '—', 2)),
      h('button', {
        type: 'button', class: 'quote-optional-toggle', 'aria-expanded': String(o.open), 'aria-controls': optionalId,
        onclick: () => {
          o.open = !o.open;
          renderQuoteForm({ animate: true });
          $flyout.querySelector('.quote-optional-toggle')?.focus();
        },
      }, h('strong', { text: `${o.open ? '−' : '+'} Optional details` }), h('span', { text: 'Down payment, trade-in, eligibility, notes' })),
      h('div', { class: 'quote-optional', id: optionalId, hidden: !o.open },
        h('div', { class: 'quote-grid' },
          h('div', { class: 'qf' },
            h('label', { htmlFor: 'quoteDown', text: 'Down payment ($)' }),
            h('input', { id: 'quoteDown', type: 'text', inputMode: 'numeric', value: o.down, placeholder: 'e.g. 10,000', oninput: (e) => { o.down = e.target.value; } })),
          h('div', { class: 'qf' },
            h('label', { htmlFor: 'quoteTrade', text: 'Trade-in vehicle' }),
            h('input', { id: 'quoteTrade', type: 'text', value: o.trade, placeholder: 'Year, make, model', oninput: (e) => { o.trade = e.target.value; } }))),
        h('label', { class: 'qf-check' },
          h('input', { type: 'checkbox', checked: o.accessories, onchange: (e) => { o.accessories = e.target.checked; } }),
          "I'm interested in Solstice accessories"),
        quoteChoices('eligibility', "I'm eligible for", [['employee', 'Solstice employee pricing'], ['supplier', 'Solstice supplier pricing'], ['none', 'Neither']], o.eligibility, (value) => { o.eligibility = value; }),
        h('div', { class: 'qf qf--notes' },
          h('label', { htmlFor: 'quoteNotes', text: 'Additional details for your dealer' }),
          h('textarea', { id: 'quoteNotes', value: o.notes, oninput: (e) => { o.notes = e.target.value; } }))));
  }

  function renderQuoteConfirmation() {
    const d = state.quoteDraft;
    const dealer = selectedDealer();
    const how = d.contact.pref === 'phone' ? `by phone at ${d.contact.phone}` : `by email at ${d.contact.email}`;
    return h('div', { class: 'quote-flow quote-done', role: 'status' },
      h('p', { class: 'flyout-title', text: 'Request sent' }),
      h('p', { class: 'quote-done__msg',
        text: `${dealer ? dealer.name : 'Your dealer'} will contact you ${how} with their best price on the ${vehicleLabel(d.vehicle)}.` }));
  }

  function closeFlyout() {
    state.flyout = null;
    $flyout.hidden = true;
    $flyout.innerHTML = '';
    delete $flyout.dataset.kind;
    renderActiveLayer();
    syncQuoteCta();
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
  const TRUNCATABLE_SELECTOR = '.primary-nav, .primary-message, .primary-sub, .primary-ctas .btn, .cta-action__label, .cta-textlink, .rotator__msg, .primary-prompt p';

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
      // Mid-roll the message is between two widths and would read as
      // truncated; finishRoll() runs this again once it has settled.
      if (rollAnims.length || ctaMorph) return;
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
    if (state.dismissMode === 'fully-dismissible') { state.fullyDismissed = true; addRecent('primary', 'dismissed'); }
    log('sticky_dismissed', state.dismissMode);
    applyVisibility();
    applyControlsVisibility();
  });

  $restoreBtn.addEventListener('click', () => {
    state.minimized = false;
    state.dismissed = false;
    removeRecent('primary');
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
    if (state.surveyActive || state.quoteActive || state.noticeActive) return;
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
    const fire = { quote: triggerQuote, survey: triggerSurvey, notice: triggerNotice, offer: triggerOffer }[kind];
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
    $primary.classList.remove('is-swapping-out');
    if (!prefersReducedMotion && wasVisible) {
      void $primary.offsetWidth;
      $primary.classList.add('is-swapping-in');
      swapCleanupTimer = setTimeout(() => $primary.classList.remove('is-swapping-in'), 1000);
      // Skip when minimize/restore is changing at the same time — that
      // sequence already animates the surface's height on its own.
      if (wasMinimized === $sticky.dataset.minimized) animateSurfaceResize(first);
    }
    $surface.style.transitionProperty = '';
    if (!full) evaluateCrowding();
    scheduleHandoverCheck();
  }

  // Animates the surface from a previously measured size to its current one.
  function animateSurfaceResize(first) {
    if (prefersReducedMotion || !first || !first.width) return;
    const last = $surface.getBoundingClientRect();
    if (Math.abs(first.width - last.width) <= 1 && Math.abs(first.height - last.height) <= 1) return;
    $surface.animate(
      [{ width: `${first.width}px`, height: `${first.height}px` }, { width: `${last.width}px`, height: `${last.height}px` }],
      { duration: getDurMedMs(), easing: 'cubic-bezier(.2,.7,.2,1)' },
    );
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
    if (interactionBusy()) {
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

    dropNoticeFor('survey');
    captureCompositionIfNeeded();
    state.surveyActive = true;
    removeRecent('survey');
    state.dismissed = false;
    state.minimized = false;
    state.scrollVisible = true;
    log('survey_triggered', 'shown in persistent layer');
    swapPrimary(true);
  }

  function dismissSurvey() {
    if (state.surveyActive && !state.surveySubmitted) addRecent('survey', 'dismissed');
    state.surveyActive = false;
    state.surveyDraft = null;
    state.surveySubmitted = false;
    if (state.flyout === 'survey') closeFlyout();
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
    if (interactionBusy()) {
      state.pendingQuote = true;
      log('quote_triggered', 'waiting — interaction in use');
      return;
    }

    if (state.surveyActive) {
      state.surveyActive = false;
      if (state.surveySubmitted) {
        // Already answered — nothing to bring back afterward.
        state.surveySubmitted = false;
        state.surveyDraft = null;
      } else {
        state.pendingSurvey = true;
        log('survey_preempted', 'quote prompt has priority');
      }
    }
    dropNoticeFor('quote prompt');

    captureCompositionIfNeeded();
    state.quoteActive = true;
    removeRecent('quote');
    state.dismissed = false;
    state.minimized = false;
    state.scrollVisible = true;
    closeFlyout();
    log('quote_triggered', 'shown in persistent layer — returning visitor');
    swapPrimary(true);
  }

  function dismissQuote() {
    if (state.quoteActive && !state.quoteSubmitted) addRecent('quote', 'dismissed');
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
    const d = state.quoteDraft;
    state.quoteSubmitted = true;
    log('cta_clicked', 'quote_submit (mock)');
    log('quote_submitted', `${vehicleLabel(d.vehicle)} ${d.vehicle.drivetrain} → ${selectedDealer()?.name || 'no dealer'}`
      + `${d.optional.trade ? ' · trade-in' : ''}${d.optional.down ? ' · down payment' : ''}`);
    renderQuoteForm({ animate: true });
    setTimeout(() => {
      if (!state.quoteActive) return;
      state.quoteDraft = null;
      state.quoteActive = false;
      closeFlyout();
      restoreCompositionIfIdle();
      swapPrimary(true);
      renderActiveLayer();
      maybeReleasePendingOverlays();
    }, QUOTE_CONFIRM_MS);
  }

  // Returning to the tab after a qualifying action is what a real site
  // would use to decide "this visitor is worth a quote prompt."
  document.addEventListener('visibilitychange', () => {
    // A timed notice shouldn't run out while the visitor is somewhere else.
    if (document.hidden) pauseNotice('away'); else resumeNotice('away');
    if (!document.hidden && state.hasQualifyingAction) scheduleQuote();
  });

  // A held-back prompt comes in after a short beat once its blocker clears,
  // rather than in the same instant — so "privacy accepted" / "chat closed"
  // and "here's the prompt" read as two moments, not one jump.
  function maybeReleasePendingOverlays() {
    if (state.privacyActive || interactionBusy()) return;
    const beat = promptDelayMs() ? RELEASE_BEAT_MS : 0;
    if (state.pendingQuote) {
      state.pendingQuote = false;
      scheduleOverlay('quote', beat, 'released');
      return;
    }
    if (state.pendingSurvey) {
      state.pendingSurvey = false;
      scheduleOverlay('survey', beat, 'released');
      return;
    }
    if (state.pendingNotice && !state.quoteActive && !state.surveyActive) {
      state.pendingNotice = false;
      scheduleOverlay('notice', beat, 'released');
    }
    if (state.pendingOffer) {
      state.pendingOffer = false;
      scheduleOverlay('offer', beat, 'released');
    }
  }

  /* ------------------------------------------------------------------ *
   * Messages you closed — a list at the end of the page of everything the
   * visitor dismissed, or that timed out or was replaced, each with its
   * action still attached. For anyone who closed one by mistake, or who
   * wouldn't know how to summon it again. One entry per kind (the latest),
   * newest first; an entry goes away once its message shows again.
   * ------------------------------------------------------------------ */

  // `var` (hoisted): applyPreset(), the prompt triggers and evaluateScroll()
  // can all run during setup, before this part of the file has.
  var recentMessages = [];
  var recentInView = false;
  var $recentSection = document.getElementById('recentMessages');
  var $recentList = document.getElementById('recentList');

  const RECENT_KINDS = {
    notice: { name: 'Partner offer', title: () => NOTICE.message },
    survey: { name: 'Survey', title: () => 'Help us improve our site', sub: () => 'One quick question about finding what you were looking for.' },
    quote: { name: 'Request a Quote', title: () => 'Ready for pricing on the Aurelia GT?', sub: () => quoteSubline() },
    primary: { name: 'Footer message', title: () => state.primary?.message || state.primary?.cta?.label || 'Footer message' },
    offer: { name: 'Private offer', title: () => `${OFFER.amount} toward a new Aurelia GT`, sub: () => `Personalized for you · ${OFFER.ends}` },
  };

  function addRecent(kind, how) {
    recentMessages = recentMessages.filter((m) => m.kind !== kind);
    recentMessages.unshift({ kind, how, at: new Date(), title: RECENT_KINDS[kind].title() });
    renderRecent();
    log('closed_message_saved', `${RECENT_KINDS[kind].name} — ${how}`);
    announce(`${RECENT_KINDS[kind].name} closed. It's saved under "Messages you closed" at the end of the page.`);
  }

  function removeRecent(kind) {
    if (!recentMessages || !recentMessages.some((m) => m.kind === kind)) return;
    recentMessages = recentMessages.filter((m) => m.kind !== kind);
    renderRecent();
  }

  // Runs fn once the takeover's prompt is on screen (the swap into it is
  // animated), so restoring can open straight into the survey or quote form.
  function whenPromptShows(selector, fn, tries = 90) {
    const el = $primary.querySelector(selector);
    if (el && !swapTimer) { fn(el); return; }
    if (tries > 0) requestAnimationFrame(() => whenPromptShows(selector, fn, tries - 1));
  }

  function restoreRecent(kind) {
    log('closed_message_reopened', RECENT_KINDS[kind].name);
    if (kind === 'survey') {
      triggerSurvey();
      if (state.surveyActive) whenPromptShows('.primary-prompt--survey .btn--primary', (b) => { if (state.flyout !== 'survey') b.click(); });
    } else if (kind === 'quote') {
      state.quoteDismissed = false;
      state.hasQualifyingAction = true;
      triggerQuote();
      if (state.quoteActive) whenPromptShows('.primary-prompt--quote .quote-cta', (b) => { if (state.flyout !== 'quote') b.click(); });
    } else if (kind === 'offer') {
      restoreOffer();
    } else if (kind === 'primary') {
      state.fullyDismissed = false;
      state.dismissed = false;
      applyVisibility();
      applyControlsVisibility();
      removeRecent('primary');
    }
    const waiting = (kind === 'survey' && state.pendingSurvey) || (kind === 'quote' && state.pendingQuote);
    if (waiting) announce(`${RECENT_KINDS[kind].name} will appear as soon as ${state.privacyActive ? 'the privacy notice is answered' : 'what you are doing is finished'}.`);
  }

  function renderRecent() {
    $recentSection.hidden = !recentMessages.length;
    const time = (d) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    $recentList.replaceChildren(...recentMessages.map((m) => {
      const k = RECENT_KINDS[m.kind];
      let action;
      if (m.kind === 'notice') {
        action = h('a', { class: 'cta-textlink', href: '#technology', onclick: () => log('cta_clicked', 'notice: learn more (from closed messages)') },
          NOTICE.cta, ' ', h('span', { 'aria-hidden': 'true', text: '→' }));
      } else {
        const label = m.kind === 'survey' ? 'Take the survey' : m.kind === 'quote' ? quoteCtaLabel() : m.kind === 'offer' ? 'View my offer' : 'Show it again';
        action = h('button', { type: 'button', class: `btn btn--small recent-item__action recent-item__action--${m.kind}`, text: label, onclick: () => restoreRecent(m.kind) });
      }
      const sub = k.sub && k.sub();
      return h('li', { class: 'recent-item', 'data-kind': m.kind },
        h('span', { class: 'recent-item__dot', 'aria-hidden': 'true' }),
        h('div', { class: 'recent-item__body' },
          h('p', { class: 'recent-item__meta', text: `${k.name} · ${m.how} at ${time(m.at)}` }),
          h('p', { class: 'recent-item__title', text: m.title }),
          sub ? h('p', { class: 'recent-item__sub', text: sub }) : null),
        h('div', { class: 'recent-item__actions' },
          action,
          h('button', { type: 'button', class: 'recent-item__remove', 'aria-label': `Remove "${k.name}" from this list`, innerHTML: closeIcon(), onclick: () => { log('closed_message_removed', k.name); removeRecent(m.kind); } })));
    }));
    renderDemoNotes();
  }

  function evaluateRecentInView() {
    if (!$recentSection) return;
    if ($recentSection.hidden) { if (recentInView) { recentInView = false; renderDemoNotes(); } return; }
    const r = $recentSection.getBoundingClientRect();
    const inView = r.top < window.innerHeight * 0.85 && r.bottom > 0;
    if (inView !== recentInView) { recentInView = inView; renderDemoNotes(); }
  }

  /* ------------------------------------------------------------------ *
   * Personalized offer — content from a personalization engine (here, a
   * $500 private offer for a returning visitor) that opens like a standard
   * pop-up over the page, then moves down into the sticky surface after a
   * few seconds, or as soon as it's closed. In the bar it replaces the
   * default content (personalized content is primary content), so the
   * survey, quote and timed notice still take over on top of it and hand
   * the space back to it afterwards.
   * ------------------------------------------------------------------ */

  const OFFER = {
    amount: '$500',
    headline: 'Your private offer: $500 toward a new Aurelia GT',
    why: "Because you've been looking at Aurelia GT",
    body: 'Exclusive to you through October 31, on top of current incentives. Claim it now, or find it in the bar below anytime.',
    ends: 'Ends Oct 31',
    code: 'AGT500-K7Q4',
  };
  const OFFER_POP_MS = 6000;

  // The "banner ad" itself: one inline SVG, used full size in the pop-up and
  // as a thumbnail in the bar. `id` keeps its gradient ids unique per copy.
  function offerArt(id, label) {
    return `<svg viewBox="0 0 640 260" preserveAspectRatio="xMidYMid slice" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}>
      <defs>
        <linearGradient id="obg-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d0f13"/><stop offset=".62" stop-color="#1b2029"/><stop offset="1" stop-color="#2d1820"/></linearGradient>
        <radialGradient id="oglow-${id}" cx=".72" cy=".64" r=".5"><stop offset="0" stop-color="#c0304f" stop-opacity=".6"/><stop offset="1" stop-color="#c0304f" stop-opacity="0"/></radialGradient>
        <linearGradient id="obody-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1eee9"/><stop offset="1" stop-color="#8e8b87"/></linearGradient>
      </defs>
      <rect width="640" height="260" fill="url(#obg-${id})"/>
      <rect width="640" height="260" fill="url(#oglow-${id})"/>
      <path d="M296 213H640" stroke="rgba(255,255,255,.14)" stroke-width="2"/>
      <g transform="translate(296 100)">
        <path d="M8 88C20 70 60 58 110 54C140 30 190 18 240 22C272 25 300 42 318 56C330 62 334 74 332 86L326 94H12Z" fill="url(#obody-${id})"/>
        <path d="M122 53C150 33 190 25 232 28C250 30 266 38 280 50Z" fill="#1e232b"/>
        <path d="M40 70C120 58 220 56 318 66" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1.5"/>
        <path d="M314 68l14 4" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
        <circle cx="78" cy="94" r="22" fill="#0b0c0f" stroke="#3a3f48" stroke-width="5"/><circle cx="78" cy="94" r="8" fill="#6b707a"/>
        <circle cx="262" cy="94" r="22" fill="#0b0c0f" stroke="#3a3f48" stroke-width="5"/><circle cx="262" cy="94" r="8" fill="#6b707a"/>
      </g>
      <g font-family="-apple-system, 'Helvetica Neue', Arial, sans-serif">
        <text x="32" y="52" fill="#f5b3c2" font-size="13" font-weight="700" letter-spacing="3">PRIVATE OFFER</text>
        <text x="27" y="142" fill="#fff" font-size="96" font-weight="800" letter-spacing="-3">$500</text>
        <text x="32" y="176" fill="#ece7e1" font-size="20">toward your Aurelia GT</text>
        <text x="32" y="224" fill="rgba(255,255,255,.55)" font-size="12">Ends Oct 31 · See dealer for details</text>
      </g>
    </svg>`;
  }

  // `var` (hoisted): applyPreset() resets the offer during setup.
  var $offerPop = document.getElementById('offerPop');
  var offerPopAnim = null;
  var offerPauses = new Set();
  var offerDocking = false;

  function offerVisible() { return !!($offerPop && !$offerPop.hidden); }

  function renderOfferPopup({ auto }) {
    const card = h('div', { class: 'offer-pop__card', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'offerPopTitle', 'aria-describedby': 'offerPopText' },
      h('button', { type: 'button', class: 'offer-pop__x', 'aria-label': 'Close; the offer moves to the bar', innerHTML: closeIcon(), onclick: () => dockOffer('closed') }),
      h('div', { class: 'offer-pop__banner', innerHTML: offerArt('pop', `Aurelia GT banner: ${OFFER.amount} private offer, ${OFFER.ends}`) }),
      h('div', { class: 'offer-pop__body' },
        h('p', { class: 'offer-pop__why' }, h('span', { class: 'offer-pop__chip', text: 'Personalized for you' }), ` ${OFFER.why}`),
        h('h2', { class: 'offer-pop__title', id: 'offerPopTitle', text: OFFER.headline }),
        h('p', { class: 'offer-pop__text', id: 'offerPopText', text: OFFER.body }),
        h('div', { class: 'offer-pop__actions' },
          h('button', { type: 'button', class: 'btn btn--primary offer-pop__claim', text: state.offer?.claimed ? 'View My Code' : 'Claim My Offer', onclick: () => dockOffer('claim') }),
          h('button', { type: 'button', class: 'btn btn--ghost offer-pop__later', text: 'Not now', onclick: () => dockOffer('not now') })),
        auto ? h('div', { class: 'offer-pop__timer', 'aria-hidden': 'true' }, h('span', { id: 'offerPopLine' })) : null,
        auto ? h('p', { class: 'offer-pop__hint', text: 'Moving to the bar below in a few seconds' }) : null));
    card.addEventListener('mouseenter', () => pauseOfferTimer('hover'));
    card.addEventListener('mouseleave', () => resumeOfferTimer('hover'));
    card.addEventListener('focusin', () => pauseOfferTimer('focus'));
    card.addEventListener('focusout', (e) => { if (!card.contains(e.relatedTarget)) resumeOfferTimer('focus'); });
    $offerPop.replaceChildren(h('div', { class: 'offer-pop__backdrop', onclick: () => dockOffer('outside click') }), card);
    return card;
  }

  function pauseOfferTimer(why) { offerPauses.add(why); if (offerPopAnim) offerPopAnim.pause(); }
  function resumeOfferTimer(why) { offerPauses.delete(why); if (offerPopAnim && !offerPauses.size) offerPopAnim.play(); }

  function triggerOffer() {
    if (offerVisible() || state.offer?.phase === 'docked') return;
    if (state.privacyActive || interactionBusy()) {
      state.pendingOffer = true;
      log('offer_triggered', `waiting — ${state.privacyActive ? 'privacy notice active' : 'interaction in use'}`);
      return;
    }
    removeRecent('offer');
    state.offer = { phase: 'popup', claimed: state.offer?.claimed || false };
    showOfferPopup({ auto: true });
    log('offer_shown', 'personalized pop-up — returning visitor');
    announce(`${OFFER.headline}. It moves to the bar at the bottom of the page in a few seconds.`);
  }

  function showOfferPopup({ auto, from }) {
    const card = renderOfferPopup({ auto });
    $offerPop.hidden = false;
    offerPauses.clear();
    if (!prefersReducedMotion) {
      $offerPop.querySelector('.offer-pop__backdrop').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'ease-out' });
      if (from) {
        // Re-opened from the bar: grow back out of it.
        const to = card.getBoundingClientRect();
        const sx = from.width / to.width;
        card.animate([
          { transform: `translate(${from.left + from.width / 2 - (to.left + to.width / 2)}px, ${from.top + from.height / 2 - (to.top + to.height / 2)}px) scale(${sx})`, opacity: 0 },
          { transform: 'none', opacity: 1 },
        ], { duration: 560, easing: 'cubic-bezier(.2,.8,.2,1)' });
      } else {
        card.animate([{ transform: 'translateY(24px) scale(.96)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 480, easing: 'cubic-bezier(.2,.8,.2,1)' });
      }
    }
    if (auto) {
      offerPopAnim = document.getElementById('offerPopLine').animate(
        [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }],
        { duration: OFFER_POP_MS, easing: 'linear', fill: 'forwards' });
      offerPopAnim.onfinish = () => { offerPopAnim = null; dockOffer('timed'); };
      if (card.matches(':hover')) pauseOfferTimer('hover');
    } else {
      card.querySelector('.offer-pop__claim').focus({ preventScroll: true });
    }
    renderActiveLayer();
  }

  function hideOfferPopup() {
    if (offerPopAnim) { offerPopAnim.onfinish = null; offerPopAnim.cancel(); offerPopAnim = null; }
    offerPauses?.clear();
    if ($offerPop) { $offerPop.hidden = true; $offerPop.replaceChildren(); }
  }

  // Swap the bar's own content for the offer: personalized content becomes
  // the primary composition (or the one a takeover will hand back to).
  function installOfferComposition() {
    const target = state.priorComposition || state;
    if (target.primaryType !== 'offer') {
      state.offerPrior = { primaryType: target.primaryType, primary: target.primary, scrollSpy: target.scrollSpy };
      target.primaryType = 'offer';
      target.scrollSpy = 'off';
    }
  }

  function dockOffer(how) {
    if (!offerVisible() || offerDocking) return;
    const card = $offerPop.querySelector('.offer-pop__card');
    const focusWasInside = $offerPop.contains(document.activeElement);
    if (offerPopAnim) { offerPopAnim.onfinish = null; offerPopAnim.cancel(); offerPopAnim = null; }
    state.offer = { ...(state.offer || {}), phase: 'docked' };
    state.minimized = false;
    state.dismissed = false;
    state.fullyDismissed = false;
    state.scrollVisible = true;
    installOfferComposition();
    const firstSurface = $surface.getBoundingClientRect();
    const from = card.getBoundingClientRect();
    cancelSwap();
    renderPrimary();
    applyVisibility();
    applyControlsVisibility();
    log('offer_docked', how);
    const finish = () => {
      offerDocking = false;
      hideOfferPopup();
      $primary.querySelector('.primary-prompt--offer')?.classList.remove('is-arriving');
      traceBorder();
      renderActiveLayer();
      evaluateCrowding();
      if (how === 'claim') openOfferClaim();
      else if (focusWasInside) $primary.querySelector('.offer-claim')?.focus({ preventScroll: true });
      maybeReleasePendingOverlays();
    };
    if (prefersReducedMotion) { finish(); return; }
    offerDocking = true;
    animateSurfaceResize(firstSurface);
    $primary.querySelector('.primary-prompt--offer')?.classList.add('is-arriving');
    // FLIP the pop-up down into the bar: it shrinks toward the surface and
    // fades as it lands, while the offer strip rises in underneath.
    const to = $surface.getBoundingClientRect();
    const scale = Math.max(0.12, to.width / from.width);
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    $offerPop.querySelector('.offer-pop__backdrop').animate([{ opacity: 1 }, { opacity: 0 }], { duration: 520, easing: 'ease-in', fill: 'forwards' });
    const fly = card.animate([
      { transform: 'none', opacity: 1, borderRadius: '24px' },
      { transform: `translate(${dx * 0.55}px, ${dy * 0.55}px) scale(${(1 + scale) / 2})`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0, borderRadius: '60px' },
    ], { duration: 780, easing: 'cubic-bezier(.55,0,.25,1)', fill: 'forwards' });
    fly.onfinish = finish;
  }

  // From the bar's thumbnail: the offer opens full size again (no timer —
  // the visitor asked for it); closing it puts it back.
  function reopenOfferPopup() {
    if (offerVisible()) return;
    const from = $primary.querySelector('.offer-thumb')?.getBoundingClientRect() || $surface.getBoundingClientRect();
    if (state.flyout === 'offer') closeFlyout();
    showOfferPopup({ auto: false, from });
    log('offer_reopened', 'from the bar');
    renderDemoNotes();
  }

  function renderOfferPrimary() {
    const claimed = !!state.offer?.claimed;
    const claim = h('button', {
      type: 'button', class: 'btn btn--small offer-claim',
      'aria-controls': 'stickyFlyout', 'aria-expanded': String(state.flyout === 'offer'),
      text: claimed ? 'View Code' : 'Claim Offer',
      onclick: () => {
        const first = $surface.getBoundingClientRect();
        if (state.flyout === 'offer') closeFlyout(); else openOfferClaim();
        animateSurfaceResize(first);
      },
    });
    $primary.appendChild(h('div', { class: 'primary-prompt primary-prompt--offer' },
      h('button', { type: 'button', class: 'offer-thumb', 'aria-label': 'View your private offer', innerHTML: offerArt('thumb'), onclick: reopenOfferPopup }),
      h('p', {}, h('strong', { text: `Your ${OFFER.amount} private offer` }), h('span', { class: 'offer-strip__meta', text: ` · ${OFFER.ends}` })),
      claim,
      h('button', { type: 'button', class: 'sticky__icon-btn', 'aria-label': 'Dismiss private offer', innerHTML: closeIcon(), onclick: () => dismissOffer() })));
  }

  function openOfferClaim() {
    if (!state.offer) return;
    if (!state.offer.claimed) { state.offer.claimed = true; log('offer_claimed', OFFER.code); }
    openFlyout('offer');
    const c = $primary.querySelector('.offer-claim');
    if (c) c.textContent = 'View Code';
    document.getElementById('offerCode')?.focus({ preventScroll: true });
  }

  function renderOfferClaim() {
    const copy = h('button', { type: 'button', class: 'btn btn--ghost btn--small', text: 'Copy code' });
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(OFFER.code); copy.textContent = 'Copied'; } catch (_) { copy.textContent = 'Select the code to copy it'; }
      log('offer_code_copied', OFFER.code);
    });
    $flyout.replaceChildren(
      h('p', { class: 'flyout-title', text: 'Your private offer' }),
      h('div', { class: 'offer-claim-panel' },
        h('p', { class: 'offer-code', id: 'offerCode', tabIndex: -1 }, h('span', { class: 'offer-code__label', text: 'Offer code' }), h('strong', { text: OFFER.code })),
        h('p', { class: 'offer-claim-panel__text', text: `${OFFER.amount} toward a new 2026 Aurelia GT, on top of current incentives. Show this code at any Solstice dealer, or apply it to a quote. Ends October 31, 2026.` }),
        h('div', { class: 'offer-claim-panel__actions' },
          h('button', { type: 'button', class: 'btn btn--primary btn--small', text: 'Get a quote with this offer', onclick: () => {
            log('cta_clicked', 'quote with private offer');
            closeFlyout();
            state.quoteDismissed = false;
            state.quoteSubmitted = false;
            state.hasQualifyingAction = true;
            triggerQuote();
            if (state.quoteActive) whenPromptShows('.primary-prompt--quote .quote-cta', (b) => { if (state.flyout !== 'quote') b.click(); });
          } }),
          copy)));
  }

  function dismissOffer() {
    if (state.offer?.phase !== 'docked') return;
    state.offer = { ...state.offer, phase: 'dismissed' };
    if (state.flyout === 'offer') closeFlyout();
    const target = state.priorComposition || state;
    if (state.offerPrior && target.primaryType === 'offer') Object.assign(target, state.offerPrior);
    state.offerPrior = null;
    log('offer_dismissed', 'from the bar');
    addRecent('offer', 'dismissed');
    swapPrimary(true);
  }

  // "Messages you closed" → back into the bar.
  function restoreOffer() {
    if (state.offer?.phase === 'docked' || offerVisible()) return;
    state.offer = { ...(state.offer || {}), phase: 'docked' };
    state.minimized = false; state.dismissed = false; state.fullyDismissed = false; state.scrollVisible = true;
    installOfferComposition();
    removeRecent('offer');
    swapPrimary(true);
    setTimeout(traceBorder, getDurMedMs() + 200);
  }

  function resetOffer() {
    hideOfferPopup();
    offerDocking = false;
    state.offer = null;
    state.offerPrior = null;
    state.pendingOffer = false;
  }

  /* ------------------------------------------------------------------ *
   * Timed notice — the lowest-priority optional message. It borrows the
   * primary zone like Survey/Quote, but closes itself when its time runs
   * out (shown as a line along the top edge that shrinks to nothing), and
   * steps aside entirely — dropped, not queued — if a survey or quote
   * needs the space, since a time-boxed partner message shouldn't pile up.
   * ------------------------------------------------------------------ */

  let noticeAnim = null;
  const noticePauses = new Set();

  function noticeMs() {
    return NOTICE_DURATIONS[state.noticeDuration] ?? NOTICE_DURATIONS.standard;
  }

  function triggerNotice() {
    if (state.noticeActive) return;
    const blocker = state.privacyActive ? 'privacy notice active'
      : interactionBusy() ? 'interaction in use'
        : (state.quoteActive || state.surveyActive) ? 'a higher-priority prompt is showing' : null;
    if (blocker) {
      state.pendingNotice = true;
      log('notice_triggered', `waiting — ${blocker}`);
      return;
    }
    captureCompositionIfNeeded();
    state.noticeActive = true;
    removeRecent('notice');
    state.dismissed = false;
    state.minimized = false;
    state.scrollVisible = true;
    log('notice_triggered', `shown — closes in ${noticeMs() / 1000}s`);
    swapPrimary(true);
    startNoticeTimer();
  }

  function dismissNotice(reason) {
    if (!state.noticeActive) return;
    stopNoticeTimer();
    state.noticeActive = false;
    restoreCompositionIfIdle();
    log('notice_closed', reason);
    if (reason !== 'acted on') addRecent('notice', reason === 'timed out' ? 'timed out' : 'dismissed');
    swapPrimary(true);
    maybeReleasePendingOverlays();
  }

  // Called when a survey or quote takes the space: the notice just goes.
  function dropNoticeFor(what) {
    if (!state.noticeActive) return;
    stopNoticeTimer();
    state.noticeActive = false;
    log('notice_closed', `dropped for the ${what} — ancillary notices aren't queued`);
    addRecent('notice', `replaced by the ${what}`);
  }

  function startNoticeTimer() {
    stopNoticeTimer();
    $noticeTimer.hidden = false;
    // Web Animations: the animation is the timer, so the line and the
    // close can't drift apart, and pausing one pauses both.
    noticeAnim = $noticeTimer.animate(
      [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }],
      { duration: noticeMs(), easing: 'linear', fill: 'forwards' },
    );
    noticeAnim.onfinish = () => { noticeAnim = null; dismissNotice('timed out'); };
    if ($sticky.matches(':hover')) pauseNotice('hover');
    if ($sticky.contains(document.activeElement)) pauseNotice('focus');
    if (document.hidden) pauseNotice('away');
  }

  function stopNoticeTimer() {
    if (noticeAnim) {
      noticeAnim.onfinish = null;
      noticeAnim.cancel();
      noticeAnim = null;
    }
    noticePauses.clear();
    $noticeTimer.hidden = true;
    delete $noticeTimer.dataset.paused;
  }

  function pauseNotice(reason) {
    if (!noticeAnim) return;
    noticePauses.add(reason);
    noticeAnim.pause();
    $noticeTimer.dataset.paused = 'true';
  }

  function resumeNotice(reason) {
    if (!noticeAnim) return;
    noticePauses.delete(reason);
    if (noticePauses.size) return;
    noticeAnim.play();
    delete $noticeTimer.dataset.paused;
  }

  function triggerPrivacy() {
    if (state.privacyActive) return;
    state.privacyActive = true;
    $privacyBar.hidden = false;
    $privacyBar.classList.add('is-entering');
    log('privacy_shown');
    updateStickyOffset();
    // Required UI wins: an offer pop-up that's up gets out of the way,
    // into the bar (where it keeps its actions), rather than covering it.
    if (offerVisible()) dockOffer('privacy notice');
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
  document.getElementById('triggerNotice').addEventListener('click', () => scheduleOverlay('notice', promptDelayMs()));
  document.getElementById('noticeDurationSelect').addEventListener('change', (e) => {
    state.noticeDuration = e.target.value;
    log('notice_duration_changed', e.target.selectedOptions[0].textContent);
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
  let navLock = null;
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
      renderDemoNotes();
    }
    syncLookStatus();
    syncScrollCue();
    evaluateRecentInView();
    evaluateEndDock();

    // Scroll spy: find the section most in view
    let current = state.activeSection;
    let best = null;
    sectionEls.forEach((secEl) => {
      const rect = secEl.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.5) best = secEl.id;
    });
    if (best) current = best;
    // After a section-nav click, hold the highlight on the destination until
    // the page arrives (or a moment passes, if it can't scroll that far).
    if (navLock) {
      if (best === navLock.id || performance.now() > navLock.until) navLock = null;
      else current = state.activeSection;
    }
    // The section whose own button row will take over at the end becomes
    // "current" as soon as that row comes into view, so the floating button
    // already shows the row's action ("Search Inventory") before handing over.
    const endRow = endDockRow();
    if (endRow && !handoverBlocked() && endRow.row.getBoundingClientRect().top < window.innerHeight) current = endRow.section.id;

    if (current !== state.activeSection) {
      state.activeSection = current;
      log('section_changed', sectionLabel(current));
      syncChatHints({ roll: true });
      if (!state.activeInteraction && state.scrollSpy !== 'off' && !state.surveyActive && !state.quoteActive && !state.noticeActive) {
        // Section nav just moves its highlight — fading the whole nav on every
        // section change would be noise. Label changes (contextual CTA,
        // "Viewing: …") are a real content swap, so those cross-fade.
        if (state.scrollSpy === 'navigation') renderPrimary();
        else if (state.scrollSpy === 'contextual' && morphContextualCta()) renderActiveLayer();
        else swapPrimary(false);
      }
    }

    // After the section update, so a merge lands on this section's action.
    evaluateStartDock();
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
    closeMoreModal('scene changed', { instant: true });
    cancelCtaMorph();
    removeRecent('primary'); // a new scene shows the bar again
    resetOffer();
    resetEndDock();
    resetStartDock({ settle: true }); // a fresh scene opens in place, without the flight
    cancelScheduledOverlays();
    cancelSwap();
    stopNoticeTimer();

    Object.assign(state, {
      legacyMode: false,
      surveyActive: false,
      quoteActive: false,
      quoteDraft: null,
      // A prompt held back in the previous scene (e.g. behind the Stress
      // Test's privacy notice) shouldn't surface in this one.
      pendingSurvey: false,
      pendingQuote: false,
      noticeActive: false,
      pendingNotice: false,
      surveyDraft: null,
      surveySubmitted: false,
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
    // A new shell gets a fresh "does it fit?" decision, and a second look
    // once its width transition has settled: measured mid-transition (still
    // at the previous shell's width), long content like Brand Story's link
    // looked like it fit, the shell never expanded, and the link was clipped.
    state.panelExpanded = false;
    $sticky.dataset.expanded = 'false';
    applyVisibility();
    evaluateCrowding();
    setTimeout(evaluateCrowding, getDurMedMs() + 60);
  }));

  radios('surface').forEach((r) => r.addEventListener('change', () => {
    if (!r.checked) return;
    state.surface = r.value;
    applyVisibility();
  }));

  const $haloToggle = document.getElementById('haloToggle');
  $haloToggle.addEventListener('change', () => {
    state.halo = $haloToggle.checked ? 'on' : 'off';
    log('sticky_variant_changed', `halo ${state.halo}${haloApplies() ? '' : ' (applies to Floating and Compact)'}`);
    applyVisibility();
  });

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
    requestAnimationFrame(() => syncChatHints());
    closeMoreModal('scene changed', { instant: true });
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
    log('entrance_changed', state.entrance);
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
    4: 'Same content, different shell. Use the "Try a look" switcher on the page to change the shape, finish, and entrance (or Next look to step through six), and Appears to set when the bar shows up as you scroll.',
    5: 'Several messages share one slot and rotate on a timer: each rolls into place while the panel\'s edge glides to fit it. Rotation pauses while you hover or focus the bar.',
    6: 'Scroll the page: the floating button morphs into the next best action for each section. Some go somewhere (→ Explore the Gallery, Search Inventory); others open more on that topic in place (+ DriveSense, Interior, Performance), and the button becomes the close.',
    7: 'Section links in the bar: click one to jump straight to that part of the page. The highlight follows as you scroll.',
    8: 'Each utility has its own color. Focus the chat field (blue) or open Search (teal) and the whole surface tints to match. Esc or clicking away closes things.',
    9: 'A partner message (a satellite-radio free weekend) arrives after the Prompt delay and closes itself when the line along the top runs out. Hover or focus the bar to pause it.',
    10: 'Personalization: a $500 private offer for a returning visitor opens as a standard pop-up after the Prompt delay, then moves down into the bar a few seconds later (or as soon as you close it). Click its image in the bar to see it again, or Claim for the code.',
    11: 'The survey arrives after the Prompt delay and takes over the bar (violet). Take Survey opens a one-question survey in place; answer it or dismiss it and the original content comes back.',
    12: 'A returning-visitor quote prompt arrives after the Prompt delay and takes over the bar (green). Get My Quote opens the four-step request form; progress is kept if you close it.',
    13: 'Both prompts, a few seconds apart: the Survey arrives first, then the Quote takes over because it outranks it. Dismiss the Quote and the Survey comes back.',
    14: 'Privacy shows first and wins; the Survey and Quote are scheduled behind it. Accept the notice and the Quote follows after a short beat, then the Survey after that.',
  };
  const $flowNote = document.getElementById('flowNote');

  function setActiveFlowStep(step) {
    activeFlowStep = step;
    document.querySelectorAll('#flowButtons button[data-flow]').forEach((b) => {
      const on = Number(b.dataset.flow) === step;
      b.classList.toggle('is-active', on);
      if (on) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    $flowNote.hidden = !step;
    $flowNote.textContent = step ? FLOW_NOTES[step] : '';
    showLookSwitcher(step === 4);
    renderDemoNotes();
  }

  function runFlowStep(step) {
    log('demo_flow_step', String(step));
    closeMoreModal('scene changed', { instant: true });
    // Step 5 turns on message rotation; presets deliberately don't reset it
    // (so it can be tried across presets by hand), but each flow step should
    // show its own scenario cleanly rather than inherit rotating messages.
    if (step !== 5 && state.messageMode !== 'static') {
      state.messageMode = 'static';
      setRadio('message', 'static');
    }
    // Same for step 4's scroll triggers: every other step shows the bar
    // straight away, so a "wait until 25% scroll" left over from step 4
    // would hide the very thing the next step is about.
    cancelLookReplay();
    if (state.visibility !== 'always') setVisibilityMode('always');
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
        // Arriving straight from Current State, there's no surface to restyle yet.
        if (state.legacyMode) applyPreset('brand-story');
        renderPrimary();
        setupRotationTimer();
        openPanelSections([1, 2]); // Presentation, Visibility & Entrance
        // The on-page "Try a look" switcher does the work here; the panel
        // stays open beside it only where there's room for both.
        if (document.documentElement.clientWidth >= 800) openPanel(); else closePanel();
        applyLook(0);
        break;
      case 5:
        applyPreset('message-cta');
        // Floating, so the card's border hugs the message and visibly
        // glides to each new length.
        setRadio('presentation', 'floating');
        state.presentation = 'floating';
        setRadio('surface', 'opaque');
        state.surface = 'opaque';
        applyVisibility();
        setRadio('message', 'rotating');
        state.messageMode = 'rotating';
        setupRotationTimer();
        renderPrimary();
        openPanelSections([4]); // Message Rotation
        openPanel();
        break;
      case 6:
      case 7:
        applyPreset(step === 6 ? 'scroll-spy' : 'section-navigator');
        // Start at the top so scrolling (or jumping) walks through every section.
        window.scrollTo({ top: 0, behavior: 'instant' });
        openPanelSections([7]); // Scroll Spy
        openPanel();
        break;
      case 8:
        applyPreset('chat-search');
        openPanelSections([0]); // Content Presets — shows the "Chat & search" group
        openPanel();
        break;
      case 9:
        applyPreset('timed-notice');
        openPanelSections([9]); // Orchestration Demos — notice duration + trigger
        openPanel();
        break;
      case 10:
        applyPreset('personalized-offer');
        openPanelSections([9]); // Orchestration Demos — the Prompt delay control
        // The pop-up needs the page; on narrow screens the panel would cover it.
        if (document.documentElement.clientWidth >= 1000) openPanel(); else closePanel();
        break;
      case 11:
      case 12:
      case 13:
        applyPreset({ 11: 'survey-integration', 12: 'quote-prompt', 13: 'survey-quote-handoff' }[step]);
        openPanelSections([9]); // Orchestration Demos — the Prompt delay control
        openPanel();
        break;
      case 14:
        applyPreset('stress-test');
        openPanelSections([8, 9]); // Busy/Overflow Edge Cases, Orchestration Demos
        openPanel();
        break;
    }
    // After the step's own work, since applyPreset/openPanel don't touch it.
    setActiveFlowStep(step);
  }

  /* ------------------------------------------------------------------ *
   * "Try a look" switcher (Demo Flow step 4)
   *
   * An on-page shortcut to the panel's Presentation and Visibility &
   * Entrance controls, so the same content can be flipped through every
   * shell, finish, entrance and trigger point in a click. It drives the
   * panel's own inputs (so both stay in sync and everything is logged the
   * same way) rather than keeping a second copy of the state.
   * ------------------------------------------------------------------ */

  // `var` (hoisted): evaluateScroll() and syncControlsFromState() call in
  // here before this part of the file has run.
  var lookReady = false;
  var lookReplayTimer = null;
  const $look = document.getElementById('lookSwitcher');
  const $lookBody = document.getElementById('lookSwitcherBody');
  const $lookCollapse = document.getElementById('lookCollapse');
  const $lookCounter = document.getElementById('lookCounter');
  const $lookStatus = document.getElementById('lookStatus');
  const $lookStatusText = document.getElementById('lookStatusText');
  const $lookMeter = document.getElementById('lookMeter');

  // "Next look" walks these in order: each differs from the last in shape,
  // finish and entrance, so every click is a visible change.
  const LOOKS = [
    { presentation: 'floating', surface: 'opaque', entrance: 'slide', halo: 'off' },
    { presentation: 'compact', surface: 'opaque', entrance: 'rise', halo: 'on' },
    { presentation: 'floating', surface: 'translucent', entrance: 'fade', halo: 'off' },
    { presentation: 'full-width', surface: 'bordered', entrance: 'rise', halo: 'off' },
    { presentation: 'compact', surface: 'translucent', entrance: 'slide', halo: 'on' },
    { presentation: 'full-width', surface: 'opaque', entrance: 'fade', halo: 'off' },
  ];
  const LOOK_WORDS = {
    'full-width': 'Full-width', floating: 'Floating', compact: 'Compact',
    opaque: 'opaque', translucent: 'glass', bordered: 'bordered',
    none: 'no entrance', fade: 'fades in', slide: 'slides up', rise: 'rises in',
  };
  // Where each control lives in the panel.
  const LOOK_CONTROLS = {
    presentation: { radio: 'presentation' },
    surface: { radio: 'surface' },
    entrance: { select: 'entranceSelect' },
    visibility: { select: 'visibilitySelect' },
    halo: { checkbox: 'haloToggle' },
  };

  function setPanelControl(key, value) {
    const c = LOOK_CONTROLS[key];
    const el = c.radio
      ? document.querySelector(`input[name="${c.radio}"][value="${value}"]`)
      : document.getElementById(c.select || c.checkbox);
    if (!el) return;
    if (c.radio) el.checked = true;
    else if (c.checkbox) el.checked = value === 'on';
    else el.value = value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function setVisibilityMode(value) {
    setPanelControl('visibility', value);
  }

  // Full width spans the viewport: there's nothing around it to blur.
  function haloApplies() { return state.presentation === 'floating' || state.presentation === 'compact'; }

  function currentLookIndex() {
    return LOOKS.findIndex((l) => l.presentation === state.presentation && l.surface === state.surface && l.entrance === state.entrance
      && (!haloApplies() || l.halo === state.halo));
  }

  function cancelLookReplay() {
    if (!lookReplayTimer) return;
    clearTimeout(lookReplayTimer);
    lookReplayTimer = null;
    applyVisibility();
  }

  // Takes the bar off screen for a beat, then brings it back with the
  // chosen entrance, so "None" (it simply appears) can be compared too.
  function replayEntrance() {
    if (!state.scrollVisible || state.legacyMode || state.fullyDismissed) return;
    clearTimeout(lookReplayTimer);
    $sticky.dataset.visible = 'false';
    lookReplayTimer = setTimeout(() => {
      lookReplayTimer = null;
      applyVisibility(); // sees the bar as newly visible, so it plays the entrance
      renderDemoNotes();
    }, prefersReducedMotion ? 0 : 320);
    log('entrance_replayed', state.entrance);
  }

  function applyLook(i) {
    const look = LOOKS[(i + LOOKS.length) % LOOKS.length];
    Object.entries(look).forEach(([k, v]) => setPanelControl(k, v));
    replayEntrance();
  }

  function showLookSwitcher(show) {
    if (!lookReady) return;
    $look.hidden = !show || embedded;
    if (!$look.hidden) syncLookSwitcher();
    syncScrollCue();
  }

  function syncLookSwitcher() {
    if (!lookReady) return;
    ['presentation', 'surface', 'entrance', 'visibility'].forEach((k) => {
      const r = $look.querySelector(`input[name="look-${k}"][value="${state[k]}"]`);
      if (r) r.checked = true;
    });
    document.getElementById('lookSectionLabel').textContent = sectionLabel(state.sectionReachTarget);
    // The halo exists on the floating panel and the pill, not full width.
    const halo = $look.querySelector('input[name="look-halo"]');
    halo.checked = state.halo === 'on';
    halo.disabled = !haloApplies();
    const i = currentLookIndex();
    const words = `${LOOK_WORDS[state.presentation]}${haloApplies() && state.halo === 'on' ? ' with halo' : ''}, ${LOOK_WORDS[state.surface]}, ${LOOK_WORDS[state.entrance]}`;
    $lookCounter.textContent = i >= 0 ? `Look ${i + 1} of ${LOOKS.length}: ${words}` : `Custom: ${words}`;
    syncLookStatus();
  }

  // How far the visitor is toward the current trigger point (0 → 1).
  function triggerProgress() {
    const y = window.scrollY;
    const vh = window.innerHeight;
    let at;
    switch (state.visibility) {
      case 'scroll10': case 'scroll25':
        at = (state.visibility === 'scroll10' ? 0.1 : 0.25) * (document.documentElement.scrollHeight - vh);
        break;
      case 'hero-exit':
        at = $hero.getBoundingClientRect().bottom + y;
        break;
      case 'section-reach': {
        const el = document.getElementById(state.sectionReachTarget);
        at = el ? el.getBoundingClientRect().top + y - vh * 0.75 : 0;
        break;
      }
      default: return 1;
    }
    return at > 0 ? Math.min(1, Math.max(0, y / at)) : 1;
  }

  function triggerWords() {
    switch (state.visibility) {
      case 'scroll10': return 'past 10% of the page';
      case 'scroll25': return 'past 25% of the page';
      case 'hero-exit': return 'past the hero image';
      case 'section-reach': return `to the ${sectionLabel(state.sectionReachTarget)} section`;
      default: return '';
    }
  }

  function syncLookStatus() {
    if (!lookReady || $look.hidden) return;
    const mode = state.visibility === 'always' ? 'always' : state.scrollVisible ? 'shown' : 'waiting';
    $lookStatus.dataset.state = mode;
    const p = triggerProgress();
    $lookMeter.style.transform = `scaleX(${mode === 'waiting' ? p : 1})`;
    const text = mode === 'always'
      ? 'Shows on page load, no scrolling needed.'
      : mode === 'waiting'
        ? `Hidden until you scroll ${triggerWords()}: ${Math.round(p * 100)}% there.`
        : `Appeared once you scrolled ${triggerWords()}.`;
    // Only touch the DOM (and the live region) when the words change.
    if ($lookStatusText.textContent !== text) $lookStatusText.textContent = text;
  }

  $look.addEventListener('change', (e) => {
    const key = e.target.name && e.target.name.replace(/^look-/, '');
    if (!LOOK_CONTROLS[key]) return;
    if (key === 'halo') { setPanelControl('halo', e.target.checked ? 'on' : 'off'); return; }
    setPanelControl(key, e.target.value);
    if (key === 'visibility') {
      // Start from the top so the trigger can be watched as it happens.
      if (e.target.value !== 'always') window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    } else {
      replayEntrance();
    }
  });
  // Keep the switcher in step when the panel's own controls change.
  $panel.addEventListener('change', (e) => {
    if (e.target.closest('#lookSwitcher')) return;
    syncLookSwitcher();
  });
  document.getElementById('lookNext').addEventListener('click', () => {
    const i = currentLookIndex();
    applyLook(i + 1);
  });
  document.getElementById('lookReplay').addEventListener('click', replayEntrance);
  document.getElementById('lookTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
  $lookCollapse.addEventListener('click', () => {
    const open = $lookBody.hidden;
    $lookBody.hidden = !open;
    $lookCollapse.setAttribute('aria-expanded', String(open));
    $lookCollapse.setAttribute('aria-label', open ? 'Collapse the switcher' : 'Expand the switcher');
  });
  lookReady = true;

  /* ------------------------------------------------------------------ *
   * Scroll hint
   *
   * Whenever the surface is waiting on a scroll trigger (from the switcher
   * or the panel's "Show when"), a hint sits where it will appear and says
   * what to do, so an empty page bottom never reads as a broken demo.
   * Dismissing it holds until the trigger changes.
   * ------------------------------------------------------------------ */

  const $scrollCue = document.getElementById('scrollCue');
  const $scrollCueText = document.getElementById('scrollCueText');
  const $scrollCueMeter = document.getElementById('scrollCueMeter');
  let scrollCueDismissedFor = null;
  const scrollCueKey = () => `${state.visibility}|${state.sectionReachTarget}|${startDockWaiting() ? 'masthead' : ''}`;

  function syncScrollCue() {
    if (!lookReady) return;
    // On phones the open panel covers the page, so the hint waits for it to close.
    const panelCovers = !$panel.hidden && document.documentElement.clientWidth <= 720;
    // Contextual CTA's masthead hand-over: the bar is waiting on the masthead.
    const masthead = startDockWaiting();
    const waiting = !embedded && !state.legacyMode && !state.fullyDismissed && !panelCovers
      && ((state.visibility !== 'always' && !state.scrollVisible) || masthead);
    const show = waiting && scrollCueDismissedFor !== scrollCueKey();
    if (show && masthead) {
      const text = "Here the masthead's own buttons come first. Once it's 60% out of view, they merge into the floating button.";
      if ($scrollCueText.textContent !== text) $scrollCueText.textContent = text;
      $scrollCueMeter.style.transform = `scaleX(${Math.min(1, heroOffShare(document.getElementById('hero')) / START_AT)})`;
    } else if (show) {
      const fix = $look.hidden
        ? 'To show it right away, open Prototype Controls → Visibility & Entrance and set "Show when" to Always visible.'
        : 'To show it right away, choose Always under Appears in the "Try a look" switcher.';
      const text = `It's set to appear once you scroll ${triggerWords()}. ${fix}`;
      if ($scrollCueText.textContent !== text) $scrollCueText.textContent = text;
      $scrollCueMeter.style.transform = `scaleX(${triggerProgress()})`;
    }
    if ($scrollCue.hidden === show) {
      $scrollCue.hidden = !show;
      renderDemoNotes();
    }
  }

  document.getElementById('scrollCueClose').addEventListener('click', () => {
    scrollCueDismissedFor = scrollCueKey();
    log('scroll_hint_dismissed', state.visibility);
    syncScrollCue();
  });

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
    document.getElementById('haloToggle').checked = state.halo === 'on';
    setRadio('ctastyle', state.ctaStyle);
    setRadio('dismiss', state.dismissMode);
    setRadio('message', state.messageMode);
    setRadio('chat', state.chat);
    setRadio('search', state.search);
    setRadio('device', state.device);
    setRadio('scrollspy', state.scrollSpy);
    setRadio('animspeed', state.animSpeed);
    setSelect('visibilitySelect', state.visibility);
    setSelect('sectionReachSelect', state.sectionReachTarget);
    document.getElementById('sectionReachField').hidden = state.visibility !== 'section-reach';
    setSelect('entranceSelect', state.entrance);
    setSelect('promptDelaySelect', state.promptDelay);
    applyAnimSpeed(state.animSpeed);
    markActivePresetButton();
    applyControlsVisibility();
    syncLookSwitcher();
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
    ch: 'chat', se: 'search', dv: 'device', ss: 'scrollSpy', pd: 'promptDelay', ha: 'halo',
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
    else if (state.moreOpen) closeMoreModal('escape');
    else if (offerVisible()) dockOffer('escape');
    else if (!$chaosOverlay.hidden) { $chaosOverlay.hidden = true; log('chaos_closed'); }
    else if (state.chatWindowOpen && $chatWindow.contains(document.activeElement)) closeChatWindow();
    else if (state.flyout === 'quote' || state.flyout === 'survey') closeFormPanel(state.flyout, 'escape');
    else if (state.flyout) { closeFlyout(); log('flyout_closed', 'escape'); }
    else if (state.chatWindowOpen) closeChatWindow();
    else if (demoNotesReady && visibleNoteIds().length) dismissNotes(visibleNoteIds(), 'escape');
  });

  // Clicking away dismisses prompts/results, like any popover. The quote
  // form is exempt: an accidental click shouldn't throw away what someone
  // has typed — Escape or the prompt's × still close it deliberately.
  document.addEventListener('pointerdown', (e) => {
    if (!state.flyout || state.flyout === 'quote' || state.flyout === 'survey') return;
    const t = e.target;
    if ($sticky.contains(t) || $chatWindow.contains(t) || $panel.contains(t) || $panelToggle.contains(t) || t.closest?.('#demoNotes')) return;
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
    syncScrollCue();
  }
  function closePanel() {
    $panel.hidden = true;
    $panelToggle.hidden = false;
    $panelToggle.setAttribute('aria-expanded', 'false');
    syncScrollCue();
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
    // Demo notes anchor to elements this render just created or revealed.
    renderDemoNotes();
  }

  /* ------------------------------------------------------------------ *
   * Demo notes — floating tooltips that explain each demo while it runs:
   * how it works, and why it matters. Anchored to the real element being
   * demonstrated, and driven by live state, so they follow the scenario as
   * it plays out (a prompt on its way → arriving → being preempted).
   * Prototype chrome only: dev-tool styling, never in the embedded preview.
   * ------------------------------------------------------------------ */

  // `var` (hoisted) for both: renderActiveLayer() — which calls
  // renderDemoNotes() — can run before this section of the file executes.
  var activeFlowStep = null;
  var demoNotesReady = false;
  const $demoNotes = document.getElementById('demoNotes');
  const $demoNotesToggle = document.getElementById('demoNotesToggle');
  const SURFACE = '#sticky .sticky__surface';
  // Two side by side on desktop; one at a time on phones, where two stacked
  // notes would cover most of the screen (dismissing one reveals the next).
  const maxNotes = () => (document.documentElement.clientWidth <= 720 ? 1 : 2);
  const dismissedNotes = new Set();
  let notesScenario = null;
  // null (not '') means "force a redraw": '' is also the key of an empty
  // list, and reusing it made the last note of every demo undismissable.
  let renderedNotesKey = null;
  let notesRaf = null;

  const note = (id, anchor, title, how, why, extra = {}) => ({ id, anchor, title, how, why, ...extra });

  // Copy can differ by form factor: a string is used everywhere, a
  // { desktop, mobile } pair picks by width, and a function gets the context
  // (for things tied to a specific breakpoint, like the chat field collapsing).
  function noteContext() {
    const vw = document.documentElement.clientWidth;
    const input = document.querySelector('.chat-input-field input');
    return {
      mobile: vw <= 720,
      chatCollapsed: input ? getComputedStyle(input).display === 'none' : vw <= 480,
    };
  }
  const pick = (value, ctx) => {
    if (typeof value === 'function') return value(ctx);
    if (value && typeof value === 'object') return ctx.mobile ? value.mobile : value.desktop;
    return value;
  };
  const PROBLEM = { labels: ['How it works today', 'The problem'] };

  // Notes for the scenario itself — keyed by preset, or by Demo Flow step
  // where the step changes more than its preset (4: presentation, 5: V2).
  const SCENARIO_NOTES = {
    'current-state': [
      note('legacy-footer', '#legacyFooter', 'A standalone promo footer',
        'A fixed footer built as its own component, with its own styling and stacking order.',
        'Nothing coordinates it with other persistent UI, so every new need — chat, surveys, privacy — ships as one more floating layer.', PROBLEM),
      note('legacy-chat', '#legacyChatFab', 'A separate chat bubble',
        "The chat vendor's widget is pinned in the corner on its own, unaware the footer exists.",
        {
          desktop: 'The two compete for attention and collide on small screens; neither can make room for the other.',
          mobile: 'On a phone they crowd the thumb zone at the bottom of the screen and cover page content; neither can make room for the other.',
        }, PROBLEM),
    ],
    'tesla-inspired': [
      note('tesla-surface', SURFACE, 'One coordinated surface',
        {
          desktop: 'The test-drive CTA and a chat entry point live in a single floating panel that sizes itself to its content.',
          mobile: "The test-drive CTA and a chat button share one bar that fits the phone's width, instead of a footer plus a separate bubble.",
        },
        "One persistent element instead of two — chat becomes part of the brand's surface, not a vendor bubble on top of it."),
      note('tesla-chat', '.chat-input-field',
        (c) => (c.chatCollapsed ? 'One tap to chat' : 'Chat entry point, not a chat window'),
        (c) => (c.chatCollapsed
          ? "On phones the inline field becomes a single chat button that opens the chat window straight away — there's no room to type in the bar."
          : 'Typing here hands off to a conventional corner chat window. On phones it collapses to a single chat button.'),
        (c) => (c.chatCollapsed
          ? 'One tap gets a proper chat window, instead of a tiny field squeezed in beside the CTA.'
          : 'Visitors can start a question without hunting for a bubble, and the conversation still gets a full-size window.'),
        { kind: 'chat' }),
    ],
    'hvb-chat': [
      note('hvb', SURFACE, 'Commerce action + help, one row',
        (c) => (c.chatCollapsed
          ? '"Search Inventory" is the primary action, with an icon-only chat button beside it (the label drops on phones) that opens the chat window.'
          : '"Search Inventory" is the primary action, with an "Ask Us" chat trigger beside it that opens the corner chat window.'),
        'Pairs the highest-intent action with a way to get help — the pattern most shopping pages need — without two separate widgets.'),
    ],
    'brand-story': [
      note('brand', SURFACE, 'Editorial content, lighter touch',
        {
          desktop: 'Same component, editorial composition: a small logo bug, a headline with one supporting line, and a text link instead of a button. No utilities.',
          mobile: 'Same component, editorial composition: a small logo bug, a headline, and a text link instead of a button. On phones the supporting line steps aside so the headline can breathe.',
        },
        "Brand storytelling (F1, concept cars) doesn't need a hard-sell button. The component adapts its tone per placement instead of forcing one style."),
    ],
    'search-utility': [
      note('search-inline', SURFACE, 'Search as the whole surface',
        'The primary zone becomes a search field that stretches across the bar; results open in the panel above it.',
        'On inventory-heavy pages, search is the most useful persistent action — and it needs no extra widget.', { kind: 'search' }),
    ],
    'message-cta': [
      note('message-cta', SURFACE, 'The simplest composition',
        'A short message and one CTA, centered together as a single cluster.',
        "It replaces today's footer one-for-one, so V1 can ship without new content types or approvals."),
    ],
    'section-navigator': [
      // Live: names the section currently highlighted.
      note('section-nav', '.primary-nav', 'Jump anywhere on the page',
        (c) => {
          const linked = NAV_SECTIONS.find((sec) => sec.id === state.activeSection);
          const now = linked ? `Right now: ${linked.label} is highlighted.` : `Right now: ${sectionLabel(state.activeSection)}, outside the linked sections.`;
          return `${now} ${c.mobile ? 'Tap' : 'Click'} a section to jump straight to it; the highlight follows as you scroll`
            + (c.mobile ? ', and the strip slides sideways to keep it in view.' : '.');
        },
        'Long model pages get wayfinding that follows the visitor — without a second sticky nav bar competing for the same edge of the screen.'),
    ],
    'mobile-compact': [
      note('mobile', SURFACE, 'Composition changes by breakpoint',
        {
          desktop: 'Shorter copy ("Test Drive") and an icon-only chat button in a compact pill. Narrow the window, or use Presenter Tools → iPhone preview, to see it at phone size.',
          mobile: 'Shorter copy ("Test Drive") and an icon-only chat button in a compact pill — the arrangement designed for a screen this size.',
        },
        'On phones the component switches to a reduced arrangement instead of shrinking the desktop one until it truncates.'),
    ],
    'chat-search': [
      note('cs-chat', '.chat-input-field', 'Chat is blue',
        (c) => (c.chatCollapsed
          ? 'Tap the chat button and the whole surface tints blue while the chat window — in the same blue — is open.'
          : 'Focus the field and the whole surface tints blue; the prompts panel and corner chat window use the same color.'),
        'Visitors — and anyone reading analytics — can tell which utility is active at a glance.', { kind: 'chat' }),
      note('cs-search', '.search-trigger, .search-field', 'Search is teal',
        {
          desktop: 'Opening search tints the surface teal and shows results in the panel above. Esc or clicking away closes it.',
          mobile: 'Tapping search tints the surface teal and shows results in the panel above; tap anywhere outside to close them.',
        },
        'Two utilities share one surface without looking alike or fighting over position.', { kind: 'search' }),
    ],
    'survey-integration': [
      note('survey-scenario', SURFACE, 'The survey lives in the surface',
        "Instead of the survey vendor's own popup, the prompt renders inside this component and hands the space back when it's done.",
        'One persistent layer for everything, so a survey never covers the footer or the chat.', { kind: 'survey' }),
    ],
    'quote-prompt': [
      note('quote-scenario', SURFACE, 'Returning-visitor quote prompt',
        {
          desktop: 'Triggered when someone who clicked a CTA, used chat or search, or reached Shopping comes back to the tab.',
          mobile: 'Triggered when someone who tapped a CTA, used chat or search, or reached Shopping comes back to the page after switching apps or tabs.',
        },
        'It targets intent the visitor already showed, instead of asking everyone for their details.', { kind: 'quote' }),
    ],
    'survey-quote-handoff': [
      note('handoff', SURFACE, 'Two prompts, one surface',
        'The Survey arrives after the Prompt delay; a returning-visitor Quote is scheduled a few seconds later.',
        'Watch the component decide between them — the visitor never sees two popups stacked on top of each other.'),
    ],
    'stress-test': [
      note('stress', SURFACE, 'Everything at once',
        'Section nav, chat, search, the privacy notice, a survey, and a quote prompt are all requested together.',
        'One priority model resolves it (see the Active layer readout) instead of every team shipping its own z-index.'),
    ],
    'kitchen-sink': [
      note('kitchen', SURFACE, 'The busy edge case',
        {
          desktop: 'Nav, chat, and search all at once. Floating and compact widen first; with Auto-collapse on, nav gives way before the utilities do.',
          mobile: "Nav, chat, and search all at once on a phone-width bar. There's no room left to widen, so with Auto-collapse on, nav reduces to the active section before the utilities shrink.",
        },
        'A measured, priority-ordered fallback instead of content silently overflowing or overlapping.'),
    ],
    'flow-4': [
      note('presentation', SURFACE, 'Same content, different shell',
        {
          desktop: 'Full-width bar, floating panel, or compact pill; opaque, glass, or bordered; fading, sliding, or rising in, all from one component. Flip through them with the "Try a look" switcher, top right.',
          mobile: 'Full-width bar, floating panel, or compact pill; opaque, glass, or bordered; fading, sliding, or rising in, all from one component. Flip through them with the "Try a look" switcher at the top. On a phone, floating and compact shrink to fit the screen, so the shapes differ less.',
        },
        'Page and brand teams choose a presentation per placement without a new build.'),
      note('trigger', SURFACE, 'Shown when it has something to add',
        {
          desktop: 'Appears sets when the bar shows up: on load, after 10% or 25% of the page, once the hero scrolls away, or when a chosen section arrives. Pick one and the page returns to the top, so you can scroll down and watch it enter.',
          mobile: 'Appears sets when the bar shows up: on load, after 10% or 25% of the page, once the hero scrolls away, or when a chosen section arrives. Pick one and the page returns to the top, so you can scroll down and watch it enter.',
        },
        'The hero gets the screen to itself on arrival, and the offer shows up once the visitor is actually reading.'),
    ],
    'flow-5': [
      note('rotation', SURFACE, 'Several messages, one slot',
        {
          desktop: 'Messages rotate through the same space on a timer. Each one rolls into place while the panel\'s edge glides to its new length, so nothing jumps. Rotation pauses while the visitor hovers over or focuses the bar.',
          mobile: 'Messages rotate through the same space on a timer. Each one rolls into place while the panel\'s edge glides to its new length, so nothing jumps. Rotation pauses while the visitor is interacting with the bar.',
        },
        'Marketing can run several messages without adding a single element to the page.'),
    ],
    'scroll-spy': [
      // Live: the wording tracks the section currently in view.
      note('scroll-spy', SURFACE, 'A next best action for every section',
        (c) => {
          const a = contextualAction(state.activeSection);
          const does = a.kind === 'more'
            ? `${c.mobile ? 'tap' : 'click'} the + to open more on this topic right here; the button becomes the close`
            : 'it goes straight to the next step';
          return `Right now: ${sectionLabel(state.activeSection)} → “${a.label}” (${does}). `
            + `${c.mobile ? 'Scroll' : 'Scroll the page'} and the button morphs into the next best action for each section.`;
        },
        'This generalizes the coming Floating Show More Button: sections with more to say open it in place (Interior, Technology, Performance), and the rest carry a single relevant action (Gallery, Shopping). It lives in the shared surface, so it never competes with chat or prompts.'),
    ],
    'personalized-offer': [
      note('offer-docked', '.primary-prompt--offer', 'A pop-up that moves into the bar',
        {
          desktop: 'The offer opened like a standard pop-up, then flew down into the surface after a few seconds, or as soon as it was closed. It keeps its image and actions here: click the thumbnail to see it full size again, or Claim for the code, which can go straight into a quote.',
          mobile: 'The offer opened like a standard pop-up, then flew down into the bar after a few seconds, or as soon as it was closed. It keeps its image and actions here: tap the thumbnail to see it full size again, or Claim for the code, which can go straight into a quote.',
        },
        "Personalized content gets a big moment without blocking the page for long, and closing the pop-up doesn't lose the offer. It's still primary content, so a survey or quote can take over and hand the space back to it.", { kind: 'offer' }),
    ],
    'timed-notice': [
      note('notice-scenario', SURFACE, 'Ancillary messages that step aside',
        'Partner and service messages (here, a satellite-radio free weekend) use the same surface at the lowest optional priority. If a survey or quote needs the space, the notice is dropped rather than queued.',
        "Secondary messages still get seen, without competing with the site's priorities or piling up for later.", { kind: 'notice' }),
    ],
  };

  function promptName(kind) { return { quote: 'Quote prompt', survey: 'Survey', notice: 'Timed notice', offer: 'Private offer' }[kind]; }

  // Notes about what is happening right now, regardless of scenario.
  // These come first — they explain the thing the audience is looking at.
  function situationalNotes() {
    const out = [];
    if (!$chaosOverlay.hidden) {
      out.push(note('chaos', '.chaos-survey', 'Four widgets, no shared layer',
        'A promo footer, chat bubble, survey card, and cookie banner — each from a different team or vendor, each fixed-positioned with its own z-index.',
        {
          desktop: 'Nothing arbitrates, so they bury each other. This is exactly what the shared persistent layer prevents.',
          mobile: 'Nothing arbitrates, so on a phone they bury each other and most of the screen. This is exactly what the shared persistent layer prevents.',
        }, PROBLEM));
      return out;
    }
    // Desktop only: on a phone there's no room beside the list, and a note
    // over it would cover the very buttons it describes (the section's own
    // heading and intro already explain it).
    if (recentInView && recentMessages.length && document.documentElement.clientWidth > 720) {
      out.push(note('recent', '#recentList', 'Closed, not gone',
        'Anything the visitor dismissed, or that timed out or was replaced, lands here at the end of the page, newest first, with its action still attached. Bringing the survey or quote back reopens it in the surface, straight to its form.',
        'Someone who closed a message by mistake, or only later wants it, has an obvious place to find it, without needing to know how to summon it again.', { prefer: 'side' }));
    }
    if (state.privacyActive) {
      out.push(note('privacy', '#privacyBar p', 'Required UI always wins',
        'The privacy notice takes the bottom edge and the sticky surface lifts above it. Prompts that come due wait until it is answered.',
        'Compliance UI is never covered, and never competes with marketing for the same spot.', { kind: 'privacy' }));
    }
    const held = state.pendingQuote ? 'quote' : state.pendingSurvey ? 'survey' : state.pendingNotice ? 'notice' : null;
    const blocker = state.privacyActive ? 'the privacy notice'
      : state.moreOpen ? 'an open "show more" panel'
        : (state.chatWindowOpen || state.activeInteraction) ? 'an active chat or search'
        : held === 'notice' && (state.quoteActive || state.surveyActive) ? 'a higher-priority prompt' : null;
    if (held && blocker) {
      out.push(note(`held-${held}`, SURFACE, `${promptName(held)} is waiting its turn`,
        `It came due, but ${blocker} has priority. It will follow about a second after that clears.`,
        'Prompts never stack on top of required UI or interrupt someone mid-conversation.', { kind: held }));
    }
    if (state.chatWindowOpen) {
      out.push(note('chat-window', '#chatWindow', 'Hand-off to a real chat window',
        {
          desktop: 'The bar only holds the entry point; the conversation continues in a corner window that sits just above the bar. Esc closes it and returns focus.',
          mobile: 'The bar only holds the entry point; on a phone the conversation opens as a full-width chat panel just above the bar. Its × closes it.',
        },
        "A full conversation doesn't get crammed into the footer, and the entry point stays visible.", { kind: 'chat' }));
    }
    if (startDockWaiting()) {
      out.push(note('start-dock', '#hero .hero__ctas', 'A deliberate beginning',
        "In the first view, the masthead's own two buttons are the only calls to action and the bar waits. Once the masthead is 60% out of view, the two merge into one that moves down into the bar as the floating button. Scroll back up and it splits back into them.",
        "The first impression belongs to the page, with no floating button competing with the masthead's, and the bar's arrival reads as the same actions following the visitor down the page."));
    }
    if (endDock && endDock.phase === 'docked' && endDock.row) {
      out.push(note('end-dock', `#${endDock.row.closest('section[id]').id} .hero__ctas`, 'A deliberate end',
        {
          desktop: "Here the floating button's action is also this section's main button, so the pinned experience ends: the button flew up into its in-page twin, split into the section's two buttons, and the bar stepped away. Scroll back up and they merge back into the bar.",
          mobile: "Here the floating button's action is also this section's main button, so the pinned experience ends: the button flew up into its in-page twin, split into the section's two buttons, and the bar stepped away. Scroll back up and they merge back into the bar.",
        },
        'No duplicate buttons competing at the bottom of the page, and a clear signal that the visitor has reached the end of the story: the page\'s own call to action takes over.'));
    }
    if (offerVisible() && document.documentElement.clientWidth > 720) {
      out.push(note('offer-pop', '.offer-pop__card', 'Personalized, then out of the way',
        'Content from the personalization engine (here, a $500 private offer for a returning visitor) opens as a standard pop-up. The line under it counts down, and hovering or focusing pauses it. Then it moves down into the bar instead of disappearing; closing it early does the same.',
        "A pop-up's impact without its usual cost: it never traps the visitor, and dismissing it doesn't throw the offer away.", { kind: 'offer', prefer: 'side' }));
    }
    const hintField = chatHintField();
    if (hintField && hintField.field.dataset.hints === 'on') {
      out.push(note('chat-hints', '.chat-input-field', 'Questions that match the page',
        (c) => `Right now: ${sectionLabel(state.activeSection)}, so the empty chat field suggests questions like “${chatHintsFor(state.activeSection)[0]}”. `
          + `${c.mobile ? 'Scroll' : 'Scroll the page'} and the examples change with the section; they rotate every few seconds, stop as soon as you ${c.mobile ? 'tap' : 'click'} into the field, and ${c.mobile ? 'tapping' : 'clicking'} send asks the one on show.`,
        'A blank "Ask a question…" makes the visitor think of something; a relevant example lowers the effort and shows the chat knows what they are looking at.', { kind: 'chat' }));
    }
    if (state.flyout === 'quote' && !state.quoteSubmitted) {
      out.push(note('quote-form', '.quote-flow', 'The full form, in four short steps',
        {
          desktop: 'Vehicle (pre-filled), contact details, nearest dealer from the ZIP, then review. Optional fields are tucked behind one toggle. While it\'s open, the bar steps aside: its top row is just a header with a × that folds the form away, progress kept.',
          mobile: 'Vehicle (pre-filled), contact details, nearest dealer from the ZIP, then review — one short step per screen, with Back and Continue pinned at the bottom. The bar\'s top row is just a header with a × that folds it away; progress is kept.',
        },
        "The same data as the long production form, with far less on screen at once — and nothing the page already knows is asked twice.", { kind: 'quote' }));
    } else if (state.quoteActive && state.flyout !== 'quote') {
      out.push(state.pendingSurvey
        ? note('quote-over-survey', '.primary-prompt--quote', 'Quote outranks Survey',
          'The higher-value lead prompt animated over the survey. The survey is queued, not lost — dismiss the Quote and it comes back.',
          'When two prompts compete, the component decides, rather than showing the visitor both.', { kind: 'quote' })
        : note('quote-active', '.primary-prompt--quote', 'The quote prompt takes over',
          'It temporarily replaces the footer content with the boldest card the surface has: dark, with a price-tag badge, a starting price and a bright green button that glints a few times on arrival. It restores the original content when dismissed or sent.',
          'A lead-gen moment that uses the space already there, rather than a modal over the page.', { kind: 'quote' }));
    }
    if (state.noticeActive) {
      out.push(note('notice-active', '.primary-prompt--notice', 'Closes itself',
        (c) => `Shown for ${noticeMs() / 1000} seconds — the line along the top of the bar shrinks to show the time left — then it closes on its own. `
          + (c.mobile ? "The timer pauses while you're interacting with the bar or away from the page."
            : 'Hovering or focusing the bar pauses it, and so does switching tabs.'),
        'A low-stakes message gets its moment without anyone having to dismiss it, and never lingers.', { kind: 'notice' }));
    }
    if (state.flyout === 'survey' && !state.surveySubmitted) {
      out.push(note('survey-form', '.survey-flow', 'Twelve questions, four short steps',
        {
          desktop: 'A typical automaker site survey asks 12 questions on 14 screens. Here related questions share a step, the "what got in the way?" follow-up only appears when it applies, the visit\'s purpose is pre-filled from what the visitor did, and nothing is required: Send now works on every step. Closing the panel keeps the answers.',
          mobile: 'A typical automaker site survey asks 12 questions on 14 screens. Here related questions share a step, the follow-up only appears when it applies, the visit\'s purpose is pre-filled, and nothing is required: Send now works on every step. Closing keeps the answers.',
        },
        'Fewer screens and no dead ends mean more people finish, and a partial answer still arrives instead of being abandoned. It all happens in the surface, not a vendor pop-up.', { kind: 'survey' }));
    } else if (state.surveyActive) {
      out.push(note('survey-active', '.primary-prompt--survey', 'The survey takes over',
        'The survey briefly replaces the footer content (violet dot, violet button), then hands the space back.',
        'No separate survey popup competing with the footer — one layer, one thing at a time.', { kind: 'survey' }));
    }
    const coming = Object.keys(scheduled);
    if (coming.length && !state.surveyActive && !state.quoteActive && !state.noticeActive && !held) {
      const kind = ['survey', 'quote', 'notice', 'offer'].find((k) => coming.includes(k));
      out.push(note(`scheduled-${kind}`, SURFACE, `${promptName(kind)} on its way`,
        "It's scheduled rather than shown: it arrives after the Prompt delay (the Prototype Controls panel counts down), and waits its turn if something more important is showing.",
        'A prompt that waits a moment feels less like an ambush than one that fires on page load.', { kind }));
    }
    return out;
  }

  function currentNotesScenario() {
    // Steps 4 (presentation) and 5 (rotation) change settings beyond their preset.
    return activeFlowStep === 4 || activeFlowStep === 5 ? `flow-${activeFlowStep}` : state.activePreset;
  }

  function anchorFor(n) {
    const el = document.querySelector(n.anchor);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return r.width || r.height ? el : null;
  }

  function dismissNotes(ids, how) {
    ids.forEach((id) => dismissedNotes.add(id));
    log('demo_note_dismissed', `${ids.join(', ')} (${how})`);
    renderedNotesKey = null;
    renderDemoNotes();
  }

  function visibleNoteIds() {
    return [...$demoNotes.children].map((el) => el.dataset.id);
  }

  function renderDemoNotes() {
    if (!demoNotesReady) return;
    const scenario = currentNotesScenario();
    if (scenario !== notesScenario) { notesScenario = scenario; dismissedNotes.clear(); }

    let eligible = [];
    const hideForOverlay = $frameOverlay && !$frameOverlay.hidden;
    // Notes stay out of the way while a "show more" modal is being read.
    // …and on phones while the offer pop-up is up (a note would cover it).
    const offerCovers = offerVisible() && document.documentElement.clientWidth <= 720;
    if ($demoNotesToggle.checked && !embedded && !hideForOverlay && !state.moreOpen && !offerCovers) {
      const seen = new Set();
      eligible = [...situationalNotes(), ...(SCENARIO_NOTES[scenario] || [])]
        .filter((n) => !seen.has(n.id) && seen.add(n.id) && !dismissedNotes.has(n.id) && anchorFor(n));
    }
    const notes = eligible.slice(0, maxNotes());

    const ctx = noteContext();
    const resolved = notes.map((n) => ({ ...n, title: pick(n.title, ctx), how: pick(n.how, ctx), why: pick(n.why, ctx) }));
    // Includes the form factor and total, so wording and the "1 of 3"
    // counter refresh when either changes, not only when the notes do.
    const key = `${ctx.mobile}|${ctx.chatCollapsed}|${eligible.length}|${notes.map((n) => n.id).join('|')}`;
    if (key === renderedNotesKey) {
      // Same notes, but live copy (e.g. the section in view) may have moved
      // on — update the text in place rather than re-animating the note.
      resolved.forEach((n, i) => {
        const el = $demoNotes.children[i];
        if (!el) return;
        el.querySelector('.demo-note__title').textContent = n.title;
        const texts = el.querySelectorAll('.demo-note__text');
        if (texts[0].textContent !== n.how) texts[0].textContent = n.how;
        if (texts[1].textContent !== n.why) texts[1].textContent = n.why;
      });
      return;
    }
    renderedNotesKey = key;

    $demoNotes.innerHTML = '';
    resolved.forEach((n, i) => {
      const [howLabel, whyLabel] = n.labels || ['How it works', 'Why it matters'];
      const { title } = n;
      $demoNotes.append(h('div', {
        class: 'demo-note', role: 'note', 'aria-label': `Demo note: ${title}`,
        'data-id': n.id, 'data-anchor': n.anchor, 'data-kind': n.kind || 'neutral', 'data-prefer': n.prefer || null,
      },
      h('div', { class: 'demo-note__head' },
        h('span', { class: 'demo-note__kicker', text: eligible.length > 1 ? `Demo note · ${i + 1} of ${eligible.length}` : 'Demo note' }),
        h('button', {
          type: 'button', class: 'demo-note__hide-all', text: 'Hide all',
          'aria-label': 'Hide all demo notes (turn them back on under Demo Flow)',
          onclick: () => {
            $demoNotesToggle.checked = false;
            $demoNotesToggle.dispatchEvent(new Event('change'));
          },
        }),
        h('button', {
          type: 'button', class: 'demo-note__close', text: '×',
          'aria-label': eligible.length > notes.length ? `Hide this note and show the next: ${title}` : `Hide note: ${title}`,
          onclick: () => dismissNotes([n.id], 'close'),
        })),
      h('p', { class: 'demo-note__title', text: title }),
      h('p', { class: 'demo-note__row' }, h('span', { class: 'demo-note__label', text: howLabel }), h('span', { class: 'demo-note__text', text: n.how })),
      h('p', { class: 'demo-note__row' }, h('span', { class: 'demo-note__label', text: whyLabel }), h('span', { class: 'demo-note__text', text: n.why })),
      h('span', { class: 'demo-note__caret', 'aria-hidden': 'true' })));
    });
    if (notes.length && !notesRaf) notesRaf = requestAnimationFrame(positionDemoNotes);
  }

  const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

  // Runs every frame while notes are showing, so they stay attached through
  // the surface's own animations (entrance, takeovers, expansion, steps).
  function positionDemoNotes() {
    const els = [...$demoNotes.children];
    if (!els.length) { notesRaf = null; return; }
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const gap = 14;
    const panelOpen = !$panel.hidden && vw > 720;
    const minLeft = panelOpen ? $panel.getBoundingClientRect().right + 12 : 12;

    // Things a note must not cover: the sticky surface, the privacy notice,
    // and the chat window — unless the note is about that very thing.
    const obstacleEls = [$surface, $privacyBar, $chatWindow, $panelToggle, $look, $scrollCue].filter((el) => !el.hidden);
    const placed = [];

    els.forEach((el) => {
      const target = document.querySelector(el.dataset.anchor);
      const r = target && target.getBoundingClientRect();
      if (!r || (!r.width && !r.height)) { el.style.visibility = 'hidden'; return; }
      el.style.visibility = '';
      const w = el.offsetWidth;
      const hgt = el.offsetHeight;
      const box = (left, top) => ({ left, top, right: left + w, bottom: top + hgt });
      // The sticky surface is always an obstacle — even for notes about
      // something inside it, which are placed above it rather than on it.
      const obstacles = obstacleEls
        .filter((o) => (o === $surface || !o.contains(target)) && o.getBoundingClientRect().height)
        .map((o) => o.getBoundingClientRect())
        .concat(placed);
      const clampLeft = (x) => Math.min(Math.max(x, minLeft), vw - w - 8);
      const free = (b) => b.top >= 8 && b.bottom <= vh - 8 && b.left >= minLeft - 0.5 && b.right <= vw - 7.5
        && !obstacles.some((o) => overlaps(b, o));
      // A note slid sideways must still sit over its anchor, so its caret can point at it.
      const overAnchor = (b) => b.left < r.right - 24 && b.right > r.left + 24;

      // Anything inside the sticky surface is referenced from the surface's
      // top edge, so the note never overlaps the bar it's describing.
      const inSurface = $surface.contains(target);
      const refTop = inSurface ? Math.min(r.top, $surface.getBoundingClientRect().top) : r.top;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;

      const aboveTop = refTop - hgt - gap;
      const candidates = [
        ['top', box(clampLeft(cx - w / 2), aboveTop)],
        // Beside an earlier note, at the same height, if still over the anchor.
        ...placed.flatMap((pl) => [
          ['top', box(pl.right + 12, aboveTop)],
          ['top', box(pl.left - w - 12, aboveTop)],
        ]).filter(([, c]) => overAnchor(c)),
        ...(inSurface ? [] : [
          ['left', box(r.left - w - gap, cy - hgt / 2)],
          ['right', box(r.right + gap, cy - hgt / 2)],
          // Last resort before detaching: under the anchor (on phones there
          // is rarely room beside it, and above may be taken by the pill).
          ['bottom', box(clampLeft(cx - w / 2), r.bottom + gap)],
        ]),
      ];
      // A note can prefer the side of its anchor (e.g. beside a list, rather
      // than over the heading above it).
      if (el.dataset.prefer === 'side') candidates.sort(([a], [c]) => (a === 'left' || a === 'right' ? 0 : 1) - (c === 'left' || c === 'right' ? 0 : 1));
      let [placement, b] = candidates.find(([, c]) => free(c)) || [];
      if (!b) {
        // Lift above whatever is in the way. The note is no longer next to
        // its anchor, so it drops the caret rather than point at the wrong thing.
        placement = 'detached';
        b = candidates[0][1];
        for (let i = 0; i < 6; i++) {
          const hit = obstacles.find((o) => overlaps(b, o));
          if (!hit) break;
          b = box(b.left, hit.top - hgt - gap);
        }
        b = box(b.left, Math.max(8, Math.min(b.top, vh - hgt - 8)));
        // Still on top of the bar (a tall survey or form on a phone leaves
        // no room above it): skip the note rather than cover the bar's own
        // controls, such as its ×. It comes back once there's room.
        if (overlaps(b, $surface.getBoundingClientRect())) { el.style.visibility = 'hidden'; return; }
      }

      el.style.left = `${Math.round(b.left)}px`;
      el.style.top = `${Math.round(b.top)}px`;
      el.dataset.placement = placement;
      // Point the caret at the nearest part of the anchor.
      if (placement === 'top' || placement === 'bottom') {
        const x = Math.min(Math.max(b.left + w / 2, r.left + 12), r.right - 12);
        el.style.setProperty('--caret', `${Math.min(Math.max(x - b.left, 18), w - 18)}px`);
      } else {
        const y = Math.min(Math.max(b.top + hgt / 2, r.top + 10), r.bottom - 10);
        el.style.setProperty('--caret', `${Math.min(Math.max(y - b.top, 18), hgt - 18)}px`);
      }
      placed.push(b);
    });
    notesRaf = requestAnimationFrame(positionDemoNotes);
  }

  // Crossing the phone breakpoint changes both how many notes fit and their wording.
  window.addEventListener('resize', () => { renderedNotesKey = null; renderDemoNotes(); });

  $demoNotesToggle.addEventListener('change', () => {
    dismissedNotes.clear();
    log('demo_notes', $demoNotesToggle.checked ? 'shown' : 'hidden');
    renderDemoNotes();
  });
  if (embedded) $demoNotes.remove();
  demoNotesReady = true;

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
