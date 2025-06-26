import { requireEnv } from "@teamgalena/shared/config";
import type { APIContext, AstroCookieSetOptions } from "astro";
import jwt from "jsonwebtoken";
import type { User } from "./user";

const COOKIE_KEY = "galena-session";
const JWT_SECRET = requireEnv("JWT_SECRET");

export type Token = {
  user: User;
  expiresAt: number;
};

function decode(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as Token;
    if (decoded.expiresAt < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function extractToken(context: APIContext) {
  // refresh token?
  const token = context.cookies.get(COOKIE_KEY)?.value ?? null;
  if (token) return decode(token);
  return null;
}

function setCookie(
  context: APIContext,
  value: string | null,
  options: Partial<AstroCookieSetOptions>
) {
  context.cookies.set(COOKIE_KEY, value ?? "", {
    httpOnly: true,
    path: "/",
    secure: import.meta.env.PROD,
    sameSite: "lax",
    ...options,
  });
}

export function login(context: APIContext, token: string, expires: Date) {
  setCookie(context, token, { expires });
}

export function logout(context: APIContext) {
  setCookie(context, null, { maxAge: 0 });
}

export function createToken(payload: Token) {
  return jwt.sign(JSON.stringify(payload), JWT_SECRET);
}
