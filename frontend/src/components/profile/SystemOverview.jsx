import React from "react";
import { Server, Database, Brain, Cpu, ShieldCheck } from "lucide-react";

export function SystemOverview() {
    return (
        <div>
            <h2 style={{ color: "white", fontSize: "1.4rem", marginBottom: "6px" }}>System Profile & Architecture Overview</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "20px" }}>
                Enterprise connection details between React Frontend, Express Backend, SQLite Database, and Hindsight Memory Engine.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div className="card">
                    <div className="card-header">
                        <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Server size={18} color="#3b82f6" /> System Architecture & Layers
                        </h3>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
                        <div style={{ background: "var(--bg-input)", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                            <strong>Frontend Layer:</strong> React 19 + Vite + Lucide Icons + Centralized Axios Client
                        </div>
                        <div style={{ background: "var(--bg-input)", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                            <strong>Backend Layer:</strong> Express 5 API Server + Modular Controllers & Services
                        </div>
                        <div style={{ background: "var(--bg-input)", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                            <strong>Database Layer:</strong> SQLite (`ap_database.sqlite`) with WAL mode & Foreign Keys
                        </div>
                        <div style={{ background: "var(--bg-input)", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                            <strong>Vector Memory Layer:</strong> Hindsight by Vectorize (`accounts-payable-agent` bank)
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <ShieldCheck size={18} color="#34d399" /> System Health Status
                        </h3>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-input)", padding: "12px", borderRadius: "10px" }}>
                            <span>Express API Backend</span>
                            <span style={{ color: "#34d399", fontWeight: "700" }}>● ONLINE (Port 5000)</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-input)", padding: "12px", borderRadius: "10px" }}>
                            <span>SQLite Database</span>
                            <span style={{ color: "#34d399", fontWeight: "700" }}>● CONNECTED</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-input)", padding: "12px", borderRadius: "10px" }}>
                            <span>Hindsight Vector Client</span>
                            <span style={{ color: "#34d399", fontWeight: "700" }}>● READY</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-input)", padding: "12px", borderRadius: "10px" }}>
                            <span>Groq AI Inference Engine</span>
                            <span style={{ color: "#34d399", fontWeight: "700" }}>● ACTIVE</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SystemOverview;
