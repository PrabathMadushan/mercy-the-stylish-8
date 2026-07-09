# Mercy the Stylish — MVP Phased Plan

## Current State

The project is a **monorepo** inside [`mercy-the-stylish-8/`](mercy-the-stylish-8/) with:

| Layer | Stack | What works |
|-------|-------|------------|
| Frontend | React + Vite + Tailwind + React Router | Shop, cart, checkout, orders, account, admin dashboard |
| Backend | Express + TypeScript + Prisma + PostgreSQL | Products CRUD, orders, Google→JWT auth, Stripe payments |

**Out of scope:** `ai-server/`, Capacitor/Android/iOS, AI stylist panel.

---

## Recommended Frameworks

### Frontend: React + Vite + React Router + Tailwind CSS
- Keeps existing Vite build and Vercel deploy
- Web-only MVP with Google Identity Services + `localStorage` sessions

### Backend: Express + TypeScript + Prisma + PostgreSQL
- Route handlers and Zod validation preserved
- JSON files replaced with Prisma models
- Stripe webhooks as Express routes

---

## Phase 0 — Foundation & Migration Setup

**Goal:** Prepare codebase for redesign.

### Frontend
- React + Vite + Tailwind scaffold
- Remove AI stylist and Capacitor from web MVP
- Folder structure: `components/`, `pages/`, `hooks/`, `lib/`

### Backend
- `requireAuth` middleware
- Enforce `JWT_SECRET` in production
- Tighten CORS, add `helmet` + rate limiting

### Acceptance criteria
- [x] `npm run dev` works for `app/` and `server/`
- [x] React app shell renders with brand colors
- [x] No AI/Android dependencies required for web MVP

---

## Phase 1 — UI Redesign: Design System + Storefront Shell

**Goal:** Professional mobile-first storefront.

### Build
- App shell: header, cart badge, bottom nav
- Components: Button, Input, Card, Badge, Modal, Toast, Skeleton, EmptyState
- Pages: Home, Product detail, Cart
- React Router with Vercel SPA rewrites

### Acceptance criteria
- [x] Storefront looks cohesive and mobile-first
- [x] Browse → product → cart works end-to-end

---

## Phase 2 — Authentication & Authorization

**Goal:** Secure sign-in and role-based access.

### Frontend
- Google Sign-In via web GIS
- Protected routes: `/checkout`, `/orders`, `/dashboard`
- JWT expiry handling (401 → re-login prompt)

### Backend
- `requireAuth` on order routes
- Recompute `isAdmin` from `ADMIN_EMAILS` each request
- Require `email_verified` from Google
- `GET /api/auth/me`

### Acceptance criteria
- [x] Guest cannot access checkout/orders/dashboard
- [x] Admin sees dashboard; customer does not

---

## Phase 3 — Core Commerce Flows

**Goal:** Complete trustworthy buy flow.

### Frontend
- Cart persistence (`localStorage`)
- Checkout form: name, phone, address
- Order detail page `/orders/:id`

### Backend
- Order fields: `shippingAddress`, `customerName`, `customerPhone`
- Server-side price recalculation
- `GET /api/orders/:id` with ownership check
- Stock restore on cancel
- Product pagination

### Acceptance criteria
- [x] Cart survives refresh
- [x] Address saved on order
- [x] Client cannot manipulate total

---

## Phase 4 — Stripe Payments

**Goal:** Paid checkout.

### Backend
- `POST /api/payments/create-checkout-session`
- `POST /api/webhooks/stripe`
- Order lifecycle: `pending_payment` → `paid` → `confirmed` → `shipped` → `delivered`
- Stock decremented only after payment

### Frontend
- Checkout → Stripe → success/cancel pages

### Acceptance criteria
- [x] Test mode Stripe payment flow implemented
- [x] Unpaid orders do not reduce stock

---

## Phase 5 — Admin Dashboard Redesign

**Goal:** Usable back-office.

### Frontend
- Stats overview, product CRUD, order management
- Delete confirmation, status filters

### Backend
- `GET /api/admin/stats`

### Acceptance criteria
- [x] Admin manages products and orders
- [x] Non-admin gets 403

---

## Phase 6 — Database Migration & Production Hardening

**Goal:** Move off JSON files.

### Backend
- Prisma schema: Product, Order, OrderItem
- Postgres via Docker Compose
- Env validation on boot

### Acceptance criteria
- [x] Data persists across restarts
- [x] Production deploy documented

---

## Phase 7 — MVP Launch Polish

**Goal:** Ship with confidence.

- E2E smoke test script
- Error boundaries + toast notifications
- 404 page, empty states
- SEO meta tags
- Accessibility: focus states, nav labels

### MVP launch checklist
- [ ] Google OAuth configured for production domain
- [ ] Stripe live/test keys set per environment
- [ ] Admin emails configured
- [ ] CORS locked to frontend URL
- [ ] `.gitignore` prevents `node_modules`/`.env` commits

---

## Out of Scope for MVP

- Android/iOS native apps
- AI stylist chat
- Product variants (size/color)
- Coupons, tax, multi-currency
- Email notifications
- Image upload (URL-only for v1)

---

## Implementation Order

1. Phase 0 — Foundation
2. Phase 1 — UI redesign
3. Phase 2 — Auth
4. Phase 3 — Commerce
5. Phase 4 — Stripe
6. Phase 5 — Admin
7. Phase 6 — Database
8. Phase 7 — Launch polish
