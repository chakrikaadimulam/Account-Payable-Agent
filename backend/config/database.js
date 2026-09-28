const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "..", "database", "ap_database.sqlite");

// Ensure database directory exists
const fs = require("fs");
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys and WAL mode for reliability & speed
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function initDatabase() {
    // 1. Vendors table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS vendors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vendor_name TEXT UNIQUE NOT NULL,
            initials TEXT NOT NULL,
            normal_min REAL NOT NULL,
            normal_max REAL NOT NULL,
            shipping_min REAL NOT NULL,
            shipping_max REAL NOT NULL,
            payment_terms TEXT NOT NULL,
            approval_threshold REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // 2. Invoices table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vendor_name TEXT NOT NULL,
            amount REAL NOT NULL,
            shipping REAL NOT NULL,
            total_amount REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // 3. Decisions table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS decisions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_id INTEGER,
            vendor_name TEXT NOT NULL,
            amount REAL NOT NULL,
            shipping REAL NOT NULL,
            total_amount REAL NOT NULL,
            decision TEXT NOT NULL,
            confidence INTEGER NOT NULL,
            reason TEXT NOT NULL,
            recommendation TEXT NOT NULL,
            memories_used TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
        )
    `).run();

    // 4. Feedback table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            decision_id INTEGER,
            vendor_name TEXT NOT NULL,
            total_amount REAL NOT NULL,
            agent_decision TEXT NOT NULL,
            human_decision TEXT NOT NULL,
            feedback TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Seed default vendors if empty
    const vendorCount = db.prepare("SELECT COUNT(*) as count FROM vendors").get().count;
    if (vendorCount === 0) {
        const insertVendor = db.prepare(`
            INSERT INTO vendors (vendor_name, initials, normal_min, normal_max, shipping_min, shipping_max, payment_terms, approval_threshold)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const defaultVendors = [
            ["ABC Industrial Supplies", "AI", 60000, 80000, 3000, 5000, "Net 30", 75000],
            ["Global Office Solutions", "GO", 20000, 45000, 1000, 3000, "Net 45", 50000],
            ["Apex Logistics & Freight", "AL", 40000, 95000, 5000, 12000, "Net 15", 90000],
            ["NexGen Cloud Services", "NC", 15000, 35000, 0, 0, "Net 30", 30000]
        ];

        for (const v of defaultVendors) {
            insertVendor.run(...v);
        }
        console.log("Database initialized with default vendor records.");
    }
}

initDatabase();

module.exports = db;
