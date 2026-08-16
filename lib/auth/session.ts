import "server-only";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "entaj_admin_session";

export interface SessionPayload {
  adminId: number;
  email: string;
  roleId: number;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set.");
  return secret;
}

export async function createSession(payload: SessionPayload) {
  const token = jwt.sign(payload, getSecret(), {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"],
  });
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, getSecret()) as SessionPayload;
  } catch {
    return null;
  }
}

export async function destroySession() {
  (await cookies()).delete(COOKIE_NAME);
}
