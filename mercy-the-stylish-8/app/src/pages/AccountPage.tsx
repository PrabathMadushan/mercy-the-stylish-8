import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export function AccountPage() {
  const { user, signIn, signOut, loading } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from;

  if (loading) {
    return <p className="text-gray-500">Loading...</p>;
  }

  if (!user) {
    return (
      <Card className="text-center">
        <h1 className="font-serif text-2xl italic text-plum">Sign in</h1>
        <p className="mt-2 text-sm text-gray-600">
          Sign in with Google to checkout, view orders, and manage your account.
        </p>
        {from && (
          <p className="mt-2 text-sm text-rose-dark">Please sign in to continue to {from}.</p>
        )}
        <Button className="mt-6 w-full" onClick={() => signIn().catch(console.error)}>
          Sign in with Google
        </Button>
      </Card>
    );
  }

  return (
    <div>
      <h1 className="mb-4 font-serif text-2xl italic text-plum">Account</h1>
      <Card className="flex items-center gap-4">
        {user.imageUrl ? (
          <img src={user.imageUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blush text-xl text-plum">
            {user.name[0]}
          </div>
        )}
        <div>
          <p className="font-semibold text-plum">{user.name}</p>
          <p className="text-sm text-gray-600">{user.email}</p>
          {user.isAdmin && (
            <span className="mt-1 inline-block rounded-full bg-gold/20 px-2 py-0.5 text-xs font-semibold text-plum">
              Admin
            </span>
          )}
        </div>
      </Card>
      <Button variant="secondary" className="mt-4 w-full" onClick={signOut}>
        Sign out
      </Button>
    </div>
  );
}
