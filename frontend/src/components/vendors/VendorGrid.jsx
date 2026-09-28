import React from "react";
import { PlusCircle, ShieldCheck, DollarSign, Calendar, CreditCard } from "lucide-react";

export function VendorGrid({ vendors = [], onOpenAddModal, onSelectVendorForAnalysis }) {
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                    <h2 style={{ color: "white", fontSize: "1.4rem" }}>Database Vendor Registry</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        Managed vendor profiles with approval thresholds & shipping rules
                    </p>
                </div>
                <button className="btn-primary" style={{ width: "auto" }} onClick={onOpenAddModal}>
                    <PlusCircle size={18} /> Register New Vendor
                </button>
            </div>

            <div className="vendors-grid">
                {vendors.map((vendor) => (
                    <div className="vendor-card" key={vendor.id || vendor.vendor_name}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                <div className="vendor-avatar">
                                    {vendor.initials || vendor.vendor_name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 style={{ color: "white", fontSize: "1.05rem" }}>{vendor.vendor_name}</h3>
                                    <span style={{ color: "#34d399", fontSize: "0.75rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                                        <ShieldCheck size={12} /> Active Baseline
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: "var(--bg-input)", padding: "14px", borderRadius: "10px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.82rem", marginBottom: "16px" }}>
                            <div>
                                <span style={{ color: "var(--text-muted)" }}>Invoice Baseline:</span>
                                <div style={{ color: "white", fontWeight: "600" }}>
                                    ₹{(vendor.normal_min / 1000).toFixed(0)}K – ₹{(vendor.normal_max / 1000).toFixed(0)}K
                                </div>
                            </div>
                            <div>
                                <span style={{ color: "var(--text-muted)" }}>Shipping Limits:</span>
                                <div style={{ color: "white", fontWeight: "600" }}>
                                    ₹{(vendor.shipping_min / 1000).toFixed(0)}K – ₹{(vendor.shipping_max / 1000).toFixed(0)}K
                                </div>
                            </div>
                            <div>
                                <span style={{ color: "var(--text-muted)" }}>Terms:</span>
                                <div style={{ color: "white", fontWeight: "600" }}>{vendor.payment_terms}</div>
                            </div>
                            <div>
                                <span style={{ color: "var(--text-muted)" }}>Approval Threshold:</span>
                                <div style={{ color: "white", fontWeight: "600" }}>₹{Number(vendor.approval_threshold).toLocaleString("en-IN")}</div>
                            </div>
                        </div>

                        <button
                            className="btn-preset"
                            style={{ width: "100%", padding: "10px", color: "var(--primary)", borderColor: "var(--border-glow)", background: "var(--primary-glow)" }}
                            onClick={() => onSelectVendorForAnalysis(vendor.vendor_name)}
                        >
                            Analyze Invoice for this Vendor →
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default VendorGrid;
