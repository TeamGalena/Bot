--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------
CREATE TABLE
   AuditLog (
      id INTEGER PRIMARY KEY,
      user TEXT NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      action TEXT NOT NULL,
      subject TEXT NOT NULL
   );

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------
DROP TABLE AuditLog