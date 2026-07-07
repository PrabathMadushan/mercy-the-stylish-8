# Deployment & Build Guide (Vercel + Local)

This workspace is a wrapper folder. **The actual project code lives in `mercy-the-stylish-8/`** (monorepo).

## Project overview

Inside `mercy-the-stylish-8/`:

- **`app/`**: Capacitor + **Vite** + TypeScript frontend (storefront + admin dashboard)
- **`server/`**: Node/TypeScript/Express API (products, orders, Google token verification)
- **`ai-server/`**: Node/TypeScript/Express AI API (stylist chat / recommendations)

Vercel is intended to deploy **only the static frontend** (`app/`). The two servers must run somewhere that can host Node processes (Docker on a VM, Fly.io/Render/Railway, etc.).

## Local build & run

From the monorepo root:

```bash
cd mercy-the-stylish-8

# install all three packages
npm install
npm run install:all

# env files (fill values)
cp server/.env.example server/.env
cp ai-server/.env.example ai-server/.env
cp app/.env.example app/.env

# run all services together
npm run dev
```

Build all:

```bash
cd mercy-the-stylish-8
npm run build:all
```

## Vercel deployment (frontend only: `app/`)

### What Vercel should build

- **Root Directory**: `app`
- **Framework**: Vite
- **Install Command**: `npm install`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

This repo already includes `mercy-the-stylish-8/app/vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### Recommended setup (simplest)

In the Vercel dashboard:

1. Import the Git repo
2. Go to **Settings → General → Root Directory**
3. Set **Root Directory** to `app`
4. Redeploy

With Root Directory set to `app`, the `vercel.json` above is applied correctly and Vercel will run the right Vite commands.

### If you cannot change Root Directory

You can still deploy, but you must override Vercel’s Build settings so it builds the subfolder:

- **Install Command**: `cd app && npm install`
- **Build Command**: `cd app && npm run build`
- **Output Directory**: `app/dist`

### Common Vercel errors (and what they mean)

- **`vite: command not found`**: Vercel is building from the wrong directory (not `app/`).
- **It runs `astro build` (or another framework)**: the Vercel project has a manual override / wrong framework preset. Fix the project’s **Build & Development Settings** to use Vite and remove overrides.

## Environment variables on Vercel

Set these in **Vercel → Project → Settings → Environment Variables** (values come from `app/.env.example`):

- **`VITE_MAIN_SERVER_URL`**: public URL of your deployed `server/` (example: `https://api.example.com`)
- **`VITE_AI_SERVER_URL`**: public URL of your deployed `ai-server/`
- **`VITE_GOOGLE_CLIENT_ID`**: Google OAuth Web Client ID

Notes:

- Vite env vars are baked in at build time. After changing env vars, **Redeploy** to apply them.
- If the API URLs are wrong/unreachable, the web app will load but calls like product list, auth, orders, and AI chat will fail.

## What to deploy where (quick checklist)

- **Deploy to Vercel**: `mercy-the-stylish-8/app` (static site built to `dist/`)
- **Deploy elsewhere (Node runtime required)**:
  - `mercy-the-stylish-8/server` (Express API)
  - `mercy-the-stylish-8/ai-server` (Express AI API)

