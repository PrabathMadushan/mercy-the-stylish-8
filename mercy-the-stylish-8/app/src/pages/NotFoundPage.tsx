import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="py-12 text-center">
      <h1 className="font-serif text-3xl italic text-plum">404</h1>
      <p className="mt-2 text-gray-600">Page not found</p>
      <Link to="/" className="mt-6 inline-block">
        <Button>Back to shop</Button>
      </Link>
    </div>
  );
}
