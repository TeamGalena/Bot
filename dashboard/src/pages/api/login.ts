import type { OAuth2Tokens } from "arctic";
import type { APIContext } from "astro";
import { validateLogin } from "../../lib/server/discord";
import requireEnv from "../../lib/server/env";
import { createToken, login, type Token } from "../../lib/server/session";

const GUILD_ID = requireEnv("GUILD_ID");

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

  if (storedState === null || code === null || state === null) {
    return new Response("Please restart the process.", {
      status: 400,
    });
  }
  if (storedState !== state) {
    return new Response("Please restart the process.", {
      status: 400,
    });
  }

  let tokens: OAuth2Tokens;
  try {
    tokens = await validateLogin(code);
  } catch (e) {
    return new Response("Please restart the process.", {
      status: 400,
    });
  }

  const { user, roles } = await request<GuildMember>(
    `/users/@me/guilds/${GUILD_ID}/member`,
    tokens
  );

  console.log(roles);

  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 5;
  const token: Token = { expiresAt, user };
  login(context, createToken(token), new Date(expiresAt));

  return context.redirect(`/`);
}
