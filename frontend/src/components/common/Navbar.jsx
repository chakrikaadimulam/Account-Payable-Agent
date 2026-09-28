import React from "react";
import { LayoutDashboard, FileSearch, Building2, ShieldCheck, UserCheck, Brain, Cpu } from "lucide-react";

export function Navbar({ activeView, setActiveView }) {
    return (
        <header className="navbar">
            <div className="nav-brand">
                <div className="logo-badge">
                    <Cpu size={20} />
                </div>
                <div>
                    <div className="brand-title">AP Memory Agent</div>
                </div>
            </div>

            <nav className="nav-menu">
                <button
                    className={`nav-item ${activeView === "dashboard" ? "active" : ""}`}
                    onClick={() => setActiveView("dashboard")}
                >
                    <LayoutDashboard size={16} /> Dashboard
                </button>
                <button
                    className={`nav-item ${activeView === "analyze" ? "active" : ""}`}
                    onClick={() => setActiveView("analyze")}
                >
                    <FileSearch size={16} /> Analyze Invoice
                </button>
                <button
                    className={`nav-item ${activeView === "vendors" ? "active" : ""}`}
                    onClick={() => setActiveView("vendors")}
                >
                    <Building2 size={16} /> Vendors
                </button>
                <button
                    className={`nav-item ${activeView === "decisions" ? "active" : ""}`}
                    onClick={() => setActiveView("decisions")}
                >
                    <ShieldCheck size={16} /> Decisions
                </button>
                <button
                    className={`nav-item ${activeView === "profile" ? "active" : ""}`}
                    onClick={() => setActiveView("profile")}
                >
                    <UserCheck size={16} /> Profile
                </button>
            </nav>

            <div className="nav-status">
                <div className="hindsight-status-pill">
                    <div className="pulse-dot"></div>
                    <Brain size={14} /> Hindsight Active
                </div>
            </div>
        </header>
    );
}

export default Navbar;
