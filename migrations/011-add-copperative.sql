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
      'copperative',
      'Copperative ',
      'Rightfully uniting copper and redstone components as one and expanding on copper as a whole.',
      'copperative',
      '#c35c35',
      'TeamGalena/Copperative',
      'copperative',
      'copperative'
   );

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------
DELETE FROM ModInfo
WHERE
   id = 'copperative';