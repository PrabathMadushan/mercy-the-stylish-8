import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { formatUGX } from "../lib/api";
import { ProductImage } from "../components/ui/ProductImage";
import { EmptyState } from "../components/ui/EmptyState";

export function CartPage() {
  const { items, removeFromCart, updateQuantity, cartTotal } = useCart();
  const total = cartTotal();
  const shipping = total >= 200000 ? 0 : 10000;

  if (!items.length) {
    return (
      <EmptyState
        title="Your bag is empty"
        description="Looks like you haven't added anything yet."
        action={
          <Link to="/" className="btn">
            Continue shopping
          </Link>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="section-title mb-8">Shopping bag</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="card flex gap-4 p-4"
          >
            <Link to={`/product/${item.product.id}`} className="shrink-0">
              <ProductImage
                src={item.product.imageUrl}
                alt={item.product.name}
                className="h-28 w-20 rounded-lg object-cover"
              />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <Link
                to={`/product/${item.product.id}`}
                className="truncate font-medium text-plum hover:text-rose"
              >
                {item.product.name}
              </Link>
              <p className="mt-0.5 text-xs uppercase tracking-wide text-muted">{item.product.category}</p>
              <p className="mt-1 text-sm font-semibold">{formatUGX(item.product.price)}</p>

              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="inline-flex items-center rounded-brand border border-border text-sm">
                  <button
                    className="px-3 py-1.5 text-muted hover:text-plum"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="min-w-[2rem] border-x border-border py-1.5 text-center font-medium">
                    {item.quantity}
                  </span>
                  <button
                    className="px-3 py-1.5 text-muted hover:text-plum"
                    onClick={() =>
                      updateQuantity(
                        item.product.id,
                        Math.min(item.product.stock, item.quantity + 1)
                      )
                    }
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-plum">
                    {formatUGX(item.product.price * item.quantity)}
                  </p>
                  <button
                    className="mt-0.5 text-xs text-muted underline hover:text-rose"
                    onClick={() => removeFromCart(item.product.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-8 p-6">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span className="font-medium">{formatUGX(total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Shipping</span>
            <span className="font-medium">
              {shipping === 0 ? "Free" : formatUGX(shipping)}
            </span>
          </div>
          {total < 200000 && (
            <p className="text-xs text-muted">
              Add {formatUGX(200000 - total)} more for free delivery
            </p>
          )}
          <div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-plum">
            <span>Total</span>
            <span>{formatUGX(total + shipping)}</span>
          </div>
        </div>
        <Link to="/checkout" className="btn-accent mt-6 block w-full text-center">
          Proceed to checkout
        </Link>
        <Link to="/" className="mt-3 block text-center text-sm text-muted hover:text-plum">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
