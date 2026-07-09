import { useState } from "react";

export function ProductImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className={`flex items-center justify-center bg-blush/40 text-xs text-muted ${className ?? ""}`}>
        <span>No image</span>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} loading="lazy" />;
}
