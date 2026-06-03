--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------
INSERT INTO
   ModInfo (
      id,
      name,
      description,
      icon,
      color,
      repository,
      curseforgeSlug,
      modrinthSlug
   )
VALUES
   (
      'creature-feature',
      'Creature Feature',
      'Features 10 unique Hostile Creatures in various parts of the game',
      'creature-feature',
      '#b1d08d',
      'TerriblyBadCoder/creaturefeature',
      NULL,
      'creature-feature'
   );

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------
DELETE FROM ModInfo
WHERE
   id = 'creature-feature';