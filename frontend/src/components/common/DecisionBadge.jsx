import React from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export function DecisionBadge({ decision }) {
    const norm = (decision || "").toUpperCase();

    if (norm === "APPROVE") {
        return (
            <span className="badge badge-approve">
                <CheckCircle2 size={14} /> APPROVE
            </span>
        );
    }
    if (norm === "REVIEW") {
        return (
            <span className="badge badge-review">
                <AlertTriangle size={14} /> REVIEW
            </span>
        );
    }
    return (
        <span className="badge badge-hold">
            <XCircle size={14} /> HOLD
        </span>
    );
}

export default DecisionBadge;
