import { UserError } from "./error";
import logger from "./logger";

type Response = {
  name: string;
  id: string;
};

async function query<T>(endpoint: string) {
  const response = await fetch(
    `https://api.minecraftservices.com/${endpoint}`,
    {
      headers: {
        Accept: "application/json",
        "User-Agent": "https://github.com/TeamGalena/Bot",
      },
    }
  );

  if (!response.ok) {
    logger.debug(response.url);
    throw new Error(response.statusText);
  }

  const json: Response = await response.json();

  return json as T;
}

export async function queryUUID(username: string) {
  const encoded = encodeURIComponent(username);

  try {
    const response = await query<Response>(
      `minecraft/profile/lookup/name/${encoded}`
    );
    return response.id;
  } catch (e) {
    logger.error(
      `received '${
        (e as Error).message
      }' from mojang for username '${username}'`
    );
    throw new UserError("unable to query player UUID");
  }
}

export async function queryUsername(uuid: string) {
  const encoded = encodeURIComponent(uuid);

  try {
    const response = await query<Response>(
      `minecraft/profile/lookup/${encoded}`
    );
    return response.id;
  } catch (e) {
    logger.error(
      `received '${(e as Error).message}' from mojang for uuid '${uuid}'`
    );
    throw new UserError("unknown uuid");
  }
}
