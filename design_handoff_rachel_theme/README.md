# רחל · "Operational Command" Theme — Handoff for Claude Code

## ⚠️ READ THIS FIRST — Scope

**This is a VISUAL RESTYLE only. DO NOT change any workflow, logic, data flow, or component behavior.**

The user's existing app at `github.com/morrisroth/rachel` already works. Your job is to:

✅ **Restyle** — replace CSS variables, refresh component visuals, update inline styles
❌ **Do NOT change** — Supabase queries, auth flow, form validation, state management, routes, props, navigation, or any of the `dbXxx` functions in `src/data.js`

If you're tempted to "improve" the workflow while you're in there: **don't**. The user explicitly asked for a design-only change.

---

## Overview

The app is a Hebrew RTL national inventory-reporting system ("רחל" / Rachel). It has two main roles — **FIELD_USER** (mobile + desktop) and **HQ_USER** (desktop dashboard) — and switches between "routine" and "emergency" national modes.

The existing design is inconsistent across screens (different gradients on each login, mixed visual vocabularies). This handoff applies a **single unified theme** across every screen.

## About the Design Files

The files in `reference-mockup/` are **design references created in HTML/JSX** — they are visual prototypes showing the intended look, not production code to copy directly.

Your job is to **port the visual decisions** (CSS variables, component shapes, layout patterns) into the existing React/Vite codebase at `rachel/project/`. The mockup uses inline React for fast prototyping; the real app uses proper React with Supabase — keep that structure intact.

## Fidelity

**High-fidelity (hifi).** Exact colors, typography, spacing, and component patterns are specified below. Recreate them pixel-accurately using the existing React components in the repo.

---

## The Design System — "Operational Command"

A calm, serious, modern aesthetic for a national logistics system. **No gradients on chrome.** Single accent color. Same vocabulary everywhere.

### Color tokens (drop-in replacement for `:root` in `rachel/project/index.html`)

See `tokens.css` in this folder for the full block — paste it into the existing `<style>` block in `index.html`, replacing the current `:root` declarations.

Key values:

| Token | Value | Role |
|---|---|---|
| `--paper` | `oklch(96% 0.010 80)` | Default background |
| `--paper-2` | `oklch(93.5% 0.012 80)` | Subtle panel background |
| `--surface` | `oklch(99% 0.005 80)` | Cards, inputs |
| `--ink` | `oklch(20% 0.012 80)` | Text, borders |
| `--ink-2` | `oklch(38% 0.012 80)` | Secondary text |
| `--ink-3` | `oklch(56% 0.012 80)` | Tertiary text, labels |
| `--brand` | `oklch(38% 0.08 165)` | Primary action, brand mark, focus |
| `--brand-bg` | `oklch(94% 0.030 165)` | Brand backgrounds |
| `--ok` | `oklch(48% 0.12 155)` | On-time status |
| `--warn` | `oklch(60% 0.14 65)` | Delay status |
| `--bad` | `oklch(52% 0.18 28)` | Critical / emergency |

### Type

- **`Heebo`** (already loaded in `index.html`) — all Hebrew + Latin text
- **`JetBrains Mono`** (already loaded) — numbers, timestamps, system tags

Type scale used in the design:

- **Hero numbers (KPIs):** 800 weight, 32px, tabular-nums, `letter-spacing: -.02em`
- **Page titles (H1):** 700 weight, 30px, `letter-spacing: -.02em`
- **Section headers (H2):** 700 weight, 22px, `letter-spacing: -.015em`
- **Panel headers (H3):** 600 weight, 15-16px
- **Body:** 14px Heebo regular
- **Labels (the "TAG" pattern):** 10.5px JetBrains Mono, 600, uppercase, `letter-spacing: .14em`, color `var(--ink-3)`
- **Input labels:** Same pattern as TAG but 10.5px

### Spacing & radii

- Radii: `--r-1: 4px` (inputs, chips), `--r-2: 8px` (cards), `--r-3: 12px` (modals)
- Borders: always 1px, never thicker
- **No shadows** except on modals and drawers (`var(--shadow-modal)`)

### Signature elements (repeated on every screen so the theme reads as ONE)

1. **The Crest** — used identically on every screen header. A 30×30 ink square (or brand-green in HQ) with the letter "ר", plus the name "רחל" + a 9.5px mono uppercase subtitle. See `Crest` in `src/components.jsx`.

2. **Mode Pill** — the "מצב חירום" / "שגרה" indicator. Pill-shaped, pulsing red dot for emergency, green for routine. Always in the top-right of every screen header.

3. **Mono Tag Labels** — every section starts with a tiny `01 · DASHBOARD`-style label. 10.5px mono uppercase, tracked 0.14em.

4. **Hero Numbers** — wherever a number matters, it's set big (28-32px), tabular, optionally followed by a small mono unit.

5. **The Sec-Title pattern** — page titles have a 1px solid ink underline (`border-bottom: 1px solid var(--ink)`), not a hairline.

6. **No gradients on chrome.** The existing app uses linear gradients on login card headers — remove them. Use solid `var(--brand)` for primary actions, solid `var(--ink)` for the crest mark.

---

## Files to update in the existing repo

### `rachel/project/index.html`
Replace the entire `:root { ... }` block with the contents of `tokens.css` from this handoff. Everything else in the file stays the same.

### `rachel/project/src/components.jsx`
Update the shared atoms. Specifically:
- **`Crest`** — replace gradient implementation with the new 30×30 ink/brand mark, "רחל" name, mono subtitle
- **`Icon`** — already fine, just ensure stroke-width is 1.6 (not 2)
- **`StatusBlock`** — restyle but keep the same props and conditional logic
- **`ProductCombobox`** — keep functionality, restyle to match new input/dropdown look

### `rachel/project/src/AppHQ.jsx`
- `HQLogin` — remove the navy gradient header on the login card. Use the left-panel layout from the mockup: brand-side + form-side, both on paper background. See `reference-mockup/parts/screen-hq-login.jsx`.
- `loading` state — restyle but keep the same logic
- Tweaks panel content stays exactly as it is

### `rachel/project/src/App.jsx`
- `FieldLogin` — remove the blue gradient card header. Use mobile phone-frame layout from the mockup. See `reference-mockup/parts/screen-field-login.jsx`.
- The login form fields, validation, and `dbLogin` call **stay identical**.

### `rachel/project/src/hq.jsx` (the big one)
This file contains the HQ shell, dashboard, monitor, organizations list, add-org drawer, and export modal. For each, match the visual treatment shown in:
- `reference-mockup/parts/screen-hq-dashboard.jsx`
- `reference-mockup/parts/screen-hq-orgs.jsx`
- `reference-mockup/parts/screen-hq-drawer.jsx`
- `reference-mockup/parts/screen-hq-export.jsx`

**Critical**: keep all `dbXxx` calls, refresh intervals, state, and prop signatures untouched.

### `rachel/project/src/field.jsx`
- Phone-frame and PC variants: see `reference-mockup/parts/screen-field-mobile.jsx` and `screen-field-pc.jsx`
- `HistoryTab` → `reference-mockup/parts/screen-field-history.jsx`
- `ProfileTab` → `reference-mockup/parts/screen-field-profile.jsx`
- Post-submit toast → still uses the existing `setToast` flow; just restyle the toast itself with the new tokens. The post-submit confirmation screen (`screen-field-success.jsx`) is a visual reference — the existing code currently shows a toast then switches to the History tab. Discuss with the user whether to keep that flow or add a full success screen. **Default: keep the existing toast-then-history flow; only restyle the toast.**

### `rachel/project/src/orgs.jsx`
The organizations list/edit. Same theme; same workflow. See `screen-hq-orgs.jsx` and `screen-hq-drawer.jsx`.

---

## Things to definitely NOT touch

- `rachel/project/src/data.js` — all `dbFetchX`, `dbInsertX`, `dbUpdateX`, `dbSendEmail`, etc. **Pure logic, no styling.** Leave alone.
- `rachel/project/src/supabase.js` — the Supabase client. Leave alone.
- `rachel/project/email-server-index.js` — server-side email. Leave alone.
- The email HTML template inside `App.jsx`'s `submitReport()` — that's a transactional email; restyling it is out of scope unless the user asks.
- The `useTweaks`, `TweakSection`, `TweakRadio`, `TweakToggle` controls in `tweaks-panel.jsx` — they're the editor's own UI, not the app's. Leave alone.

---

## Behavior, interactions, animations — UNCHANGED

Every interaction, animation, transition, validation rule, and navigation step **must remain identical** to what's in the repo today. If you find yourself reading a `useEffect` or changing a state machine, **stop** — you're out of scope.

The mockup uses placeholder Hebrew data ("שופרסל מרכזים — חיפה צפון", etc.). **Do not hard-code that data into the real app** — the real app reads from Supabase. The mockup data is for visual reference only.

---

## Files in this handoff

```
design_handoff_rachel_theme/
├── README.md                          ← you are here
├── tokens.css                         ← drop-in replacement for the `:root` block
└── reference-mockup/                  ← visual reference (don't ship these files)
    ├── index.html
    ├── app.jsx
    ├── design-canvas.jsx
    ├── parts/atoms.jsx
    ├── parts/screen-field-login.jsx
    ├── parts/screen-hq-login.jsx
    ├── parts/screen-hq-dashboard.jsx
    ├── parts/screen-hq-orgs.jsx
    ├── parts/screen-hq-drawer.jsx
    ├── parts/screen-hq-export.jsx
    ├── parts/screen-field-mobile.jsx
    ├── parts/screen-field-history.jsx
    ├── parts/screen-field-profile.jsx
    ├── parts/screen-field-success.jsx
    └── parts/screen-field-pc.jsx
```

To preview the mockup before implementing: open `reference-mockup/index.html` in a browser. You'll see all 12 surfaces laid out on a single canvas.

---

## Suggested order of work

1. Replace `:root` tokens in `index.html` (5 min) — this alone will refresh most of the visual feel.
2. Restyle `components.jsx` atoms (`Crest`, `Icon` usage, `StatusBlock`, chips) — propagates everywhere.
3. Restyle `AppHQ.jsx` `HQLogin` and `App.jsx` `FieldLogin` — high-visibility entry points.
4. Restyle `hq.jsx` shell, dashboard, monitor table.
5. Restyle `hq.jsx` orgs page + add-org drawer.
6. Restyle `field.jsx` phone view + PC view.
7. Restyle `hq.jsx` export modal.
8. Restyle `field.jsx` history + profile tabs.
9. Final pass: chips, toasts, banners — make sure mode-pill and tag patterns are everywhere.

After each step: open the app, click around, **verify nothing functional broke.** If something works differently than before, revert and try again — you've crossed into workflow territory.

---

## Questions to ask the user before starting

1. Do you want me to keep the current login-card layout (centered card) or move to the new split layout (brand panel + form panel) shown in the mockup?
2. The mockup adds a "Submitted Success" confirmation screen for the field user. The current app shows a toast and switches to history. Keep current behavior, or implement the new success screen?
3. Any specific screens you want me to skip or tackle first?

When in doubt: **change less, not more.**
