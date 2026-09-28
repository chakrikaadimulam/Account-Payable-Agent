import React from "react";
import { ShieldCheck, Brain, CreditCard, DollarSign, AlertCircle } from "lucide-react";

export function VendorIntelligenceCard({ vendor, memoriesCount = 0 }) {
    if (!vendor) {
        return (
            <div className="card">
                <div className="card-header">
                    <h3>Vendor Intelligence</h3>
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    Select a vendor to inspect historical baseline profile.
                </p>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title-group">
                    <h3>Vendor Intelligence Baseline</h3>
                    <div className="card-subtitle">Stored in SQLite database</div>
                </div>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#34d399", fontSize: "0.78rem", fontWeight: "600" }}>
                    <ShieldCheck size={14} /> VERIFIED
                </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                <div className="vendor-avatar">
                    {vendor.initials || vendor.vendor_name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <h4 style={{ color: "white", fontSize: "1.1rem" }}>{vendor.vendor_name}</h4>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Database ID: #{vendor.id || 'N/A'}</div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div style={{ background: "var(--bg-input)", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}>
                        <DollarSign size={12} /> Typical Invoices
                    </div>
                    <strong style={{ color: "white", fontSize: "0.95rem" }}>
                        ₹{(vendor.normal_min / 1000).toFixed(0)}K – ₹{(vendor.normal_max / 1000).toFixed(0)}K
                    </strong>
                </div>

                <div style={{ background: "var(--bg-input)", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}>
                        <DollarSign size={12} /> Shipping Range
                    </div>
                    <strong style={{ color: "white", fontSize: "0.95rem" }}>
                        ₹{(vendor.shipping_min / 1000).toFixed(0)}K – ₹{(vendor.shipping_max / 1000).toFixed(0)}K
                    </strong>
                </div>

                <div style={{ background: "var(--bg-input)", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}>
                        <CreditCard size={12} /> Payment Terms
                    </div>
                    <strong style={{ color: "white", fontSize: "0.95rem" }}>{vendor.payment_terms}</strong>
                </div>

                <div style={{ background: "var(--bg-input)", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}>
                        <AlertCircle size={12} /> Approval Limit
                    </div>
                    <strong style={{ color: "white", fontSize: "0.95rem" }}>
                        ₹{Number(vendor.approval_threshold).toLocaleString('en-IN')}
                    </strong>
                </div>
            </div>

            <div style={{ background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: "10px", padding: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                <Brain size={20} color="#3b82f6" />
                <div style={{ fontSize: "0.82rem", color: "#93c5fd" }}>
                    <strong>Hindsight Vector Experience:</strong> {memoriesCount} prior interactions & human review decisions recalled for this vendor.
                </div>
            </div>
        </div>
    );
}

export default VendorIntelligenceCard;
