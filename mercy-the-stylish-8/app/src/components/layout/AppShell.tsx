import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { ErrorBoundary } from "../ErrorBoundary";
import { IconCart, IconUser, IconBag } from "../ui/Icons";

const navLinks = [
  { to: "/", label: "Shop" },
  { to: "/orders", label: "Orders", protected: true },
  { to: "/account", label: "Account" }
];

export function AppShell() {
  const { user } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const count = cartCount();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Announcement bar */}
      <div className="bg-plum py-2 text-center text-xs font-medium tracking-wide text-white">
        Free delivery in Kampala on orders over UGX 200,000
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-shop items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link to="/" className="shrink-0">
            <span className="font-serif text-xl font-semibold tracking-tight text-plum md:text-2xl">
              Mercy
            </span>
            <span className="ml-1 hidden text-xs font-normal uppercase tracking-[0.2em] text-muted sm:inline">
              the Stylish
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
            {navLinks.map((link) => {
              if (link.protected && !user) return null;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition ${
                    isActive(link.to) ? "text-plum" : "text-muted hover:text-plum"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {user?.isAdmin && (
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition ${
                  isActive("/dashboard") ? "text-plum" : "text-muted hover:text-plum"
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/account"
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition hover:bg-cream hover:text-plum"
              aria-label="Account"
            >
              <IconUser />
            </Link>
            <Link
              to="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted transition hover:bg-cream hover:text-plum"
              aria-label={`Cart${count ? `, ${count} items` : ""}`}
            >
              <IconCart />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[10px] font-bold text-white">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-shop flex-1 px-4 py-6 md:px-8 md:py-10">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-8">
        <div className="mx-auto max-w-shop px-4 text-center md:px-8">
          <p className="font-serif text-lg text-plum">Mercy the Stylish</p>
          <p className="mt-1 text-sm text-muted">Curated women's fashion · Kampala, Uganda</p>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-white/95 backdrop-blur-md md:hidden"
        aria-label="Mobile navigation"
      >
        <div className="flex justify-around py-2">
          {navLinks.map((link) => {
            if (link.protected && !user) return null;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex flex-col items-center gap-0.5 px-4 py-1 text-[10px] font-medium ${
                  isActive(link.to) ? "text-plum" : "text-muted"
                }`}
              >
                {link.to === "/" && <IconBag className="h-5 w-5" />}
                {link.to === "/orders" && <IconBag className="h-5 w-5" />}
                {link.to === "/account" && <IconUser className="h-5 w-5" />}
                {link.label}
              </Link>
            );
          })}
          <Link
            to="/cart"
            className={`relative flex flex-col items-center gap-0.5 px-4 py-1 text-[10px] font-medium ${
              isActive("/cart") ? "text-plum" : "text-muted"
            }`}
          >
            <IconCart className="h-5 w-5" />
            Cart
            {count > 0 && (
              <span className="absolute right-2 top-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose text-[9px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </nav>

      <div className="h-16 md:hidden" />
    </div>
  );
}
