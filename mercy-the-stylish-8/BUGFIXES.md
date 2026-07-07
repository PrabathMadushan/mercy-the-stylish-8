# Bug-fix pass — what was actually wrong and what changed

This project was built across several turns, and this pass went back through everything
looking for real errors rather than new features. Here's exactly what was broken and how
it's fixed now.

## Would have broken `npm run build` / `npm run lint`
- **`server/tsconfig.json` and `ai-server/tsconfig.json`** used `moduleResolution: "Bundler"`,
  but the code imports relative files with `.js` extensions (e.g. `import "./db.js"`), which
  is required for Node to run ESM at runtime. "Bundler" resolution doesn't map `.js` imports
  to `.ts` source files - only `"NodeNext"` does. This would have made `tsc` fail with
  "Cannot find module './db.js'". **Fixed:** both configs now use `"module": "NodeNext"` and
  `"moduleResolution": "NodeNext"`, which is the correct pairing for this file layout.

## Would have crashed the server at runtime
- **`server/src/routes/products.ts` and `orders.ts`** had async route handlers with no
  try/catch. Express 4 does not automatically catch promise rejections thrown inside async
  handlers - an unhandled rejection would either hang the request forever or crash the whole
  Node process (Node 15+ terminates on unhandled rejections by default). **Fixed:** added
  `server/src/asyncHandler.ts`, a wrapper that forwards any rejected promise to Express's
  error middleware, and applied it to every async handler in both route files.
- The error middleware in `server/src/index.ts` always returned 500, even for a client's
  malformed JSON body (which should be a 400). **Fixed:** it now checks for JSON parse errors
  specifically.

## Would have broken CI on the very first push
- **`.github/workflows/ci-cd.yml`** referenced `cache-dependency-path: app/package-lock.json`
  (and the same for `server`/`ai-server`), but no lockfiles are committed yet - and
  `actions/setup-node`'s caching fails outright if the referenced lockfile doesn't exist.
  **Fixed:** removed the caching config; it's a performance nicety, not something the
  pipeline should depend on before you've run `npm install` and committed lockfiles.
- The Android job's "Decode signing keystore" step checked `if: env.ANDROID_KEYSTORE_BASE64`,
  but that secret was only ever referenced inside the step's own `env:` block, not the job's -
  so the condition was always true regardless of whether you'd set the secret. **Fixed:** the
  condition now checks `secrets.ANDROID_KEYSTORE_BASE64` directly.

## Would have broken the AI stylist entirely
- **`ai-server/src/routes/style.ts`** called the Anthropic API with `model: "claude-sonnet-4-6"`,
  which isn't a real, current model ID - every request would have failed. **Fixed:** now uses
  `"claude-sonnet-5"`, the current model. Also bumped `@anthropic-ai/sdk` from `^0.27.3`
  (mid-2024) to `^0.60.0` so its TypeScript types actually recognize current models.

## Would have silently broken Google Sign-In in the browser
- **`app/src/auth/googleAuth.ts`** called `GoogleAuth.initialize(clientId, scopes, grantOfflineAccess)`
  with positional arguments, but the plugin's real API takes a single options object:
  `GoogleAuth.initialize({ clientId, scopes, grantOfflineAccess })`. Passing a string where an
  object was expected would silently produce `undefined` for every field. **Fixed:** now calls
  it correctly with the options object.
- **`app/index.html`** was missing the Google Identity Services script tag
  (`accounts.google.com/gsi/client`), which the plugin needs to work in a browser (native
  builds don't need this, only `npm run dev` testing does). **Fixed:** added it.
- Added `VITE_GOOGLE_CLIENT_ID` to `app/.env.example` and wired it into `googleAuth.ts`, since
  browser testing needs the client ID passed in JS - it can't read `capacitor.config.ts` the
  way a native build can.

## Would have silently produced an UNSIGNED Android build every time (found in a deeper pass)
- The CI Android job runs `npx cap add android` fresh on every run, because `app/android/`
  is git-ignored (correctly - Capacitor platform folders are usually regenerated). But my
  original instructions told you to *manually paste* the signing config into the generated
  `build.gradle`. Since that folder never gets committed, that manual edit could never survive
  into a fresh CI checkout - meaning `./gradlew bundleRelease` would run against a
  freshly-generated `build.gradle` with no signing config at all, and silently produce an
  **unsigned** `.aab` regardless of whether you'd set up the keystore secrets. This completely
  defeated the point of the Android signing setup. **Fixed:** replaced the "paste this into
  build.gradle" snippet with `android-config/signing.gradle`, a self-contained file applied via
  Gradle's `apply from:` mechanism. The CI workflow now copies it in and appends one line
  (`apply from: 'signing.gradle'`) automatically after every `cap add android`, so it survives
  regeneration without any manual, easily-lost edit. Also fixed the keystore's expected file
  path in `key.properties.example`, which pointed one directory level off from where
  `scripts/generate-android-keystore.sh` actually creates the file.

## A validation edge case that would reject legitimate empty form fields
- **`server/src/validation.ts`**: `category: z.string().trim().min(1).default("Uncategorized")` looks
  reasonable but has a real gap - `.default()` only applies when a key is *missing*, never when
  it's present-but-empty. Since the dashboard's category field isn't marked required, leaving it
  blank sends `category: ""`, which `.min(1)` then rejects with a 400 - the fallback never had a
  chance to run. **Fixed** with a `z.preprocess()` helper that converts an empty string to
  `undefined` *before* validation, so `.default()` correctly kicks in. (First attempt at this fix
  chained `.default()` *after* the preprocess step instead of inside it, which would have just
  swapped one rejection for a different one - worked through the exact evaluation order by hand
  before shipping the corrected version.) Also made the product update route strip `undefined`
  keys before merging a patch, so a partial update can never accidentally blank out a field that
  wasn't actually sent. Added `server/test/validation.test.ts` to lock this in.

## Category tabs that could never match real data
- **`app/src/pages/Home.ts`** had a hardcoded category tab list (`Dresses, Tops, Accessories,
  Footwear, Bags`) while categories are actually free-text on the backend. Proof it was broken:
  the seed data's "Chic Denim Jacket" has category `"Outerwear"`, which matches *none* of the
  tabs - permanently unreachable by category filter, and the same trap awaits any admin who
  types a new category name. **Fixed:** tabs are now derived from whatever categories actually
  exist in the product data, so this can't drift out of sync again. Also switched filtering to
  run client-side against the already-fetched product list instead of a server round-trip per
  keystroke - simpler and removes a class of "did the debounce timer fire correctly" bugs.

## AI stylist chat that forgot every conversation immediately
- **`app/src/components/layout.ts`** kept the AI chat history in a local variable inside
  `wireAiPanel()`, but `renderShell()` - called on *every single page navigation* - tears down
  and rebuilds the whole panel from scratch, including that closure. Result: navigate from Home
  to Cart and the "conversation" silently resets, even mid-conversation. **Fixed:** chat history
  now lives in the shared `store` (same place cart/user state already lives), so it survives
  navigation. Also added HTML-escaping when rendering messages, since the history is now
  rendered via `innerHTML` on every re-render rather than `textContent` once.

## A genuinely missing piece, now actually filled in rather than just flagged
- Previously I'd only flagged "no real app icon/splash images" as a gap you'd need to fill
  yourself. This pass actually generated them: `app/resources/icon-only.png` (1024×1024) and
  `app/resources/splash.png` (2732×2732), drawn to match the shop's rose/gold/cream palette and
  monogram style, using the exact filenames `@capacitor/assets` expects in its "Full Control"
  mode. Added `@capacitor/assets` as a dev dependency and an `npm run assets:generate` script
  that turns these into every platform-specific icon/splash size once you've run
  `npx cap add android`/`ios`.

## Stale documentation caught by re-reading against the actual current code
- The README's "what the frontend does" section still described the *old* hardcoded category
  tab list and debounced search - both of which were replaced in an earlier fix (dynamic
  category tabs, instant client-side filtering). Updated the text to match what the code
  actually does now.
- The "Project structure" tree at the end of the README hadn't been updated as files were added
  across several rounds - it was missing `SETUP-CREDENTIALS.md`, `BUGFIXES.md`, `LICENSE`,
  `scripts/`, and `app/resources/`. Brought it up to date.
- Renumbered the README's sections after inserting the new icon/splash section in the middle.

## Vercel deployment failure: "vite: command not found"
- Deploying the repo directly to Vercel failed with `sh: line 1: vite: command not found` /
  `Error: Command "vite build" exited with 127`. Root cause: this is a monorepo, and Vercel was
  building from the repo root, where `vite` was never installed - it's only a devDependency
  inside `app/package.json`, since `app/` is the actual frontend project. **Fixed** two ways:
  added `app/vercel.json` with explicit `installCommand`/`buildCommand`/`outputDirectory` so the
  build doesn't depend on auto-detection guessing correctly, and documented in the README
  (section 5) that Vercel's **Root Directory** project setting needs to point at `app/` - that
  part has to be set in the Vercel dashboard, since it's not something a repo file can control.
  Also confirmed our hash-based routing (`#/path`, never sent to the server) means no SPA
  rewrite rule is needed, unlike most History-API-routed Vite SPAs.

## Stored XSS: product/user data rendered without escaping in several pages
- **`app/src/pages/Product.ts`** rendered `product.name`, `product.description`, and
  `product.imageUrl` directly into `innerHTML` with no escaping at all - unlike `Home.ts` and
  `Dashboard.ts`, which already escaped this data. Since these are admin-entered fields stored
  in the shared product database and shown to every visitor, an admin account entering
  something like `<img src=x onerror=...>` as a product name would execute as real HTML on
  every customer's Product page - a genuine stored XSS bug, not a theoretical one.
- The same missing-escaping pattern turned up in **`Cart.ts`** (product name - same admin-data,
  every-customer-affected risk), **`Account.ts`** (the signed-in user's own Google display
  name/picture URL - Google doesn't guarantee those fields are free of HTML-special characters,
  so this was a self-XSS risk), **`Checkout.ts`** (user email), and **`Dashboard.ts`**'s order
  table (customer email shown to the admin). The email cases are lower-risk in practice (email
  format validation constrains what characters can appear), but fixed for consistency and
  defense-in-depth rather than relying on an upstream format guarantee. All five files now
  escape this data the same way Home.ts and Dashboard.ts's product table already did.

## Stock check/decrement didn't aggregate duplicate line items
- **`server/src/routes/orders.ts`**: if an order's `items` array contained the same `productId`
  more than once (a duplicate line item - not something our own Cart produces since it merges
  quantities, but the API itself never enforced that), the shortage check evaluated each line
  independently against the *original*, undecremented stock - so two lines each requesting 3
  units of a product with only 5 in stock would both individually pass (5 < 3 is false, twice),
  even though the combined request (6) exceeded what was available. The decrement loop would
  then subtract each line's quantity in sequence, pushing the stored stock **negative**.
  **Fixed** by aggregating quantities per unique `productId` before checking or decrementing -
  added `server/test/stock-aggregation.test.ts`, which I actually ran (it has no external
  dependencies): 3/3 pass.

## A redundant double-render on every page load
- **`app/src/router.ts`**'s `startRouter()` called `resolve()` immediately AND registered it as
  a `window.addEventListener("load", resolve)` handler. Since `<script type="module">` already
  runs after the DOM is parsed, the `#app` element the router needs is guaranteed to exist by
  the time the immediate call runs - the `load` listener was redundant and caused an unnecessary
  second render (and a duplicate `/api/products` fetch) on every single page load. Removed it.

## Verified, not bugs (checked rather than assumed)
- Confirmed via the actual `@anthropic-ai/sdk` source that constructing the `Anthropic` client
  does not throw when the API key is missing - it only throws later, when a request is actually
  attempted, and our code already checks for the missing key explicitly before ever reaching
  that path. No fix needed; wanted to be sure rather than assume, since this is exactly the kind
  of "what does the library actually do" question this whole review has been about.
- Confirmed via Vite's official docs that `__dirname` in `vite.config.ts` is deliberately
  special-cased and replaced by Vite's config loader, regardless of the project's own
  `"type": "module"` setting - a common gotcha in general, but not an issue here.

## Vercel deployment failure #2: "astro: command not found"
- After fixing the first Vercel error, a follow-up deploy failed with
  `sh: line 1: astro: command not found` / `Error: Command "astro build" exited with 127`. This
  project doesn't use Astro anywhere - this means the Vercel project's **Framework Preset** got
  set to "Astro" in the dashboard (most likely while troubleshooting the previous error), which
  overrides everything with Astro's default build command. **Fixed** by adding
  `"framework": "vite"` to `app/vercel.json` - confirmed via Vercel's own docs that the
  `framework` key in `vercel.json` explicitly overrides whatever Framework Preset is selected in
  the dashboard, and confirmed `"vite"` is a valid framework slug (it's in Vercel's official
  list) rather than assuming. Documented one thing this fix *can't* reach: if the dashboard's
  Build Command override toggle was also manually turned on with a hand-typed command, that
  takes precedence over `vercel.json` and has to be corrected in the dashboard directly - flagged
  this explicitly in the README rather than silently assuming the file-based fix covers every case.

## Everything else checked and confirmed fine
- Ran the main server's test suite for real (not just syntax-checked) - all 5 tests pass.
- Verified every edited file for balanced brackets/valid JSON.
- Confirmed `@codetrix-studio/capacitor-google-auth@3.4.0-rc.4` (pinned in `app/package.json`)
  is the version confirmed by its maintainers to work with Capacitor 6 - left the Capacitor
  packages on `^6.x` on purpose, since this auth plugin has no confirmed Capacitor 7/8 support
  and hasn't been updated in ~2 years. Upgrading Capacitor without a compatible fork of that
  plugin would trade one bug for another - flagging it here rather than guessing.
