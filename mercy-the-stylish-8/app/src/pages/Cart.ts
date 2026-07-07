import { store } from "../store";
import { renderShell } from "../components/layout";
import { navigate } from "../router";

export function CartPage() {
  const rows = store.cart
    .map(
      (item) => `
      <div class="row" style="align-items:center;margin-bottom:10px;">
        <div style="flex:2;">
          <strong>${escapeHtml(item.product.name)}</strong><br/>
          <span style="color:var(--rose-dark);">UGX ${item.product.price.toLocaleString()} × ${item.quantity}</span>
        </div>
        <button class="btn secondary" data-remove="${item.product.id}" style="flex:0;padding:8px 14px;">Remove</button>
      </div>`
    )
    .join("");

  renderShell(
    "/cart",
    `
    <h2 style="color:var(--plum);">Your bag</h2>
    ${store.cart.length ? rows : "<p>Your bag is empty. Go find something lovely!</p>"}
    ${
      store.cart.length
        ? `<p style="font-size:18px;font-weight:700;color:var(--plum);margin-top:16px;">Total: UGX ${store
            .cartTotal()
            .toLocaleString()}</p>
           <button class="btn" id="checkout-btn">Checkout</button>`
        : `<a class="btn" href="#/">Browse the shop</a>`
    }
  `
  );

  document.querySelectorAll("[data-remove]").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.remove!;
      store.removeFromCart(id);
      CartPage();
    })
  );

  document.getElementById("checkout-btn")?.addEventListener("click", () => navigate("/checkout"));
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
