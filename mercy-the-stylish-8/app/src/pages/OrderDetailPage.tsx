import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, formatUGX, formatStatus } from "../lib/api";
import { statusColor } from "../lib/utils";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";

const STATUS_STEPS = ["pending_payment", "paid", "confirmed", "shipped", "delivered"] as const;

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => api.getOrder(id!),
    enabled: Boolean(id)
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <p className="text-rose-dark">Order not found.</p>
        <Link to="/orders" className="btn mt-4 inline-block">
          Back to orders
        </Link>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(order.status as (typeof STATUS_STEPS)[number]);

  return (
    <div>
      <Link to="/orders" className="text-sm text-rose-dark">← Back to orders</Link>
      <h1 className="mt-2 font-serif text-2xl italic text-plum">Order #{order.id.slice(0, 8)}</h1>
      <Badge className={`mt-2 ${statusColor(order.status)}`}>{formatStatus(order.status)}</Badge>

      <Card className="mt-4">
        <h2 className="mb-2 font-semibold text-plum">Items</h2>
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between border-b border-blush/30 py-2 text-sm last:border-0">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span className="font-medium">{formatUGX(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="mt-3 flex justify-between font-bold text-plum">
          <span>Total</span>
          <span>{formatUGX(order.total)}</span>
        </div>
      </Card>

      {(order.customerName || order.shippingAddress) && (
        <Card className="mt-3">
          <h2 className="mb-2 font-semibold text-plum">Delivery</h2>
          {order.customerName && <p className="text-sm">{order.customerName}</p>}
          {order.customerPhone && <p className="text-sm text-gray-600">{order.customerPhone}</p>}
          {order.shippingAddress && <p className="mt-1 text-sm text-gray-600">{order.shippingAddress}</p>}
        </Card>
      )}

      {order.status !== "cancelled" && (
        <Card className="mt-3">
          <h2 className="mb-3 font-semibold text-plum">Status timeline</h2>
          <div className="space-y-2">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-2 text-sm">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    i <= currentStep ? "bg-rose" : "bg-blush"
                  }`}
                />
                <span className={i <= currentStep ? "font-medium text-plum" : "text-gray-400"}>
                  {formatStatus(step)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
