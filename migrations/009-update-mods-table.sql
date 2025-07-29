--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------
CREATE TABLE
   ModInfo (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT NOT NULL,
      repository TEXT NOT NULL,
      description TEXT,
      curseforgeSlug TEXT,
      modrinthSlug TEXT
   );

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
      'oreganized',
      'Oreganized',
      'Oreganized is a mod focusing on adding new ores and metals to Minecraft. Currently it adds, Lead and Silver as base metals and a new alloy known as Electrum.',
      'oreganized',
      '#57587d',
      'TeamGalena/Oreganized',
      'oreganized',
      'oreganized'
   ),
   (
      'windswept',
      'Windswept',
      'A general expansion to snowy and forest areas of the game, incentivising players to explore and build in the new expanded areas',
      'windswept',
      '#822336',
      'rosevcook/windswept',
      'windsweptmod',
      null
   ),
   (
      'overweight-farming',
      'Overweight Farming',
      'Small mod that aims to improve and expand Minecraft''s farming and tries to make farming more fun.',
      'overweight-farming',
      '#78564b',
      '0rc1nus/Overweight-Farming',
      'overweight-farming',
      'overweight-farming'
   ),
   (
      'heart-crystals',
      'Heart Crystals',
      'Find Heart Crystals underground to permanently increase your health!',
      'heart-crystals',
      '#ea006a',
      'rosevcook/heart_crystals',
      'heart-crystals',
      'heart_crystals'
   ),
   (
      'fermion',
      'Fermion',
      'Allows you to hide items from creative mode tabs, customize tab icons + many new item tooltips. the perfect vanilla+ mod and modpack making tool.',
      'fermion',
      '#c3872b',
      'rosevcook/fermion',
      'fermionmod',
      null
   ),
   (
      'nirvana',
      'Nirvana',
      'Nirvana is a mod that aims to add Hemp and herb in a vanilla friendly way! Get ready to make some Herb Rolled in Paper, Oddly Shaped Glasses, Herbal Salves, Burlap and much more.',
      'nirvana',
      '#a5c751',
      'TeamGalena/Nirvana',
      'nirvana',
      null
   ),
   (
      'doom-gloom',
      'Doom & Gloom',
      'An addon-mod for Oreganized adding Halloween-themed content.',
      'doom-gloom',
      '#61cea8',
      'TeamGalena/DoomAndGloom',
      'doom-gloom',
      'doom-gloom'
   ),
   (
      'thigh-highs-etc',
      'Thigh highs etc.',
      'A small addon for the mod Etcetera which adds Thigh highs to the cotton wear! Crafted with cotton in the shape of boots.',
      'thigh-highs-etc',
      '#c6c6c6',
      'TeamGalena/ThighHighsEtc',
      'thigh-highs-etc',
      'thigh-highs-etc'
   );

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------
DROP TABLE ModInfo