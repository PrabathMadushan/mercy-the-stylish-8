import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Skeleton } from "../ui/Skeleton";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/account" replace />;
  if (!user.isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}
