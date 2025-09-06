--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------
UPDATE ModInfo
SET
   modrinthSlug = 'nirvana-mod'
WHERE
   id = 'nirvana';

UPDATE ModInfo
SET
   modrinthSlug = 'windswept'
WHERE
   id = 'windswept';

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------
UPDATE ModInfo
SET
   modrinthSlug = NULL
WHERE
   id IN ('nirvana', 'windswept');