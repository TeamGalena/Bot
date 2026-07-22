--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------
CREATE TABLE
   AutoThreading (
      id TEXT PRIMARY KEY,
      requiresLink BOOLEAN NOT NULL DEFAULT FALSE
   );

INSERT INTO
   AutoThreading (id, requiresLink)
VALUES
   ('1146771660104548442', TRUE) -- other-mod-showcases 
;

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------
DROP TABLE AutoThreading