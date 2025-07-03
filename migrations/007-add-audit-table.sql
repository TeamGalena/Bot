--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------
CREATE TABLE
   AuditLog (
      id INTEGER PRIMARY KEY,
      user TEXT PRIMARY KEY,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      action TEXT PRIMARY KEY,
      subject TEXT PRIMARY KEY
   );

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------
DROP TABLE AuditLog