import { Discord, generateState } from "arctic";
import type { APIContext } from "astro";
import { requireEnv } from "./env";

// TODO: Update redirect URI
const discord = new Discord(
  requireEnv("DISCORD_CLIENT_ID"),
  requireEnv("DISCORD_CLIENT_SECRET"),
  "http://localhost:4321/api/login"
);

export function generateLoginRedirect(context: APIContext) {
  const state = generateState();
  const url = discord.createAuthorizationURL(state, null, [
    "guilds.members.read",
  ]);

  context.cookies.set("state", state, {
    httpOnly: true,
    maxAge: 60 * 10,
    secure: import.meta.env.PROD,
    path: "/",
    sameSite: "lax",
  });

  return context.redirect(url.toString());
}

export function validateLogin(code: string) {
  return discord.validateAuthorizationCode(code, null);
}
