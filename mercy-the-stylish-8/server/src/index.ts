import "dotenv/config";
import express from "express";
import cors from "cors";
import { initDb } from "./db.js";
import { optionalAuth } from "./middleware/auth.js";
import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.js";
import authRouter from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(optionalAuth);

app.get("/health", (_req, res) => res.json({ status: "ok", service: "main-server" }));

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err?.type === "entity.parse.failed" || err instanceof SyntaxError) {
    return res.status(400).json({ error: "Malformed JSON in request body" });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Mercy the Stylish main server listening on port ${PORT}`);
  });
});
