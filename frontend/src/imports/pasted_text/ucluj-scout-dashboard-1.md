Design a professional football analysis web application called "UCluj Scout" built exclusively for FC Universitatea Cluj (U-Cluj), the Romanian football club from Cluj-Napoca.

This is an internal tool used by real coaches and players. It must feel serious, confident, and purposeful — like something built by a top European club's analytics department. It should not look like a generic app template, a student project, or anything AI-generated. Every design decision should feel intentional and human.

---

BRAND IDENTITY — U-CLUJ

U-Cluj's official colors are navy blue and white, with gold used as a prestige accent. These must be used faithfully and consistently throughout the app.

Primary brand color: #1A3A6B (deep navy blue — dominant, used for headers, sidebars, key UI surfaces)
Secondary brand color: #FFFFFF (white — text on dark surfaces, clean space)
Accent: #C9A84C (muted gold — not bright yellow, more like a trophy or medal tone — used sparingly for highlights, active states, CTAs)
Dark background: #0B0F1A (near-black with a blue undertone, not pure black)
Card/surface: #111827
Subtle border: #1E2D45
Body text on dark: #CBD5E1
Muted text: #64748B

Light mode surfaces: #F8FAFC (cool off-white, not warm), #FFFFFF for cards
Light mode text: #0F172A
Light mode accent surfaces: #EFF4FF

The U-Cluj crest should appear in the top-left of the navigation bar. Use a placeholder shield shape in navy with a gold "U" monogram if the actual crest is unavailable.

---

DESIGN PHILOSOPHY — WHAT THIS SHOULD FEEL LIKE

Reference points: Opta Pro, StatsBomb, UEFA's internal tools, Football Manager's scouting interface. Not Dribbble. Not a SaaS landing page. Not a mobile fitness app.

- Density over whitespace. This is a data tool. Pack information intelligently without making it feel cramped.
- No decorative gradients, no glowing blobs, no big hero illustrations.
- No rounded pill buttons unless for small tags/labels. Prefer sharp or subtly rounded (4px) rectangles for primary actions.
- No drop shadows that look "floaty." Use border-based separation or very subtle elevation (1–2px shadow max).
- Tables, grids, and structured layouts are preferred over card grids where data is involved.
- Typography should be clean and utilitarian — Inter or IBM Plex Sans. No display fonts, no thin weights on small text.
- Monospaced font for numbers and statistics only (e.g. IBM Plex Mono or Tabular Nums feature in Inter).
- Icons: Phosphor Icons or Lucide — outline, 1.5px stroke weight. Never filled unless indicating an active state.
- Transitions and hover states should be subtle — 150ms ease. Nothing bouncy or elastic.

---

COLOR MODES

Dark Mode (default — this is the primary mode for match prep and evening sessions):
- Page background: #0B0F1A
- Sidebar/nav: #0F1623
- Card surface: #111827
- Elevated surface (modals, drawers): #1A2438
- Border: #1E2D45
- Primary text: #E2E8F0
- Secondary text: #64748B
- Accent (gold): #C9A84C
- Active/selected: #1A3A6B with a left gold border indicator
- Success (W): #16A34A
- Draw (D): #475569
- Loss (L): #DC2626

Light Mode:
- Page background: #F1F5F9
- Sidebar/nav: #FFFFFF with a right border #E2E8F0
- Card surface: #FFFFFF
- Border: #E2E8F0
- Primary text: #0F172A
- Secondary text: #64748B
- Accent: #B8922A (slightly darker gold for legibility on light)
- Active/selected: #EFF4FF with a left gold border indicator

Mode toggle: a minimal icon button (sun / moon) in the top-right nav bar. No label needed. The icon itself is enough.

---

LANGUAGE TOGGLE

Place a compact "RO / EN" text switcher next to the dark/light toggle in the top-right nav. The active language should be in the gold accent color and slightly heavier weight. The inactive one is muted gray. No border, no pill — just two text labels separated by a slash. Clean and discreet.

---

NAVIGATION

Left sidebar, fixed, narrow (64px icon-only, expands to 220px on hover or toggle).

Nav items (top to bottom):
- U-Cluj crest / logo (top, always visible)
- Dashboard (home icon)
- Opponent Analysis (crosshair or magnifier icon)
- My Assignments (player with arrow icon) — visible only to players
- Squad Assignments (group icon) — visible only to coaches
- Match Library (film reel or folder icon)
- Settings (gear icon, bottom of sidebar)

Role badge shown just below the avatar in the top-right corner of the nav bar: a small pill label — "COACH" in gold or "PLAYER" in slate blue — distinguishing the two interface modes.

---

SCREENS TO DESIGN

--- SCREEN 1: Home / Dashboard ---

Left: sidebar (dark navy, icon-only by default)
Top bar: U-Cluj crest + "UCluj Scout" wordmark (left), page title center, role badge + language toggle + dark/light toggle + user avatar (right)

Main content area:
- A "Next Match" banner at the top — showing the upcoming opponent's crest, name, date, competition name, and a "Begin Analysis" CTA button in gold
- Below: a 2-column grid of recent opponent analysis sessions — each shown as a compact row item (not a big card): opponent crest, name, date analyzed, formation used, a row of 5 W/D/L result pills for recent form
- A narrow right panel: quick stats for the last analyzed team (possession avg, goals scored/conceded, pressing intensity indicator)

--- SCREEN 2: Opponent Overview — Pitch & Formation ---

Layout: full-width content area with a left info panel (280px) and an optional right drawer (360px, hidden by default).

Left panel:
- Opponent club crest (large, top of panel)
- Club name and country
- Typical formation label (e.g. "4-3-3")
- Last 5 results as W/D/L pills in a row
- Key stats: avg possession, avg shots on target, pressing intensity, set piece threat rating
- A "Notes" section where the coach has left freeform text

Center: interactive football pitch
- Top-down view, realistic proportions
- Pitch surface: dark green (#1A3D2B) with white line markings — not a cartoon or flat illustration
- Players shown as circular nodes: navy fill (#1A3A6B), white jersey number, name in small caps below
- Selected player: gold border glow, slightly enlarged
- Coach view: small "+" icon on each node
- Connector lines for assigned matchups: gold, 1.5px, slightly dashed, with small arrows indicating direction

Right drawer (slides in on player click):
- Player name and position (large, top)
- Season stats in a structured table: Goals, Assists, Xg, Pass Acc%, Duels Won%, Aerial Duels, Distance Covered
- A small heatmap thumbnail (placeholder image, realistic style)
- Key strengths listed as compact tags (e.g. "Set Pieces", "Through Balls", "High Press")
- Coach view only: an "Assign Player" button at the bottom of the drawer

--- SCREEN 3: Coach — Assignment Modal ---

Triggered by clicking "Assign Player" in the right drawer or the "+" icon on a player node.

Modal design:
- Dark elevated surface (#1A2438), sharp corners (4px radius), subtle border
- Header: opponent player's name and position
- A dropdown or inline list to select which UCluj player(s) to assign
- A text area for the coach to write a specific tactical note for this matchup
- A "Confirm Assignment" button (gold, full-width at bottom)
- A secondary "Cancel" link (no button, just text)

Once assigned, the connector line appears on the pitch and a small checkmark indicator replaces the "+" on that player node.

Bottom-right of the pitch view: a persistent "Send to Players" button — gold, slightly elevated, with a send/arrow icon. On click, a small popover appears with three options:
- Push Notification
- In-App Message
- AI Summary (generates a short tactical briefing from all assignments)

--- SCREEN 4: Player View — My Assignments ---

This screen should also be shown in a mobile frame (390px wide) as players will primarily use this on their phones.

Top: role badge shows "PLAYER", name of the player logged in
Main content: a simplified pitch showing only the player's position and their assigned opponent(s) — highlighted in gold, all others dimmed/gray

Below the pitch:
A card titled "Your Assignment" containing:
- Opponent player name, position, club
- Stats most relevant to the matchup (e.g. if facing a winger: dribbles per game, crossing accuracy, preferred foot)
- Key strengths tags
- Coach's note in a blockquote-style text block (slightly indented, italic, subtle left border in gold)

Mobile layout: stack everything vertically, pitch shown at reduced size with only essential information visible.

---

COMPONENTS TO INCLUDE (design as reusable variants)

- Navigation sidebar (collapsed / expanded / dark / light)
- Top navigation bar (coach variant / player variant / dark / light)
- Pitch component (full / simplified / dark only)
- Player node (default / selected / assigned / coach-view with + icon)
- Connector line (unidirectional matchup line with arrow)
- Right drawer / side panel (open / closed)
- Stat row (label + value + optional trend arrow up/down)
- W/D/L result pill (Win / Draw / Loss)
- Assignment modal
- "Send to Players" popover
- Role badge (Coach / Player)
- Language switcher (RO active / EN active)
- Dark/light mode toggle button
- Compact opponent row item (for dashboard list)

---

WHAT TO AVOID

- No gradients on text
- No bright neon or oversaturated colors
- No large empty hero sections
- No stock illustration or decorative SVG blobs
- No playful or rounded display typography
- No card shadows that look "material design 2014"
- No generic sports emoji or clip-art style icons
- No blue that reads as "tech startup" — keep it grounded in the navy brand color
- No AI-looking UI patterns (glassmorphism, aurora backgrounds, floating cards with no grid logic)

This tool is used by real football professionals. Every pixel should earn its place.