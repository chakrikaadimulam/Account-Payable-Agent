import React from "react";
import DecisionBadge from "../common/DecisionBadge";
import { Database, Brain, Cpu, ShieldAlert, UserCheck } from "lucide-react";

export function DecisionTimeline({ history = [] }) {
    if (history.length === 0) {
        return (
            <div className="card" style={{ padding: "40px", textAlign: "center" }}>
                <h3>No Decisions Traced Yet</h3>
                <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
                    Process an invoice from the Dashboard to record complete agent execution traces.
                </p>
            </div>
        );
    }

    return (
        <div>
            <h2 style={{ color: "white", fontSize: "1.4rem", marginBottom: "6px" }}>Decision Intelligence Execution Traces</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "20px" }}>
                Step-by-step trace: Invoice Input → DB Profile Match → Vector Recall → AI Reasoning → Human Feedback Loop
            </p>

            {history.map((record) => (
                <div className="card" key={record.id} style={{ marginBottom: "20px" }}>
                    <div className="card-header">
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                            <div className="vendor-avatar">
                                {record.initials || record.vendor_name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h3 style={{ color: "white" }}>{record.vendor_name}</h3>
                                <div className="card-subtitle">
                                    Invoice Total: ₹{Number(record.total_amount).toLocaleString("en-IN")} (Net ₹{Number(record.amount).toLocaleString()} + Shipping ₹{Number(record.shipping).toLocaleString()})
                                </div>
                            </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <DecisionBadge decision={record.decision} />
                            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
                                {record.confidence}% Agent Confidence
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginTop: "16px" }}>
                        <div style={{ background: "var(--bg-input)", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                            <div style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                                <Database size={14} /> 1. DATABASE PROFILE
                            </div>
                            <div style={{ fontSize: "0.82rem", color: "var(--text-main)" }}>
                                Vendor baseline & threshold checked from SQLite DB.
                            </div>
                        </div>

                        <div style={{ background: "var(--bg-input)", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                            <div style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                                <Brain size={14} /> 2. VECTOR RECALL
                            </div>
                            <div style={{ fontSize: "0.82rem", color: "var(--text-main)" }}>
                                {record.memories_used?.length || 0} Hindsight memories passed to context.
                            </div>
                        </div>

                        <div style={{ background: "var(--bg-input)", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                            <div style={{ fontSize: "0.75rem", color: "#f59e0b", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                                <Cpu size={14} /> 3. GROQ REASONING
                            </div>
                            <div style={{ fontSize: "0.82rem", color: "var(--text-main)" }}>
                                {record.reason || "AI evaluated patterns."}
                            </div>
                        </div>

                        <div style={{ background: "var(--bg-input)", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                            <div style={{ fontSize: "0.75rem", color: "#ec4899", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                                <UserCheck size={14} /> 4. HUMAN MEMORY FEEDBACK
                            </div>
                            <div style={{ fontSize: "0.82rem", color: "var(--text-main)" }}>
                                Outcome retained for future invoice runs.
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default DecisionTimeline;
