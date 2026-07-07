import express from "express";
import cors from "cors";
import styleRouter from "./routes/style.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok", service: "ai-server" }));
app.use("/api/ai", styleRouter);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));
