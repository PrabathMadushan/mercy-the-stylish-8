import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { initDb } from "./db.js";
import { env } from "./config/env.js";
import { optionalAuth } from "./middleware/auth.js";
import { authLimiter, orderLimiter } from "./middleware/rateLimit.js";
import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.js";
import authRouter from "./routes/auth.js";
import paymentsRouter from "./routes/payments.js";
import webhooksRouter from "./routes/webhooks.js";
import adminRouter from "./routes/admin.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true
  })
);

app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), webhooksRouter);

app.use(express.json());
app.use(optionalAuth);

app.get("/health", (_req, res) => res.json({ status: "ok", service: "main-server" }));

app.use("/api/auth", authLimiter, authRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", orderLimiter, ordersRouter);
app.use("/api/payments", orderLimiter, paymentsRouter);
app.use("/api/admin", adminRouter);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (
    (err as { type?: string })?.type === "entity.parse.failed" ||
    err instanceof SyntaxError
  ) {
    return res.status(400).json({ error: "Malformed JSON in request body" });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

initDb()
  .then(() => {
    app.listen(env.PORT, () => {
      console.log(`Mercy the Stylish main server listening on port ${env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
