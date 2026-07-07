import { api } from "../api";
import { store } from "../store";
import { renderShell } from "../components/layout";
import type { Product } from "../types";

let editingProductId: string | null = null;

export async function DashboardPage() {
  if (!store.user?.isAdmin) {
    renderShell("/dashboard", `<p>This area is for shop admins only.</p>`);
    return;
  }

  renderShell("/dashboard", `<p>Loading dashboard...</p>`);

  const [products, orders] = await Promise.all([api.listProducts(), api.listOrders()]);
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const editingProduct = editingProductId ? products.find((p) => p.id === editingProductId) ?? null : null;

  const productRows = products
    .map(
      (p) => `
      <tr>
        <td>${escapeHtml(p.name)}</td>
        <td>UGX ${p.price.toLocaleString()}</td>
        <td>${p.stock}</td>
        <td><button class="btn secondary" data-edit="${p.id}" style="padding:6px 12px;font-size:12px;">Edit</button>
            <button class="btn secondary" data-del="${p.id}" style="padding:6px 12px;font-size:12px;">Delete</button></td>
      </tr>`
    )
    .join("");

  const orderRows = orders
    .map(
      (o) => `
      <tr>
        <td>${o.id.slice(0, 8)}</td>
        <td>${escapeHtml(o.userEmail)}</td>
        <td>UGX ${o.total.toLocaleString()}</td>
        <td>
          <select data-status="${o.id}">
            ${["pending", "confirmed", "shipped", "delivered", "cancelled"]
              .map((s) => `<option value="${s}" ${s === o.status ? "selected" : ""}>${s}</option>`)
              .join("")}
          </select>
        </td>
      </tr>`
    )
    .join("");

  renderShell(
    "/dashboard",
    `
    <h2 style="color:var(--plum);">Dashboard</h2>
    <div class="row" style="margin-bottom:18px;">
      <div class="dashboard-stat"><div class="num">${products.length}</div><div class="label">Products</div></div>
      <div class="dashboard-stat"><div class="num">${orders.length}</div><div class="label">Orders</div></div>
      <div class="dashboard-stat"><div class="num">UGX ${revenue.toLocaleString()}</div><div class="label">Revenue</div></div>
    </div>

    <h3 style="color:var(--plum);">${editingProduct ? "Edit product" : "Add a product"}</h3>
    <div class="form-group"><label>Name</label><input id="p-name" value="${escapeHtml(editingProduct?.name ?? "")}" /></div>
    <div class="row">
      <div class="form-group"><label>Price (UGX)</label><input id="p-price" type="number" value="${editingProduct?.price ?? ""}" /></div>
      <div class="form-group"><label>Stock</label><input id="p-stock" type="number" value="${editingProduct?.stock ?? ""}" /></div>
    </div>
    <div class="form-group"><label>Category</label><input id="p-category" placeholder="Dresses, Tops, Bags..." value="${escapeHtml(editingProduct?.category ?? "")}" /></div>
    <div class="form-group"><label>Image URL</label><input id="p-image" placeholder="https://..." value="${escapeHtml(editingProduct?.imageUrl ?? "")}" /></div>
    <div class="form-group"><label>Description</label><textarea id="p-desc" rows="2">${escapeHtml(editingProduct?.description ?? "")}</textarea></div>
    <button class="btn" id="p-save">${editingProduct ? "Save changes" : "Add product"}</button>
    ${editingProduct ? `<button class="btn secondary" id="p-cancel-edit">Cancel</button>` : ""}
    <p id="p-error" style="color:var(--rose-dark);"></p>

    <h3 style="color:var(--plum);margin-top:24px;">Products</h3>
    <div class="table-wrap"><table>
      <thead><tr><th>Name</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
      <tbody>${productRows}</tbody>
    </table></div>

    <h3 style="color:var(--plum);margin-top:24px;">Orders</h3>
    <div class="table-wrap"><table>
      <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
      <tbody>${orderRows}</tbody>
    </table></div>
  `
  );

  document.getElementById("p-save")?.addEventListener("click", async () => {
    const errorEl = document.getElementById("p-error")!;
    const data: Partial<Product> = {
      name: (document.getElementById("p-name") as HTMLInputElement).value.trim(),
      price: Number((document.getElementById("p-price") as HTMLInputElement).value),
      stock: Number((document.getElementById("p-stock") as HTMLInputElement).value),
      category: (document.getElementById("p-category") as HTMLInputElement).value.trim(),
      imageUrl: (document.getElementById("p-image") as HTMLInputElement).value.trim(),
      description: (document.getElementById("p-desc") as HTMLTextAreaElement).value.trim()
    };
    if (!data.name || !data.price) {
      errorEl.textContent = "Name and price are required.";
      return;
    }
    try {
      if (editingProductId) {
        await api.updateProduct(editingProductId, data);
        editingProductId = null;
      } else {
        await api.createProduct(data);
      }
      DashboardPage();
    } catch (err: any) {
      errorEl.textContent = err.message || "Could not save product.";
    }
  });

  document.getElementById("p-cancel-edit")?.addEventListener("click", () => {
    editingProductId = null;
    DashboardPage();
  });

  document.querySelectorAll("[data-edit]").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      editingProductId = (e.currentTarget as HTMLElement).dataset.edit!;
      DashboardPage();
    })
  );

  document.querySelectorAll("[data-del]").forEach((btn) =>
    btn.addEventListener("click", async (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.del!;
      if (editingProductId === id) editingProductId = null;
      await api.deleteProduct(id);
      DashboardPage();
    })
  );

  document.querySelectorAll("[data-status]").forEach((sel) =>
    sel.addEventListener("change", async (e) => {
      const target = e.currentTarget as HTMLSelectElement;
      const id = target.dataset.status!;
      await api.updateOrderStatus(id, target.value as any);
      DashboardPage();
    })
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
