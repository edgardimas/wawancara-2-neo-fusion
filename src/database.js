const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./data/chat.db", (err) => {
  if (err) return console.error("DB connection error:", err.message);
  console.log("Connected to SQLite database.");
});

// Create conversations table
db.run(
  `CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT
  )`,
  (err) => {
    if (err)
      return console.error("Error creating conversations table:", err.message);
    console.log("Conversations table ready.");
  }
);

// Create messages table
db.run(
  `CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER,
    role TEXT,
    text TEXT,
    time TEXT,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
  )`,
  (err) => {
    if (err)
      return console.error("Error creating messages table:", err.message);
    console.log("Messages table ready.");
  }
);

module.exports = db;
