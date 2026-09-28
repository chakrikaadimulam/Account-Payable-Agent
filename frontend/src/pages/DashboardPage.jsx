import React, { useState, useEffect } from "react";
import ScrollRevealSection from "../components/common/ScrollRevealSection";
import StatCard from "../components/common/StatCard";
import DecisionBadge from "../components/common/DecisionBadge";
import { fetchDashboardStats } from "../api/client";
import { FileText, Wallet, Clock, Building2, ArrowRight, Activity, AlertTriangle, ShieldCheck } from "lucide-react";

export function DashboardPage({ onNavigate }) {
    const [stats, setStats] = useState({
        totalInvoices: 0,
        totalSpend: 0,
        approvedCount: 0,
        reviewCount: 0,
        holdCount: 0,
        totalVendors: 0,
        vendorsWithExceptions: 0,
        vendorsRequiringAttention: 0,
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats()
            .then(data => setStats(data))
            .catch(err => console.error("Failed to load dashboard stats:", err))
            .finally(() => setLoading(false));
    }, []);

    const formatSpend = (spend) => {
        if (!spend) return "₹0";
        if (spend >= 100000) {
            return `₹${(spend / 100000).toFixed(1)}L`;
        }
        return `₹${spend.toLocaleString("en-IN")}`;
    };

    const totalDecisions = (stats.approvedCount || 0) + (stats.reviewCount || 0) + (stats.holdCount || 0);
    const approvedPct = totalDecisions > 0 ? Math.round((stats.approvedCount / totalDecisions) * 100) : 0;
    const reviewPct = totalDecisions > 0 ? Math.round((stats.reviewCount / totalDecisions) * 100) : 0;
    const holdPct = totalDecisions > 0 ? Math.round((stats.holdCount / totalDecisions) * 100) : 0;

    return (
        <div>
            {/* Dashboard Hero */}
            <div className="dashboard-hero">
                <h1>Accounts Payable Overview</h1>
                <p>Monitor invoice activity, review decisions and track vendor operations.</p>
            </div>

            {/* 4 Dynamic Executive Statistic Cards */}
            <ScrollRevealSection delay={100}>
                <div className="stats-banner">
                    <StatCard icon={FileText} value={stats.totalInvoices || 0} label="Invoices" />
                    <StatCard icon={Wallet} value={formatSpend(stats.totalSpend)} label="Total Spend" />
                    <StatCard icon={Clock} value={stats.reviewCount || 0} label="Pending Review" />
                    <StatCard icon={Building2} value={stats.totalVendors || 10} label="Vendors" />
                </div>
            </ScrollRevealSection>

            {/* Section 1: Recent Activity */}
            <ScrollRevealSection delay={200}>
                <div className="card">
                    <div className="card-header">
                        <div className="card-title-group">
                            <h3><Activity size={18} color="#3b82f6" /> Recent Activity</h3>
                        </div>
                        <button className="action-link" onClick={() => onNavigate("decisions")}>
                            View all decisions <ArrowRight size={14} />
                        </button>
                    </div>

                    {loading ? (
                        <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", padding: "12px 0" }}>Loading activity...</div>
                    ) : !stats.recentActivity || stats.recentActivity.length === 0 ? (
                        <div style={{ color: "var(--text-muted)", fontSize: "0.88rem", padding: "16px 0" }}>
                            No invoice activity recorded yet. Click <strong>Analyze Invoice</strong> in the menu to test an invoice.
                        </div>
                    ) : (
                        <div className="activity-list">
                            {stats.recentActivity.map((act) => (
                                <div className="activity-item" key={act.id}>
                                    <div className="activity-left">
                                        <div className="activity-icon">
                                            <FileText size={16} />
                                        </div>
                                        <div>
                                            <div className="activity-title">{act.vendor_name}</div>
                                            <div className="activity-sub">
                                                ₹{Number(act.total_amount || 0).toLocaleString("en-IN")} · {act.reason ? act.reason.slice(0, 60) + "..." : "Invoice analyzed"}
                                            </div>
                                        </div>
                                    </div>
                                    <DecisionBadge decision={act.decision} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ScrollRevealSection>

            {/* Section 2: Vendor Overview */}
            <ScrollRevealSection delay={300}>
                <div className="card">
                    <div className="card-header">
                        <div className="card-title-group">
                            <h3><Building2 size={18} color="#3b82f6" /> Vendor Overview</h3>
                        </div>
                        <button className="action-link" onClick={() => onNavigate("vendors")}>
                            View all vendors <ArrowRight size={14} />
                        </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
                        <div style={{ background: "var(--bg-input)", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                            <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "white" }}>{stats.totalVendors || 10}</div>
                            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Active Vendors</div>
                        </div>
                        <div style={{ background: "var(--bg-input)", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                            <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#fbbf24" }}>{stats.vendorsWithExceptions || 0}</div>
                            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Vendors with Recent Exceptions</div>
                        </div>
                        <div style={{ background: "var(--bg-input)", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                            <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#f87171" }}>{stats.vendorsRequiringAttention || 0}</div>
                            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Requiring Attention</div>
                        </div>
                    </div>
                </div>
            </ScrollRevealSection>

            {/* Section 3: Decision Overview */}
            <ScrollRevealSection delay={400}>
                <div className="card">
                    <div className="card-header">
                        <div className="card-title-group">
                            <h3><ShieldCheck size={18} color="#3b82f6" /> Decision Overview</h3>
                        </div>
                        <button className="action-link" onClick={() => onNavigate("decisions")}>
                            View decision history <ArrowRight size={14} />
                        </button>
                    </div>

                    <div className="distribution-container">
                        <div className="distribution-row">
                            <div className="distribution-label">
                                <span style={{ color: "#34d399" }}>Approved ({stats.approvedCount || 0})</span>
                                <span style={{ color: "var(--text-muted)" }}>{approvedPct}%</span>
                            </div>
                            <div className="bar-bg">
                                <div className="bar-fill-approve" style={{ width: `${approvedPct}%` }}></div>
                            </div>
                        </div>

                        <div className="distribution-row">
                            <div className="distribution-label">
                                <span style={{ color: "#fbbf24" }}>Pending Review ({stats.reviewCount || 0})</span>
                                <span style={{ color: "var(--text-muted)" }}>{reviewPct}%</span>
                            </div>
                            <div className="bar-bg">
                                <div className="bar-fill-review" style={{ width: `${reviewPct}%` }}></div>
                            </div>
                        </div>

                        <div className="distribution-row">
                            <div className="distribution-label">
                                <span style={{ color: "#f87171" }}>On Hold ({stats.holdCount || 0})</span>
                                <span style={{ color: "var(--text-muted)" }}>{holdPct}%</span>
                            </div>
                            <div className="bar-bg">
                                <div className="bar-fill-hold" style={{ width: `${holdPct}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollRevealSection>
        </div>
    );
}

export default DashboardPage;
