import { Router } from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const router = Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  const { idToken } = req.body as { idToken?: string };
  if (!idToken) {
    return res.status(400).json({ error: "idToken is required" });
  }
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ error: "Server is missing GOOGLE_CLIENT_ID configuration" });
  }

  try {
    const ticket = await googleClient.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(401).json({ error: "Google token did not contain an email" });
    }

    const email = payload.email.toLowerCase();
    const isAdmin = ADMIN_EMAILS.includes(email);

    const token = jwt.sign({ email, name: payload.name, isAdmin }, JWT_SECRET, { expiresIn: "30d" });

    res.json({
      email,
      name: payload.name || email,
      imageUrl: payload.picture,
      isAdmin,
      token
    });
  } catch (err) {
    res.status(401).json({ error: "Invalid Google ID token" });
  }
});

export default router;
