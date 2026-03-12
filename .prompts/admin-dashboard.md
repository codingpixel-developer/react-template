# Admin Dashboard Frontend Agent Prompt

> **Usage:** This prompt is designed to be used by any AI agent to build a production-grade admin dashboard UI. The agent must collect required inputs from the user before writing any code.

---

## Before Anything Else — Read `Agent.md`

**The very first action** the agent must take is to read `Agent.md` from the project root:

```
Agent.md    ← read this first, before any code, before any questions
```

`Agent.md` contains the general project overview, the full list of available skills, project-wide rules, and conventions the agent must follow throughout this task. Everything in `Agent.md` takes precedence over any defaults in this prompt.

Only after reading and internalizing `Agent.md` should the agent proceed to Step 1 below.

---

## Step 1 — Collect Required Inputs (Ask Before Coding)

Before writing a single line of code, the agent **must** ask the user for the following:

### 1.1 — Dashboard Screens

Ask the user:

> "Which screens/pages do you need for your admin dashboard? List all the screens you want built. Common examples include:
>
> - Overview / Home Dashboard
> - Analytics & Reports
> - Users Management
> - Products / Inventory
> - Orders / Transactions
> - Settings & Preferences
> - Notifications Center
> - Role & Permissions
> - Audit Logs
> - Support / Tickets
>
> Please list the screens you need, and for each one briefly describe what data or actions it should support (e.g. 'Users — view, search, ban, export')."

Wait for the user's answer. Do not proceed until confirmed.

---

### 1.2 — Color Scheme

Ask the user:

> "What color scheme would you like for the dashboard? You can:
>
> - **Pick a mood:** (e.g. Corporate Blue, Slate & Purple, Dark Midnight, Forest Green, Warm Amber)
> - **Provide hex values:** Primary color, accent color, background color
> - **Reference a brand:** (e.g. 'match our brand — primary is #FF5733')
> - **Choose a preset style:** Light / Dark / System-default
>
> Also let me know: should the sidebar be dark with a light main area, or fully dark, or fully light?"

Wait for the user's answer. Do not proceed until confirmed.

---

### 1.3 — Stack & Project Context (Pre-Configured — Do Not Ask)

The following are **fixed** for this project. The agent must not ask the user about these:

| Setting                       | Value                                                                                                    |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Framework**                 | React.js (no SSR/Next.js unless explicitly told)                                                         |
| **Styling**                   | Tailwind CSS                                                                                             |
| **Component approach**        | Reuse existing components first; create new custom components only when needed for the requested screens |
| **Skills/conventions source** | `.agent/skills/` folder in the project root                                                              |

#### Reading the Skills Folder

**Before writing any code**, the agent must read the project's skills files to understand structure and conventions:

| Task                                                          | Skill file                        |
| ------------------------------------------------------------- | --------------------------------- |
| Understand project structure, add pages, configure Vite       | `.agent/skills/architecture.md`   |
| Use or create UI components (Button, Modal, Input, etc.)      | `.agent/skills/components.md`     |
| Apply styles, work with CSS variables, Tailwind, SCSS         | `.agent/skills/styling.md`        |
| Implement auth, protect routes, work with tokens/API          | `.agent/skills/auth.md`           |
| Add Redux state, create slices, use hooks                     | `.agent/skills/state.md`          |
| Add images/icons/fonts, use standard image handling           | `.agent/skills/assets.md`         |
| Follow naming conventions and component size rules            | `.agent/skills/code-standards.md` |
| Navigate between pages, add new routes, update access control | `.agent/skills/routes.md`         |

**How to use the skills folder:**

1. Read every `.md` file in `.agent/skills/` at the start of the task
2. Use the existing component catalogue to identify what already exists before building anything new
3. Match the folder structure, file naming, and import path conventions exactly as documented
4. Respect any custom Tailwind config (custom colors, spacing, plugins) found in `styling.md` or `tailwind.config.js`
5. If a skills file documents a pattern (e.g. how forms are structured, how modals are triggered), follow that pattern for new components

**Component reuse decision tree:**

```
Does an existing component cover this UI need?
  ├── Yes → Use it as-is or extend via props
  ├── Partially → Compose it with wrapper/slot pattern, don't rewrite internals
  └── No → Create a new component in the appropriate folder per project.md conventions
```

New custom components must:

- Live in the folder the skills file specifies (e.g. `src/components/dashboard/`)
- Follow the existing naming convention (PascalCase, kebab-case filenames, etc.)
- Use Tailwind classes consistent with the existing styling patterns
- Be composable and accept standard props (className, children, etc.)

---

## Step 2 — Build a Mental Model of the System

Once inputs are collected and skills files are read, the agent should:

- **Catalogue existing components** relevant to the dashboard (cards, tables, buttons, badges, modals, inputs)
- **Map design tokens** from the user's color scheme to Tailwind config values or CSS custom properties already in the project
- **Plan the component architecture:** identify what's reused vs what needs to be built from scratch
- **Note project conventions:** import aliases, file structure, class ordering, prop patterns from the skills files

---

## Step 3 — Implementation Plan

Propose a concise plan before writing code, covering:

1. **Layout Shell** — Sidebar + Topbar + Main content area
2. **Shared Components** — Cards, Tables, Badges, Stat widgets, Charts
3. **Per-Screen Components** — Derived from the user's confirmed screen list
4. **Design Token Mapping** — How the user's color scheme maps to CSS custom properties

Get user approval on the plan before proceeding.

---

## Step 4 — Implementation Rules

### Architecture

**Stack:** React.js + Tailwind CSS. All components are `.jsx` or `.tsx` files.

**Before building anything:**

- Re-read `.agent/skills/` files to confirm folder structure and conventions
- Check the existing components catalogue — do not rebuild what already exists
- Check `tailwind.config.js` for custom colors/tokens before adding CSS variables

**General rules:**

- Extend existing components via props/composition before creating new ones
- New components go in the folder documented in `.agent/skills/project.md`
- Use `clsx` or `cn()` (whichever the project uses) for conditional class merging
- Use `cva` + `tailwind-merge` for new variant-based components if the project already uses this pattern — check skills files first
- Design tokens: prefer Tailwind config custom values (e.g. `bg-accent`) over raw CSS variables, unless the project uses CSS custom properties — follow whatever the skills files document
- Folder structure, file naming, and import aliases must match `.agent/skills/project.md` exactly

### Design System (Minimalist Modern)

Apply the following from the design system unless overridden by user's color scheme:

#### Colors

| Token                | Default Value    | Purpose              |
| -------------------- | ---------------- | -------------------- |
| `--background`       | `#FAFAFA`        | Main canvas          |
| `--foreground`       | `#0F172A`        | Primary text         |
| `--muted`            | `#F1F5F9`        | Secondary surfaces   |
| `--muted-foreground` | `#64748B`        | Secondary text       |
| `--accent`           | _(user-defined)_ | Primary action color |
| `--accent-secondary` | _(user-defined)_ | Gradient endpoint    |
| `--border`           | `#E2E8F0`        | Structural borders   |
| `--card`             | `#FFFFFF`        | Card surfaces        |
| `--sidebar-bg`       | _(user-defined)_ | Sidebar background   |

> Replace `--accent` and `--accent-secondary` with the user's chosen colors. Derive the sidebar background from the user's light/dark preference.

#### Typography

| Use                     | Font                           | Notes                            |
| ----------------------- | ------------------------------ | -------------------------------- |
| Page/section headlines  | `Calistoga, Georgia, serif`    | Warm, characterful display serif |
| Body, UI, labels        | `Inter, system-ui, sans-serif` | Clean and highly legible         |
| Badges, tags, monospace | `JetBrains Mono, monospace`    | Uppercase, wide tracking         |

#### Signature Gradient

Apply the user's primary + secondary accent colors as the gradient signature:

```css
background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
```

Use on: primary buttons, featured stat card borders, icon backgrounds, chart highlights, active sidebar items.

#### Shadows

| Level    | Value                           | Use                         |
| -------- | ------------------------------- | --------------------------- |
| `sm`     | `0 1px 3px rgba(0,0,0,0.06)`    | Subtle lift                 |
| `md`     | `0 4px 6px rgba(0,0,0,0.07)`    | Standard cards              |
| `lg`     | `0 10px 15px rgba(0,0,0,0.08)`  | Elevated panels             |
| `accent` | `0 4px 14px rgba(accent, 0.25)` | CTA buttons, featured items |

---

### Dashboard Layout Spec

#### Sidebar

- Width: `256px` collapsed → `72px` icon-only mode
- Background: `--sidebar-bg` (dark or light per user preference)
- Active item: gradient accent bar on left edge + accent-tinted background
- Section labels: uppercase monospace, `0.15em` letter-spacing, muted color
- User profile: pinned to bottom, avatar + name + role
- Hover: subtle background tint, icon scales `1.05x`
- Transition: `200ms ease-out` on all hover/active states

#### Topbar

- Height: `64px`
- Background: `--card` or `--sidebar-bg` depending on theme
- Contains: Page title (left), Search bar (center or right), Notifications icon, User avatar
- Bottom border: `1px solid var(--border)`
- Breadcrumb optional under title

#### Main Content Area

- Padding: `p-6` to `p-8`
- Max width: `max-w-7xl` centered when needed, full-bleed for tables
- Background: `--background`

---

### Per-Screen Patterns

For each screen the user requests, follow these implementation patterns:

#### Overview / Home Dashboard

- Top row: 4 KPI stat cards (gradient icon background, trend badge, delta vs last period)
- Middle: Main chart (line/area) full width + secondary metric (donut or bar)
- Bottom: Recent activity feed + Quick actions panel
- Stat card hover: lifts with `shadow-lg`, gradient overlay fades in

#### Analytics & Reports

- Date range picker in topbar area
- Chart grid: primary large chart + 2–3 supporting charts
- Data table below charts with export button
- Filter sidebar or top filter bar

#### Users / Entity Management

- Search + filter bar at top
- Data table: sortable columns, row hover highlight, bulk action bar appears on selection
- Row actions: View, Edit, Delete (icon buttons, tooltip on hover)
- Pagination: bottom of table
- Empty state: illustrated placeholder with CTA

#### Detail / Profile Pages

- Two-column layout: main info panel (2/3) + sidebar metadata panel (1/3)
- Breadcrumb navigation
- Tab navigation for sub-sections (Activity, Settings, Permissions)
- Action buttons in top-right of header area

#### Settings Pages

- Left subnav (within page) + right content panel
- Form groups with clear section headers
- Save/Cancel button bar pinned at bottom or top of form
- Danger zone section styled with subtle red border/tint

---

### Component Styling Rules

#### Cards

```
bg-[--card] rounded-xl border border-[--border] shadow-md
hover: shadow-xl + gradient overlay (accent/3 → transparent)
p-6 standard, p-8 for featured
```

#### Stat Cards

```
Icon: 48px container, gradient background (accent → accent-secondary), rounded-xl
Value: text-3xl font-semibold Inter
Label: text-sm muted-foreground
Trend badge: rounded-full, green/red tinted background, arrow icon + delta %
```

#### Tables

```
thead: bg-muted, text-xs uppercase tracking-wide muted-foreground
tbody rows: border-b border-[--border], hover:bg-muted/50
Selected rows: bg-accent/5 border-l-2 border-[--accent]
Actions column: opacity-0 group-hover:opacity-100
```

#### Badges / Status Chips

```
Rounded-full, px-3 py-1, text-xs font-medium
Success: green-100 text-green-700
Warning: amber-100 text-amber-700
Danger: red-100 text-red-700
Info/Default: accent/10 text-accent
Active indicator: pulsing dot (2s scale/opacity animation)
```

#### Buttons

```
Primary: gradient bg (accent → accent-secondary), white text, rounded-xl, shadow-sm
  hover: -translate-y-0.5, shadow-accent, brightness-110
  active: scale-[0.98]
Secondary: transparent bg, border border-[--border], rounded-xl
  hover: bg-muted, border-accent/30
Icon buttons: rounded-lg, muted-foreground → foreground on hover
```

#### Section Labels

```jsx
<div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5">
  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
  <span className="font-mono text-xs uppercase tracking-[0.15em] text-accent">
    Section Name
  </span>
</div>
```

---

### Animation Spec

| Interaction            | Duration           | Easing              | Effect                |
| ---------------------- | ------------------ | ------------------- | --------------------- |
| Hover (buttons, cards) | `200ms`            | `ease-out`          | Lift, shadow, color   |
| Page entrance          | `700ms`            | `[0.16, 1, 0.3, 1]` | Fade up 28px          |
| Stagger children       | `100ms` delay each | —                   | Sequential fade-up    |
| Sidebar collapse       | `300ms`            | `ease-in-out`       | Width transition      |
| Pulsing status dot     | `2s infinite`      | —                   | Scale + opacity pulse |
| Chart load             | `600ms`            | `ease-out`          | Draw animation        |

Respect `prefers-reduced-motion` — disable continuous animations, keep structural transitions.

---

### Responsive Strategy

| Breakpoint              | Sidebar             | Layout           | Tables            |
| ----------------------- | ------------------- | ---------------- | ----------------- |
| Mobile (`<768px`)       | Drawer (off-canvas) | Single column    | Horizontal scroll |
| Tablet (`768px–1024px`) | Icon-only collapsed | 2-column grids   | Full width        |
| Desktop (`>1024px`)     | Full expanded       | 3–4 column grids | Full features     |

- KPI stat cards: `grid-cols-2` mobile → `grid-cols-4` desktop
- Charts: full width on mobile, side-by-side on desktop
- Topbar: hamburger menu on mobile to toggle sidebar drawer

---

### Accessibility Requirements

- All interactive elements: `ring-2 ring-[--accent] ring-offset-2` on focus
- Color contrast: WCAG AA minimum (4.5:1 for text)
- Tables: proper `<th scope>`, `aria-sort` on sortable columns
- Sidebar: `aria-current="page"` on active nav item
- Modals/dialogs: focus trap, `aria-modal`, `role="dialog"`
- Touch targets: minimum `44px` height on all interactive elements
- Status badges: don't rely on color alone — include text label

---

## Step 5 — Output Format

When writing code, follow this order:

1. **Read `.agent/skills/`** — confirm existing components and folder structure before touching anything
2. **Layout shell** — only build `DashboardShell`, `Sidebar`, `Topbar` if they don't already exist in the project
3. **Shared components** — reuse existing ones; build new ones (StatCard, DataTable, Badge, Chart wrapper) only if missing
4. **Each screen** — one at a time, in the order the user prioritized them
5. **After each screen** — pause and ask: _"Happy with this? Should I adjust anything before the next screen?"_

All files are `.jsx` (or `.tsx` if the project uses TypeScript — check skills files). File names and folder placement must match `.agent/skills/project.md`.

When creating a new component, briefly note:

- Why it's new (not covered by existing components)
- Where it lives and why (per project structure)
- Any design system decisions made (color mapping, token usage)

---

## Reference — Design System Quick Card

> Full design system details are embedded in the agent's context. This is a quick reference for the core values.

| Token            | Value                                               |
| ---------------- | --------------------------------------------------- |
| Background       | `#FAFAFA`                                           |
| Foreground       | `#0F172A`                                           |
| Muted            | `#F1F5F9`                                           |
| Muted Foreground | `#64748B`                                           |
| Border           | `#E2E8F0`                                           |
| Card             | `#FFFFFF`                                           |
| Accent           | _User-defined_                                      |
| Accent Secondary | _User-defined_                                      |
| Gradient         | `linear-gradient(135deg, accent, accent-secondary)` |

**Font stack:** Calistoga (headlines) · Inter (UI/body) · JetBrains Mono (labels)

**Border radius:** `rounded-xl` (12px) standard · `rounded-2xl` (16px) featured · `rounded-full` badges

**Section spacing:** `py-8` inner content · `gap-5` to `gap-8` grid gaps

---

_End of prompt. The agent should not proceed past Step 1 without collecting user inputs for screens and color scheme._
