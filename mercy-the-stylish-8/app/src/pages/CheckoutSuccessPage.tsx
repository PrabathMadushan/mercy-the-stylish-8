import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <Card className="text-center">
      <p className="text-4xl">✅</p>
      <h1 className="mt-3 font-serif text-2xl italic text-plum">Payment successful!</h1>
      <p className="mt-2 text-sm text-gray-600">
        {orderId ? `Order #${orderId.slice(0, 8)}… is confirmed.` : "Your order is confirmed."}
      </p>
      <div className="mt-6 flex flex-col gap-3">
        {orderId && (
          <Link to={`/orders/${orderId}`}>
            <Button className="w-full">View order</Button>
          </Link>
        )}
        <Link to="/orders">
          <Button variant="secondary" className="w-full">
            All orders
          </Button>
        </Link>
      </div>
    </Card>
  );
}
