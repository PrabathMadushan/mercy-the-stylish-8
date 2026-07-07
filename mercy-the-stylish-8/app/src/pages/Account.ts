import { store } from "../store";
import { renderShell } from "../components/layout";
import { signInWithGoogle, signOutOfGoogle } from "../auth/googleAuth";
import { clearSession } from "../api";

export function AccountPage() {
  if (store.user) {
    renderShell(
      "/account",
      `
      <div class="center-screen" style="min-height:auto;padding:32px 0;">
        <img src="${escapeHtml(store.user.imageUrl || "/logo.svg")}" style="width:72px;border-radius:50%;" />
        <h3 style="color:var(--plum);margin:0;">${escapeHtml(store.user.name)}</h3>
        <p style="color:#666;margin:0;">${escapeHtml(store.user.email)}</p>
        <button class="btn secondary" id="signout">Sign out</button>
      </div>
    `
    );
    document.getElementById("signout")?.addEventListener("click", async () => {
      await signOutOfGoogle();
      await clearSession();
      store.user = null;
      AccountPage();
    });
  } else {
    renderShell(
      "/account",
      `
      <div class="center-screen" style="min-height:auto;padding:32px 0;">
        <img src="/logo.svg" style="width:72px;" />
        <h3 style="color:var(--plum);">Welcome to Mercy the Stylish</h3>
        <p style="color:#666;">Sign in with Google to save your cart, track orders, and get outfit ideas from our AI stylist.</p>
        <button class="btn" id="google-signin">Sign in with Google</button>
        <p id="signin-error" style="color:var(--rose-dark);"></p>
      </div>
    `
    );
    document.getElementById("google-signin")?.addEventListener("click", async () => {
      const errorEl = document.getElementById("signin-error")!;
      try {
        const user = await signInWithGoogle();
        store.user = user;
        AccountPage();
      } catch (err: any) {
        errorEl.textContent = err.message || "Sign-in failed. Please try again.";
      }
    });
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
