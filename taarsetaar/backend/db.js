// db.js — Database setup using SQLite (no separate DB server needed)

const Database = require('better-sqlite3');
const path = require('path');

// Creates orders.db file in the backend folder automatically
const db = new Database(path.join(__dirname, 'orders.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// ── Create orders table if it doesn't exist ──
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    phone       TEXT    NOT NULL,
    product     TEXT    NOT NULL,
    quantity    INTEGER NOT NULL DEFAULT 1,
    address     TEXT    NOT NULL,
    notes       TEXT,
    status      TEXT    NOT NULL DEFAULT 'Pending',
    created_at  DATETIME DEFAULT (datetime('now', 'localtime'))
  );
`);

console.log('✅ Database ready — orders.db connected');

module.exports = db;
