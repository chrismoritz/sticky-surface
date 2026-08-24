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

## Animation timing, and a more discrete minimize/restore

**Animation timing** (Visibility & Entrance): Snappy / Standard / Relaxed.
Governs entrance, the minimize/restore sequence below, and other CSS
transitions across the component, via the `--dur-fast`/`--dur-med` custom
properties — one control to feel out how much motion is too much or too
little for a given placement.

**Minimize** no longer swaps a labeled "Reopen" button in with a hard cut.
It's now a small grip — no text, no accent color, just a thin line that
darkens and widens slightly on hover/focus — sized for a proper touch
target but visually about as quiet as a persistent affordance can be while
still reading as clickable. The collapse itself is a real three-beat
sequence rather than a cross-fade: content fades/settles out, the bar's
height and the grip's height animate in the same motion (one shrinking as
the other grows), then the grip fades in — using the CSS grid
`grid-template-rows: 1fr → 0fr` technique to animate to/from an intrinsic
height without JS measuring pixel values. Restoring runs the same sequence
in reverse. `inert` is applied to whichever side is visually collapsed the
instant the state changes (not after the animation finishes), so keyboard
and screen-reader users can never land on off-screen controls mid-transition.
The same mechanism drives "Dismissible + restore" mode, since a dismiss
recovery affordance is conceptually the same collapse/expand behavior as
minimize.

## Always visible by default

Every Demo Flow step and the initial page load now default to **Always
visible** rather than requiring a scroll first — the point of the flow is
telling the story in a few clicks, and waiting on a scroll threshold before
the thing you're demoing even appears got in the way of that. The scroll-
triggered visibility modes (10%/25% scroll, after hero, on section reach)
are still there in the panel for anyone who wants to show that behavior
specifically — the default just isn't gating the rest of the demo on it
anymore.

## The chat input hands off to a real chat window

Wherever the sticky bar shows the "Ask a question" input field (Tesla-
Inspired, Stress Test, Kitchen Sink, or the Chat Demo's "Ask a Question"
mode), its send button no longer just logs a mock event — it opens a
conventional bottom-right corner chat window, the way a real product would
hand off from a persistent-surface entry point to an actual conversation
surface (think Intercom/Drift). Whatever was typed in the sticky bar
becomes the first message; the window then runs a small mock back-and-forth
(canned replies, no backend) so it reads as alive rather than static. The
sticky bar's own field clears and the window's composer takes focus, so
typing continues uninterrupted.

This slots into the existing priority model rather than sitting outside
it: the window counts as an **active interaction** for as long as it's
open, so triggering Survey while it's open defers exactly the way it does
for the inline chat field, and the panel's Active Layer readout reflects
it. Pressing Enter in either the sticky bar's field or the window's own
composer submits, matching how a chat input is expected to behave.

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

## Content-driven layout

Content is centered as one balanced cluster within the bar (primary +
utilities + controls together), rather than the more common navbar pattern
of primary content pinned left and utilities pushed to the far right —
short compositions like "Schedule a Test Drive | Ask a Question" now read
as one connected unit instead of two things awkwardly far apart, which
was part of the original brief's point.

Floating and Compact/pill go a step further: the surface itself sizes to
its content (capped at a sane max-width for busy compositions) instead of
occupying a fixed-width box regardless of how little it holds. Search
Utility is the deliberate exception — its field still stretches to fill
available width, since a search box is meant to invite typing, not hug
itself into a chip.

## Notable UX/technical calls worth flagging to stakeholders

- **Very content-heavy compositions in Floating at extreme mobile widths
  can still run out of room.** "Schedule a Test Drive" + a full "Ask a
  question" field is a lot to ask a ~360px-wide floating card to hold.
  Text now shrinks and truncates with an ellipsis rather than overflowing
  or bleeding outside the card, but that's a graceful failure, not a
  design recommendation — the "Mobile Compact" preset (shorter copy: "Test
  Drive" + a chat icon) is the actual intended pattern for narrow
  viewports, exactly as the original brief called out (composition should
  change by breakpoint, not just shrink in place).
- **The control panel occupies real screen width when open.** It lives
  top-left and stops 150px short of the viewport bottom specifically so it
  never covers the sticky footer, across every presentation — but it still
  covers the left portion of the page content behind it while open. That's
  expected drawer behavior for a dev tool — close the panel to show the
  full clean customer view — but it's worth calling out explicitly so
  nobody mistakes it for a production layout bug.
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
