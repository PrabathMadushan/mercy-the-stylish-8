import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z
    .string()
    .default("postgresql://mercy:mercy@localhost:5432/mercy?schema=public"),
  GOOGLE_CLIENT_ID: z.string().default(""),
  JWT_SECRET: z.string().default("dev-secret-change-me"),
  ADMIN_EMAILS: z.string().default(""),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional()
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid environment: ${msg}`);
  }

  const env = parsed.data;

  if (env.NODE_ENV === "production" && env.JWT_SECRET === "dev-secret-change-me") {
    throw new Error("JWT_SECRET must be set to a secure value in production");
  }

  return env;
}

export const env = loadEnv();

export function getAdminEmails(): string[] {
  return env.ADMIN_EMAILS.split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}
