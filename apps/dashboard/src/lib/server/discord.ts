import { requireEnv } from "@teamgalena/shared/config";
import { Discord, generateState } from "arctic";
import type { APIContext } from "astro";

const discord = new Discord(
  requireEnv("DISCORD_CLIENT_ID"),
  requireEnv("DISCORD_CLIENT_SECRET"),
  `${requireEnv("BASE_URL")}/api/login`
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
