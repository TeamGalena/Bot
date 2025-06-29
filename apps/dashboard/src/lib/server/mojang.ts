import { queryUsername } from "@teamgalena/shared/mojang";
import cache from "./cache";

export default function getPlayerName(uuid: string) {
  return cache.computeIfAbsent(`mojang_name:${uuid}`, () =>
    queryUsername(uuid)
  );
}
