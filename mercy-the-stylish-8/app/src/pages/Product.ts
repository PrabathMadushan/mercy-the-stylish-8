import { api } from "../api";
import { store } from "../store";
import { renderShell } from "../components/layout";
import { navigate } from "../router";

export async function ProductPage(params: Record<string, string>) {
  renderShell("/", `<p>Loading product...</p>`);
  try {
    const id = params.id;
    if (!id) {
      renderShell("/", `<p>Product not found.</p>`);
      return;
    }

    const product = await api.getProduct(id);
    const maxQty = Math.max(product.stock, 0);

    renderShell(
      "/",
      `
      <img src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.name)}" style="width:100%;border-radius:16px;margin-bottom:14px;" />
      <h2 style="color:var(--plum);margin:0 0 4px;">${escapeHtml(product.name)}</h2>
      <p style="color:var(--rose-dark);font-weight:700;font-size:18px;">UGX ${product.price.toLocaleString()}</p>
      <p style="color:#555;">${escapeHtml(product.description)}</p>
      <p style="font-size:13px;color:#888;">${product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p>

      ${
        maxQty > 0
          ? `
        <div class="row" style="align-items:center;margin:14px 0;max-width:160px;">
          <button class="btn secondary" id="qty-minus" style="flex:none;padding:8px 14px;">−</button>
          <input id="qty-input" type="number" min="1" max="${maxQty}" value="1"
                 style="text-align:center;border:1px solid var(--blush);border-radius:10px;padding:8px;width:60px;" />
          <button class="btn secondary" id="qty-plus" style="flex:none;padding:8px 14px;">+</button>
        </div>
      `
          : ""
      }

      <button class="btn" id="add-cart" ${maxQty <= 0 ? "disabled" : ""}>Add to cart</button>
    `
    );

    const qtyInput = document.getElementById("qty-input") as HTMLInputElement | null;

    function clampQty(): number {
      if (!qtyInput) return 1;
      let val = parseInt(qtyInput.value || "1", 10);
      if (Number.isNaN(val) || val < 1) val = 1;
      if (val > maxQty) val = maxQty;
      qtyInput.value = String(val);
      return val;
    }

    document.getElementById("qty-minus")?.addEventListener("click", () => {
      if (!qtyInput) return;
      qtyInput.value = String(Math.max(1, parseInt(qtyInput.value || "1", 10) - 1));
    });
    document.getElementById("qty-plus")?.addEventListener("click", () => {
      if (!qtyInput) return;
      qtyInput.value = String(Math.min(maxQty, parseInt(qtyInput.value || "1", 10) + 1));
    });
    qtyInput?.addEventListener("change", clampQty);

    document.getElementById("add-cart")?.addEventListener("click", () => {
      const quantity = clampQty();
      store.addToCart(product, quantity);
      navigate("/cart");
    });
  } catch {
    renderShell("/", `<p>Product not found.</p>`);
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
