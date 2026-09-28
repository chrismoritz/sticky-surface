# Sticky Surface — Aurelia GT Prototype

**View it live: [chrismoritz.github.io/sticky-surface](https://chrismoritz.github.io/sticky-surface/)**
— the live site is published from this repo's `main` branch, so it always
shows the latest version. Open **Prototype Controls** (top-left) and click
through the **Demo Flow** to see the pitch.

A standalone, CodePen-style front-end concept demo for evolving the OEM's
basic sticky footer into one reusable, reconfigurable **persistent surface**
component — the kind of shared space where a CTA, Chat, Search, and other
sitewide utilities can coexist instead of stacking up as competing
floating widgets.

The background page is a fictional luxury EV ("Aurelia GT" by "Solstice
Motors") used only to give the sticky component something real to sit on
top of and scroll against.

**Contents**

- [Why this exists](#why-this-exists) — the problem at the bottom of the screen
- [The strategy](#the-strategy) — one shared surface, with rules
- [Try it](#try-it) — live site, or run it locally
- [Demoing it live](#demoing-it-live) — the thirteen-step Demo Flow, presets, presenter tools
- [Tactical decisions](#tactical-decisions) — how the strategy became specific design and engineering choices
- [Roadmap: V1, V2, V3](#roadmap-v1-v2-v3) — what's proposed now vs. later
- [Measuring success](#measuring-success) — proposed pilot metrics
- [How the prototype is built](#how-the-prototype-is-built) — build choices and why
- [Feature notes](#feature-notes) — detail on each behavior
- [Open questions and caveats](#open-questions-and-caveats) — calls worth flagging to stakeholders
- [Accessibility](#accessibility)

## Why this exists

Every OEM product page ends up with the same problem at the bottom of the
screen. Over time, separate teams and vendors each claim a piece of it:

- marketing's promo footer ("Explore current offers"),
- the chat vendor's floating bubble,
- the survey vendor's intercept,
- the consent manager's cookie banner,
- lead generation's "Request a Quote" prompt.

Each one ships independently, positioned on its own with its own stacking
order. Nobody owns the space, so nothing decides what shows when. The
results are predictable: widgets overlap each other — worst on phones, where
the bottom edge is also the thumb zone; the page's own content gets covered;
a visitor in the middle of a chat gets interrupted by a survey; the brand
shows up five different ways in one corner of the screen; and every new need
means one more widget and one more negotiation between teams. The
prototype's **Show Uncoordinated Chaos** demo shows exactly this.

The brief was to evolve the basic sticky footer. The opportunity is bigger:
treat that strip of screen as shared, governed real estate.

## The strategy

**Replace a collection of widgets with one persistent surface that
everything shares — and give it rules.**

1. **One surface, many occupants.** A single component owns the bottom
   edge. CTAs, chat, search, surveys, quote prompts, and section navigation
   are *content* it hosts, configured per page — not separate products
   competing for position. Every preset in the prototype is the same
   component with different configuration; nothing is rebuilt per scenario,
   which makes the reusability claim concrete rather than theoretical.
2. **Arbitrate, don't stack.** When two things want the space, a priority
   model decides: required UI (the privacy notice) › an active interaction
   (chat or search in use) › a requested utility (an open panel) › lead
   capture (Quote) › survey › a timed notice › contextual content ›
   primary content.
   Lower-priority items wait their turn instead of overlapping. The panel's
   **Active layer** readout shows the decision as it happens.
3. **Never interrupt intent.** A visitor mid-chat or mid-search doesn't get
   a survey. Prompts are scheduled rather than fired on page load; a prompt
   that was held back arrives a beat after its blocker clears, not in the
   same instant; and the quote form ignores stray clicks outside it, so
   typed details aren't lost.
4. **Earn the space.** Something visible on every screen costs attention
   on every screen, so it has to stay relevant: the CTA follows the section
   in view, the quote prompt targets returning visitors who already showed
   intent, the surface sizes itself to its content, and visitors can
   minimize or dismiss it where the business allows.
5. **Match the tone to the placement.** Brand storytelling gets a text
   link; commerce gets a button. A full-width bar, floating panel, or
   compact pill are presentations of the same component, chosen per page
   rather than rebuilt.
6. **Adopt incrementally.** V1 replaces today's footer one-for-one and
   coordinates chat; V2 adds the smarter behaviors; V3 is explicitly
   exploratory. Each step ships value on its own, without a re-platform.

The prototype exists to make that argument tangible: something
stakeholders can click through, rather than a spec they have to imagine.

## Try it

The quickest way is the live site: **https://chrismoritz.github.io/sticky-surface/**,
published from the `main` branch.

To run it yourself — no build step, no dependencies — any of these work:

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
- `script.js` — state, rendering, orchestration and sequencing, the multi-step quote form, demo notes, event log

## Demoing it live

Click **Prototype Controls** (top-left) to open the panel. The **Demo
Flow** buttons at the top walk through the pitch in order. Each step shows a
short "what to watch" caption under the buttons and stays highlighted until
you pick a preset by hand.

1. **Current State** — today's basic full-width footer + an unrelated
   floating chat bubble. This is the "problem" shot.
2. **V1 Enhancement** — swaps to the Tesla-inspired floating panel with
   "Schedule a Test Drive" and an inline "Ask a Question" chat field living
   in one coordinated surface. Send a question to hand off to the corner
   chat window.
3. **Flexibility** — jump into the preset list and click through Search
   Inventory, Brand Story (F1), and the various Chat/Search entry points.
   Same component, new content every time.
4. **Presentation** — a "Try a look" switcher appears on the page (top
   right; under the Prototype Controls pill on phones). **Next look** steps
   through six curated combinations of shape (full-width / floating /
   compact), finish (opaque / glass / bordered) and entrance (fade / slide /
   rise), replaying the entrance each time; each row can also be set
   directly, and ↻ replays the entrance. **Appears** sets when the bar
   shows up: on load, after 10% or 25% of the page, past the hero, or at a
   section. Picking a trigger returns to the top so you can scroll down and
   watch it enter, with a meter showing how close you are.
5. **Message Rotation (V2)** — several messages share one slot in the
   floating panel and rotate on a timer: each one rolls into place while
   the panel's edge glides to its new length and a highlight traces its
   border. Rotation pauses while the bar is hovered or focused.
6. **Scroll Spy: Contextual CTA (V2)** — the Scroll Spy preset, starting
   from the top of the page. The bar is just a floating button, and as you
   scroll it becomes the next best action for the section in view (Explore
   Gallery in Design, View Specs in Performance, Search Inventory in
   Shopping), cross-fading as it changes. Its demo note updates live
   ("Right now: Interior → 'Interior Features'").
7. **Scroll Spy: Section Nav (V2)** — the same scroll tracking, used for
   on-page navigation instead: the bar holds links to the page's sections.
   Click one and the page scrolls straight to it; scroll by hand and the
   highlight follows. The note names the section you're in.
8. **Chat & Search** — the Chat + Search preset: both utilities side by
   side, each in its own color. Focus the chat field or open Search and the
   whole surface tints to match; Esc or clicking away closes things.
9. **Timed Notice** — an ancillary partner message (a satellite-radio free
   listening weekend) arrives after the Prompt delay and closes itself when
   the line along the top of the bar runs out. Hover or focus the bar to
   pause it.
10. **Survey Takeover** — the survey arrives after the Prompt delay and
   takes over the bar in violet. **Take Survey** opens a one-question survey
   inside the surface (a 1–5 rating and an optional comment). Send it or
   dismiss it and the original content comes back.
11. **Quote Takeover** — a returning-visitor quote prompt arrives after the
   Prompt delay and takes over in green. **Get My Quote** opens the
   four-step request form; closing it keeps your progress.
12. **Survey vs. Quote** — both prompts, a few seconds apart. The readout
   counts down; the Survey arrives first, then the Quote animates over it
   because it outranks it. Dismiss the Quote and the Survey comes back after
   a short beat.
13. **Orchestration** — shows the privacy notice immediately and schedules
   a Survey and a Quote prompt behind it. When they land, privacy still wins
   and they wait ("…_triggered — waiting"). Accept the notice and the Quote
   follows after a short beat; dismiss the Quote and the Survey follows
   that. Nothing overlaps, and nothing cuts in abruptly.

Each step starts from a clean slate — the rotating messages step 5 turns
on don't carry into the later steps.

**Demo notes.** Every demo also gets floating tooltips ("Demo note"),
anchored to the element being demonstrated — the bar, the chat field, the
privacy notice, the quote form, the chaos widgets — each explaining **how
it works** and **why it matters** (for the Current State and chaos
comparison: how it works today, and the problem). They follow live state
rather than just the preset: in the Survey vs. Quote step the note changes
from "Survey on its way" to "The survey takes over" to "Quote outranks
Survey" as each moment lands, and opening the quote form, the chat window,
or the privacy notice brings up a note about that.

The wording follows the form factor being viewed: on a phone, notes
describe what's actually on a phone screen — the chat field collapsed to a
single chat button, "tap outside" instead of Esc or clicking away, a
full-width chat panel instead of a corner window, no hover — and switch
back when the window is widened. At most two notes show at once on desktop
and one on phones; a "1 of 3" counter shows when more are queued. Every
note can be dismissed with its ×, which reveals the next; **Hide all** in
any note turns them off (turn them back on with **Show demo notes** under
the Demo Flow buttons), and on desktop Escape dismisses the visible notes
once there's nothing else for it to close. Notes stay clear of the sticky
bar, each other, the open control panel, and the Prototype Controls pill,
and track their anchors through every animation. They're styled as
prototype chrome and never appear in the device-frame preview.

**Content Presets** are grouped by what they demonstrate — *Baseline*,
*Compositions*, *Chat & search* (the color-coded utilities), *Intercept
prompts* (which arrive after the Prompt delay), and *Orchestration & edge
cases* — so the scenario you're after is easy to find.

The **Event Log** at the bottom of the panel is a live feed of everything
the component would emit for analytics in a real build.

The control panel itself is intentionally styled like a dev tool (dark,
monospace, labeled "PROTOTYPE TOOL — NOT PART OF THE SITE") so it's never
mistaken for customer-facing UI.

### Presenter tools (panel → "Presenter Tools")

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

## Tactical decisions

How the strategy turns into specific design and engineering choices, and
why each one was made. The [Feature notes](#feature-notes) have the detail.

### Composition and layout

- **A centered cluster, not a navbar.** Primary content, utilities, and
  controls center together, so "Schedule a Test Drive | Ask a question"
  reads as one unit instead of two things pinned to opposite edges.
- **Content decides the size.** Floating and compact surfaces size to what
  they hold. When content gets crowded they **widen before they collapse**
  anything — widening costs nothing, collapsing hides something. Only when
  the viewport has no more room does a priority-ordered collapse run
  (section navigation gives way before chat and search do).
- **Phones change the composition, not just the scale.** Below 480px the
  inline chat field becomes a single chat button (it only ever handed off
  to the chat window anyway), and prompts get their own row — rather than
  shrinking the desktop layout until everything truncates.

### Orchestration

- **Takeovers borrow the space instead of adding a layer.** Survey and
  Quote temporarily replace the primary content and put it back afterward,
  using one shared snapshot, so whichever finishes last restores the
  original.
- **Quote outranks Survey.** A returning visitor who has already shown
  buying intent is a more valuable moment than a general site survey. The
  survey is queued, not lost, and returns when the quote prompt clears.
- **Ancillary messages step aside and time out.** A partner message (the
  satellite-radio free weekend) sits at the lowest optional priority and
  closes itself after a few seconds, with a line along the top of the bar
  shrinking to show the time left. If a survey or quote needs the space, the
  notice is dropped rather than queued — a time-boxed message shouldn't pile
  up for later — and the timer pauses while the visitor hovers, focuses the
  bar, or is on another tab, so it never expires unseen.
- **Prompts wait.** A configurable delay (default 3 seconds) with a visible
  countdown in the panel, and a short beat before a held-back prompt
  follows whatever was blocking it.
- **Transitions are sequenced.** The color shifts first, the old content
  fades out, the new content rises in, and the surface animates between
  sizes — a deliberate handoff rather than a jump-cut. Changes that land
  mid-transition merge into a single render, so a survey preempted in the
  same moment never flashes on screen.

### Utilities as entry points

- **Chat starts in the bar and continues in a window.** The bar holds the
  entry point; the conversation moves to a conventional corner window that
  sits just above the bar. A footer can't hold a conversation, and a bubble
  on its own is easy to miss.
- **One panel, several occupants.** Search results, suggested chat prompts,
  the survey, and the quote form all open in the same panel above the bar,
  so there's one pattern to learn and one space to govern.
- **The survey is answered in place.** Take Survey opens a one-question
  rating (1–5, plus an optional comment) in that panel rather than a vendor
  popup or a new tab. A stray click doesn't close it or lose the answer; if
  the Quote needs the space, the survey steps aside and comes back with the
  rating still picked. Sending it shows a brief thank-you, then the original
  content returns.
- **A next best action for each block.** In Contextual CTA mode the surface
  is just a button, with no standing label, because the action itself says
  where the visitor is. This is close to the coming **Floating Show More
  Button**, which opens a section's contextual modal while the visitor is in
  that section. Built on the shared surface, the same button becomes a
  general next-best-action slot: each block can nominate its own action (a
  contextual modal, the gallery, specs, inventory), and the button still
  follows the surface's priority rules, so it steps aside for chat, prompts
  and required UI instead of floating over them. When the bar holds nothing
  but that button, the floating and compact shells tighten into a pill
  around it, so it reads as a floating button rather than a button in a box.
- **Scroll tracking doubles as on-page navigation.** The same section
  tracking that drives the contextual CTA can instead put section links in
  the bar: clicking one scrolls to it, the current section stays
  highlighted (and marked for screen readers) as the visitor scrolls, and on
  phones the link strip slides sideways to keep the current section in view.
  The highlight goes straight to the chosen section instead of flickering
  through every section passed on the way.

### Lead capture

- **Target intent, not everyone.** The quote prompt appears when a visitor
  who clicked a CTA, used chat or search, or reached the Shopping section
  comes back to the tab — not on a timer, and not on exit intent.
- **The whole production form, one short step at a time.** Every field from
  the dealer-pricing form is kept — vehicle, contact details and consent,
  dealer, optional details — but split into Vehicle → You → Dealer →
  Review. Anything the page already knows is filled in (the car being
  viewed, or the one picked in search; the nearest dealers from the ZIP just
  entered), and the optional fields sit behind one toggle, so the required
  path is three quick steps.
- **Don't lose the visitor's work.** Progress survives closing the panel
  (the button then reads "Continue My Quote"); validation is inline and
  specific; and each error clears as soon as it's fixed.

### Visual language and motion

- **Color means "something specific is happening."** Chat is blue, search
  teal, survey violet, quote green, privacy amber. Everyday commerce content
  stays on the brand's neutral black and white, so color signals a state
  instead of becoming decoration.
- **Motion is restrained and optional.** One Animation timing control
  governs every transition, and visitors who prefer reduced motion get
  instant state changes.

### Accessibility and interaction

- **Popovers behave like popovers.** Escape and clicking away close them,
  and focus returns somewhere sensible — deliberately not into the chat
  field, which would count as reopening chat.
- **Hidden means unreachable.** Collapsed content is made `inert` the
  instant it hides, so keyboard users can't tab into it mid-animation.
- **The form guides focus.** Each quote step moves focus to its heading,
  and a failed Continue moves it to the first field with a problem.

## Roadmap: V1, V2, V3

The panel tags every control so you can tell a client, in one glance,
what's actually being proposed for the next release vs. what's exploratory.

- **V1 — Better Persistent Surface** (realistic first ask): full-width /
  floating presentation, flexible CTA + message compositions, Chat
  coordination, optional Search entry, responsive composition, basic
  entrance animation, clean orchestration with required UI.
- **V2 — Smarter Persistent Surface** (near-term roadmap): message
  rotation / ticker / manual rotator, minimize & dismiss-with-restore,
  Scroll Spy (orientation, navigation, contextual CTA), Survey integration,
  timed ancillary notices that close themselves,
  Request a Quote (returning-visitor lead-gen prompt).
- **V3 — Sitewide Utility Layer** (future / exploratory only, labeled as
  such in the panel): richer Chat (device-simulated iMessage handoff),
  language selector, province selector, market/global selector.

Nothing here implies the platform team should build all of this at once —
that separation is the point of the demo.

## Measuring success

Every state change in the prototype emits an event (see the panel's
**Event Log**), which doubles as a draft analytics contract: each occupant
of the surface can be measured against the same baseline. Proposed measures
for a pilot:

| Question | Signal (event names from the prototype) |
|---|---|
| Is the surface earning its space? | Click-through on the surface vs. today's footer (`cta_clicked`), broken down by composition and presentation |
| Does chat get used more as a built-in entry point than as a bubble? | Conversations started (`chat_opened`), and from which entry point |
| Where does the quote form lose people? | Step-by-step funnel (`quote_step`), which fields fail validation (`quote_validation`), and completions (`quote_submitted`) |
| Are prompts welcome, or just tolerated? | Dismissals vs. engagement (`survey_dismissed` vs. `survey_submitted`, `quote_dismissed` vs. `quote_submitted`), and how often a prompt had to wait its turn (`…_triggered — waiting`) |
| Does section navigation help people find things? | Jumps from the bar (`section_changed — nav click`), scroll depth, and whether survey ratings for "easy to find" go up |
| Does targeting pay off? | Quote completion for returning, high-intent visitors vs. a prompt shown to everyone |
| Do timed notices get noticed? | How notices end (`notice_closed`: acted on, dismissed, timed out, or dropped for a higher-priority prompt), and whether the pause-on-hover gets used |

Guardrails to watch alongside: bounce rate and scroll depth on pages with
the surface; consent-accept rates, since the privacy notice must not
suffer; and accidental taps near the bottom edge on phones.

## How the prototype is built

- **No build step, three files** (`index.html`, `styles.css`, `script.js`).
  Anyone can open it, fork it, or paste it into CodePen. It's a thinking
  tool for stakeholders, not production code, so it shouldn't need a
  toolchain to evaluate.
- **One component, driven by state.** A single `state` object describes
  everything — composition, presentation, which layer is active, what's
  scheduled — and render functions rebuild the component from it. Presets
  are just patches to that state, which is the most direct evidence that
  the component really is reusable.
- **CSS does the visual work.** Presentations, finishes, and colors are
  data attributes on one element (`data-presentation`, `data-surface`,
  `data-kind`), and animation is CSS transitions and keyframes. JavaScript
  only measures sizes where CSS can't animate on its own (the surface
  resizing between states).
- **Presenter tooling is kept separate from the proposal.** The Demo Flow,
  demo notes, Active layer readout, Event Log, device-frame preview, and
  shareable links exist to run the pitch. They're styled like a dev tool
  and tagged "Prototype tool" so nobody mistakes them for proposed site UI.
- **Checked like a product.** Changes were verified with scripted browser
  sweeps (Playwright) across every preset, presentation, and desktop /
  tablet / phone width — looking for see-through surfaces, off-screen
  content, overlapping elements, undersized tap targets, and keyboard
  dismissal. Those scripts aren't included in this repo.
- **A fictional brand, a real field set.** "Solstice Motors" and the
  Aurelia GT keep the demo free of any real OEM's branding, while the quote
  form carries the real production form's fields, so the multi-step
  argument is an honest comparison.

## Feature notes

Detail on each behavior, and the reasoning behind specific choices.

### Content-driven layout

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

### Floating and compact both expand before they ever collapse anything

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

### Busy / overflow edge cases

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

### Text links vs. buttons, and the "Active layer" readout

The **Presentation** section has a **Primary CTA style** toggle (Button /
Text link). Editorial, brand-forward compositions — like Brand Story — default to
the text-link treatment ("Formula 1 — Explore the Team
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

### Color-coding chat, search, survey, quote, and privacy

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

The whole sticky surface — not just Survey/Quote's primary-zone takeover —
now carries a matching background tint for every one of these states: it
washes chat-blue while the chat field is focused, the corner window is
open, or its suggested-prompts flyout is showing; teal for search focus or
open results; on top of the violet/green Survey/Quote already had. This
is driven by one `data-kind` attribute on the sticky element, recomputed
by the same function that drives the panel's Active layer readout, so the
two can't drift out of sync. Getting this right surfaced (and fixed) a
subtler bug: because blur events and Quote's delayed auto-dismiss timer
didn't go through the same code path as everything else, the tint could
get stuck showing the wrong color after the state that caused it had
already ended — e.g. the surface staying quote-green after its "Request
received" confirmation auto-closed. Both `openFlyout()`/`closeFlyout()`
and the two blur handlers now refresh the readout directly instead of
relying on an event happening to call `log()` afterward.

### Rotating messages roll, and the border follows

A message change in the rotation used to be a hard cut: the text swapped
and, since the surface sizes to its content, the panel's edge and the CTA
jumped. Now each change is one coordinated motion:

- **The message rolls.** The old line lifts away and blurs out while the new
  one rises into place, overlapping slightly, so there's never an empty bar.
  Only the message moves; the CTA stays put.
- **The edge glides.** The message's width animates between the two
  lengths, so a floating or compact panel's border (and, full-width, the
  CTA's position) follows smoothly. When the new message is longer the edge
  leads, so the text is never clipped as it arrives; when it's shorter the
  edge waits for the old line to clear.
- **The border traces the change.** A soft highlight runs once around the
  inside of the surface's border, drawn inside the card so it reads over
  the dark hero and the white page alike.
- **Manual ‹ ›** uses the same roll, and the button keeps focus now, so
  keyboard users can step through messages without losing their place.
  Rapid clicks settle the roll in flight and start the next one.

The layout's truncation and expansion checks wait for a roll to finish, so
a half-glided message is never mistaken for one that doesn't fit. With
reduced motion, rotation stays off and the first message simply shows.

### Animation timing, and a more discrete minimize/restore

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

### Always visible by default

Every Demo Flow step and the initial page load now default to **Always
visible** rather than requiring a scroll first — the point of the flow is
telling the story in a few clicks, and waiting on a scroll threshold before
the thing you're demoing even appears got in the way of that. The scroll-
triggered visibility modes (10%/25% scroll, after hero, on section reach)
are still there in the panel for anyone who wants to show that behavior
specifically — the default just isn't gating the rest of the demo on it
anymore.

### Trying looks and trigger points without the panel

Demo Flow step 4 adds an on-page **"Try a look"** switcher, so a viewer can
flip the same content through every presentation option without opening
the panel's sections. It drives the panel's own controls rather than
keeping a second copy of the settings, so the two always agree and every
change lands in the Event Log the same way.

- **Next look** walks six combinations, each differing from the last in
  shape, finish and entrance, so every click is a visible change. The
  counter reads "Look 3 of 6: …", or "Custom: …" once a row has been set by
  hand.
- **Entrance** now has a fourth option, **Rise**: the surface rises from
  below the viewport edge, the most noticeable entrance, for placements
  that should announce themselves. **↻** takes the bar off screen for a
  beat and brings it back, so even **None** (it simply appears) can be
  compared.
- **Appears** sets the trigger point. Choosing one scrolls back to the top;
  the switcher then shows "Hidden until you scroll past the hero image: 40%
  there" with a meter, and "Appeared once you scrolled …" plus a **Back to
  top** button once it fires.
- Leaving step 4 resets the trigger to Always visible, so no later step
  starts with a hidden bar.

### A hint when the surface is waiting on a scroll

Whenever the surface is set to wait for a scroll trigger and hasn't
appeared yet (from the switcher, or the panel's **Show when**), a hint sits
at the bottom of the screen, where the bar will appear: "Scroll down to
see the sticky surface", which trigger it's waiting for, how far along the
visitor is, and how to show it right away (the switcher's Always option in
step 4; otherwise Prototype Controls → Visibility & Entrance → Show when).
It disappears as soon as the bar does and comes back if you scroll back
above the trigger. Dismissing it with × holds until the trigger changes.
It's prototype chrome: it never appears in the embedded preview, demo notes
steer clear of it, and on phones it waits while the control panel covers the
screen.

### The chat input hands off to a real chat window

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

### Request a Quote: a returning-visitor lead-gen prompt

A second scenario that reuses the same "takes over the primary zone"
mechanism as Survey: if a visitor does something that signals real intent —
clicks a CTA, opens Chat or Search, or scrolls into the Shopping section —
and then leaves the tab and comes back, the sticky surface greets them with
"Welcome back. Ready for pricing on the Aurelia GT?" and a **Get My Quote**
button instead of whatever was showing before. Clicking it opens the
multi-step request form (see "The full quote form, as four short steps"
below) in the same flyout panel that already hosts suggested chat prompts
and search results, so there's no new UI surface to build — just a new
occupant for the existing one. Dismissing with the × restores whatever
composition was showing beforehand, same as Survey.

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

### The full quote form, as four short steps

The production Request Dealer Pricing form asks for a lot: model year,
model, drivetrain, and trim; first/last name, ZIP, phone, email, and a
contact preference (with a consent statement); a down payment, trade-in,
accessories interest, and employee/supplier eligibility; a dealer search by
City/State, ZIP, or dealer name; and free-form notes. The quote panel now
carries every one of those fields (re-skinned for the fictional Solstice
brand), but sequenced so only one short group is on screen at a time and
anything the page already knows is answered for you:

1. **Vehicle** — year → model → drivetrain + trim are dependent dropdowns
   (the fictional lineup includes a 2026 *Meridian* SUV so the dependency
   actually does something), with a live "Starting MSRP" summary. It's
   pre-filled with the Aurelia GT the visitor is viewing — or, if they
   clicked a car in search results earlier (e.g. "2026 Aurelia GT —
   Performance, AWD"), that exact configuration — so most visitors just
   press Continue.
2. **Your information** — name, email, phone, ZIP, and contact preference,
   with the consent statement above them. Choosing *Telephone* makes phone
   required. Errors appear inline on Continue, the first problem field is
   focused, and each error clears as soon as it's fixed.
3. **Dealer** — searched automatically from the ZIP entered in step 2, with
   the nearest dealer preselected. The City/State / ZIP / dealer-name search
   is there to change it (Enter searches rather than submitting the step).
   If the ZIP changes later, the dealer list follows it — unless the
   visitor searched for something else themselves.
4. **Review & send** — a summary of the three answers, each with an Edit
   link back to its step. Down payment, trade-in, accessories, eligibility,
   and the notes box live behind one collapsed *Optional details*
   disclosure, so the required path is three quick steps plus a check.

Other details: a progress bar and "Step 2 of 4" heading (focus moves to it
on each step, for screen reader and keyboard users); Back/Continue stay
pinned to the bottom of the panel while a long step scrolls; the panel
animates its height between steps; progress survives closing the panel
(the prompt's button then reads *Continue My Quote*) and is cleared once
the request is sent or a new preset is applied. Sending shows who will
contact the visitor, how, and about which car — "Bayview Solstice will
contact you by phone at … with their best price on the 2025 Aurelia GT
Grand Touring" — and the event log records the vehicle, dealer, and which
optional details were filled in. Dealers, prices, and distances are mock
data; there's no backend.

### Timed notices that close themselves

Not every message deserves a dismiss button that someone has to find. The
**Timed Notice** scenario (Demo Flow step 9, the Timed Notice preset, or
**Orchestration Demos → Show Timed Notice**) uses an ancillary partner
message — "Free listening weekend: Starwave Satellite Radio is on in every
Aurelia GT through Sunday," from a fictional satellite-radio provider — to
show a message that takes over the primary zone briefly and then leaves on
its own:

- **Visible timing.** A thin line along the top edge of the bar shrinks
  from full width to nothing over the notice's lifetime (5, 8, or 12
  seconds, set under **Orchestration Demos → Timed notice duration**;
  default 8). When it runs out, the notice closes and the previous content
  comes back with the usual animated takeover. The line is driven by the Web
  Animations API, and the animation *is* the timer — so the line and the
  close can't drift apart.
- **Pausable.** Hovering or focusing the bar pauses the countdown (the line
  dims while it's paused), and so does switching to another tab — the
  visitor can always read it, and it never expires while they're away. The
  × closes it early, and "Learn more" closes it on the way out.
- **Lowest optional priority.** It waits behind the privacy notice and any
  active chat or search like everything else, and if a survey or quote
  prompt needs the space, the notice is **dropped, not queued** — a
  time-boxed partner message shouldn't reappear later, out of context.
- **Its own quiet hue.** Slate, not a brand or action color: informational,
  deliberately low-key, and distinct from the chat/search/survey/quote/
  privacy colors.
- **Adapts to the space.** On wide screens it's one line: message, a
  text-link CTA (lighter-touch than a button, since it's a partner message),
  and ×. Where one line can't hold it — tablets, phones, and the compact
  pill — it becomes a toast: the message beside its × (up to three lines),
  "Learn more" underneath, and compact softens from a pill into a rounded
  card.

The event log records how every notice ended (`notice_closed` — acted on,
dismissed, timed out, or dropped for a higher-priority prompt), which is
exactly the data needed to tune the duration.

### Sequencing: prompts arrive after a delay, takeovers animate

Real intercepts don't appear the instant a page loads, so Survey and Quote
are now *scheduled* rather than shown on the spot. **Orchestration Demos →
Prompt delay** sets how long they wait (Immediate / 1.5s / 3s / 6s,
default 3s), and the panel's Active layer readout counts down ("Next:
Survey arriving in 2.0s"). That applies everywhere a prompt is triggered:
the Trigger Survey / Simulate Return Visit buttons, the Survey Integration,
Quote Prompt, and Stress Test presets, and a real tab return. A prompt that
was held back by the privacy notice or an active chat/search follows its
blocker after a short (~0.9s) beat instead of arriving in the same instant,
so "notice accepted" and "here's the prompt" read as two moments.

When one state takes over the primary zone — a prompt arriving, a Quote
preempting a Survey, a prompt being dismissed, or a contextual CTA changing
as you scroll — the transition is sequenced instead of cut:

1. The surface's tint starts cross-fading to the new state's color.
2. The outgoing content fades and sinks slightly (`--dur-fast`).
3. The new content renders and rises into place (`--dur-med`), and the
   surface animates between its old and new size (a FLIP of width and
   height) rather than snapping — noticeable in Floating and Compact, where
   a prompt is usually wider than what it replaces.
4. A newly arrived prompt pings its colored dot once.

All of it follows the **Animation timing** control. Section navigation
deliberately doesn't cross-fade on scroll (it only moves its highlight),
and reduced-motion users get instant swaps with no movement.

Two details worth knowing: state changes immediately and only the render
waits, so changes that land mid-transition coalesce into a single render of
the latest state — in the Stress Test, a Survey that's preempted by the
Quote in the same moment never flashes on screen. And switching presets
cancels anything still on its way, so a prompt scheduled for one scene
never lands in the next.

### Quality-of-life pass

A scripted audit (every preset × presentation at desktop, tablet, and
phone widths) checking for see-through surfaces, content spilling off
screen, overlapping elements, undersized tap targets, and keyboard/click
dismissal. What it found and what changed:

- **Survey/Quote (and the chat/search states) were see-through.** Their
  tints were 6–7% alpha colors *replacing* the surface's opaque white, so
  the page showed through. The tints are now opaque mixes with white
  (`color-mix(in srgb, <hue> 7%, #fff)`).
- **Phones: the chat field ran off the right edge of the screen**, and in
  the Stress Test the text input itself was squeezed to 4px wide. Below
  480px the field now collapses to one round chat button that opens the
  corner window directly — the field only ever handed off to that window
  anyway, and tap-to-open is the conventional mobile pattern.
- **Squeezed CTA labels were hard-clipped mid-letter** ("Schedule a Test
  D") instead of ending in an ellipsis: `.btn` is `inline-flex`, and
  `text-overflow` does nothing on a flex container. CTA buttons and text
  links now render as blocks so the ellipsis actually applies.
- **Survey/Quote prompts were ellipsized to a word or two on phones.** They
  now wrap to two lines, and on phones take their own row above the
  utilities (compact softens from a pill to a rounded card while a prompt
  shows).
- **The corner chat window covered the sticky bar**, including the field
  that opened it. It now sits just above the bar and follows it as the bar
  grows, shrinks, or moves above the privacy notice.
- **Nothing responded to Escape or clicking away.** Escape now closes an
  open flyout or the chat window (returning focus to the bar's chat button
  — deliberately not the text field, since focusing that counts as
  reopening chat). Clicking outside closes suggested prompts / search
  results / nav overflow. The quote form is exempt from click-away so a
  stray click can't throw away what someone typed; Escape or × still
  close it.
- **Smaller fixes:** text inputs now fill their pill's full height as a tap
  target (was 18px); the search pill matches the chat pill's height; the
  text-link CTA got a taller hit area; the Survey/Quote dismiss × uses the
  same icon as the bar's other controls instead of a tiny text glyph; empty
  utility/control zones no longer reserve a gap in the row.

## Open questions and caveats

- **Phones change the composition, not just the size.** Below 480px the
  inline "Ask a question" field becomes a single round chat button that
  opens the corner window directly (see Quality-of-life pass), and a
  Survey/Quote prompt gets its own row. Beyond that, anything still too
  long ends in an ellipsis rather than clipping or overflowing — a graceful
  failure, not a design recommendation. The "Mobile Compact" preset
  (shorter copy: "Test Drive" + a chat icon) remains the intended pattern
  for narrow viewports. The Quote copy ("Welcome back. Ready for pricing on
  the Aurelia GT?") is long enough to hit the two-line cap on the smallest
  phones; shorter copy would read better there.
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

## Accessibility

Reduced motion is respected throughout: entrance, takeover, and step
animations, the ticker, and message rotation all become instant or static
when `prefers-reduced-motion: reduce` is set. Every control is
keyboard-reachable with a visible focus state; Escape and clicking away
close popovers; collapsed content is made `inert` immediately so focus
can't land on hidden controls; closing the chat window returns focus to the
bar; and the quote form moves focus to each step's heading and to the first
invalid field, with each error tied to its field via `aria-describedby`.
Chat and search triggers are 44px. Every other control in the bar, chat
window, and quote form measures at least 27px in its smaller dimension (the
smallest are the quote form's Back and Edit links), which clears the WCAG
2.2 minimum of 24px; the one smaller target, the "Privacy Statement" link
inside the consent sentence, falls under that guideline's exception for
links within a line of text. Moving content (ticker, rotating messages)
pauses on hover and focus.
