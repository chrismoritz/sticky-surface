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
   Inventory, Brand Story (F1), and the various Chat/Search entry points.
   Same component, new content every time.
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
Lead capture / Quote, Survey, Contextual content, or Primary content) — so
the orchestration model's decision is visible in real time instead of only
inferable from behavior. It's also color-coded now — see below.

## Color-coding chat, search, survey, quote, and privacy

Every distinct message/utility type that can occupy the sticky surface now
carries its own hue, so which kind of thing is on screen reads at a glance
instead of requiring a close look at icon shape or copy:

- **Chat** — blue (trigger border/icon, the "Ask a question" field, the
  corner chat window's header rule, avatar, and composer send button).
- **Search** — teal (trigger border/icon, the search field, result rows on
  hover).
- **Survey** — violet (a small dot before the message, and the "Take
  Survey" button).
- **Quote** — green (same treatment as Survey: dot + CTA button), also used
  for the lead-gen form's focus ring and submit button.
- **Privacy notice** — amber (a dot before the message, a top border on the
  bar, and — not just decorative — the Accept button, which previously
  rendered as black text with no visible button boundary on the bar's
  already-black background).

The flyout panel (suggested prompts / search results / the quote form)
picks up a matching colored top border and section title, so it's obvious
which trigger opened it even once it's detached from the pill that
triggered it. The dev panel's **Active layer** readout uses the same five
hues (in brighter dark-mode-safe variants) for its `<strong>` text, so the
orchestration model's real-time state and the on-page color-coding tell
the same story. Regular commerce content (message + CTA, section nav,
search-inline) intentionally stays on the brand's neutral black/white —
color is reserved for the small set of "something specific is happening"
moments, not applied everywhere, so it doesn't get diluted into "this
component is just colorful."

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

## Floating and compact both expand before they ever collapse anything

Floating panels and the compact/pill treatment both default to a compact
width, but neither is locked to it. When content is too crowded for the
default cap, the panel first tries the option that costs nothing — taking
more width, if the viewport actually has room to give — before any
collapse logic even runs. Apply "Kitchen Sink (Overload)" in Floating (or
Compact) presentation on a wide-enough window and watch the panel visibly
grow to fit nav + Chat + Search rather than immediately shrinking
anything; switch back to a simple preset and it animates back down to
compact, since holding onto extra width it no longer needs isn't
"opportunistic" either.

"Crowded" isn't only the extreme, nav-overflowing case — the panel also
grows for the much more everyday case of a message or CTA that's simply
longer than usual and would otherwise quietly ellipsize with room to
spare. Type a longer line into Presenter Tools → Custom content override
in either presentation and watch the panel grow to show it in full rather
than truncating it — this is what makes the width feel like it's actually
driven by its content, not just reactive to a couple of hard-coded
overflow cases.

Compact keeps its own, smaller ceiling (800px vs. Floating's 920px) so it
stays visibly more contained even at its widest — the two presentations
are meant to read differently, not converge into the same shape once
something makes them grow.

This is deliberately **not** gated behind the Auto-collapse toggle the way
nav/utilities collapsing is: expanding the container can't hide or lose
any content the way collapsing can, so there's no tradeoff to make it
opt-in — it's just a better default. Collapse is still there as the
fallback for when even the expanded width isn't enough (a narrow viewport
genuinely has nowhere further to give, or the content is long enough to
still need trimming even at the wider cap), which is why Kitchen Sink at
a narrow width still ends up demonstrating both mechanics in sequence: it
expands as far as the viewport allows, and only turns to collapsing nav/
utilities if that still isn't sufficient. The crowding badge names which
of the two actually resolved it, and which presentation did the expanding.

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

## Request a Quote: a returning-visitor lead-gen prompt

A second scenario that reuses the same "takes over the primary zone"
mechanism as Survey: if a visitor does something that signals real intent —
clicks a CTA, opens Chat or Search, or scrolls into the Shopping section —
and then leaves the tab and comes back, the sticky surface greets them with
"Welcome back. Ready for pricing on the Aurelia GT?" and a **Get My Quote**
button instead of whatever was showing before. Clicking it opens a small
Name/Email/ZIP form in the same flyout panel that already hosts suggested
chat prompts and search results, so there's no new UI surface to build —
just a new occupant for the existing one. Submitting shows a mock
confirmation; dismissing with the × restores whatever composition was
showing beforehand, same as Survey.

"Returning to the tab" is detected with the Page Visibility API
(`visibilitychange` firing while the document is no longer hidden) —
deliberately not a timer or an exit-intent listener, since the brief was
specifically about a *return* visit, not time-on-page. Try it live via
**Orchestration Demos → "Simulate Return Visit (Quote)"**, which fakes both
the qualifying action and the tab return in one click, or the **Quote
Prompt (Returning Visitor)** content preset.

**Where it sits in the priority model:** Quote slots in as a second
"optional engagement" layer alongside Survey, but outranks it — a
returning visitor who already showed buying intent is a more valuable
moment than a generic site survey. If Survey is already showing when Quote
triggers, Survey is bumped back to pending (not lost) and resumes
automatically once the quote prompt is dismissed or submitted. Quote still
defers behind everything Survey already deferred behind — the privacy
notice and any active Chat/Search interaction — since interrupting someone
mid-conversation to ask for their email is worse than a few seconds' delay.
Both layers now share one snapshot-and-restore mechanism
(`captureCompositionIfNeeded` / `restoreCompositionIfIdle`) rather than each
keeping its own copy of "what was there before," so whichever one releases
last is the one that puts the original content back.

## What's V1 / V2 / V3

The panel tags every control so you can tell a client, in one glance,
what's actually being proposed for the next release vs. what's exploratory.

- **V1 — Better Persistent Surface** (realistic first ask): full-width /
  floating presentation, flexible CTA + message compositions, Chat
  coordination, optional Search entry, responsive composition, basic
  entrance animation, clean orchestration with required UI.
- **V2 — Smarter Persistent Surface** (near-term roadmap): message
  rotation / ticker / manual rotator, minimize & dismiss-with-restore,
  Scroll Spy (orientation, navigation, contextual CTA), Survey integration,
  Request a Quote (returning-visitor lead-gen prompt).
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
- **Priority model is intentionally simple.** The demo hard-codes a small,
  fixed deferral rule set (privacy blocks everything below it; an active
  chat/search interaction blocks Survey and Quote; Quote outranks Survey and
  bumps it to pending) to make the "coordinated system, not competing
  z-indexes" argument legible. A production version would need a more
  general priority queue as more optional-engagement surfaces are added —
  right now Quote and Survey are hand-ordered against each other, which
  won't scale past two or three such layers.
- **The Quote trigger is a plausible proxy, not real intent data.** "Any
  CTA click, or opening chat/search, or reaching Shopping" is deliberately
  broad so the demo is easy to trigger — a real implementation would use
  actual signals (configurator progress, saved vehicle, dealer contact) and
  probably a minimum time-away threshold before treating a tab return as
  meaningful.
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
