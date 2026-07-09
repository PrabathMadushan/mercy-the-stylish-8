import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, formatUGX } from "../lib/api";
import { useCart } from "../contexts/CartContext";
import { useToast } from "../contexts/ToastContext";
import { Button } from "../components/ui/Button";
import { ProductImage } from "../components/ui/ProductImage";
import { Skeleton } from "../components/ui/Skeleton";

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [qty, setQty] = useState(1);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => api.getProduct(id!),
    enabled: Boolean(id)
  });

  if (isLoading) {
    return (
      <div className="grid gap-8 md:grid-cols-2">
        <Skeleton className="aspect-[3/4] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted">Product not found.</p>
        <Link to="/" className="btn mt-4 inline-block">Back to shop</Link>
      </div>
    );
  }

  const maxQty = Math.max(product.stock, 0);

  return (
    <div>
      <nav className="mb-6 text-sm text-muted">
        <Link to="/" className="hover:text-plum">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-plum">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <div className="overflow-hidden rounded-brand border border-border bg-blush/20">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            className="aspect-[3/4] w-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">{product.category}</p>
          <h1 className="mt-2 font-serif text-3xl font-medium text-plum md:text-4xl">{product.name}</h1>
          <p className="mt-3 text-2xl font-semibold text-plum">{formatUGX(product.price)}</p>

          <p className="mt-6 leading-relaxed text-muted">{product.description}</p>

          <div className="mt-4">
            {maxQty > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-green-700">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                {product.stock} in stock
              </span>
            ) : (
              <span className="text-sm font-medium text-rose">Out of stock</span>
            )}
          </div>

          {maxQty > 0 && (
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-plum">Quantity</label>
              <div className="inline-flex items-center rounded-brand border border-border">
                <button
                  className="px-4 py-2.5 text-lg text-muted transition hover:text-plum"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="min-w-[3rem] border-x border-border py-2.5 text-center text-sm font-medium">
                  {qty}
                </span>
                <button
                  className="px-4 py-2.5 text-lg text-muted transition hover:text-plum"
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="accent"
              className="flex-1"
              disabled={maxQty <= 0}
              onClick={() => {
                addToCart(product, qty);
                showToast("Added to cart", "success");
              }}
            >
              Add to cart
            </Button>
            <Button
              className="flex-1"
              disabled={maxQty <= 0}
              onClick={() => {
                addToCart(product, qty);
                navigate("/cart");
              }}
            >
              Buy now
            </Button>
          </div>

          <div className="mt-8 space-y-2 border-t border-border pt-6 text-sm text-muted">
            <p>✓ Secure checkout with Stripe</p>
            <p>✓ Free delivery in Kampala over UGX 200,000</p>
            <p>✓ Easy returns within 7 days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
