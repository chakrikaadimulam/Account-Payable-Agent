import React from "react";
import DecisionBadge from "../common/DecisionBadge";
import { History, Clock } from "lucide-react";

export function RecentHistoryTable({ history = [] }) {
    return (
        <div className="card" style={{ marginTop: "24px" }}>
            <div className="card-header">
                <div className="card-title-group">
                    <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <History size={18} color="#3b82f6" /> Stored Invoice Decisions (SQLite Database)
                    </h3>
                    <div className="card-subtitle">Real-time persistent audit logs from database</div>
                </div>
                <span className="card-subtitle">{history.length} records</span>
            </div>

            {history.length === 0 ? (
                <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                    No decisions recorded yet. Analyze an invoice above to generate history.
                </div>
            ) : (
                <div className="table-container">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Vendor</th>
                                <th>Invoice Amount</th>
                                <th>Shipping</th>
                                <th>Total Exposure</th>
                                <th>Decision</th>
                                <th>Confidence</th>
                                <th>Date & Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((row) => (
                                <tr key={row.id}>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <div className="vendor-avatar" style={{ width: "30px", height: "30px", fontSize: "0.8rem" }}>
                                                {row.initials || row.vendor_name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <strong>{row.vendor_name}</strong>
                                        </div>
                                    </td>
                                    <td>₹{Number(row.amount || 0).toLocaleString("en-IN")}</td>
                                    <td>₹{Number(row.shipping || 0).toLocaleString("en-IN")}</td>
                                    <td>
                                        <strong>₹{Number(row.total_amount || 0).toLocaleString("en-IN")}</strong>
                                    </td>
                                    <td>
                                        <DecisionBadge decision={row.decision} />
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: "600", color: "var(--text-main)" }}>{row.confidence}%</span>
                                    </td>
                                    <td>
                                        <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                            <Clock size={12} />
                                            {new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default RecentHistoryTable;
