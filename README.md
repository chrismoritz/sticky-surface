# Sticky Surface — Aurelia GT Prototype

A standalone, CodePen-style front-end concept demo for evolving the OEM's
basic sticky footer into one reusable, reconfigurable **persistent surface**
component — the kind of shared space where a CTA, Chat, Search, and other
sitewide utilities can coexist instead of stacking up as competing
floating widgets.

The background page is a fictional luxury EV ("Aurelia GT" by "Solstice
Motors") used only to give the sticky component something real to sit on
top of and scroll against.

## How to run it

No build step, no dependencies. Any of these work:

1. **Just open it.** Double-click `index.html`, or drag it into a browser tab.
2. **Local static server** (recommended, avoids any `file://` quirks):
   ```
   cd sticky-surface
   python3 -m http.server 8080
   ```
   then visit `http://localhost:8080`.
3. **CodePen / JSFiddle / StackBlitz**: paste `index.html` into the HTML
   pane and `styles.css` / `script.js` into their respective panes (or
   drop all three into a StackBlitz "static" project).

Everything lives in three files:

- `index.html` — the fake product page + the one sticky component + the control panel markup
- `styles.css` — all visual states (presentation, surface, entrance, responsive breakpoints)
- `script.js` — state, rendering, scroll/orchestration logic, event log

## Demoing it live

Click **Prototype Controls** (top-right) to open the panel. The **Demo
Flow** buttons at the top walk through the pitch in order:

1. **Current State** — today's basic full-width footer + an unrelated
   floating chat bubble. This is the "problem" shot.
2. **V1 Enhancement** — swaps to the Tesla-inspired floating panel with
   "Schedule a Test Drive" and an inline "Ask a Question" chat field living
   in one coordinated surface.
3. **Flexibility** — jump into the preset list and click through Search
   Inventory, Brand Story (F1), Concept Vehicle, and the various Chat/Search
   entry points. Same component, new content every time.
4. **Presentation** — toggle Full-width / Floating / Compact and the three
   surface finishes (opaque, translucent/blur, bordered) to show the same
   component adapting its shell.
5. **The Future (V2)** — turns on message rotation and contextual Scroll
   Spy, so the CTA changes as the visitor scrolls through Design, Interior,
   Technology, Performance.
6. **Orchestration** — fires Privacy, Survey, and a busy composition at
   once. Watch the event log: privacy wins, the survey visibly waits for it
   ("survey_triggered — waiting"), and nothing overlaps.

The **Event Log** at the bottom of the panel is a live feed of everything
the component would emit for analytics in a real build.

The control panel itself is intentionally styled like a dev tool (dark,
monospace, labeled "PROTOTYPE TOOL — NOT PART OF THE SITE") so it's never
mistaken for customer-facing UI.

## Presenter tools (panel → "Presenter Tools")

These exist to make the demo itself easier to run — they aren't part of the
proposed component, which is why they're tagged "Prototype tool" rather
than V1/V2/V3:

- **Custom content override** — type alternate message/CTA copy and click
  Apply to preview it live, without leaving the demo, for "what if it said
  X instead" questions. "Reset to preset" clears it.
- **Copy Link** — encodes the current preset + presentation + behavior
  choices into the URL so a specific configuration can be bookmarked or
  sent to a client instead of re-clicking through the panel each time.
- **Device frame preview** — opens a real, independently-rendered instance
  of this same page at an iPhone / Android / Desktop viewport size, stripped
  of the dev panel so it reads as a clean customer view. It mirrors whatever
  configuration is currently active in the main window.

## Text links vs. buttons, and the "Active layer" readout

The **Presentation** section has a **Primary CTA style** toggle (Button /
Text link). Editorial, brand-forward compositions — Brand Story and Concept
Vehicle — default to the text-link treatment ("Formula 1 — Explore the Team
→") since a pill button reads as harder-sell than that content warrants;
commerce-forward presets (Tesla-Inspired, HVB + Chat) keep the button. The
toggle applies to whichever composition is currently shown, so any preset
can be previewed either way.

A small **Active layer** readout stays pinned to the top of the panel and
updates on every state change, naming which tier of the priority model is
currently in control (Required UI, Active interaction, Requested utility,
Survey, Contextual content, or Primary content) — so the orchestration
model's decision is visible in real time instead of only inferable from
behavior.

## Busy / overflow edge cases

Two ways to show what happens when several things want the same real estate:

- **"Show Uncoordinated Chaos"** (Orchestration Demos): a deliberately naive
  comparison — four independently-styled widgets (a promo footer, a chat
  bubble, a survey card, a cookie banner) fixed-positioned with no shared
  coordination layer, the way they'd look if four different teams or
  vendors each shipped their own persistent widget. Turn it on while the
  real coordinated sticky component is showing to watch it get buried —
  that's the point.
- **"Kitchen Sink (Overload)" preset + Auto-collapse** (Busy / Overflow
  Edge Cases): applies section navigation + Chat + Search all at once, then
  lets you compare two outcomes at a narrow width: raw (nav silently
  eats extra items into its own horizontal scroll, with no visible cue that
  Performance is even there) vs. auto-collapse on (nav explicitly collapses
  to the active section + a "More" button before utilities shrink to
  icon-only) — a real measurement-driven mechanism, not a canned animation.
  The crowding badge reports which items collapsed, and admits when it's
  still tight even after collapsing everything it can.

## What's V1 / V2 / V3

The panel tags every control so you can tell a client, in one glance,
what's actually being proposed for the next release vs. what's exploratory.

- **V1 — Better Persistent Surface** (realistic first ask): full-width /
  floating presentation, flexible CTA + message compositions, Chat
  coordination, optional Search entry, responsive composition, basic
  entrance animation, clean orchestration with required UI.
- **V2 — Smarter Persistent Surface** (near-term roadmap): message
  rotation / ticker / manual rotator, minimize & dismiss-with-restore,
  Scroll Spy (orientation, navigation, contextual CTA), Survey integration.
- **V3 — Sitewide Utility Layer** (future / exploratory only, labeled as
  such in the panel): richer Chat (device-simulated iMessage handoff),
  language selector, province selector, market/global selector.

Nothing here implies the platform team should build all of this at once —
that separation is the point of the demo.

## Notable UX/technical calls worth flagging to stakeholders

- **The control panel occupies real screen width when open.** On a
  full-width bar at desktop sizes, an open drawer can sit over the right
  end of the bar (its own minimize/dismiss controls). That's expected drawer
  behavior for a dev tool — close the panel to show the clean customer view
  — but it's worth calling out explicitly so nobody mistakes it for a
  production layout bug.
- **Priority model is intentionally simple.** The demo hard-codes exactly
  one deferral rule set (privacy blocks survey; active chat blocks survey)
  to make the "coordinated system, not competing z-indexes" argument
  legible. A production version would need a more general priority queue
  as more surfaces are added (e.g. what happens if Search and Chat are both
  requested at once on a very narrow viewport).
- **Contextual CTA only has a visible home in the message+CTA composition.**
  If Scroll Spy's "Contextual CTA" mode is turned on while a preset like
  "Search Utility" (search-only) is active, there's nothing for it to
  change — that's a deliberate no-op, not a broken state, but it's an
  example of a state combination a spec should call out explicitly once
  this becomes a real component API.
- **Mobile composition is opt-in via preset, not fully automatic.** The
  "Mobile Compact" preset demonstrates a deliberately reduced arrangement;
  real responsive collapsing (hiding utility labels under 480px, etc.) also
  happens automatically via CSS regardless of preset. Worth deciding, for a
  real build, whether composition changes by breakpoint should be
  fully automatic or explicitly authored per breakpoint like this demo.
- **The naive nav treatment doesn't look broken — that's what makes it
  worth flagging.** With auto-collapse off, a too-narrow section nav
  doesn't visibly overflow or wrap; it silently becomes horizontally
  scrollable within its own strip, so a section (e.g. Performance) can end
  up genuinely unreachable with zero visual cue that it's there. That's a
  more realistic "busy edge case" failure than an obviously broken layout,
  and worth calling out to stakeholders precisely because it's easy to miss
  in a design review.
- **The device frame preview doesn't carry every panel setting across.**
  It mirrors preset/presentation/behavior via the same URL parameters as
  Copy Link, but a few purely-visual, presenter-only toggles (auto-collapse,
  the custom content override) aren't in that URL and reset to default
  inside the framed instance, since the frame boots a fresh, independent
  page. Worth deciding, if this becomes a real internal tool, whether that
  parameter set should be exhaustive.
- **The "Uncoordinated Chaos" comparison is illustrative, not simulated.**
  Its four widgets are fixed at deliberately overlapping positions rather
  than reacting to real content or viewport changes — it's making a point
  about the absence of coordination, not modeling how any particular
  real vendor widget actually behaves.

## Accessibility notes

Reduced-motion is respected throughout (entrance animation, ticker, and
message rotation all disable or fall back to static when
`prefers-reduced-motion: reduce` is set). All interactive controls are
keyboard-reachable with visible focus states, touch targets are ≥44px,
and moving content (ticker, rotating messages) pauses on hover/focus.
