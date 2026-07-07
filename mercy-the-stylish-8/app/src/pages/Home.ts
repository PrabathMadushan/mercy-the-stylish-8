import { api } from "../api";
import { renderShell } from "../components/layout";
import type { Product } from "../types";

let activeCategory = "All";
let activeSearch = "";
let allProducts: Product[] = [];

export async function HomePage() {
  renderShell("/", `<p>Loading the latest collection...</p>`);

  try {
    allProducts = await api.listProducts();
  } catch {
    renderShell("/", `<p>Could not load products. Is the main server running?</p>`);
    return;
  }

  render();
}

function render() {
  const categories = ["All", ...Array.from(new Set(allProducts.map((p) => p.category))).sort()];
  const filtered = applyFilters(allProducts);

  renderShell(
    "/",
    `
    <div class="hero">
      <h1>Style meets sweetness</h1>
      <p>Latest collections · Trendy dresses · Chic tops · Accessories · Footwear · Bags</p>
    </div>
    <div class="form-group">
      <input id="search-input" placeholder="Search for dresses, bags, shoes..." value="${escapeHtml(activeSearch)}" />
    </div>
    <div class="row" id="category-tabs" style="flex-wrap:wrap;gap:8px;margin-bottom:14px;">
      ${categories
        .map(
          (c) =>
            `<button class="btn ${c === activeCategory ? "" : "secondary"}" data-category="${escapeHtml(c)}" style="flex:none;padding:8px 16px;font-size:13px;">${escapeHtml(c)}</button>`
        )
        .join("")}
    </div>
    <div id="product-grid">${renderGrid(filtered)}</div>
  `
  );

  wireControls();
}

function applyFilters(products: Product[]): Product[] {
  let result = products;
  if (activeCategory !== "All") {
    result = result.filter((p) => p.category === activeCategory);
  }
  if (activeSearch.trim()) {
    const q = activeSearch.trim().toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }
  return result;
}

function renderGrid(products: Product[]): string {
  if (!products.length) {
    return `<p>No products match that search yet.</p>`;
  }
  const cards = products
    .map(
      (p) => `
      <a class="card" href="#/product/${p.id}">
        <img src="${p.imageUrl}" alt="${escapeHtml(p.name)}" />
        <div class="info">
          <p class="name">${escapeHtml(p.name)}</p>
          <p class="price">UGX ${p.price.toLocaleString()}</p>
        </div>
      </a>`
    )
    .join("");
  return `<div class="grid">${cards}</div>`;
}

function wireControls() {
  document.querySelectorAll<HTMLButtonElement>("[data-category]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category!;
      render();
    });
  });

  const searchInput = document.getElementById("search-input") as HTMLInputElement | null;
  searchInput?.addEventListener("input", () => {
    activeSearch = searchInput.value;
    const gridEl = document.getElementById("product-grid");
    if (gridEl) gridEl.innerHTML = renderGrid(applyFilters(allProducts));
  });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
