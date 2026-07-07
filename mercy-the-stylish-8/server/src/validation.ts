import { z } from "zod";

// .default() only kicks in when a key is missing/undefined - not when it's
// present but empty (e.g. an unfilled form field sending ""). This helper
// converts an empty string to undefined first, so .default() actually applies
// instead of the field failing .min(1) validation.
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

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive()
});

export const orderCreateSchema = z.object({
  userEmail: z.string().email().optional(),
  items: z.array(orderItemSchema).min(1, "at least one item is required"),
  total: z.number().nonnegative()
});

export const orderStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"])
});

/** Formats a ZodError into a short, user-friendly message. */
export function formatZodError(error: z.ZodError): string {
  return error.issues.map((i) => `${i.path.join(".") || "value"}: ${i.message}`).join("; ");
}
