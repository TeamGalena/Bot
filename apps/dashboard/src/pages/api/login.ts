import { optionalEnv, requireEnv } from "@teamgalena/shared/config";
import { containsAdminRole } from "@teamgalena/shared/database";
import type { OAuth2Tokens } from "arctic";
import type { APIContext } from "astro";
import { generateLoginRedirect, validateLogin } from "../../lib/server/discord";
import { createToken, login, type Token } from "../../lib/server/session";

const GUILD_ID = requireEnv("GUILD_ID");
const EXPIRES_AFTER =
  Number.parseInt(optionalEnv("JWT_EXPIRES_AFTER")) || 1000 * 60 * 60 * 24;

type DiscordUser = {
  id: string;
  username: string;
};

type GuildMember = {
  roles: string[];
  user: DiscordUser;
};

async function request<T>(endpoint: string, tokens: OAuth2Tokens): Promise<T> {
  const response = await fetch(`https://discord.com/api/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${tokens.accessToken()}`,
    },
  });
  if (!response.ok) throw new Error(response.statusText);
  return response.json();
}

export async function GET(context: APIContext): Promise<Response> {
  const storedState = context.cookies.get("state")?.value ?? null;
  const code = context.url.searchParams.get("code");
  const state = context.url.searchParams.get("state");

  if (
    storedState === null ||
    code === null ||
    state === null ||
    storedState !== state
  ) {
    return generateLoginRedirect(context);
  }

  let tokens: OAuth2Tokens;
  try {
    tokens = await validateLogin(code);
  } catch (e) {
    return generateLoginRedirect(context);
  }

  const { user, roles } = await request<GuildMember>(
    `/users/@me/guilds/${GUILD_ID}/member`,
    tokens
  );

  const isAdmin = await containsAdminRole(roles);

  if (!isAdmin) {
    return new Response("Only moderators are allowed to access our dashboard", {
      status: 403,
    });
  }

  const expiresAt = Date.now() + EXPIRES_AFTER;
  const token: Token = { expiresAt, user };
  login(context, createToken(token), new Date(expiresAt));

  return context.redirect(`/`);
}
