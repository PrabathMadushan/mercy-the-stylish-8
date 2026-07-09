import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env, getAdminEmails } from "../config/env.js";

export interface AuthedUser {
  email: string;
  name?: string;
  isAdmin: boolean;
}

export interface AuthedRequest extends Request {
  user?: AuthedUser;
}

function resolveAdmin(email: string): boolean {
  return getAdminEmails().includes(email.toLowerCase());
}

export function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const payload = jwt.verify(header.slice(7), env.JWT_SECRET) as {
        email: string;
        name?: string;
      };
      req.user = {
        email: payload.email.toLowerCase(),
        name: payload.name,
        isAdmin: resolveAdmin(payload.email)
      };
    } catch {
      // invalid token — endpoint decides if auth is required
    }
  }
  next();
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Sign in required" });
  }
  next();
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
