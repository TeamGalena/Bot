import { faker } from "@faker-js/faker";
import {
  migrateDatabase,
  persistLink,
  truncateLinks,
} from "@teamgalena/shared/database";
import logger from "@teamgalena/shared/logger";
import parseArgs from "arg";
import { createFlags, Flag } from "../../bot/src/flags";

const FLAGS: Flag[] = ["anniversary", "pride"];

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

for (let i = 0; i < count; i++) {
  await persistLink({
    discordId: faker.database.mongodbObjectId(),
    uuid: faker.string.uuid(),
    rank: faker.number.int({ min: 0, max: 100 }),
    flags: createFlags(...faker.helpers.arrayElements(FLAGS)),
  });
}

logger.info("Done!");
