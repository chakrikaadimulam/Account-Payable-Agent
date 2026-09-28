import React from "react";

export function StatCard({ icon: Icon, value, label }) {
    return (
        <div className="stat-card">
            <div className="stat-icon">
                <Icon size={24} />
            </div>
            <div>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
            </div>
        </div>
    );
}

export default StatCard;
