
const Database = require('better-sqlite3')
const path = require('path')

// Create or open the SQLite database
const db = new Database(path.join(__dirname, 'relay.db'))

// Enable foreign key support
db.pragma('foreign_keys = ON')

// Vehicles table
db.exec(`
  CREATE TABLE IF NOT EXISTS vehicles (
    registration TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    year INTEGER,
    score INTEGER,
    photo TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`)
// Add complete vehicle data storage
const vehicleColumns = db.prepare(
    "PRAGMA table_info(vehicles)"
).all()

if (!vehicleColumns.some(column => column.name === 'vehicle_data')) {
    db.exec(`
    ALTER TABLE vehicles
    ADD COLUMN vehicle_data TEXT
  `)
}
// RELAY records table
db.exec(`
  CREATE TABLE IF NOT EXISTS relay_records (
    id TEXT PRIMARY KEY,
    registration TEXT,
    record_data TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`)

// Handovers table
db.exec(`
  CREATE TABLE IF NOT EXISTS handovers (
    id TEXT PRIMARY KEY,
    vehicle TEXT,
    registration TEXT,
    buyerName TEXT,
    buyerPhone TEXT,
    status TEXT DEFAULT 'Pending',
    createdAt TEXT,
    expiresAt TEXT,
    acceptedAt TEXT,
    completedAt TEXT
  )
`)

// Seller settings table
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    sellerName TEXT DEFAULT '',
    sellerPhone TEXT DEFAULT '',
    emailNotifications INTEGER DEFAULT 1,
    smsNotifications INTEGER DEFAULT 1
  )
`)

// Create default settings row
db.prepare(`
  INSERT OR IGNORE INTO settings (id) VALUES (1)
`).run()

console.log('RELAY database and tables initialized.')

module.exports = db
