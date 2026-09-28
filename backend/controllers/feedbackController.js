const agentService = require("../services/agentService");

async function handleFeedback(req, res) {
    try {
        const feedbackData = req.body;
        if (!feedbackData.vendor_name) {
            return res.status(400).json({ error: "vendor_name is required" });
        }
        if (!feedbackData.human_decision) {
            return res.status(400).json({ error: "human_decision is required" });
        }
        const result = await agentService.saveFeedback(feedbackData);
        res.json(result);
    } catch (error) {
        console.error("Feedback controller error:", error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    handleFeedback
};
