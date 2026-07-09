import { z } from "zod";

const optionalTrimmedString = (fallback: string) =>
  z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    z.string().trim().default(fallback)
  );

export const productCreateSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  price: z.number().positive("price must be greater than 0"),
  category: optionalTrimmedString("Uncategorized"),
  imageUrl: optionalTrimmedString(""),
  description: optionalTrimmedString(""),
  stock: z.number().int().min(0).default(0)
});

export const productUpdateSchema = productCreateSchema.partial();

export const orderItemRequestSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive()
});

export const checkoutSessionSchema = z.object({
  items: z.array(orderItemRequestSchema).min(1, "at least one item is required"),
  customerName: z.string().trim().min(1, "customer name is required"),
  customerPhone: z.string().trim().min(1, "customer phone is required"),
  shippingAddress: z.string().trim().min(1, "shipping address is required")
});

export const orderStatusSchema = z.object({
  status: z.enum(["pending_payment", "paid", "confirmed", "shipped", "delivered", "cancelled"])
});

export function formatZodError(error: z.ZodError): string {
  return error.issues.map((i) => `${i.path.join(".") || "value"}: ${i.message}`).join("; ");
}
