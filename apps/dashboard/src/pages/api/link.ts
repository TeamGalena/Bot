import { getFormData } from "@/lib/server/csrf";
import {
  deleteLinkByDiscordId,
  getLinkByDiscordId,
  updateLink,
  type LinkEntry,
} from "@teamgalena/shared/database";
import type { APIContext } from "astro";

export async function PUT(context: APIContext): Promise<Response> {
  const body = await getFormData<LinkEntry>(context);
  const existing = await getLinkByDiscordId(body.discordId);

  if (!existing) {
    return new Response("no link found for given input", { status: 404 });
  }

  await updateLink(existing, body);

  return context.redirect(`/partial/row/${body.discordId}`);
}

export async function DELETE(context: APIContext): Promise<Response> {
  const body = await getFormData<LinkEntry>(context);
  await deleteLinkByDiscordId(body.discordId);

  return new Response(null);
}
