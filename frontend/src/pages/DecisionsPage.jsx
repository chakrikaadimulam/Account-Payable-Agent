import React, { useState, useEffect } from "react";
import DecisionTimeline from "../components/decisions/DecisionTimeline";
import { fetchDecisionHistory } from "../api/client";

export function DecisionsPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDecisionHistory(50)
            .then(data => setHistory(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div style={{ padding: "40px", color: "var(--text-muted)" }}>Loading decision execution traces from database...</div>;
    }

    return (
        <div>
            <DecisionTimeline history={history} />
        </div>
    );
}

export default DecisionsPage;
