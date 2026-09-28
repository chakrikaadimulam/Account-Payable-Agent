import React from "react";
import { Brain, ArrowUpRight, History } from "lucide-react";

export function HindsightCard({ memories = [] }) {
    return (
        <div className="card" style={{ marginTop: "20px" }}>
            <div className="card-header">
                <div className="card-title-group">
                    <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Brain size={18} color="#3b82f6" /> Recalled Hindsight Vector Memories
                    </h3>
                    <div className="card-subtitle">
                        Semantic search retrieved {memories.length} relevant historical experiences
                    </div>
                </div>
                <span className="badge badge-approve" style={{ fontSize: "0.72rem" }}>
                    {memories.length} MEMORIES
                </span>
            </div>

            {memories.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.88rem" }}>
                    <History size={32} style={{ marginBottom: "8px", opacity: 0.5 }} />
                    <p>No prior historical memories matched this invoice query.</p>
                </div>
            ) : (
                <div>
                    {memories.map((mem, idx) => (
                        <div className="memory-item" key={idx}>
                            <div className="memory-tag">
                                {mem.type || "Historical Memory"}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="memory-text">{mem.text}</div>
                            </div>
                            <ArrowUpRight size={16} color="var(--text-muted)" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default HindsightCard;
