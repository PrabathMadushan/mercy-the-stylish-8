import { store } from "../store";
import { api } from "../api";

export function renderShell(activePath: string, contentHtml: string) {
  const app = document.getElementById("app")!;
  app.innerHTML = `
    <header class="topbar">
      <div class="brand"><img src="/logo.svg" alt="logo" /> Mercy the Stylish</div>
      <a href="#/cart" class="icon-btn" title="Cart">🛍️</a>
    </header>
    <main class="container" style="padding-bottom: 90px;">${contentHtml}</main>
    <button class="ai-fab" id="ai-fab" title="Ask your AI stylist">✨</button>
    <div class="ai-panel" id="ai-panel">
      <div class="ai-header">
        <span>Your AI Stylist</span>
        <button class="icon-btn" id="ai-close">✕</button>
      </div>
      <div class="ai-messages" id="ai-messages"></div>
      <div class="ai-input-row">
        <input id="ai-input" placeholder="e.g. Something for a wedding guest..." />
        <button class="btn gold" id="ai-send">Send</button>
      </div>
    </div>
    <nav class="bottom-nav">
      <a href="#/" class="${activePath === "/" ? "active" : ""}">🏠<span>Shop</span></a>
      <a href="#/cart" class="${activePath === "/cart" ? "active" : ""}">🛍️<span>Cart</span></a>
      <a href="#/orders" class="${activePath === "/orders" ? "active" : ""}">📦<span>Orders</span></a>
      ${store.user?.isAdmin ? `<a href="#/dashboard" class="${activePath === "/dashboard" ? "active" : ""}">📊<span>Dashboard</span></a>` : ""}
      <a href="#/account" class="${activePath === "/account" ? "active" : ""}">👤<span>Account</span></a>
    </nav>
  `;

  wireAiPanel();
}

function renderHistory() {
  const messagesEl = document.getElementById("ai-messages");
  if (!messagesEl) return;

  if (!store.aiChatHistory.length) {
    messagesEl.innerHTML = `<div class="ai-bubble assistant">Hi! Tell me the occasion, your size, or a style you love, and I'll suggest pieces from Mercy the Stylish.</div>`;
    return;
  }

  messagesEl.innerHTML = store.aiChatHistory
    .map((m) => `<div class="ai-bubble ${m.role}">${escapeHtml(m.content)}</div>`)
    .join("");
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function wireAiPanel() {
  const fab = document.getElementById("ai-fab")!;
  const panel = document.getElementById("ai-panel")!;
  const close = document.getElementById("ai-close")!;
  const send = document.getElementById("ai-send")!;
  const input = document.getElementById("ai-input") as HTMLInputElement;

  renderHistory();

  fab.addEventListener("click", () => panel.classList.add("open"));
  close.addEventListener("click", () => panel.classList.remove("open"));

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    store.aiChatHistory.push({ role: "user", content: text });
    renderHistory();

    const messagesEl = document.getElementById("ai-messages")!;
    const thinkingBubble = document.createElement("div");
    thinkingBubble.className = "ai-bubble assistant";
    thinkingBubble.textContent = "Thinking...";
    messagesEl.appendChild(thinkingBubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    try {
      const { reply } = await api.chatWithStylist(store.aiChatHistory);
      store.aiChatHistory.push({ role: "assistant", content: reply });
    } catch {
      store.aiChatHistory.push({
        role: "assistant",
        content: "Sorry, I couldn't reach the stylist service. Please try again shortly."
      });
    }
    renderHistory();
  }

  send.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
