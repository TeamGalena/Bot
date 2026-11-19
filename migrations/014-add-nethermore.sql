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
      'nethermore',
      'Nethermore',
      '2 Nether Subbiomes further from spawn',
      'nethermore',
      '#19174f',
      'TerriblyBadCoder/nethermore',
      NULL,
      'nethermore'
   );

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------
DELETE FROM ModInfo
WHERE
   id = 'nethermore';