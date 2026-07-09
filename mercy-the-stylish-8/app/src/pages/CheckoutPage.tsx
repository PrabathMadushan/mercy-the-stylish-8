import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { api, formatUGX } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Input, Textarea } from "../components/ui/Input";
import { useToast } from "../contexts/ToastContext";

const schema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerPhone: z.string().min(1, "Phone is required"),
  shippingAddress: z.string().min(1, "Delivery address is required")
});

type FormData = z.infer<typeof schema>;

export function CheckoutPage() {
  const { items, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (!items.length) {
    navigate("/cart");
    return null;
  }

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const result = await api.createCheckoutSession({
        ...data,
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity }))
      });
      window.location.href = result.url;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Checkout failed";
      showToast(message, "error");
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="mb-4 font-serif text-2xl italic text-plum">Checkout</h1>
      <p className="mb-2 text-sm text-gray-600">Signed in as {user?.email}</p>
      <p className="mb-4 font-bold text-plum">Total: {formatUGX(cartTotal())}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-plum">Full name</label>
          <Input {...register("customerName")} placeholder="Jane Doe" />
          {errors.customerName && <p className="mt-1 text-sm text-rose-dark">{errors.customerName.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-plum">Phone</label>
          <Input {...register("customerPhone")} placeholder="+256 700 000 000" />
          {errors.customerPhone && <p className="mt-1 text-sm text-rose-dark">{errors.customerPhone.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-plum">Delivery address</label>
          <Textarea {...register("shippingAddress")} rows={3} placeholder="Plot 12, Kampala Road, Kampala" />
          {errors.shippingAddress && (
            <p className="mt-1 text-sm text-rose-dark">{errors.shippingAddress.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Redirecting to payment..." : "Pay with Stripe"}
        </Button>
      </form>
    </div>
  );
}
