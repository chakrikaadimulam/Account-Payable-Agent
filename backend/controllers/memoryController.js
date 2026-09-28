const { seedHistoricalCases, getNewCases } = require("../services/seedService");
const { recall } = require("../services/hindsightService");

async function seedHistoricalMemory(req, res) {
    try {
        const result = await seedHistoricalCases();
        res.json(result);
    } catch (error) {
        console.error("Seed memory error:", error);
        res.status(500).json({ error: error.message });
    }
}

function fetchNewTestCases(req, res) {
    try {
        const cases = getNewCases();
        res.json(cases);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function queryMemory(req, res) {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: "query string is required" });
        }
        const memories = await recall(query);
        res.json({ query, memories });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    seedHistoricalMemory,
    fetchNewTestCases,
    queryMemory
};
