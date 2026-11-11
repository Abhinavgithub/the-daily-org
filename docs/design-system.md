# Design system

How the paper looks, and the rules that keep it looking that way. Read this before changing a page, a component or a style, and keep to it. If a change needs something that is not here, add it here in the same change: a new token, a new component, a new state.

The tokens are in `src/styles/_tokens.scss`; the paper's three own colours are set in `src/lib/theme.ts` (and may be overridden by `colours` in `paper.config.ts`). Which partial styles which page is in [code-map.md](code-map.md).

## The idea

A printed broadsheet, on a screen. One sheet of newsprint lying on a desk; stories set in columns and parted by rules; a nameplate, a folio, flags and small capitals. Everything follows from that:

- **Rules, not boxes.** Stories and sections are parted by hairlines. Nothing on the sheet is a card with a background, a shadow or a rounded corner.
- **Square.** Every corner is square.
- **Ink and paper, and little else.** Colour is used to mean something, never to decorate.
- **Quiet.** Nothing moves except a colour under the pointer, a panel opening, and the page turning between editions.

If a design would look at home in a web application's dashboard, it is wrong for the paper.

## Colour

Use a colour for its role. Never write a colour value in a partial: every colour is a token, and each has a light and a dark value.

| Token | Role | Light | Dark |
|---|---|---|---|
| `--desk` | Behind the sheet | `#c8bda6` | `#0d0c0a` |
| `--paper` | The sheet | `#f1ebdd` | `#191713` |
| `--surface` | A field, a floating note, a diagram's box | `#faf6ec` | `#24211b` |
| `--wash` | Behind something chosen or pointed at: an edition's day, a hovered tool | `#e8e0cd` | `#2e2a22` |
| `--ink` | Text, headlines, heavy rules, a pressed control | `#1c1a16` | `#ebe5d6` |
| `--muted` | Secondary text: bylines, dates, labels, captions | `#5a5346` | `#b0a896` |
| `--rule` | Hairlines between things. Decoration only | `#cdc4ae` | `#3e392f` |
| `--control` | The outline of anything pressed or typed in | ink 55% on paper | the same |
| `--edge` | The sheet's border, a floating note's border | ink 38% | the same |
| `--sky` | Links, and the focus ring | `#2c5878` | `#9cc3e0` |
| `--sun` | The paper's own voice: "What to do", a mark in a list, a diagram's numbers, the Bulletin's count | `#8f4a08` | `#f0a85a` |
| `--alarm` | A failure of the service, and a share price that fell. Nothing else | `#b3261e` | `#ff6b5e` |
| `--rise` | A share price that rose | `#1f7a3d` | `#5fc27e` |

Rules:

- Text is `--ink` or `--muted`. Both pass 4.5 to 1 on `--paper` and `--surface` in both themes; a new text colour must too.
- `--rule` is too faint to show where a control is. A button, a field or a chip is outlined in `--control` (3 to 1 or better).
- Never fade text with `opacity` to make it quieter: use `--muted`. Faded text fails contrast.
- A headline is a link but is set in `--ink`, not `--sky`; it turns `--sky` and underlined under the pointer. Links inside running text and small utility links are `--sky` and underlined.
- Dark mode is a second palette, not an inversion. A new token gets both values, in `:root` and in the `dark` mixin. Check every change in both themes.

## Type

Three faces, each with one job. All are served from the site.

| Token | Face | For |
|---|---|---|
| `--nameplate` | Chomsky | The paper's name, and nothing else |
| `--headline`, `--text` | Newsreader | Headlines, decks, reading text, the paper's questions (in italic) |
| `--display` | Libre Franklin | Labels, navigation, controls, figures, anything in capitals |

The scale. Every `font-size` is one of these; do not write a size.

| Token | Size | For |
|---|---|---|
| `--fs-nameplate` | clamp(2.6rem, 8vw, 4.75rem) | The nameplate on an edition. Other pages set it smaller (`.masthead--inner`) |
| `--fs-lead` | clamp(2rem, 3.4vw, 2.75rem) | The lead story's headline |
| `--fs-title` | 2rem | A page's own large title |
| `--fs-headline` | 1.25rem | A story's headline; a lead's deck |
| `--fs-sub` | 1.125rem | A headline in a list: a notice, a year in the Archive |
| `--fs-deck` | 1.0625rem | A deck, a brief's headline, a question the paper asks |
| `--fs-body` | 1rem | Reading text |
| `--fs-label` | 0.8125rem | Labels, bylines, navigation, controls |
| `--fs-small` | 0.75rem | Capitals: flags, the folio, a section's name. Nothing is smaller |

Rules:

- Headlines: Newsreader, weight 700, `letter-spacing: -0.005em`, line-height 1.2 to 1.25.
- Reading text: Newsreader, weight 400, line-height 1.5, at most about 46rem wide.
- Capitals: Libre Franklin, weight 600 or 700, `letter-spacing: var(--caps)`, usually `--fs-small` and `--muted`. Capitals are for labels of a word or three, never for a sentence.
- Text is set ragged right. Nothing is justified.
- Figures that line up (prices, counts, dates in a column) take `font-variant-numeric: tabular-nums`.
- Headings go in order, h1 to h2 to h3, with no level skipped. Each page has one h1, in the masthead.

## Space and layout

- The sheet is `--width` (78rem) at most, with `--gutter` between its edge and its content.
- A front page is three columns with a 2.25rem gap; two under 64rem; one under 44rem. `src/lib/pack.ts` places the stories.
- A ledger page (Bulletin, Deadlines, Archive, Stats) is one column of 62rem: each section's name in an 11rem margin, its content beside it. Under 44rem the name goes above.
- Steps of space for new work: `--space-1` to `--space-6` (0.25, 0.5, 0.75, 1, 1.5, 2.25rem). Older rules use values near these; bring them to a step when you touch them.
- Breakpoints, and only these: 64rem (three columns to two), 46rem (the masthead's ears and share price go), 44rem (one column, filters on two lines, ledger names above), 40rem (the release edition's lists). The narrow rules live in `_narrow.scss`, last in the cascade.
- Nothing scrolls sideways at 320px.

## Rules, corners and depth

- Three rules: 1px `--rule` between items; 2px `--ink` to head a section or a list; 3px double `--ink` to close the masthead's filter bar. A section is not headed twice.
- `border-radius: 0` everywhere. A circle is allowed for a radio's mark and the round "why read this" icon. Diagram boxes are 2px.
- Shadows: `--shadow-sheet` on the sheet, `--shadow-2` on a note floating over the page. Stories and sections have none.

## Components

Use what exists. Add a component only when none of these fits, and add it here.

| Component | Class | What it is |
|---|---|---|
| Flag | `.flag` | A word or two reversed out of ink: the heaviest mark. A date, a kind of alert, Must-read. One to an item |
| Quiet flag | `.flag.flag--quiet` | The same, ruled and not filled: the second of two ranks (Recommended) |
| Label | `.deadlines__label`, `.contents__mark` | Capitals in `--sun`: the paper speaking in its own voice |
| Chip | `.chip` | A small ruled control. Pressed, it fills with ink |
| Tabs | `.tabs` | The parts of the paper: News, Bulletin, Deadlines, Archive. On every page |
| Filter bar | `.filters` | Plain words; the chosen one bold and underlined. Its choice is kept in the address |
| Story | `.story` | Mark, byline, headline, deck, diagram, text, "Read the original", votes. In that order |
| Briefs | `.briefs` | A ruled list of headlines with a sentence each |
| Ledger row | `.ledger__row` | A section named in the margin |
| Notice | `.bulletin__item` | Flag, headline, a line of facts, text. Used by the Bulletin and the Deadlines |
| Disclosure | `details` | For what most readers will skip. Its summary is a `--sky` label |
| Tool | `.tool`, `.search` | A 2.5rem square button; the search field with its button |
| Votes and report | `.verdict` | The paper's question in italic, two square buttons, a panel that opens beneath |
| Diagram | `.fig` | Line art drawn by code in ink and `--sun`. No photographs, no decoration |

## States

Every control has all of these, and they look the same everywhere.

| State | How it looks |
|---|---|
| Hover | The border darkens to `--ink`, or the text turns `--sky`; a tool takes `--wash` |
| Focus | `outline: 2px solid var(--sky); outline-offset: 2px`. Never removed without a replacement as strong |
| Pressed, chosen | Filled with `--ink`, text in `--paper`; in navigation, bold with a 2px ink underline. Marked with `aria-pressed` or `aria-current` |
| Disabled | 55% opacity, the default cursor |
| Busy | The progress cursor, and the words change ("Sending…") |
| Read | A headline already followed turns `--muted` |
| Empty | A plain sentence saying what is not there, and where to go |
| Failed | A sentence saying what happened and what to do; what the reader typed is kept |

Colour is never the only sign: a pressed control is also bold or filled, a count is also named when read aloud.

## Motion

- A colour or a border changes over `--ease` (120ms). A panel opens in 160ms. The page turns only between two editions.
- Nothing loops, bounces or slides in. Nothing moves that the reader did not cause.
- All of it is inside `@media (prefers-reduced-motion: no-preference)`, or switched off under `reduce`.

## Accessibility

The paper meets WCAG 2.2 AA. A change that breaks any of these is not finished.

- Contrast: text 4.5 to 1, a control's outline and large text 3 to 1, in both themes.
- Anything pressed is at least 24px by 24px, and on a touch screen takes a press of about 40px or more (`@media (pointer: coarse)` in `_narrow.scss` and `_feedback.scss`).
- Everything works from the keyboard, in the order it is read. The skip link goes to `#main`, which every page's `<main>` carries.
- A control with no words has an `aria-label`. A link that opens a new tab says so.
- Words hidden from the eye but kept for a screen reader use `.visually-hidden`, never `display: none`.

## Before a change is done

1. It uses tokens: no colour value, no font size, no radius written in a partial.
2. It reuses a component above, or adds one to this page.
3. Look at it at 1280px and 390px, in the light theme and the dark.
4. `npm test && npm run check && npm run lint`.
