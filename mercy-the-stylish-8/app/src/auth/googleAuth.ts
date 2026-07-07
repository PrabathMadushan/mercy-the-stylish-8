import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { api, saveSession } from "../api";
import type { User } from "../types";

let initialized = false;

export function initGoogleAuth() {
  if (initialized) return;
  // On native (Android/iOS), Capacitor injects the config from capacitor.config.ts
  // automatically. In a browser (e.g. `npm run dev`), the plugin needs the client ID
  // passed explicitly here - that's what VITE_GOOGLE_CLIENT_ID is for.
  const webClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
  GoogleAuth.initialize({
    clientId: webClientId,
    scopes: ["profile", "email"],
    grantOfflineAccess: true
  });
  initialized = true;
}

/**
 * Signs the user in with Google, sends the ID token to the main server for
 * verification, and stores the returned session (JWT + profile) locally.
 */
export async function signInWithGoogle(): Promise<User> {
  initGoogleAuth();
  const googleUser = await GoogleAuth.signIn();
  const idToken = googleUser.authentication.idToken;
  if (!idToken) {
    throw new Error("Google did not return an ID token. Check your OAuth client configuration.");
  }
  const user = await api.loginWithGoogle(idToken);
  await saveSession(user);
  return user;
}

export async function signOutOfGoogle() {
  try {
    await GoogleAuth.signOut();
  } catch {
    // ignore - user may not have an active native session (e.g. web dev mode)
  }
}
