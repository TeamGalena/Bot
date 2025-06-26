import { UserError } from "./error";
import logger from "./logger";

type Response = {
  name: string;
  id: string;
};

export default async function queryUUID(username: string) {
  const encoded = encodeURIComponent(username);
  const response = await fetch(
    `https://api.minecraftservices.com/minecraft/profile/lookup/name/${encoded}`,
    {
      headers: {
        Accept: "application/json",
        "User-Agent": "https://github.com/TeamGalena/Bot",
      },
    }
  );

  if (!response.ok) {
    logger.error(
      `received '${response.statusText}' from mojang for username '${username}'`
    );
    throw new UserError("unable to query player UUID");
  }

  const json: Response = await response.json();

  return json.id;
}
