const OpenAI = require("openai");

function getGroqClient() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return null;
    }
    return new OpenAI({
        apiKey: apiKey,
        baseURL: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1"
    });
}

async function analyzeWithLLM(invoice, vendor, memories) {
    const groq = getGroqClient();

    if (!groq) {
        console.log("GROQ_API_KEY not configured. Using intelligent AP fallback rule engine.");
        return fallbackRuleEngine(invoice, vendor, memories);
    }

    const prompt = `
You are an expert Accounts Payable AI Agent operating in an enterprise environment.

Analyze this invoice using three sources of truth:
1. The incoming current invoice
2. The dynamic vendor profile (stored in database)
3. Historical memories recalled from Hindsight vector database

CURRENT INVOICE:
${JSON.stringify(invoice, null, 2)}

VENDOR PROFILE:
${JSON.stringify(vendor, null, 2)}

RECALLED HINDSIGHT MEMORIES:
${JSON.stringify(memories, null, 2)}

Evaluate the invoice risk profile and select ONE decision:
- APPROVE: When amount, shipping, and payment patterns match historical profile or prior positive human override.
- REVIEW: When amounts exceed normal ranges, shipping is unexpectedly higher, or past discrepancies are unresolved.
- HOLD: When there are critical risks like suspected duplicate charges, massive variance, or explicit policy violations.

Provide your output ONLY as a strict JSON object with this exact schema:
{
  "decision": "APPROVE" | "REVIEW" | "HOLD",
  "confidence": <integer from 0 to 100>,
  "reason": "<Detailed step-by-step rationale citing specific numbers, percentages, or historical memories>",
  "memory_used": ["<Brief summary of key memories that influenced this recommendation>"],
  "recommendation": "<Clear, actionable next step for the AP team>"
}
`;

    try {
        const response = await groq.chat.completions.create({
            model: process.env.LLM_MODEL || "openai/gpt-oss-120b",
            messages: [
                {
                    role: "system",
                    content: "You are a meticulous, security-minded Accounts Payable Operations Agent."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.1,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        return JSON.parse(content);
    } catch (error) {
        console.error("LLM evaluation error:", error.message);
        return fallbackRuleEngine(invoice, vendor, memories);
    }
}

function fallbackRuleEngine(invoice, vendor, memories) {
    const amount = Number(invoice.amount) || Number(invoice.total_amount) || 0;
    const shipping = Number(invoice.shipping) || 0;
    const total = amount + shipping;
    
    let decision = "APPROVE";
    let confidence = 88;
    let reason = "Invoice parameters are within standard vendor operational baselines.";
    let recommendation = "Proceed with automated batch payment processing.";

    if (vendor) {
        if (total > vendor.approval_threshold) {
            decision = "REVIEW";
            confidence = 75;
            reason = `Total amount ₹${total.toLocaleString('en-IN')} exceeds vendor approval threshold of ₹${vendor.approval_threshold.toLocaleString('en-IN')}.`;
            recommendation = "Route to AP manager for purchase-order verification.";
        } else if (shipping > vendor.shipping_max) {
            decision = "REVIEW";
            confidence = 70;
            reason = `Shipping charge ₹${shipping.toLocaleString('en-IN')} exceeds historical maximum ₹${vendor.shipping_max.toLocaleString('en-IN')}.`;
            recommendation = "Request shipping fee breakdown from vendor.";
        }
    }

    // Check if any recalled memory alerts to past issues
    const duplicateMem = memories.find(m => String(m.text || "").toLowerCase().includes("duplicate"));
    const warningMem = memories.find(m => String(m.text || "").toLowerCase().includes("exception") || String(m.text || "").toLowerCase().includes("rejected"));

    if (duplicateMem) {
        decision = "REVIEW";
        confidence = 92;
        reason = `Historical risk alert: Previous invoice for ${invoice.vendor_name} contained duplicate charges.`;
        recommendation = "Manually check line items against previous invoice receipts before approving.";
    } else if (warningMem) {
        decision = "REVIEW";
        confidence = 80;
        reason = `Vendor memory flag: ${warningMem.text.slice(0, 120)}...`;
        recommendation = "Verify supporting documentation with finance lead.";
    }

    return {
        decision,
        confidence,
        reason,
        memory_used: memories.map(m => m.type || "Historical Memory"),
        recommendation
    };
}

module.exports = {
    analyzeWithLLM
};
