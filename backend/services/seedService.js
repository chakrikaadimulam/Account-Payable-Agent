const fs = require("fs");
const path = require("path");
const db = require("../config/database");
const { remember } = require("./hindsightService");

function parseCSV(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    // Check if line 0 is 'csv' header marker
    let headerIdx = 0;
    if (lines[0].trim().toLowerCase() === "csv") {
        headerIdx = 1;
    }

    const headers = lines[headerIdx].split(",").map(h => h.trim());
    const records = [];

    for (let i = headerIdx + 1; i < lines.length; i++) {
        // Parse CSV line handling commas within quotes if any
        const row = lines[i].split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map(col => {
            let val = col.trim();
            if (val.startsWith('"') && val.endsWith('"')) {
                val = val.slice(1, -1).replace(/""/g, '"');
            }
            return val;
        });

        if (row.length === headers.length) {
            const record = {};
            headers.forEach((h, idx) => {
                record[h] = row[idx];
            });
            records.push(record);
        }
    }
    return records;
}

async function seedVendorsFromCSV() {
    const csvPath = path.join(__dirname, "..", "data", "vendors.csv");
    const vendorRecords = parseCSV(csvPath);

    if (vendorRecords.length === 0) {
        console.log("No vendors found in vendors.csv");
        return;
    }

    const insertStmt = db.prepare(`
        INSERT OR IGNORE INTO vendors (
            vendor_name, initials, normal_min, normal_max, shipping_min, shipping_max, payment_terms, approval_threshold
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let added = 0;
    for (const v of vendorRecords) {
        const name = v.vendor_name;
        if (!name) continue;
        const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().substring(0, 2);
        const terms = v.default_payment_terms || "Net 30";
        
        // Estimate range baselines based on vendor category
        const normalMin = 20000;
        const normalMax = 80000;
        const shippingMin = 2000;
        const shippingMax = 6000;
        const threshold = 75000;

        const info = insertStmt.run(name, initials, normalMin, normalMax, shippingMin, shippingMax, terms, threshold);
        if (info.changes > 0) added++;
    }

    console.log(`Seeded ${added} vendors from vendors.csv into SQLite DB.`);
}

async function seedHistoricalCases() {
    const csvPath = path.join(__dirname, "..", "data", "historical_cases.csv");
    const cases = parseCSV(csvPath);

    if (cases.length === 0) {
        return { success: false, message: "No historical cases found in CSV" };
    }

    let seededCount = 0;
    for (const c of cases) {
        const text = `
Historical Case ${c.case_id}:
Vendor: ${c.vendor_name} (ID: ${c.vendor_id})
Invoice ID: ${c.invoice_id}, PO: ${c.po_number}
Exception Type: ${c.exception_type}
Description: ${c.exception_description}
Investigation: ${c.investigation}
Evidence Found: ${c.evidence_found}
Decision: ${c.decision}
Reason: ${c.reason}
Resolution Outcome: ${c.outcome}
        `.trim();

        await remember(text, {
            type: "historical_case",
            case_id: c.case_id,
            vendor: c.vendor_name,
            exception_type: c.exception_type,
            decision: c.decision
        });
        seededCount++;
    }

    return {
        success: true,
        message: `Successfully retained ${seededCount} historical case memories into Hindsight.`,
        cases_seeded: seededCount
    };
}

function getNewCases() {
    const csvPath = path.join(__dirname, "..", "data", "new_cases.csv");
    return parseCSV(csvPath);
}

module.exports = {
    parseCSV,
    seedVendorsFromCSV,
    seedHistoricalCases,
    getNewCases
};
