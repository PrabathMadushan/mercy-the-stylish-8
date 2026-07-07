import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are the AI stylist for "Mercy the Stylish", a women's fashion shop in Kampala,
Uganda selling dresses, tops, accessories, footwear, and bags. Give warm, concise, practical styling
advice (2-4 sentences). When relevant, suggest general categories the shop carries (e.g. "a floral
wrap dress" or "block heels") rather than inventing specific product names or prices you don't know.`;

router.post("/chat", async (req, res) => {
  const { messages } = req.body as { messages?: { role: "user" | "assistant"; content: string }[] };
  if (!messages?.length) {
    return res.status(400).json({ error: "messages array is required" });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY configuration" });
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content }))
    });

    const reply = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .filter(Boolean)
      .join("\n");

    res.json({ reply: reply || "Sorry, I didn't quite catch that - could you rephrase?" });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "The stylist AI is temporarily unavailable" });
  }
});

router.post("/recommend", async (req, res) => {
  const { preferences } = req.body as { preferences?: string };
  if (!preferences) {
    return res.status(400).json({ error: "preferences is required" });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY configuration" });
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 300,
      system: SYSTEM_PROMPT + "\nRespond with 3-5 short bullet-style outfit ideas, one per line, no numbering.",
      messages: [{ role: "user", content: `Suggest outfits for: ${preferences}` }]
    });

    const text = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .filter(Boolean)
      .join("\n");

    const recommendations = text
      .split("\n")
      .map((line) => line.replace(/^[-*•]\s*/, "").trim())
      .filter(Boolean);

    res.json({ recommendations });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "The stylist AI is temporarily unavailable" });
  }
});

export default router;
