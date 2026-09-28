const db = require("../config/database");

function getAllVendors() {
    return db.prepare("SELECT * FROM vendors ORDER BY vendor_name ASC").all();
}

function getVendorByName(vendorName) {
    return db.prepare("SELECT * FROM vendors WHERE LOWER(vendor_name) = LOWER(?)").get(vendorName);
}

function createVendor(vendorData) {
    const {
        vendor_name,
        initials,
        normal_min,
        normal_max,
        shipping_min,
        shipping_max,
        payment_terms,
        approval_threshold
    } = vendorData;

    const stmt = db.prepare(`
        INSERT INTO vendors (
            vendor_name, initials, normal_min, normal_max, shipping_min, shipping_max, payment_terms, approval_threshold
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
        vendor_name,
        initials || vendor_name.substring(0, 2).toUpperCase(),
        Number(normal_min) || 0,
        Number(normal_max) || 0,
        Number(shipping_min) || 0,
        Number(shipping_max) || 0,
        payment_terms || "Net 30",
        Number(approval_threshold) || 50000
    );

    return getVendorByName(vendor_name);
}

function updateVendor(id, vendorData) {
    const {
        normal_min,
        normal_max,
        shipping_min,
        shipping_max,
        payment_terms,
        approval_threshold
    } = vendorData;

    db.prepare(`
        UPDATE vendors SET
            normal_min = ?,
            normal_max = ?,
            shipping_min = ?,
            shipping_max = ?,
            payment_terms = ?,
            approval_threshold = ?
        WHERE id = ?
    `).run(
        Number(normal_min),
        Number(normal_max),
        Number(shipping_min),
        Number(shipping_max),
        payment_terms,
        Number(approval_threshold),
        id
    );

    return db.prepare("SELECT * FROM vendors WHERE id = ?").get(id);
}

function deleteVendor(id) {
    return db.prepare("DELETE FROM vendors WHERE id = ?").run(id);
}

module.exports = {
    getAllVendors,
    getVendorByName,
    createVendor,
    updateVendor,
    deleteVendor
};
