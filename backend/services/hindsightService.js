const { HindsightClient } = require("@vectorize-io/hindsight-client");

const hindsight = new HindsightClient({
    baseUrl: process.env.HINDSIGHT_BASE_URL || "https://api.hindsight.vectorize.io",
    apiKey: process.env.HINDSIGHT_API_KEY
});

const BANK_ID = "accounts-payable-agent";

async function initializeMemory() {
    try {
        await hindsight.createBank(BANK_ID, {
            name: "Accounts Payable Agent Memory",
            mission:
                "Remember vendor patterns, payment terms, invoice discrepancies, approval decisions, and human feedback to improve accounts payable decisions."
        });
        console.log("Hindsight memory bank initialized successfully");
    } catch (error) {
        console.log("Hindsight memory bank already exists or initialization skipped");
    }
}

async function remember(content, metadata = {}) {
    try {
        return await hindsight.retain(BANK_ID, content, { metadata });
    } catch (error) {
        console.error("Hindsight retain error:", error.message);
        return null;
    }
}

async function recall(query) {
    try {
        const result = await hindsight.recall(BANK_ID, query, {
            budget: "low",
            maxTokens: 1500
        });
        return result.results || [];
    } catch (error) {
        console.error("Hindsight recall error:", error.message);
        return [];
    }
}

module.exports = {
    hindsight,
    BANK_ID,
    initializeMemory,
    remember,
    recall
};
