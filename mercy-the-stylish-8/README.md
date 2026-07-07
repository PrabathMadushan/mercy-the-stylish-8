# Mercy the Stylish

A women's fashion e-commerce app (dresses, tops, accessories, footwear, bags) with:

- **`app/`** — Capacitor + Vite + TypeScript mobile/web app (customer storefront + admin dashboard), Google Sign-In, AI stylist chat
- **`server/`** — main API server (Node/TypeScript/Express): products, orders, Google auth verification
- **`ai-server/`** — second server (Node/TypeScript/Express): AI styling chat & outfit recommendations
- **`.github/workflows/`** — CI/CD (GitHub Actions): type-check + build every push, Docker images on merge to `main`, Android release bundle
- **Docker** — each service has a `Dockerfile`; `docker-compose.yml` runs all three together
- **`logo/logo.svg`** — the app's logo

## 1. Run it locally (fastest way to see it working)

You'll need Node.js 20+ installed (there's an `.nvmrc` if you use `nvm` - just run `nvm use`).

**Option A - one command, from the repo root:**
```bash
npm install
npm run install:all   # installs server/, ai-server/, and app/ each
cp server/.env.example server/.env       # fill in GOOGLE_CLIENT_ID, JWT_SECRET, ADMIN_EMAILS
cp ai-server/.env.example ai-server/.env # fill in ANTHROPIC_API_KEY
cp app/.env.example app/.env
npm run dev
```
This starts all three services at once (color-coded logs per service) using `concurrently`.
Once they're running, you can sanity-check them with `npm run smoke-test`.

**Option B - three terminals, one service each** (useful if you want to see each service's
output on its own, or restart just one):

```bash
# terminal 1 - main server
cd server
cp .env.example .env      # fill in GOOGLE_CLIENT_ID, JWT_SECRET, ADMIN_EMAILS
npm install
npm run dev                # http://localhost:4000

# terminal 2 - AI server
cd ai-server
cp .env.example .env      # fill in ANTHROPIC_API_KEY
npm install
npm run dev                # http://localhost:4100

# terminal 3 - frontend (mobile app, running as a website for dev)
cd app
cp .env.example .env
npm install
npm run dev                # http://localhost:5173
```

Open http://localhost:5173 — you should see the storefront. Add your email to `ADMIN_EMAILS` in `server/.env` and sign in with Google to unlock the **Dashboard** tab.

**For step-by-step help getting your Google Client ID, Anthropic API key, and Android keystore, see [`SETUP-CREDENTIALS.md`](./SETUP-CREDENTIALS.md).**

## 2. Google Sign-In setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials.
2. Create an **OAuth 2.0 Client ID** of type **Web application** (used to verify tokens server-side) — copy its Client ID into `server/.env` as `GOOGLE_CLIENT_ID`.
3. Create an **Android** OAuth client (once you have your release keystore's SHA-1) and an **iOS** OAuth client, per the [`@codetrix-studio/capacitor-google-auth` docs](https://github.com/CodetrixStudio/CapacitorGoogleAuth).
4. Put the **Web** client ID in three places: `server/.env` (`GOOGLE_CLIENT_ID`), `app/capacitor.config.ts` (`serverClientId` - used on native Android/iOS builds), and `app/.env` (`VITE_GOOGLE_CLIENT_ID` - used when testing sign-in in a browser via `npm run dev`, since native config injection doesn't apply there).

## 3. AI stylist setup

The AI server calls the Anthropic API. Get a key at console.anthropic.com and put it in `ai-server/.env` as `ANTHROPIC_API_KEY`. Until that's set, the chat button will return a friendly "temporarily unavailable" message instead of crashing — nothing else in the app depends on it.

## 4. Docker (run everything in containers)

```bash
cp server/.env.example server/.env
cp ai-server/.env.example ai-server/.env
docker compose up --build
```

- Web app: http://localhost:8080
- Main API: http://localhost:4000
- AI API: http://localhost:4100

Note: the web container bakes `VITE_MAIN_SERVER_URL`/`VITE_AI_SERVER_URL` in at build time (they default to `localhost:4000`/`4100`). For a real cloud deployment, pass your public API URLs as Docker build args or environment variables before `npm run build` runs.

## 5. Deploying the frontend to Vercel

If you connect this repo to Vercel directly, the build can fail in a couple of specific ways
unless Vercel knows the actual frontend lives in `app/`, not the repo root (this is a monorepo -
`server/` and `ai-server/` aren't meant to run on Vercel at all, only `app/` is a static site):

- `sh: line 1: vite: command not found` - Vercel built from the wrong directory.
- `sh: line 1: astro: command not found` (or any other framework's CLI) - Vercel's **Framework
  Preset** got set to the wrong framework somewhere, usually while troubleshooting the first
  error above. This project doesn't use Astro (or anything else) at all - only Vite.

Fix it one of these two ways:

**Option A (recommended):** In the Vercel dashboard, go to **Settings → General → Root
Directory** and set it to `app`. Save, then redeploy. `app/vercel.json` (already in this repo)
takes it from there - it explicitly sets `"framework": "vite"`, which overrides an incorrectly
selected Framework Preset in the dashboard, plus explicit install/build/output settings.

**Option B (if you'd rather not change Root Directory):** In **Settings → Build & Development
Settings**, override:
- Install Command: `cd app && npm install`
- Build Command: `cd app && npm run build`
- Output Directory: `app/dist`

**One thing `vercel.json` cannot fix for you:** if someone previously turned on the **Override**
toggle next to Build Command (or Install/Output) in **Settings → Build & Development Settings**
and typed in a command by hand (e.g. `astro build`), that manual override takes precedence over
`vercel.json` - it has to be turned off or corrected in the dashboard directly. Check that
section if the build still runs the wrong command after redeploying.

Either way, set the environment variables from `app/.env.example` (`VITE_MAIN_SERVER_URL`,
`VITE_AI_SERVER_URL`, `VITE_GOOGLE_CLIENT_ID`) in **Settings → Environment Variables**, pointing
at wherever you've deployed `server/` and `ai-server/` (Vercel only hosts the static frontend -
the two API servers need to run somewhere that can execute a Node process, e.g. the Docker setup
above, or a service like Fly.io/Render/Railway).

## 6. App icon and splash screen

Real source images are already in `app/resources/` (`icon-only.png` at 1024×1024 and `splash.png`
at 2732×2732, in the shop's rose/gold/cream palette). To generate the actual platform-specific
icon and splash files once you've added Android and/or iOS:

```bash
cd app
npx cap add android   # and/or: npx cap add ios
npm run assets:generate
npx cap sync
```

This uses `@capacitor/assets` to produce every required icon/splash size for each platform from
those two source images. Feel free to swap in your own `icon-only.png`/`splash.png` first if
you'd rather use different artwork - just keep the same filenames and minimum dimensions.

## 7. Building the Android app

```bash
cd app
npm install
npm run build
npx cap add android      # only needed once
npx cap sync android
```

Then apply the release signing config (this works the same way CI does it - see the "Apply release signing config" step in `.github/workflows/ci-cd.yml` - so it survives every fresh `npx cap add android` instead of being lost):
```bash
cp ../android-config/signing.gradle android/app/signing.gradle
echo "apply from: 'signing.gradle'" >> android/app/build.gradle
```
Then either:
- create `app/android/key.properties` from `android-config/key.properties.example` for **local** signed builds, or
- set the `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` **GitHub repo secrets** so CI can produce a signed `.aab` automatically (see `.github/workflows/ci-cd.yml`, job `android`).

Open in Android Studio with `npx cap open android`, or build from the CLI with `./gradlew assembleDebug` (unsigned, for testing) / `./gradlew bundleRelease` (signed, for the Play Store).

## 8. Building the iOS app

```bash
npx cap add ios
npx cap sync ios
npx cap open ios
```

Signing is handled in Xcode (Signing & Capabilities tab) with your Apple Developer account — Apple doesn't support CLI-only signing the way Android does with a keystore.

## 9. CI/CD

On every push/PR: the frontend and both servers are type-checked, tested (`npm test`, using Node's built-in test runner via `tsx`), and built. On every push to `main`: Docker images are built and pushed to GitHub Container Registry (`ghcr.io`), and a signed Android `.aab` is produced (if the signing secrets above are set) and uploaded as a workflow artifact.

## 10. What the backend and frontend actually do

**Main server (`server/`)**
- Products: list with `?category=` and `?search=` filters, get one, create/update/delete (admin-only), validated with `zod` (`src/validation.ts`) — bad input gets a clear 400 message instead of a vague 500.
- Orders: creating an order checks real stock availability first and rejects the whole order with a 409 and a specific message (e.g. "Only 2 left of Floral Wrap Dress") if anything is oversold, rather than silently short-shipping. Admins see all orders; customers see only their own.
- Auth: verifies a Google ID token server-side and issues its own short-lived-free JWT (30 days) so the app doesn't need to re-verify with Google on every request.

**Frontend (`app/`)**
- Home: category tabs derived from whatever categories your products actually have (not a hardcoded list, so a new category you add always shows up), plus an instant client-side search box.
- Product page: a working quantity stepper, clamped to available stock.
- Dashboard: the "Edit" button on each product now actually works — it loads the product into the same form used for adding new ones, with a "Save changes" / "Cancel" flow (this was a dead button in the first version and is fixed now).

## 11. Going to production

The main server ships with a small JSON-file datastore (`server/data/*.json`) so it runs with **zero setup**. For real traffic, swap `server/src/db.ts` for a managed database — Postgres via Prisma, or a managed service like Neon/Supabase/Cloud SQL — and deploy each service (main server, AI server, web) to your cloud of choice (Fly.io, Render, AWS ECS, Google Cloud Run all work well with the provided Dockerfiles as-is).

## Project structure

```
mercy-the-stylish/
├── app/               # Capacitor + Vite + TS frontend (storefront + dashboard)
│   ├── resources/     # Source icon/splash images for native app builds
│   └── vercel.json    # Explicit Vercel build config (see "Deploying the frontend to Vercel")
├── server/            # Main API (products, orders, Google auth)
├── ai-server/         # AI stylist (chat + recommendations)
├── android-config/    # Signing config for the Android build (see SETUP-CREDENTIALS.md)
├── scripts/           # Setup script (keystore) and scripts/smoke-test.sh
├── logo/              # Brand logo (SVG)
├── package.json       # Root convenience scripts only - see "Run it locally" above
├── docker-compose.yml
├── SETUP-CREDENTIALS.md  # Step-by-step: Google OAuth, Anthropic key, Android keystore
├── BUGFIXES.md           # Log of bugs found and fixed across review passes
├── LICENSE
└── .github/workflows/ci-cd.yml
```
