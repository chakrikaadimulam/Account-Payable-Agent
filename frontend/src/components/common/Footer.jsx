import React from "react";
import { Database, Zap, ShieldCheck } from "lucide-react";

export function Footer() {
    return (
        <footer className="footer">
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Database size={14} color="#3b82f6" /> SQLite Database Persistent
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Zap size={14} color="#f59e0b" /> Groq AI Reasoning Engine
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <ShieldCheck size={14} color="#10b981" /> Hindsight Vector Memory Bank
                </span>
            </div>
            <div>AP Intelligence v2.0 Enterprise Agent</div>
        </footer>
    );
}

export default Footer;
