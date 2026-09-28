import React, { useState } from "react";
import SystemOverview from "../components/profile/SystemOverview";
import { seedHistoricalMemory } from "../api/client";
import { Database, Sparkles, CheckCircle2 } from "lucide-react";

export function ProfilePage() {
    const [seeding, setSeeding] = useState(false);
    const [seedResult, setSeedResult] = useState(null);

    const handleSeedHistoricalCSV = async () => {
        setSeeding(true);
        setSeedResult(null);
        try {
            const res = await seedHistoricalMemory();
            setSeedResult(res);
        } catch (err) {
            console.error(err);
            alert("Failed to seed historical memory.");
        } finally {
            setSeeding(false);
        }
    };

    return (
        <div>
            <div className="card" style={{ marginBottom: "24px", background: "linear-gradient(135deg, #1e293b, #0f172a)" }}>
                <div className="card-header">
                    <div>
                        <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Database size={20} color="#3b82f6" /> Seed Historical Experience Dataset (`historical_cases.csv`)
                        </h3>
                        <p className="card-subtitle" style={{ marginTop: "4px" }}>
                            Inject 50 historical exception cases into Hindsight vector database to train the AP Agent prior to new case testing.
                        </p>
                    </div>
                    <button className="btn-primary" style={{ width: "auto" }} disabled={seeding} onClick={handleSeedHistoricalCSV}>
                        <Sparkles size={16} /> {seeding ? "Retaining Memory into Hindsight..." : "Seed 50 Historical Cases"}
                    </button>
                </div>

                {seedResult && (
                    <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "14px", borderRadius: "10px", color: "#34d399", display: "flex", alignItems: "center", gap: "10px", marginTop: "12px" }}>
                        <CheckCircle2 size={20} />
                        <div>
                            <strong>{seedResult.message}</strong>
                        </div>
                    </div>
                )}
            </div>

            <SystemOverview />
        </div>
    );
}

export default ProfilePage;
