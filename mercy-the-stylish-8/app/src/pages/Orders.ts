import { api } from "../api";
import { store } from "../store";
import { renderShell } from "../components/layout";

export async function OrdersPage() {
  if (!store.user) {
    renderShell("/orders", `<p>Sign in to see your orders.</p><a class="btn" href="#/account">Go to account</a>`);
    return;
  }
  renderShell("/orders", `<p>Loading orders...</p>`);
  try {
    const all = await api.listOrders();
    const mine = all.filter((o) => o.userEmail === store.user!.email);
    const html = mine
      .map(
        (o) => `
      <div class="card" style="padding:14px;margin-bottom:12px;">
        <div class="info" style="padding:0;">
          <p class="name">Order #${o.id.slice(0, 8)} · ${o.status}</p>
          <p class="price">UGX ${o.total.toLocaleString()}</p>
          <p style="font-size:12px;color:#888;">${new Date(o.createdAt).toLocaleString()}</p>
        </div>
      </div>`
      )
      .join("");
    renderShell("/orders", `<h2 style="color:var(--plum);">Your orders</h2>${html || "<p>No orders yet.</p>"}`);
  } catch {
    renderShell("/orders", `<p>Could not load orders.</p>`);
  }
}
