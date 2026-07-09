import { Link } from "react-router-dom";
import type { Product } from "../../types";
import { formatUGX } from "../../lib/api";
import { ProductImage } from "./ProductImage";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const outOfStock = product.stock <= 0;

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <article className="card overflow-hidden transition duration-300 group-hover:shadow-hover">
        <div className="relative aspect-[3/4] overflow-hidden bg-blush/30">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          {outOfStock && (
            <span className="absolute left-3 top-3 rounded-full bg-plum/90 px-2.5 py-1 text-xs font-medium text-white">
              Sold out
            </span>
          )}
          {!outOfStock && product.stock <= 3 && (
            <span className="absolute left-3 top-3 rounded-full bg-rose/90 px-2.5 py-1 text-xs font-medium text-white">
              Low stock
            </span>
          )}
        </div>
        <div className="p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">{product.category}</p>
          <h3 className="mt-1 line-clamp-2 text-sm font-medium text-plum group-hover:text-rose">
            {product.name}
          </h3>
          <p className="mt-2 text-sm font-semibold text-plum">{formatUGX(product.price)}</p>
        </div>
      </article>
    </Link>
  );
}
