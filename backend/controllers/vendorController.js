const vendorService = require("../services/vendorService");

function getAll(req, res) {
    try {
        const vendors = vendorService.getAllVendors();
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

function getByName(req, res) {
    try {
        const vendor = vendorService.getVendorByName(req.params.name);
        if (!vendor) {
            return res.status(404).json({ error: "Vendor not found" });
        }
        res.json(vendor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

function create(req, res) {
    try {
        const { vendor_name, normal_min, normal_max, shipping_min, shipping_max, payment_terms, approval_threshold } = req.body;
        if (!vendor_name) {
            return res.status(400).json({ error: "vendor_name is required" });
        }
        const existing = vendorService.getVendorByName(vendor_name);
        if (existing) {
            return res.status(400).json({ error: `Vendor '${vendor_name}' already exists` });
        }
        const newVendor = vendorService.createVendor(req.body);
        res.status(201).json(newVendor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

function update(req, res) {
    try {
        const updated = vendorService.updateVendor(req.params.id, req.body);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

function remove(req, res) {
    try {
        vendorService.deleteVendor(req.params.id);
        res.json({ success: true, message: "Vendor deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAll,
    getByName,
    create,
    update,
    remove
};
