CREATE TABLE
   NewLink (
      id INTEGER PRIMARY KEY,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      uuid TEXT UNIQUE NOT NULL,
      discordId TEXT UNIQUE NOT NULL,
      rank INT NOT NULL DEFAULT 0,
      flags INT NOT NULL DEFAULT 0
   );

INSERT INTO
   NewLink (uuid, discordId, rank, flags)
SELECT
   *
FROM
   Link;

DROP TABLE Link;

ALTER TABLE NewLink
RENAME TO Link;