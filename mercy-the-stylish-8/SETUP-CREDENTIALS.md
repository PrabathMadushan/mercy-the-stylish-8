# Setting up your credentials

These three things are tied to *your* accounts, so I can't create them for you —
but here's exactly where to click and what to paste where.

---

## 1. Google OAuth Web Client ID

**Where to get it:**
1. Go to https://console.cloud.google.com/ and create a project (or pick an existing one) — top-left project dropdown → "New Project" → name it "Mercy the Stylish" → Create.
2. Left sidebar → **APIs & Services → OAuth consent screen**. Choose **External**, fill in app name "Mercy the Stylish", your support email, and your logo (`logo/logo.svg` exported as PNG works) → Save.
3. Left sidebar → **APIs & Services → Credentials → + Create Credentials → OAuth client ID**.
4. Application type: **Web application**. Name it "Mercy the Stylish - Web/Server". You don't need to add redirect URIs for this — the server only uses it to *verify* tokens, not to redirect. Click **Create**.
5. Copy the **Client ID** (looks like `123456789-abc123.apps.googleusercontent.com`).

**Where it goes in the code (already wired, just paste the value in):**

`server/.env`
```
GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
```

`app/capacitor.config.ts` (used on native Android/iOS builds)
```ts
GoogleAuth: {
  scopes: ["profile", "email"],
  serverClientId: "123456789-abc123.apps.googleusercontent.com",  // <- same value here
  ...
}
```

`app/.env` (used when testing sign-in in a browser via `npm run dev` - native builds get the value from `capacitor.config.ts` instead)
```
VITE_GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
```

**Later, when you build for Android/iOS**, come back to Credentials and also create an **Android** client (needs your keystore's SHA-1 — see the keystore section below, `keytool -list -v -keystore release.keystore` prints it) and an **iOS** client (needs your bundle ID, `com.mercythestylish.app`). Those extra client IDs don't go in your code — Google's SDK finds them automatically by matching your app's package name/SHA-1 or bundle ID. Only the Web client ID above goes in your files.

---

## 2. Anthropic API key

**Where to get it:**
1. Go to https://console.anthropic.com/ and sign in / sign up.
2. Left sidebar → **API Keys → Create Key**. Name it "mercy-the-stylish-ai-server".
3. Copy the key (starts with `sk-ant-...`) — it's only shown once.
4. Add a small amount of credit under **Billing** so the key can actually make requests.

**Where it goes:**

`ai-server/.env`
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

That's it — `ai-server/src/routes/style.ts` already reads `process.env.ANTHROPIC_API_KEY` and calls the model. Restart the AI server after adding the key.

---

## 3. Android keystore (for signed release builds)

This is the one you generate yourself, once, and it must never be committed to git or shared.

**Generate it:**
```bash
cd mercy-the-stylish/app
../scripts/generate-android-keystore.sh
```
This must be run from inside `app/` - it puts the keystore at `app/release.keystore`, which is where `key.properties` (below) expects to find it relative to the generated Android project.
It will ask for:
- a keystore password (make one up, save it in a password manager)
- your name/organization (for the certificate — can be anything, e.g. "Mercy the Stylish")
- a key password (press Enter to reuse the keystore password)

At the end it prints a long base64 string and tells you exactly which values to save.

**Where it goes:** GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**, add these four:

| Secret name | Value |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | the long string the script printed |
| `ANDROID_KEYSTORE_PASSWORD` | the keystore password you typed |
| `ANDROID_KEY_ALIAS` | `mercy-the-stylish` (the script sets this automatically) |
| `ANDROID_KEY_PASSWORD` | the key password you typed |

The `android` job in `.github/workflows/ci-cd.yml` already reads these four secrets and uses them to produce a signed `.aab` on every push to `main`. Nothing else in the workflow needs editing.

**For local signed builds** (not through CI), instead of secrets, create `app/android/key.properties` from `android-config/key.properties.example` and fill in the same four values. Then apply the signing config (from inside `app/`, after `npx cap add android`):
```bash
cp ../android-config/signing.gradle android/app/signing.gradle
echo "apply from: 'signing.gradle'" >> android/app/build.gradle
```
This uses Gradle's `apply from:` to add the signing config without hand-editing the generated `build.gradle` - important because `npx cap add android` regenerates that file from scratch every time (the `android/` folder isn't committed to git), so a manual edit would otherwise be silently lost on the next sync.

---

## Quick checklist

- [ ] `server/.env` has `GOOGLE_CLIENT_ID`
- [ ] `app/capacitor.config.ts` has the same `serverClientId`
- [ ] `app/.env` has the same value as `VITE_GOOGLE_CLIENT_ID` (needed for browser testing)
- [ ] `ai-server/.env` has `ANTHROPIC_API_KEY`
- [ ] Ran `../scripts/generate-android-keystore.sh` from inside `app/` and saved the output somewhere safe
- [ ] Added the 4 `ANDROID_*` secrets in GitHub repo settings

Once those are done, `docker compose up --build` (for the servers) and pushing to `main` (for the signed Android build) should both work end to end.
