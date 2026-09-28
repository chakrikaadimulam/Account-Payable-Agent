import React from "react";
import DecisionBadge from "../common/DecisionBadge";
import { HelpCircle, CheckSquare, Sparkles } from "lucide-react";

export function DecisionCard({ result }) {
    if (!result) return null;

    const { decision, invoice } = result;
    const norm = (decision?.decision || "REVIEW").toLowerCase();

    return (
        <div className={`decision-banner ${norm}`}>
            <div className="decision-header">
                <div>
                    <div className="card-subtitle">GROQ AI AGENT RECOMMENDATION</div>
                    <div style={{ marginTop: "6px" }}>
                        <DecisionBadge decision={decision?.decision} />
                    </div>
                </div>

                <div className="confidence-meter">
                    <div>
                        <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "white" }}>
                            {decision?.confidence || 85}%
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "right" }}>Confidence</div>
                    </div>
                    <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${decision?.confidence || 85}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="decision-reason-box">
                <div className="reason-title">
                    <HelpCircle size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                    Decision Rationale & Vector Analysis
                </div>
                <div className="reason-text">
                    {decision?.reason || "Invoice analyzed using database vendor profile and vector historical memory."}
                </div>
            </div>

            <div className="recommendation-box">
                <CheckSquare size={18} />
                <div>
                    <strong>Actionable AP Recommendation:</strong> {decision?.recommendation || "Proceed with standard processing."}
                </div>
            </div>
        </div>
    );
}

export default DecisionCard;
