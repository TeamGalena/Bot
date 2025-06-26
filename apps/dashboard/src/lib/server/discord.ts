import { requireEnv } from "@teamgalena/shared/config";
import logger from "@teamgalena/shared/logger";
import { Discord, generateState } from "arctic";
import type { APIContext } from "astro";

const clientId = requireEnv("DISCORD_CLIENT_ID");
const redirectUrl = `${requireEnv("BASE_URL")}/api/login`;

logger.debug(
  `Setting up discord OAuth for client id ${clientId}, redirecting to ${redirectUrl}`
);

const discord = new Discord(
  clientId,
  requireEnv("DISCORD_CLIENT_SECRET"),
  redirectUrl
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
