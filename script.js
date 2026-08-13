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

  const INVENTORY = [
    '2026 Aurelia GT — Slate Grey, RWD',
    '2026 Aurelia GT — Performance, AWD',
    '2026 Aurelia GT — Alpine White, AWD',
    '2025 Aurelia GT — Certified Pre-Owned',
    'V-ONE Concept — Not yet available',
  ];

  const PRESETS = [
    {
      id: 'current-state',
      label: 'Current State',
      hint: 'Basic footer + separate chat bubble',
      version: 'today',
      patch: { legacyMode: true, presentation: 'full-width', chat: 'off', search: 'off', scrollSpy: 'off' },
    },
    {
      id: 'tesla-inspired',
      label: 'Tesla-Inspired',
      hint: 'Schedule a Test Drive | Ask a Question',
      version: 'v1',
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
      patch: {
        legacyMode: false, scrollSpy: 'off', ctaStyle: 'text-link',
        primaryType: 'message-cta', primary: { message: 'Formula 1', cta: { label: 'Explore the Team' } },
        chat: 'off', search: 'off',
      },
    },
    {
      id: 'concept-vehicle',
      label: 'Concept Vehicle',
      hint: 'Meet the V-ONE Concept | Explore',
      version: 'v1',
      patch: {
        legacyMode: false, scrollSpy: 'off', ctaStyle: 'text-link',
        primaryType: 'message-cta', primary: { message: 'Meet the V-ONE Concept', cta: { label: 'Explore' } },
        chat: 'off', search: 'off',
      },
    },
    {
      id: 'search-utility',
      label: 'Search Utility',
      hint: 'Search [input field]',
      version: 'v1',
      patch: { legacyMode: false, scrollSpy: 'off', primaryType: 'search-inline', chat: 'off', search: 'off' },
    },
    {
      id: 'message-cta',
      label: 'Message + CTA',
      hint: 'Discover the latest | Explore',
      version: 'v1',
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
      patch: { legacyMode: false, scrollSpy: 'navigation', chat: 'off', search: 'off' },
    },
    {
      id: 'survey-integration',
      label: 'Survey Integration',
      hint: 'Help us improve our site | Take Survey | ×',
      version: 'v2',
      patch: {
        legacyMode: false, scrollSpy: 'off',
        primaryType: 'message-cta', primary: { message: 'Discover the latest', cta: { label: 'Explore' } },
        chat: 'off', search: 'off',
      },
      after() { triggerSurvey(); },
    },
    {
      id: 'mobile-compact',
      label: 'Mobile Compact',
      hint: 'Test Drive | Chat — reduced arrangement',
      version: 'v1',
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
      patch: {
        legacyMode: false, scrollSpy: 'navigation',
        primaryType: 'message-cta', primary: { message: '', cta: { label: 'Schedule a Test Drive' } },
        chat: 'question', search: 'icon',
      },
      after() {
        triggerPrivacy();
        triggerSurvey();
      },
    },
    {
      id: 'kitchen-sink',
      label: 'Kitchen Sink (Overload)',
      hint: 'Nav + Chat + Search all at once — the busy edge case',
      version: 'edge-case',
      patch: {
        legacyMode: false, presentation: 'full-width', scrollSpy: 'navigation',
        chat: 'suggested', search: 'compact',
      },
      note: 'Everything is asking for room at once. Try "Busy / Overflow Edge Cases" → Auto-collapse to compare raw overflow against priority-ordered collapsing.',
    },
  ];

  /* ------------------------------------------------------------------ *
   * State
   * ------------------------------------------------------------------ */

  const state = {
    legacyMode: true,
    presentation: 'full-width',
    surface: 'opaque',
    visibility: 'scroll25',
    sectionReachTarget: 'design',
    entrance: 'fade',
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

    activePreset: 'current-state',
    scrollVisible: false,
    minimized: false,
    dismissed: false,
    fullyDismissed: false,
    everShown: false,

    activeInteraction: null, // 'chat' | 'search' | null
    flyout: null, // 'chat' | 'search' | null

    privacyActive: false,
    surveyActive: false,
    pendingSurvey: false,
    priorComposition: null,

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

  /* ------------------------------------------------------------------ *
   * Event log
   * ------------------------------------------------------------------ */

  function log(type, detail) {
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
    if (state.activeInteraction === 'chat') return 'Active interaction — Chat';
    if (state.activeInteraction === 'search') return 'Active interaction — Search';
    if (state.flyout === 'chat') return 'Requested utility — Chat prompts open';
    if (state.flyout === 'search' || state.flyout === 'nav-overflow') return 'Requested utility — open';
    if (state.surveyActive) return 'Survey / optional engagement';
    if (state.scrollSpy === 'contextual') return `Contextual content — ${sectionLabel(state.activeSection)}`;
    if (state.scrollSpy === 'navigation') return 'Contextual content — section navigation';
    if (state.scrollSpy === 'orientation') return 'Contextual content — orientation';
    if (state.pendingSurvey) return 'Primary content (survey waiting)';
    return 'Primary persistent content';
  }

  function renderActiveLayer() {
    if (!$activeLayerReadout) return;
    $activeLayerReadout.innerHTML = `Active layer: <strong>${computeActiveLayerLabel()}</strong>`;
  }

  /* ------------------------------------------------------------------ *
   * Sticky offset (adjusts when required UI like the privacy bar is shown)
   * ------------------------------------------------------------------ */

  function updateStickyOffset() {
    const offset = state.privacyActive ? $privacyBar.offsetHeight : 0;
    document.documentElement.style.setProperty('--sticky-offset-bottom', offset + 'px');
  }

  /* ------------------------------------------------------------------ *
   * Rendering: the sticky bar shell (presentation, visibility, surface)
   * ------------------------------------------------------------------ */

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
      $sticky.classList.remove('enter-fade', 'enter-slide');
      if (!prefersReducedMotion && state.entrance !== 'none') {
        void $sticky.offsetWidth;
        $sticky.classList.add(state.entrance === 'slide' ? 'enter-slide' : 'enter-fade');
      }
      log('sticky_shown', state.activePreset);
      state.everShown = true;
    }

    $sticky.dataset.minimized = String(collapsed);
    $sticky.dataset.presentation = state.presentation;
    $sticky.dataset.surface = state.surface;
    $sticky.dataset.survey = String(state.surveyActive);

    $legacyFooter.hidden = !state.legacyMode;
    $legacyChatFab.hidden = !state.legacyMode;
  }

  function applyControlsVisibility() {
    const showMinimize = state.dismissMode === 'minimizable';
    const showDismiss = state.dismissMode === 'dismissible-restore' || state.dismissMode === 'fully-dismissible';
    $minimizeBtn.hidden = !showMinimize;
    $dismissBtn.hidden = !showDismiss;
    $restoreBtn.hidden = !(state.minimized || (state.dismissed && state.dismissMode === 'dismissible-restore'));
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
    $primary.classList.toggle('is-fluid', !state.surveyActive && state.scrollSpy === 'off' && state.primaryType === 'search-inline');

    if (state.surveyActive) return renderSurveyPrimary();
    if (state.scrollSpy === 'navigation') return renderNavPrimary();
    if (state.scrollSpy === 'orientation') return renderOrientationPrimary();
    if (state.primaryType === 'search-inline') return renderSearchInlinePrimary();
    return renderMessageCtaPrimary();
  }

  function renderSurveyPrimary() {
    const wrap = document.createElement('div');
    wrap.className = 'primary-survey';

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
    close.innerHTML = '&times;';
    close.addEventListener('click', () => dismissSurvey());
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
      maybeReleasePendingSurvey();
    });
    field.appendChild(input);

    const send = document.createElement('button');
    send.type = 'button';
    send.setAttribute('aria-label', 'Send message (mock)');
    send.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    send.addEventListener('click', () => log('cta_clicked', 'chat_send (mock)'));
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
      maybeReleasePendingSurvey();
    });
    field.appendChild(input);
    if (autofocus) requestAnimationFrame(() => input.focus());
    return field;
  }

  function renderSearchResults(query) {
    const q = query.trim().toLowerCase();
    const matches = q ? INVENTORY.filter((item) => item.toLowerCase().includes(q)) : INVENTORY.slice(0, 3);
    openFlyout('search');
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
  }

  function openFlyout(kind) {
    state.flyout = kind;
    $flyout.hidden = false;
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
    }
  }

  function closeFlyout() {
    state.flyout = null;
    $flyout.hidden = true;
    $flyout.innerHTML = '';
  }

  /* ------------------------------------------------------------------ *
   * Crowding / auto-collapse — the "busy edge case" mechanism.
   * When several things want the same real estate, collapse the lowest
   * priority content first (section navigation), then utilities, rather
   * than letting the bar silently overflow or wrap.
   * ------------------------------------------------------------------ */

  function evaluateCrowding() {
    requestAnimationFrame(() => {
      if (!state.autoCollapse) {
        const changed = state.navCollapsed || state.utilitiesCollapsed;
        state.navCollapsed = false;
        state.utilitiesCollapsed = false;
        if (changed) { renderPrimary(); renderUtilities(); }
        updateCrowdingBadge(false, 0);
        return;
      }

      // Two checks, because flexbox hides crowding at different levels:
      // section nav has its own overflow-x:auto so it silently absorbs
      // excess pills via internal scroll rather than pushing its parent
      // wider — that has to be measured on the nav element itself. Other
      // compositions (message + CTA + utilities) don't have that internal
      // escape hatch, so a real squeeze does show up as $stickyBar
      // overflowing its own box.
      const overflowing = () => {
        const nav = $primary.querySelector('.primary-nav');
        const navCrowded = nav ? nav.scrollWidth > nav.clientWidth + 1 : false;
        const barCrowded = $stickyBar.scrollWidth > $stickyBar.clientWidth + 1;
        return navCrowded || barCrowded;
      };

      if (overflowing() && !state.navCollapsed && state.scrollSpy === 'navigation') {
        state.navCollapsed = true;
        renderPrimary();
      }
      if (overflowing() && !state.utilitiesCollapsed) {
        state.utilitiesCollapsed = true;
        renderUtilities();
      }

      const collapsedCount = (state.navCollapsed ? 1 : 0) + (state.utilitiesCollapsed ? 1 : 0);
      updateCrowdingBadge(overflowing(), collapsedCount);
    });
  }

  function updateCrowdingBadge(isOverflowing, collapsedCount) {
    if (!$crowdingBadge) return;
    $crowdingBadge.classList.toggle('is-overflowing', isOverflowing);
    if (isOverflowing) {
      $crowdingBadge.textContent = collapsedCount > 0
        ? `Still tight after collapsing ${collapsedCount} item${collapsedCount > 1 ? 's' : ''} — consider trimming utilities.`
        : 'Overflowing — enable auto-collapse, or reduce nav/utilities.';
    } else if (collapsedCount > 0) {
      $crowdingBadge.textContent = `Fits — ${collapsedCount} lower-priority item${collapsedCount > 1 ? 's' : ''} collapsed to make room.`;
    } else {
      $crowdingBadge.textContent = 'Fits available space.';
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

  function triggerSurvey() {
    if (state.privacyActive) {
      state.pendingSurvey = true;
      log('survey_triggered', 'waiting — privacy notice active');
      return;
    }
    if (state.activeInteraction === 'chat') {
      state.pendingSurvey = true;
      log('survey_triggered', 'waiting — chat in use');
      return;
    }
    if (state.surveyActive) return;

    state.priorComposition = {
      primaryType: state.primaryType,
      primary: state.primary,
      scrollSpy: state.scrollSpy,
    };
    state.surveyActive = true;
    state.dismissed = false;
    state.minimized = false;
    state.scrollVisible = true;
    log('survey_triggered', 'shown in persistent layer');
    fullRender();
  }

  function dismissSurvey() {
    state.surveyActive = false;
    if (state.priorComposition) {
      state.primaryType = state.priorComposition.primaryType;
      state.primary = state.priorComposition.primary;
      state.scrollSpy = state.priorComposition.scrollSpy;
      state.priorComposition = null;
    }
    log('survey_dismissed');
    fullRender();
  }

  function maybeReleasePendingSurvey() {
    if (state.pendingSurvey && !state.privacyActive && state.activeInteraction !== 'chat') {
      state.pendingSurvey = false;
      triggerSurvey();
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
    maybeReleasePendingSurvey();
  }

  $privacyAccept.addEventListener('click', () => resolvePrivacy('accepted'));
  $privacyDecline.addEventListener('click', () => resolvePrivacy('declined'));

  document.getElementById('triggerPrivacy').addEventListener('click', triggerPrivacy);
  document.getElementById('triggerSurvey').addEventListener('click', triggerSurvey);
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
      if (!state.activeInteraction && state.scrollSpy !== 'off' && !state.surveyActive) {
        renderPrimary();
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

    Object.assign(state, {
      legacyMode: false,
      surveyActive: false,
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
    PRESETS.forEach((preset) => {
      const tag = VERSION_TAGS[preset.version];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'preset-btn';
      btn.dataset.preset = preset.id;
      btn.innerHTML = `<strong>${preset.label}${tag ? ` <span class="tag ${tag.cls}">${tag.label}</span>` : ''}</strong><span>${preset.hint}</span>`;
      btn.addEventListener('click', () => applyPreset(preset.id));
      $presetButtons.appendChild(btn);
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

  function runFlowStep(step) {
    log('demo_flow_step', String(step));
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
        setSelect('visibilitySelect', 'scroll25');
        state.visibility = 'scroll25';
        renderUtilities();
        applyVisibility();
        break;
      case 3:
        applyPreset('brand-story');
        openPanelSections([0]); // Content Presets
        openPanel();
        announce('Try the preset buttons to swap Search Inventory, F1, Concept, Chat, or Search.');
        break;
      case 4:
        setRadio('presentation', 'compact');
        state.presentation = 'compact';
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
        applyPreset('stress-test');
        openPanelSections([8, 9]); // Busy/Overflow Edge Cases, Orchestration Demos
        openPanel();
        break;
    }
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
    setSelect('visibilitySelect', state.visibility);
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
    ent: 'entrance', dm: 'dismissMode', mm: 'messageMode',
    ch: 'chat', se: 'search', dv: 'device', ss: 'scrollSpy',
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
