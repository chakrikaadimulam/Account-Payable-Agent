import React, { useState } from "react";
import { Check, X, MessageSquare, CheckCircle2 } from "lucide-react";
import { sendFeedback } from "../../api/client";

export function FeedbackCard({ result, onFeedbackSaved }) {
    const [feedbackSent, setFeedbackSent] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!result) return null;

    const handleSendFeedback = async (humanDecision) => {
        setLoading(true);
        try {
            await sendFeedback({
                decision_id: result.id,
                vendor_name: result.invoice.vendor_name,
                total_amount: result.invoice.total_amount,
                agent_decision: result.decision?.decision,
                human_decision: humanDecision,
                feedback: humanDecision === "APPROVE"
                    ? "Human reviewer verified purchase order and authorized payment."
                    : "Human reviewer flagged invoice for line-item variance inspection."
            });
            setFeedbackSent(true);
            if (onFeedbackSaved) onFeedbackSaved();
        } catch (error) {
            console.error(error);
            alert("Failed to save human feedback.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ marginTop: "20px", background: "linear-gradient(135deg, #111827, #1e293b)" }}>
            <div className="card-header">
                <div>
                    <div className="card-subtitle">HUMAN-IN-THE-LOOP FEEDBACK</div>
                    <h3 style={{ marginTop: "4px" }}>Train the AP Agent with Human Oversight</h3>
                </div>
            </div>

            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "16px" }}>
                Your feedback is permanently recorded in SQLite DB and retained as vector memory in Hindsight for future invoice runs.
            </p>

            {feedbackSent ? (
                <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "14px", borderRadius: "10px", color: "#34d399", display: "flex", alignItems: "center", gap: "10px" }}>
                    <CheckCircle2 size={20} />
                    <div>
                        <strong>Human Override Retained in Hindsight!</strong>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-main)" }}>Future invoices from {result.invoice.vendor_name} will recall this decision.</div>
                    </div>
                </div>
            ) : (
                <div style={{ display: "flex", gap: "12px" }}>
                    <button
                        className="btn-primary"
                        style={{ background: "var(--success)", flex: 1 }}
                        disabled={loading}
                        onClick={() => handleSendFeedback("APPROVE")}
                    >
                        <Check size={18} /> Confirm & Approve Invoice
                    </button>
                    <button
                        className="btn-primary"
                        style={{ background: "var(--warning)", flex: 1 }}
                        disabled={loading}
                        onClick={() => handleSendFeedback("REVIEW")}
                    >
                        <MessageSquare size={18} /> Request Manager Review
                    </button>
                </div>
            )}
        </div>
    );
}

export default FeedbackCard;
