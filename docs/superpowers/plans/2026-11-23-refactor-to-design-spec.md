# Refatoração para DESIGN.md Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the financial planner application with the DESIGN.md specification — implementing the correct navigation structure, dashboard layout, KPI cards, month picker, mobile bottom nav, and visual system tokens.

**Architecture:** The project already uses Next.js 15 App Router with TypeScript, Tailwind CSS v4, Supabase Auth, and Prisma. This plan refactors existing components to match the DESIGN.md spec by updating: (1) design tokens in globals.css to match the spec exactly, (2) Sidebar/SidebarRail navigation structure per spec, (3) Dashboard layout with 4 KPIs, cash flow chart, budget progress, recent activity, (4) Mobile bottom nav with FAB for "Novo lançamento", (5) Month picker with accessibility, (6) Button and Card components to use semantic tokens.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4 (CSS-first config), Supabase, Prisma, Recharts, date-fns, lucide-react

**Spec:** `DESIGN.md` (in project root)

## Global Constraints

- **Color tokens:** Must match DESIGN.md Table 5 exactly (background #F5F7FB/#0B1220, surface #FFFFFF/#111B2C, text #101828/#F1F5F9, text-muted #475569/#B4C1D4, border #DCE3EC/#344259, control-border #64748B/#8091AB, primary #1D4ED8/#93C5FD, on-primary #FFFFFF/#0B1220, positive #047857/#6EE7B7, negative #B42318/#FDA4AF, warning #92400E/#FCD34D, focus #1D4ED8/#93C5FD)
- **Typography:** Inter with system fallback. Title 28/36px desktop, 24/32px mobile. Section title 18/26px. Body 16/24px. Auxiliary 14/20px. Values 24/32px tabular nums weight 650-700.
- **Spacing:** 4, 8, 12, 16, 24, 32, 48px. Card radius 16px, padding 16-24px. Control radius 10px. Icons 20px with 44×44px hit area.
- **Transitions:** 140-200ms. Respect `prefers-reduced-motion`.
- **Z-index:** dropdown 100, sticky 200, fixed 300, modal-backdrop 400, modal 500, popover 600, tooltip 700, toast 800.
- **Breakpoints per spec:** 320-479px (mobile), 480-767px (mobile wide), 768-1199px (tablet), ≥1200px (desktop)
- **Content max-width:** 1440px centered
- **Portuguese (Brazil):** Dates dd/MM/yyyy, months in Portuguese, currency R$ 1.250,00, calculations in integer cents
- **Accessibility:** WCAG 2.2 AA. Focus visible 2px solid focus color with 2px offset. Skip link. ARIA labels for icon buttons. `aria-current="page"` on active nav. Table equivalent for charts.
- **Hide values:** Masks numbers in cards, transactions, axes, tables, tooltips, toasts, accessible names. Persists across sessions. Form value field stays visible during entry.

## Review Focus

1. **Theme switching with localStorage sync** — Flash of wrong theme on load; spec requires inline script in `<head>` to set theme before paint. Test: hard refresh in both themes, verify no flash.
2. **Month picker persistence across navigation** — localStorage key `selectedMonth`/`selectedYear` must persist when navigating Dashboard ↔ Lançamentos ↔ Planejamento. Test: change month in Dashboard, navigate to Lançamentos, verify month preserved.
3. **Mobile bottom nav FAB positioning** — FAB at `absolute -top-3 left-1/2 -translate-x-1/2` must not overlap safe area on notched devices. Test: iPhone SE / iPhone 14 Pro in browser dev tools.
4. **Sidebar rail vs drawer on tablet (768-1199px)** — Rail shows icons only; "Mais" button opens drawer with labels. Test: resize to 800px, verify rail icons + drawer behavior.
5. **Hide values in tooltips and toasts** — When `Ocultar valores` is on, chart tooltips and toast amounts must show `••••••`. Test: enable hide values, hover cash flow chart, verify tooltip shows masked values.

---

### Task 1: Update Design Tokens in globals.css

**Files:**

- Modify: `meu-planner-financeiro/src/app/globals.css:1-341`

**Interfaces:**

- Consumes: None (foundation task)
- Produces: All semantic CSS custom properties used by every component

- [ ] **Step 1: Verify current tokens against DESIGN.md Table 5**

Compare each token in `:root` and `.dark` blocks with spec values. List discrepancies.

- [ ] **Step 2: Update `:root` (light theme) tokens to match spec exactly**

```css
:root {
  --background: #f5f7fb;
  --surface: #ffffff;
  --text: #101828;
  --text-muted: #475569;
  --border: #dce3ec;
  --control-border: #64748b;
  --primary: #1d4ed8;
  --primary-hover: #1e40af;
  --on-primary: #ffffff;
  --positive: #047857;
  --positive-bg: #ecfdf5;
  --positive-border: #a7f3d0;
  --negative: #b42318;
  --negative-bg: #fef2f2;
  --negative-border: #fecaca;
  --warning: #92400e;
  --warning-bg: #fffaeb;
  --warning-border: #fde68a;
  --transfer: #7c3aed;
  --transfer-bg: #f5f3ff;
  --transfer-border: #ddd6fe;
  --focus: #1d4ed8;
  --focus-ring: rgba(29, 78, 216, 0.2);
  /* ... rest unchanged but verify ... */
}
```

- [ ] **Step 3: Update `.dark` tokens to match spec exactly**

```css
.dark {
  --background: #0b1220;
  --surface: #111b2c;
  --text: #f1f5f9;
  --text-muted: #b4c1d4;
  --border: #344259;
  --control-border: #8091ab;
  --primary: #93c5fd;
  --primary-hover: #bfdbfe;
  --on-primary: #0b1220;
  --positive: #6ee7b7;
  --positive-bg: #064e3b;
  --positive-border: #065f46;
  --negative: #fda4af;
  --negative-bg: #7f1d1d;
  --negative-border: #991b1b;
  --warning: #fcd34d;
  --warning-bg: #78350f;
  --warning-border: #92400e;
  --transfer: #a78bfa;
  --transfer-bg: #3b0764;
  --transfer-border: #581c87;
  --focus: #93c5fd;
  --focus-ring: rgba(147, 197, 253, 0.3);
  /* ... rest unchanged but verify ... */
}
```

- [ ] **Step 4: Verify @media (prefers-color-scheme: dark) block matches .dark**

- [ ] **Step 5: Verify @theme inline mappings reference correct CSS variables**

- [ ] **Step 6: Run dev server and verify both themes render correctly**

```bash
cd meu-planner-financeiro && pnpm dev
```

Expected: No console errors, both themes apply correct colors.

- [ ] **Step 7: Commit**

```bash
git add meu-planner-financeiro/src/app/globals.css
git commit -m "refactor: update design tokens to match DESIGN.md spec"
```

---

### Task 2: Refactor Sidebar Navigation Structure

**Files:**

- Modify: `meu-planner-financeiro/src/components/layout/Sidebar.tsx`
- Modify: `meu-planner-financeiro/src/components/layout/SidebarRail.tsx`

**Interfaces:**

- Consumes: Updated design tokens from Task 1
- Produces: Navigation components matching DESIGN.md §2 architecture

- [ ] **Step 1: Update Sidebar.tsx mainNavigation and moreNavigation per DESIGN.md Table 2**

```tsx
const mainNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Lançamentos', href: '/lancamentos', icon: CreditCard },
  { name: 'Contas', href: '/contas', icon: Wallet },
  { name: 'Caixinhas', href: '/caixinhas', icon: PiggyBank },
  { name: 'Planejamento', href: '/planejamento', icon: Calendar },
];

const moreNavigation = [
  { name: 'Categorias', href: '/categorias', icon: Tag },
  { name: 'Instituições', href: '/instituicoes', icon: Building2 },
  { name: 'Preferências', href: '/preferencias', icon: Settings },
];
```

Remove `User`, `LogOut`, `Plus`, `Menu`, `ChevronLeft`, `ChevronRight` imports not used here.

- [ ] **Step 2: Ensure active item has `aria-current="page"`, background, indicator per spec**

Verify lines 100-122: `isActive` logic, `bg-sidebar-active border border-sidebar-active-border text-sidebar-icon-active shadow-sm`, `aria-current={isActive ? 'page' : undefined}`.

- [ ] **Step 3: Update SidebarRail.tsx for tablet (768-1199px) per DESIGN.md §2**

- Rail width: 72px (`w-18` not `w-16`)
- Icons only with accessible names (`aria-label={item.name}`)
- "Mais" button opens drawer with labels visible
- Keep `onOpenDrawer` prop for mobile drawer integration

- [ ] **Step 4: Verify collapsed/expanded transitions use `transition-all duration-300`**

- [ ] **Step 5: Test at 320, 768, 1024, 1200, 1440px viewports**

```bash
cd meu-planner-financeiro && pnpm dev
```

Expected: Sidebar works at all breakpoints, rail at tablet, drawer on mobile.

- [ ] **Step 6: Commit**

```bash
git add meu-planner-financeiro/src/components/layout/Sidebar.tsx meu-planner-financeiro/src/components/layout/SidebarRail.tsx
git commit -m "refactor: update sidebar navigation to match DESIGN.md architecture"
```

---

### Task 3: Refactor Dashboard Layout and KPI Cards

**Files:**

- Modify: `meu-planner-financeiro/src/app/(dashboard)/PageClient.tsx`
- Modify: `meu-planner-financeiro/src/components/ui/KPICard.tsx`

**Interfaces:**

- Consumes: Dashboard data types from `@/types`, design tokens from Task 1
- Produces: Dashboard matching DESIGN.md §3 composition and KPI specs

- [ ] **Step 1: Update KPICard.tsx to match DESIGN.md §3.2 indicator specs**

Four variants: `available`, `caixinhas`, `income`, `expense` with:

- Title, value, contextual description (not generic)
- Action with explicit label: "Ver contas", "Ver caixinhas", "Ver entradas", "Ver saídas"
- Trend only when `hasComparison` true, else "Sem base de comparação"
- Accent bar top (4px) in variant color
- Tabular nums for values, 24/32px weight 650-700

```tsx
// KPICard variantStyles updates
available: { accentBar: 'bg-primary', iconBg: 'bg-primary/10', iconColor: 'text-primary', ... }
caixinhas: { accentBar: 'bg-positive', iconBg: 'bg-positive-bg', iconColor: 'text-positive', ... }
income: { accentBar: 'bg-positive', iconBg: 'bg-positive-bg', iconColor: 'text-positive', ... }
expense: { accentBar: 'bg-negative', iconBg: 'bg-negative-bg', iconColor: 'text-negative', ... }
```

- [ ] **Step 2: Update PageClient.tsx header per DESIGN.md §3.1**

Title "Dashboard", button "Novo lançamento", month picker, "Ocultar valores" toggle. Remove duplicate month picker in mobile (keep one responsive).

- [ ] **Step 3: Implement KPI grid per DESIGN.md §3.2 composition**

| Width      | KPIs      |
| ---------- | --------- |
| 320-479px  | 1 column  |
| 480-767px  | 2×2       |
| 768-1199px | 2×2       |
| ≥1200px    | 4 columns |

Use CSS grid: `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` with media queries for exact spec.

- [ ] **Step 4: Implement Fluxo de Caixa (2/3) + Planejamento (1/3) at ≥1200px**

`dashboard-grid` class: `grid-template-columns: 2fr 1fr` at ≥1200px, stacked below.

- [ ] **Step 5: Implement Atividade Recente full width at ≥1200px**

- [ ] **Step 6: Verify CashFlowChart and BudgetProgress integrate correctly**

CashFlowChart: grouped bars by calendar week (Mon-Sun), legend, real scale, "Ver dados" link.
BudgetProgress: "R$ X de R$ Y usados", "R$ Z disponíveis/acima", status badges per spec Table 6.

- [ ] **Step 7: Test all breakpoints with zoom and virtual keyboard**

```bash
cd meu-planner-financeiro && pnpm dev
```

Expected: Dashboard matches DESIGN.md Figures at all widths.

- [ ] **Step 8: Commit**

```bash
git add meu-planner-financeiro/src/app/\(dashboard\)/PageClient.tsx meu-planner-financeiro/src/components/ui/KPICard.tsx
git commit -m "refactor: dashboard layout and KPIs per DESIGN.md spec"
```

---

### Task 4: Refactor Mobile Bottom Navigation with FAB

**Files:**

- Modify: `meu-planner-financeiro/src/components/layout/MobileBottomNav.tsx`

**Interfaces:**

- Consumes: `onNewLaunch` callback from dashboard layout
- Produces: Mobile nav per DESIGN.md §2 tablet/mobile spec

- [ ] **Step 1: Update mainNavigation per DESIGN.md Table 2 mobile**

```tsx
const mainNavigation = [
  { name: 'Início', href: '/', icon: LayoutDashboard },
  { name: 'Lançamentos', href: '/lancamentos', icon: CreditCard },
  { name: 'Contas', href: '/contas', icon: Wallet },
  { name: 'Mais', href: '#mais', icon: Settings },
];
```

"Mais" is the 4th item, not a FAB target.

- [ ] **Step 2: Update moreItems per DESIGN.md §2 mobile**

```tsx
const moreItems = [
  { name: 'Novo lançamento', href: '#novo-lancamento', icon: Plus, action: true },
  { name: 'Caixinhas', href: '/caixinhas', icon: PiggyBank },
  { name: 'Planejamento', href: '/planejamento', icon: Calendar },
  { name: 'Categorias', href: '/categorias', icon: Tag },
  { name: 'Instituições', href: '/instituicoes', icon: Building2 },
  { name: 'Preferências', href: '/preferencias', icon: Settings },
];
```

"Novo lançamento" is FIRST in Mais panel, triggers `onNewLaunch`.

- [ ] **Step 3: FAB button "Novo lançamento" floating above nav at `absolute -top-3 left-1/2 -translate-x-1/2`**

Size: 48×48px (`h-12 w-12`) with `z-60`, shadow, hover scale. Accessible name "Novo lançamento". At narrow screens show "Lançar" label with `aria-label="Novo lançamento"`.

- [ ] **Step 4: Verify safe-area-inset-bottom padding on nav and panel**

`style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}` on both.

- [ ] **Step 5: Test at 320px, 390px, 480px with virtual keyboard**

```bash
cd meu-planner-financeiro && pnpm dev
```

Expected: FAB centered, panel slides up, no overlap with keyboard or safe area.

- [ ] **Step 6: Commit**

```bash
git add meu-planner-financeiro/src/components/layout/MobileBottomNav.tsx
git commit -m "refactor: mobile bottom nav with FAB per DESIGN.md"
```

---

### Task 5: Refactor Month Picker Component

**Files:**

- Modify: `meu-planner-financeiro/src/components/ui/MonthPicker.tsx`

**Interfaces:**

- Consumes: `month` (0-11), `year`, `onChange(month, year)`, `onGoToCurrent`
- Produces: Accessible month/year selector per DESIGN.md §2 período

- [ ] **Step 1: Verify trigger button shows "Mês atual" option in popover**

- [ ] **Step 2: Ensure month grid uses 3 columns, abbreviated names (Jan, Fev, ...)**

- [ ] **Step 3: Year grid uses 4 columns, range 2025-2030 (from `getYearRange`)**

- [ ] **Step 4: Keyboard navigation: arrows between months/years, Enter to select, Escape to close**

- [ ] **Step 5: ARIA: `aria-haspopup="dialog"`, `aria-expanded`, `role="dialog"` on popover, `aria-label` on trigger**

- [ ] **Step 6: Persist selection to localStorage (`selectedMonth`, `selectedYear`) — already in dashboard layout, verify picker doesn't duplicate**

- [ ] **Step 7: Test at all breakpoints, with screen reader (NVDA/VoiceOver)**

```bash
cd meu-planner-financeiro && pnpm dev
```

Expected: Picker opens, navigates by keyboard, announces correctly, persists.

- [ ] **Step 8: Commit**

```bash
git add meu-planner-financeiro/src/components/ui/MonthPicker.tsx
git commit -m "refactor: month picker accessibility and spec compliance"
```

---

### Task 6: Update Button Component to Use Semantic Tokens

**Files:**

- Modify: `meu-planner-financeiro/src/components/ui/Button.tsx`

**Interfaces:**

- Consumes: Design tokens from Task 1
- Produces: Button variants using semantic CSS variables

- [ ] **Step 1: Replace hardcoded Tailwind colors with semantic token classes**

```tsx
// Instead of: 'bg-primary-600 text-white hover:bg-primary-700'
// Use: 'bg-primary text-on-primary hover:bg-primary-hover'
const variants = {
  default: 'bg-primary text-on-primary hover:bg-primary-hover shadow-sm hover:shadow-md',
  destructive: 'bg-negative text-on-negative hover:bg-negative-hover shadow-sm hover:shadow-md',
  outline: 'border border-border bg-surface hover:bg-sidebar-hover',
  secondary: 'bg-surface text-text hover:bg-sidebar-hover border border-border',
  ghost: 'text-text hover:bg-sidebar-hover',
  link: 'text-primary underline-offset-4 hover:underline',
  success: 'bg-positive text-on-positive hover:bg-positive-hover shadow-sm hover:shadow-md',
};
```

Note: Need to add `--color-negative-hover`, `--color-positive-hover`, `--color-on-negative`, `--color-on-positive` to globals.css if not present.

- [ ] **Step 2: Add missing hover/active tokens to globals.css**

```css
--negative-hover: #991b1b; /* dark: #FCA5A5 */
--positive-hover: #059669; /* dark: #34D399 */
--on-negative: #ffffff; /* dark: #7F1D1D */
--on-positive: #ffffff; /* dark: #064E3B */
```

- [ ] **Step 3: Update sizes to match spec: default h-10 (40px), min 44×44px hit area**

`default: 'h-10 px-4 py-2 text-sm gap-2'` — verify 40px height.

- [ ] **Step 4: Verify focus-visible uses `--focus` with 2px offset**

`focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-surface`

- [ ] **Step 5: Test all variants in both themes**

```bash
cd meu-planner-financeiro && pnpm dev
```

Expected: Buttons use semantic colors, focus ring visible, loading state maintains label space.

- [ ] **Step 6: Commit**

```bash
git add meu-planner-financeiro/src/components/ui/Button.tsx meu-planner-financeiro/src/app/globals.css
git commit -m "refactor: button component semantic tokens per DESIGN.md"
```

---

### Task 7: Update Card Component Variants

**Files:**

- Modify: `meu-planner-financeiro/src/components/ui/Card.tsx`

**Interfaces:**

- Consumes: Design tokens from Task 1
- Produces: Card variants using semantic tokens

- [ ] **Step 1: Align variants with globals.css utility classes**

```tsx
const variants = {
  default: 'rounded-xl bg-card border border-card-border shadow-sm', // uses .card from globals.css
  glass: 'rounded-xl card-glass', // uses .card-glass from globals.css
  elevated: 'rounded-xl bg-card border border-card-border shadow-lg', // uses .card-elevated
};
```

- [ ] **Step 2: Verify CardHeader, CardContent, CardFooter padding matches spec (16-24px)**

Current: `px-6 py-4` (24px horizontal, 16px vertical) — matches spec.

- [ ] **Step 3: Test card hover elevation (`.card:hover` in globals.css)**

- [ ] **Step 4: Commit**

```bash
git add meu-planner-financeiro/src/components/ui/Card.tsx
git commit -m "refactor: card component semantic tokens per DESIGN.md"
```

---

### Task 8: Verify and Fix Dashboard Data Integration

**Files:**

- Modify: `meu-planner-financeiro/src/app/(dashboard)/PageClient.tsx`
- Read: `meu-planner-financeiro/src/app/actions/dashboard/getDashboardData.ts`

**Interfaces:**

- Consumes: Dashboard action response, types from `@/types`
- Produces: Correct data display per DESIGN.md §3.3 rules

- [ ] **Step 1: Verify getDashboardData returns DashboardData matching DESIGN.md rules**

Check: "Disponível" = sum account balances - caixinha reserves (no double-count). "Em caixinhas" = total reserved. Month current = position today. Month closed = position at close. Month future = "Posição ainda indisponível".

- [ ] **Step 2: Verify comparison logic per DESIGN.md Table 6**

Month closed → compare with previous full month. Current month → compare up to same day of previous month (capped at last day). Base zero → omit percentage, show "Sem base de comparação".

- [ ] **Step 3: Verify cash flow weekly grouping (Mon-Sun, civil week)**

- [ ] **Step 4: Verify budget status: normal (<80%), warning (80-99%), limit (100%), over (>100%), none (no budget)**

- [ ] **Step 5: Test with sample data covering all states**

```bash
cd meu-planner-financeiro && pnpm dev
```

Expected: Dashboard shows correct values per spec rules.

- [ ] **Step 6: Commit**

```bash
git add meu-planner-financeiro/src/app/\(dashboard\)/PageClient.tsx
git commit -m "refactor: dashboard data integration per DESIGN.md rules"
```

---

### Task 9: Apply Patterns to Contas, Caixinhas, Planejamento Pages

**Files:**

- Modify: `meu-planner-financeiro/src/app/(dashboard)/contas/PageClient.tsx`
- Modify: `meu-planner-financeiro/src/app/(dashboard)/caixinhas/PageClient.tsx`
- Modify: `meu-planner-financeiro/src/app/(dashboard)/planejamento/PageClient.tsx`

**Interfaces:**

- Consumes: Updated UI components (Button, Card, MonthPicker), design tokens
- Produces: Pages consistent with DESIGN.md §4 patterns

- [ ] **Step 1: Contas page — "Nova conta" as local action, table layout per §4**

Header: title "Contas", description, "Nova conta" button. Table on desktop, vertical list on mobile. Filters inline when space, panel on mobile.

- [ ] **Step 2: Caixinhas page — "Nova caixinha" as local action per §4**

Header: title "Caixinhas", "Nova caixinha" button. List cards with progress. Aporte/resgate flow separate with "Disponível após a operação" preview.

- [ ] **Step 3: Planejamento page — month picker persisted, "Definir orçamento" action per §4**

Already has month picker. Verify it uses shared localStorage keys. "Novo item" → "Definir orçamento" when no budget exists.

- [ ] **Step 4: All forms use modal (desktop/tablet) or full-screen dialog (mobile) per DESIGN.md §6**

Max width 560px desktop, full-screen mobile. Header + actions visible during scroll. Focus management, escape to close, dirty form confirmation.

- [ ] **Step 5: Toasts per DESIGN.md §7 — bottom-right desktop, above nav mobile, max 2, aria-live="polite"**

- [ ] **Step 6: Test all pages at 320, 480, 768, 1024, 1200, 1440px**

```bash
cd meu-planner-financeiro && pnpm dev
```

Expected: Consistent patterns across all pages.

- [ ] **Step 7: Commit**

```bash
git add meu-planner-financeiro/src/app/\(dashboard\)/contas/PageClient.tsx meu-planner-financeiro/src/app/\(dashboard\)/caixinhas/PageClient.tsx meu-planner-financeiro/src/app/\(dashboard\)/planejamento/PageClient.tsx
git commit -m "refactor: apply DESIGN.md patterns to Contas, Caixinhas, Planejamento"
```

---

### Task 10: Accessibility and Quality Audit

**Files:**

- Review: All modified files

**Interfaces:**

- Consumes: All previous tasks
- Produces: WCAG 2.2 AA compliance verification

- [ ] **Step 1: Run automated accessibility audit (axe-core or similar)**

```bash
cd meu-planner-financeiro && pnpm test:a11y
```

Expected: No critical/major violations.

- [ ] **Step 2: Manual keyboard navigation test — Tab order, focus visible, skip link works**

- [ ] **Step 3: Screen reader test (NVDA/VoiceOver) — announcements, labels, hide values**

- [ ] **Step 4: Color contrast verification — 4.5:1 text, 3:1 large text/UI components**

- [ ] **Step 5: Reduced motion test — `prefers-reduced-motion: reduce` disables animations**

- [ ] **Step 6: Zoom test — 200% zoom, no horizontal scroll at 320px**

- [ ] **Step 7: Offline/poor network test — form preservation, toast behavior**

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: accessibility and quality audit per DESIGN.md §8"
```

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-11-23-refactor-to-design-spec.md`. Please review the plan. Which execution approach would you prefer?**

- **Subagent-driven** - A fresh subagent implements each task and a fresh reviewer checks it before the next one starts, then a whole-branch review at the end. Most thorough; costs a fresh context per task and per review.
- **Native** - I implement every task myself in this session, the way this harness runs work, then one fresh reviewer on the most capable model checks the whole branch. Cheapest and fastest; no independent review until the end. Runs well with a mid-tier session model, since the plan carries the design.

**For this plan I recommend Native, because the tasks are highly sequential (tokens → components → pages) with shared interfaces that benefit from single-context implementation, and a mistake would require rework across multiple files anyway. Does the plan capture what you want, and which approach should we use?**
