import { store } from "../store";
import { api } from "../api";
import { renderShell } from "../components/layout";
import { navigate } from "../router";

export function CheckoutPage() {
  if (!store.cart.length) {
    navigate("/cart");
    return;
  }
  if (!store.user) {
    renderShell(
      "/checkout",
      `<p>Please sign in with Google before checking out.</p><a class="btn" href="#/account">Go to account</a>`
    );
    return;
  }

  renderShell(
    "/checkout",
    `
    <h2 style="color:var(--plum);">Checkout</h2>
    <p>Signed in as ${escapeHtml(store.user.email)}</p>
    <p style="font-weight:700;color:var(--plum);">Total: UGX ${store.cartTotal().toLocaleString()}</p>
    <div class="form-group">
      <label>Delivery address</label>
      <textarea id="address" rows="3" placeholder="e.g. Plot 12, Kampala Road, Kampala"></textarea>
    </div>
    <button class="btn" id="place-order">Place order</button>
    <p id="checkout-error" style="color:var(--rose-dark);"></p>
  `
  );

  document.getElementById("place-order")?.addEventListener("click", async () => {
    const address = (document.getElementById("address") as HTMLTextAreaElement).value.trim();
    const errorEl = document.getElementById("checkout-error")!;
    if (!address) {
      errorEl.textContent = "Please enter a delivery address.";
      return;
    }
    try {
      await api.createOrder({
        userEmail: store.user!.email,
        items: store.cart.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity
        })),
        total: store.cartTotal()
      });
      store.clearCart();
      navigate("/orders");
    } catch (err: any) {
      errorEl.textContent = err.message || "Could not place order.";
    }
  });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
