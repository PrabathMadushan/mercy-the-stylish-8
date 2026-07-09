import { Router } from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { env, getAdminEmails } from "../config/env.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../asyncHandler.js";

const router = Router();
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

router.post(
  "/google",
  asyncHandler(async (req, res) => {
    const { idToken } = req.body as { idToken?: string };
    if (!idToken) {
      return res.status(400).json({ error: "idToken is required" });
    }
    if (!env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: "Server is missing GOOGLE_CLIENT_ID configuration" });
    }

    const ticket = await googleClient.verifyIdToken({ idToken, audience: env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(401).json({ error: "Google token did not contain an email" });
    }
    if (!payload.email_verified) {
      return res.status(401).json({ error: "Google email is not verified" });
    }

    const email = payload.email.toLowerCase();
    const isAdmin = getAdminEmails().includes(email);
    const token = jwt.sign({ email, name: payload.name }, env.JWT_SECRET, { expiresIn: "30d" });

    res.json({
      email,
      name: payload.name || email,
      imageUrl: payload.picture,
      isAdmin,
      token
    });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const email = req.user!.email;
    res.json({
      email,
      name: req.user!.name || email,
      isAdmin: getAdminEmails().includes(email)
    });
  })
);

export default router;
