const agentService = require("../services/agentService");

async function analyze(req, res) {
    try {
        const invoice = req.body;

        if (!invoice.vendor_name) {
            return res.status(400).json({ error: "vendor_name is required" });
        }

        if (invoice.amount === undefined && invoice.total_amount === undefined) {
            return res.status(400).json({ error: "Invoice amount is required" });
        }

        const result = await agentService.analyzeInvoice(invoice);
        res.json(result);
    } catch (error) {
        console.error("Analysis controller error:", error);
        res.status(500).json({ error: error.message });
    }
}

function getHistory(req, res) {
    try {
        const limit = req.query.limit ? Number(req.query.limit) : 50;
        const history = agentService.getDecisionHistory(limit);
        res.json(history);
    } catch (error) {
        console.error("Get history error:", error);
        res.status(500).json({ error: error.message });
    }
}

function getStats(req, res) {
    try {
        const stats = agentService.getDashboardStats();
        res.json(stats);
    } catch (error) {
        console.error("Get stats error:", error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    analyze,
    getHistory,
    getStats
};
