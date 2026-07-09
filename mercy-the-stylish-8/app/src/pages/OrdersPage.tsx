import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, formatUGX, formatStatus } from "../lib/api";
import { statusColor } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";

export function OrdersPage() {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["orders"],
    queryFn: api.listOrders
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) return <p className="text-rose-dark">Could not load orders.</p>;

  if (!orders?.length) {
    return (
      <EmptyState
        title="No orders yet"
        description="When you place an order, it will appear here."
        action={
          <Link to="/" className="btn">
            Start shopping
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <h1 className="mb-4 font-serif text-2xl italic text-plum">Your orders</h1>
      <div className="space-y-3">
        {orders.map((order) => (
          <Link key={order.id} to={`/orders/${order.id}`}>
            <Card className="transition hover:shadow-lg">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-plum">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <Badge className={statusColor(order.status)}>{formatStatus(order.status)}</Badge>
              </div>
              <p className="mt-2 font-bold text-rose-dark">{formatUGX(order.total)}</p>
              <p className="text-sm text-gray-500">{order.items.length} item(s)</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
