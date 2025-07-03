import dotenv from "@dotenvx/dotenvx";
import { faker } from "@faker-js/faker";
import {
  insertLink,
  migrateDatabase,
  truncateLinks,
} from "@teamgalena/shared/database";
import { createFlags, FLAGS } from "@teamgalena/shared/flags";
import logger from "@teamgalena/shared/logger";
import type { User } from "@teamgalena/shared/models";
import parseArgs from "arg";

dotenv.config({ convention: "flow" });

await migrateDatabase();

const args = parseArgs({
  "--truncate": Boolean,
  "--count": Number,
  "-c": "--count",
  "-t": "--truncate",
});

if (args["--truncate"]) {
  logger.info("deleting existing links");
  await truncateLinks();
}

const count = args["--count"] ?? 100;
logger.info(`creating ${count} random link entries...`);

const uuids = faker.helpers.uniqueArray(faker.string.uuid, count);
const discordIds = faker.helpers.uniqueArray(
  faker.database.mongodbObjectId,
  count
);

const user: User = {
  username: "seeder",
};

for (let i = 0; i < count; i++) {
  const flags = faker.datatype.boolean(0.3)
    ? createFlags(...faker.helpers.arrayElements(FLAGS))
    : undefined;

  await insertLink(
    {
      discordId: discordIds[i],
      uuid: uuids[i],
      rank: faker.number.int({ min: 0, max: 100 }),
      flags,
    },
    user
  );
}

logger.info("Done!");
