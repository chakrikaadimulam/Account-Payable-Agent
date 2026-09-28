const db = require("../config/database");
const vendorService = require("./vendorService");
const { remember, recall } = require("./hindsightService");
const { analyzeWithLLM } = require("./llmService");

function removeDuplicateMemories(memories) {
    const seen = new Set();
    return memories.filter(memory => {
        const text = String(memory.text || "").trim().toLowerCase();
        if (!text || seen.has(text)) return false;
        seen.add(text);
        return true;
    });
}

function prioritizeMemories(memories) {
    return [...memories].sort((a, b) => {
        const aText = String(a.text || "").toLowerCase();
        const bText = String(b.text || "").toLowerCase();
        const aType = String(a.type || "").toLowerCase();
        const bType = String(b.type || "").toLowerCase();

        const aIsFeedback = aType.includes("feedback") || aText.includes("human feedback") || aText.includes("human decision") || aText.includes("purchase order");
        const bIsFeedback = bType.includes("feedback") || bText.includes("human feedback") || bText.includes("human decision") || bText.includes("purchase order");

        if (aIsFeedback && !bIsFeedback) return -1;
        if (!aIsFeedback && bIsFeedback) return 1;
        return 0;
    });
}

async function analyzeInvoice(invoice) {
    const amount = Number(invoice.amount) || 0;
    const shipping = Number(invoice.shipping) || 0;
    const total_amount = Number(invoice.total_amount) || (amount + shipping);
    const vendor_name = invoice.vendor_name;

    // 1. Fetch vendor profile from Database
    let vendor = vendorService.getVendorByName(vendor_name);

    if (!vendor) {
        // Auto-register unknown vendor dynamically with estimated bounds
        vendor = vendorService.createVendor({
            vendor_name,
            initials: vendor_name.substring(0, 2).toUpperCase(),
            normal_min: amount * 0.7,
            normal_max: amount * 1.3,
            shipping_min: shipping * 0.5,
            shipping_max: shipping * 1.5,
            payment_terms: "Net 30",
            approval_threshold: total_amount * 1.2
        });
    }

    // 2. Query Hindsight vector memory
    const vendorMemoryQuery = `
    Analyze invoice from ${vendor_name}.
    Find historical vendor invoice ranges, shipping patterns, previous discrepancies, invoice resolutions, and approval decisions.
    `;

    const feedbackMemoryQuery = `
    Find previous human feedback and human decisions involving ${vendor_name}.
    Look for human approval decisions, purchase order verification, supporting document verification, exceptions, and instructions.
    `;

    const [vendorMemories, feedbackMemories] = await Promise.all([
        recall(vendorMemoryQuery),
        recall(feedbackMemoryQuery)
    ]);

    const combinedMemories = [...feedbackMemories, ...vendorMemories];
    const uniqueMemories = removeDuplicateMemories(combinedMemories);
    const prioritizedMemories = prioritizeMemories(uniqueMemories);
    
    const compactMemories = prioritizedMemories.slice(0, 5).map(m => ({
        type: m.type || "historical_memory",
        text: String(m.text || "").slice(0, 500)
    }));

    // 3. AI Reasoning
    const decisionResult = await analyzeWithLLM(
        { ...invoice, amount, shipping, total_amount },
        vendor,
        compactMemories
    );

    // 4. Save Invoice & Decision to SQLite Database
    const invoiceStmt = db.prepare(`
        INSERT INTO invoices (vendor_name, amount, shipping, total_amount)
        VALUES (?, ?, ?, ?)
    `);
    const invoiceInfo = invoiceStmt.run(vendor_name, amount, shipping, total_amount);
    const invoiceId = invoiceInfo.lastInsertRowid;

    const decisionStmt = db.prepare(`
        INSERT INTO decisions (
            invoice_id, vendor_name, amount, shipping, total_amount, decision, confidence, reason, recommendation, memories_used
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const decisionInfo = decisionStmt.run(
        invoiceId,
        vendor_name,
        amount,
        shipping,
        total_amount,
        decisionResult.decision,
        decisionResult.confidence,
        decisionResult.reason,
        decisionResult.recommendation,
        JSON.stringify(compactMemories)
    );

    // 5. Retain Analysis in Hindsight Vector Store
    await remember(
        `
        Invoice Analysis Record:
        Vendor: ${vendor_name}
        Amount: ₹${amount}
        Shipping: ₹${shipping}
        Total Exposure: ₹${total_amount}
        Decision: ${decisionResult.decision}
        Confidence: ${decisionResult.confidence}%
        Reasoning: ${decisionResult.reason}
        Recommendation: ${decisionResult.recommendation}
        `,
        {
            type: "invoice_analysis",
            vendor: vendor_name,
            decision: decisionResult.decision
        }
    );

    return {
        id: decisionInfo.lastInsertRowid,
        invoice_id: invoiceId,
        invoice: {
            vendor_name,
            amount,
            shipping,
            total_amount
        },
        vendor,
        memories: compactMemories,
        decision: decisionResult,
        created_at: new Date().toISOString()
    };
}

async function saveFeedback(feedbackData) {
    const {
        decision_id,
        vendor_name,
        total_amount,
        agent_decision,
        human_decision,
        feedback
    } = feedbackData;

    // 1. Save to SQLite Database
    const stmt = db.prepare(`
        INSERT INTO feedback (
            decision_id, vendor_name, total_amount, agent_decision, human_decision, feedback
        ) VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
        decision_id || null,
        vendor_name,
        Number(total_amount) || 0,
        agent_decision,
        human_decision,
        feedback || ""
    );

    // 2. Save to Hindsight vector memory
    await remember(
        `
        Human Feedback Log for ${vendor_name}:
        Invoice Amount: ₹${total_amount}
        Agent Decision: ${agent_decision}
        Human Decision: ${human_decision}
        Feedback Note: ${feedback}
        Learning: Future invoices from ${vendor_name} must consider this human decision outcome.
        `,
        {
            type: "human_feedback",
            vendor: vendor_name,
            importance: "high"
        }
    );

    return {
        id: info.lastInsertRowid,
        success: true,
        message: "Human feedback recorded in Database and retained in Hindsight memory."
    };
}

function getDecisionHistory(limit = 50) {
    const records = db.prepare(`
        SELECT d.*, v.initials
        FROM decisions d
        LEFT JOIN vendors v ON LOWER(d.vendor_name) = LOWER(v.vendor_name)
        ORDER BY d.id DESC
        LIMIT ?
    `).all(limit);

    return records.map(r => ({
        ...r,
        memories_used: r.memories_used ? JSON.parse(r.memories_used) : []
    }));
}

function getDashboardStats() {
    const totalInvoices = db.prepare("SELECT COUNT(*) as count FROM invoices").get().count;
    const totalSpend = db.prepare("SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices").get().total;
    const approvedCount = db.prepare("SELECT COUNT(*) as count FROM decisions WHERE decision = 'APPROVE'").get().count;
    const reviewCount = db.prepare("SELECT COUNT(*) as count FROM decisions WHERE decision = 'REVIEW'").get().count;
    const holdCount = db.prepare("SELECT COUNT(*) as count FROM decisions WHERE decision = 'HOLD'").get().count;
    const totalVendors = db.prepare("SELECT COUNT(*) as count FROM vendors").get().count;
    const feedbackCount = db.prepare("SELECT COUNT(*) as count FROM feedback").get().count;

    const vendorsWithExceptions = db.prepare("SELECT COUNT(DISTINCT vendor_name) as count FROM decisions WHERE decision IN ('REVIEW', 'HOLD')").get().count;
    const vendorsRequiringAttention = db.prepare("SELECT COUNT(DISTINCT vendor_name) as count FROM decisions WHERE decision = 'REVIEW'").get().count;

    const recentActivity = db.prepare(`
        SELECT id, vendor_name, total_amount, decision, reason, created_at
        FROM decisions
        ORDER BY id DESC
        LIMIT 5
    `).all();

    const approvalRate = totalInvoices > 0 ? Math.round((approvedCount / totalInvoices) * 100) : 100;

    return {
        totalInvoices,
        totalSpend,
        approvedCount,
        reviewCount,
        holdCount,
        totalVendors,
        feedbackCount,
        approvalRate,
        vendorsWithExceptions,
        vendorsRequiringAttention,
        recentActivity
    };
}

module.exports = {
    analyzeInvoice,
    saveFeedback,
    getDecisionHistory,
    getDashboardStats
};
