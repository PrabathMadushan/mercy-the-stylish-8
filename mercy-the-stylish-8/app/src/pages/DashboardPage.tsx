import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, formatUGX, formatStatus } from "../lib/api";
import type { Order, Product } from "../types";
import { statusColor } from "../lib/utils";
import { Button } from "../components/ui/Button";
import { Input, Textarea } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { ConfirmModal } from "../components/ui/Modal";
import { useToast } from "../contexts/ToastContext";

type Tab = "overview" | "products" | "orders";

const emptyProduct = {
  name: "",
  price: 0,
  category: "",
  imageUrl: "",
  description: "",
  stock: 0
};

export function DashboardPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: api.getAdminStats
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["products", "admin"],
    queryFn: () => api.listProducts({ limit: 100 }),
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders", "admin"],
    queryFn: api.listOrders
  });

  const saveProduct = useMutation({
    mutationFn: () =>
      editing
        ? api.updateProduct(editing.id, form)
        : api.createProduct(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setEditing(null);
      setForm(emptyProduct);
      showToast("Product saved", "success");
    },
    onError: (err: Error) => showToast(err.message, "error")
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setDeleteId(null);
      showToast("Product deleted", "success");
    },
    onError: (err: Error) => showToast(err.message, "error")
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Order["status"] }) =>
      api.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      showToast("Order updated", "success");
    },
    onError: (err: Error) => showToast(err.message, "error")
  });

  const products = productsData?.items ?? [];
  const filteredOrders =
    statusFilter === "all" ? orders : orders?.filter((o) => o.status === statusFilter);

  const startEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      description: product.description,
      stock: product.stock
    });
    setTab("products");
  };

  return (
    <div>
      <h1 className="mb-4 font-serif text-2xl italic text-plum">Dashboard</h1>

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {(["overview", "products", "orders"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium capitalize ${
              tab === t ? "bg-rose text-white" : "bg-white text-plum shadow-brand"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-2 gap-3">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)
          ) : (
            <>
              <StatCard label="Total orders" value={String(stats?.totalOrders ?? 0)} />
              <StatCard label="Revenue" value={formatUGX(stats?.revenue ?? 0)} />
              <StatCard label="Pending payment" value={String(stats?.pendingOrders ?? 0)} />
              <StatCard label="Low stock" value={String(stats?.lowStockCount ?? 0)} />
            </>
          )}
        </div>
      )}

      {tab === "products" && (
        <div className="space-y-4">
          <Card>
            <h2 className="mb-3 font-semibold text-plum">{editing ? "Edit product" : "Add product"}</h2>
            <div className="space-y-2">
              <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input type="number" placeholder="Price (UGX)" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <Input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
              <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Input type="number" placeholder="Stock" value={form.stock || ""} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            </div>
            <div className="mt-3 flex gap-2">
              <Button onClick={() => saveProduct.mutate()} disabled={saveProduct.isPending}>
                {editing ? "Save changes" : "Add product"}
              </Button>
              {editing && (
                <Button variant="secondary" onClick={() => { setEditing(null); setForm(emptyProduct); }}>
                  Cancel
                </Button>
              )}
            </div>
          </Card>

          {productsLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <div className="space-y-2">
              {products.map((p) => (
                <Card key={p.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-plum">{p.name}</p>
                    <p className="text-sm text-rose-dark">{formatUGX(p.price)} · Stock: {p.stock}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="secondary" className="!px-3 !py-2 text-sm" onClick={() => startEdit(p)}>
                      Edit
                    </Button>
                    <Button className="!bg-rose-dark !px-3 !py-2 text-sm" onClick={() => setDeleteId(p.id)}>
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "orders" && (
        <div>
          <select
            className="input mb-3"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            {["pending_payment", "paid", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
              <option key={s} value={s}>
                {formatStatus(s as Order["status"])}
              </option>
            ))}
          </select>

          {ordersLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <div className="space-y-3">
              {filteredOrders?.map((order) => (
                <Card key={order.id}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-plum">#{order.id.slice(0, 8)} · {order.userEmail}</p>
                      <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                      <p className="mt-1 font-bold text-rose-dark">{formatUGX(order.total)}</p>
                    </div>
                    <Badge className={statusColor(order.status)}>{formatStatus(order.status)}</Badge>
                  </div>
                  <ul className="mt-2 text-sm text-gray-600">
                    {order.items.map((item, i) => (
                      <li key={i}>{item.name} × {item.quantity}</li>
                    ))}
                  </ul>
                  {order.shippingAddress && (
                    <p className="mt-2 text-sm text-gray-500">📍 {order.shippingAddress}</p>
                  )}
                  <select
                    className="input mt-3"
                    value={order.status}
                    onChange={(e) =>
                      updateStatus.mutate({ id: order.id, status: e.target.value as Order["status"] })
                    }
                    aria-label="Update order status"
                  >
                    {["pending_payment", "paid", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
                      <option key={s} value={s}>
                        {formatStatus(s as Order["status"])}
                      </option>
                    ))}
                  </select>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete product?"
        message="This cannot be undone."
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteProduct.mutate(deleteId)}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-plum">{value}</p>
    </Card>
  );
}
