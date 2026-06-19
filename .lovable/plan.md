# Astrelo — Numerology Quiz Build Plan

A mobile-first, single-page interactive quiz with 25 steps + 4 milestone interludes + paywall. Visual language mirrors lumenx.app: clean white background, deep navy CTAs, rounded outlined option cards, mystical cosmic hero imagery, smooth fade/slide transitions between steps.

## Visual direction (reference: quiz.lumenx.app)

- **Layout:** centered mobile column (max 480px), top progress bar + "TOP APP IN US ⭐ 4.8" ribbon on hero only.
- **Palette:** white background `#ffffff`, deep navy `#0B1E3F` (CTAs, headings), accent gradient violet→magenta→gold for cosmic visuals, subtle indigo borders on option cards.
- **Typography:** bold sans for H1 (Plus Jakarta Sans / Sora), neutral body sans (Inter).
- **Imagery:** AI-generated cosmic/numerology art (silhouette + sacred geometry, glowing matrix, golden pie chart) — generated per quiz chapter.
- **Motion:** fade-in + slide-up on step change (200–250ms), animated progress bar, pulse on milestone CTAs, blurred X-Ray pages with revealed "cut-out" zones, animated loader matrix.

## Architecture

Single TanStack route `/` (replaces placeholder index) drives the whole flow as a state machine (no multi-route). Each step is a small component receiving `onNext(value)`. State stored in a single `useReducer` keyed by step id.

```text
src/routes/index.tsx                — hosts <Quiz />
src/components/quiz/Quiz.tsx        — state machine, step router, progress bar
src/components/quiz/QuizShell.tsx   — mobile frame, header, footer
src/components/quiz/steps/
  Step01Hero.tsx … Step25Paywall.tsx
  Milestone1.tsx … Milestone4.tsx
src/components/quiz/widgets/
  OptionCard.tsx        — outlined selectable card (lumenx style)
  StressSlider.tsx      — 1–10 slider (shadcn slider restyled)
  DateOfBirthPicker.tsx — Month/Day/Year selects
  ProgressBar.tsx
  XRayScroller.tsx      — swipeable blurred 31-page book with revealed zones
  DynamicTimeline.tsx   — 2 future dates (today+45, today+90) computed at runtime
  PricingTiers.tsx      — 3 cards $19 / $27 / $33
  AILoader.tsx          — 4-stage progress text + rotating matrix svg
src/lib/quiz/
  state.ts        — reducer + types (answers, currentStep)
  numerology.ts   — life-path + karmic debt calc from DOB
  copy.ts         — all step questions/options text (US English)
src/assets/quiz/  — generated cosmic images (hero, milestones, paywall book cover)
src/styles.css    — extend tokens: --quiz-navy, --quiz-gold, --quiz-violet, gradients, shadows
```

## Step-by-step coverage

All 25 steps and 4 milestones from the spec are implemented verbatim (copy in `copy.ts`):

- **Ch.1 Steps 1–5** + Milestone 1 ("Core Vibration locked, 14%")
- **Ch.2 Steps 6–10** (3 sliders + 2 choice) + Milestone 2 ("Not your fault")
- **Ch.3 Steps 11–16** (6 choice questions) + Milestone 3 ("64% compiled, FOMO")
- **Ch.4 Steps 17–21** + Milestone 4 ("Phase 1 complete")
- **Ch.5 Step 22 Name → 23 Email → 24 AI Loader (6–8s, 4 status lines) → 25 Paywall**

## Step 25 Paywall composition

1. **Free hook insight** — uses computed Life Path from DOB + name interpolation.
2. **X-Ray Scroller** — horizontal swipe over 31 stylised pages (blur 5px), pages 4 and 12 expose a sharp "cut-out" zone (golden pie chart 89% / "Karmic match for [Name] + ████"). Implemented with a CSS scroll-snap track + per-page mask.
3. **Dynamic Timeline** — `new Date()` + 45 / 90 days, formatted "Month YYYY", with lock icons and locked copy.
4. **Trust row** — Sitejabber/Trustpilot-style 5★ static badges + "Secure Checkout via Stripe 🔒" pill (no real Stripe yet — CTA is a placeholder click that toasts).
5. **Three pricing tiers** $19 / $27 / $33 with Most Popular highlight (scale + glow), single CTA bound to selected tier.

## Numerology / dynamic content

Pure function in `lib/quiz/numerology.ts`: reduces DOB digits to Life Path 1–9 (preserving 11/22/33), flags karmic debt 13/14/16/19. Drives the free insight on the paywall and milestone copy where `[Name]` / number references appear.

## Out of scope (this turn)

- Real Stripe checkout (paywall CTA is presentational; ready for `enable_stripe_payments` later).
- Backend persistence of answers (client-only state for now).
- Auth.

## Technical notes

- All colors via semantic tokens added to `src/styles.css`; no hardcoded hex in components.
- Replace placeholder content in `src/routes/index.tsx` with the quiz on this turn (also set route `head()` title/description for "Astrelo — Decode Your Numerology Blueprint").
- Mobile-first; on desktop the column is centered with a soft cosmic background.
- Generate ~5 cosmic images via `imagegen` (hero silhouette, 3 milestones, blurred report book cover).

After approval I'll implement everything in one pass: tokens → state/copy → widgets → steps → milestones → paywall → image assets → wire into `/`.
