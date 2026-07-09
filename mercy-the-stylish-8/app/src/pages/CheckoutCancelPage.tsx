import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export function CheckoutCancelPage() {
  return (
    <Card className="text-center">
      <p className="text-4xl">↩️</p>
      <h1 className="mt-3 font-serif text-2xl italic text-plum">Payment cancelled</h1>
      <p className="mt-2 text-sm text-gray-600">No charge was made. Your cart items are still available.</p>
      <div className="mt-6 flex flex-col gap-3">
        <Link to="/cart">
          <Button className="w-full">Back to cart</Button>
        </Link>
        <Link to="/">
          <Button variant="secondary" className="w-full">
            Continue shopping
          </Button>
        </Link>
      </div>
    </Card>
  );
}
