import { api } from "../lib/api";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

function waitForGoogle(): Promise<typeof window.google> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve(window.google);
      return;
    }
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.google?.accounts?.id) {
        clearInterval(interval);
        resolve(window.google);
      } else if (attempts > 50) {
        clearInterval(interval);
        reject(new Error("Google Sign-In failed to load"));
      }
    }, 100);
  });
}

export async function signInWithGoogle() {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("VITE_GOOGLE_CLIENT_ID is not configured");
  }

  const google = await waitForGoogle();

  return new Promise<Awaited<ReturnType<typeof api.loginWithGoogle>>>((resolve, reject) => {
    google!.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          const user = await api.loginWithGoogle(response.credential);
          resolve(user);
        } catch (err) {
          reject(err);
        }
      }
    });
    google!.accounts.id.prompt();
  });
}
