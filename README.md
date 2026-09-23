# Grand Horizon Hotel Management System (HMS)

> Production-ready, full-stack, AI-powered Hotel Property Management System (PMS) and Progressive Web App (PWA).

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.8-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-cyan.svg)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple.svg)](https://web.dev/progressive-web-apps/)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

---

## 🏨 Overview

**Grand Horizon Hotel Management System** is an enterprise-grade hospitality management platform engineered for luxury hotels and boutique properties. It provides front-desk clerks, housekeeping managers, and general executives with high-velocity tools to manage reservations, room states, guest profiles, staff schedules, work order dispatches, financial tracking, and real-time operational intelligence.

### Key Features
- **Interactive Room Grid & Availability**: Real-time room status tracking (Clean, Dirty, Inspected, Out-of-Order, Occupied, Vacant), quick filters by floor and category, and fast occupancy updates.
- **Reservation & Guest Lifecycle**: Frictionless check-ins, check-outs, folios, payment records, and search across past and current guests.
- **Housekeeping & Facilities Board**: Smart task assignment with priority triage, status tracking, and floor dispatch.
- **Financial Analytics & Revenue Tracking**: ADR (Average Daily Rate), RevPAR (Revenue Per Available Room), occupancy yields, and payment breakdown.
- **AI Executive Copilot & Daily Operational Briefings**: Powered by Google Gemini (`@google/genai`) with automatic fallback to built-in hospitality intelligence when offline or during API rate limits.
- **Progressive Web App (PWA)**: Full offline support via Service Worker caching, installable home-screen experience across Android, iOS Safari, and Desktop Chrome/Edge.
- **Dual-Engine Persistence**: Seamlessly switches between cloud Supabase PostgreSQL and high-resilience local state store.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Client (React 19 SPA)                │
│  - Vite + Tailwind CSS v4 + Motion Animations         │
│  - Service Worker (Workbox Auto-Update & Caching)       │
│  - In-App PWA Install Banner & Offline Alert          │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / REST API
┌───────────────────────────▼────────────────────────────┐
│              Backend Service (Node.js / Express)        │
│  - Server-Side Gemini AI Engine (@google/genai)        │
│  - Production Static Asset Serving (dist/)             │
│  - Dynamic PORT configuration (process.env.PORT)       │
│  - Resilient AI Fallback & Rate-Limit Handlers         │
│  - Security & CORS Protection Headers                  │
└───────────────────────────┬────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
   Supabase PostgreSQL         Local Resilient Store
   (Cloud Production DB)       (Zero-Config Standby)
```

---

## 🔒 Security & Production Hardening

1. **Zero Secret Leaks**:
   - Client code contains **zero** hardcoded API keys or database service role secrets.
   - All external calls to Gemini AI or Supabase PostgreSQL route strictly through server-side proxy handlers.
2. **Environment Variable Isolation**:
   - `.gitignore` strictly ignores `.env*` while tracking `.env.example`.
3. **HTTP Security Headers**:
   - Strict `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: SAMEORIGIN`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - Proper CORS preflight (`OPTIONS`) and credentials handling.
4. **Resilience Under Load / Quota Exhaustion**:
   - All AI endpoints (`/api/ai/chat`, `/api/ai/briefing`, `/api/ai/prioritize-tasks`, `/api/ai/draft-message`, `/api/ai/generate-report`) feature automated fallback handlers so the UI never crashes if upstream AI quotas are exceeded or network connectivity drops.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | Port for Express server (default `3000`) | `3000` |
| `NODE_ENV` | Optional | Environment mode | `production` or `development` |
| `GEMINI_API_KEY` | Recommended | Google Gemini API key for AI features | `AIzaSy...` |
| `SUPABASE_URL` | Optional | Supabase Project URL | `https://xyzcompany.supabase.co` |
| `SUPABASE_ANON_KEY` | Optional | Supabase Public Anon Key | `eyJhbG...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Supabase Service Role Key | `eyJhbG...` |
| `APP_URL` | Optional | Public application URL | `https://your-domain.com` |

*Note: If Supabase credentials are not provided, the application automatically uses its built-in resilient in-memory database seeded with realistic luxury hotel data.*

---

## 🚀 Quick Start & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the live development app.

### 3. Lint & Type Check
```bash
npm run lint
```

---

## 📦 Production Build & Deployment

### Build the Full-Stack Application
```bash
npm run build
```
This runs:
1. `vite build` to bundle client assets, PWA manifest, and service worker into `dist/`.
2. `esbuild server.ts` to bundle the backend Express server into `dist/server.cjs`.

### Start Production Server
```bash
npm start
```
Starts the bundled server on `http://localhost:${PORT:-3000}`.

---

## 🐳 Docker Deployment

A production-grade, multi-stage `Dockerfile` is included:

```bash
# Build the Docker image
docker build -t grand-horizon-hms .

# Run the container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e GEMINI_API_KEY="your_api_key" \
  grand-horizon-hms
```

### Deploy to Google Cloud Run / AWS / Railway
1. **Google Cloud Run**:
   ```bash
   gcloud run deploy grand-horizon-hms \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars NODE_ENV=production
   ```
2. **Render / Railway / Heroku**:
   - Set Build Command: `npm run build`
   - Set Start Command: `npm start`
   - Bind environment variables from `.env.example`.

---

## 📱 Progressive Web App (PWA) Testing

### Testing on Android (Chrome)
1. Open the application in Google Chrome.
2. Tap the in-app **"Install App"** button or the browser menu `⋮` -> **"Add to Home screen"** / **"Install app"**.
3. Launch from the Android home screen — it will open in standalone full-screen mode with custom splash screen and theme color (`#0f172a`).

### Testing on iOS (Safari)
1. Open the application in Safari.
2. Tap the **Share** button (box with upward arrow).
3. Tap **"Add to Home Screen"**.
4. Tap **"Add"** in the top-right corner.

### Testing on Desktop (Chrome / Edge / Brave)
1. An install icon will appear on the right side of the address bar or via the in-app **"Install App"** button in the top navigation bar.
2. Click **Install** to run Grand Horizon HMS in a dedicated standalone desktop window.

### Testing Offline Mode
1. Open DevTools (`F12`) -> **Network** tab.
2. Toggle the network dropdown from "No throttling" to **"Offline"**.
3. Reload or navigate the application — cached rooms, bookings, and UI assets will load seamlessly with the **"Offline Mode Active"** banner.

---

## 📡 API Endpoints

### System & Health
- `GET /api/health` — System status, database provider, and AI capability check.
- `GET /api/db/status` — Supabase PostgreSQL connection status and record counts.
- `POST /api/db/seed` — Seed initial database tables and mock records.
- `POST /api/db/reset` — Reset database to pristine demo state.

### Operational CRUD
- `GET /api/rooms` • `POST /api/rooms` • `PUT /api/rooms/:id`
- `GET /api/bookings` • `POST /api/bookings` • `PUT /api/bookings/:id` • `DELETE /api/bookings/:id`
- `GET /api/guests` • `POST /api/guests` • `PUT /api/guests/:id`
- `GET /api/staff` • `POST /api/staff` • `PUT /api/staff/:id`
- `GET /api/tasks` • `POST /api/tasks` • `PUT /api/tasks/:id` • `POST /api/tasks/batch`
- `GET /api/payments` • `POST /api/payments`
- `GET /api/activities` • `POST /api/activities`

### AI Operations
- `POST /api/ai/chat` — Conversational hotel copilot.
- `POST /api/ai/briefing` — Daily shift operational overview.
- `POST /api/ai/prioritize-tasks` — Smart housekeeping and maintenance dispatch.
- `POST /api/ai/draft-message` — Luxury guest communications (welcome notes, folios).
- `POST /api/ai/generate-report` — Executive yield, turnover, and VIP analytical reports.
