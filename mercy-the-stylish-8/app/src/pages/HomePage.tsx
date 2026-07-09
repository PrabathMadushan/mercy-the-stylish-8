import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { ProductCard } from "../components/ui/ProductCard";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { IconSearch } from "../components/ui/Icons";

const FEATURED_CATEGORIES = ["Dresses", "Tops", "Bags", "Footwear", "Accessories"];

export function HomePage() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", category, search],
    queryFn: () => api.listProducts({ category, search: search || undefined, limit: 50 })
  });

  const categories = useMemo(() => {
    const items = data?.items ?? [];
    const cats = new Set(items.map((p) => p.category));
    return ["All", ...Array.from(cats).sort()];
  }, [data]);

  const productCount = data?.total ?? 0;

  return (
    <div>
      {/* Hero */}
      <section className="relative mb-10 overflow-hidden rounded-brand bg-plum px-6 py-12 text-white md:px-12 md:py-16">
        <div className="relative z-10 max-w-lg">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/70">New season</p>
          <h1 className="mt-3 font-serif text-4xl font-medium leading-tight md:text-5xl">
            Style that speaks for you
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/80 md:text-base">
            Discover curated dresses, tops, bags and accessories — thoughtfully selected for the modern woman.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-rose/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 right-12 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
      </section>

      {/* Search */}
      <div className="relative mb-6">
        <IconSearch className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          placeholder="Search dresses, bags, accessories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-11"
          aria-label="Search products"
        />
      </div>

      {/* Category filters */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              category === cat
                ? "border-plum bg-plum text-white"
                : "border-border bg-white text-muted hover:border-plum/30 hover:text-plum"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Quick category links */}
      {category === "All" && !search && (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {FEATURED_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="card px-4 py-5 text-left transition hover:border-plum/20 hover:shadow-card"
            >
              <p className="text-sm font-medium text-plum">{cat}</p>
              <p className="mt-0.5 text-xs text-muted">Shop now →</p>
            </button>
          ))}
        </div>
      )}

      {/* Product grid header */}
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="section-title">
            {category === "All" ? "All products" : category}
          </h2>
          {!isLoading && (
            <p className="mt-1 text-sm text-muted">{productCount} items</p>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full" />
          ))}
        </div>
      )}

      {error && (
        <p className="rounded-brand border border-rose/20 bg-rose-light px-4 py-3 text-sm text-rose-dark">
          Could not load products. Please try again.
        </p>
      )}

      {!isLoading && data?.items.length === 0 && (
        <EmptyState title="No products found" description="Try a different search or category." />
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {data?.items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
