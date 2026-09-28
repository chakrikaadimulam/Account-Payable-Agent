import React, { useState, useEffect } from "react";
import InvoiceForm from "../components/dashboard/InvoiceForm";
import VendorIntelligenceCard from "../components/dashboard/VendorIntelligenceCard";
import DecisionCard from "../components/dashboard/DecisionCard";
import HindsightCard from "../components/dashboard/HindsightCard";
import FeedbackCard from "../components/dashboard/FeedbackCard";
import { analyzeInvoice } from "../api/client";
import axios from "axios";

const API = "http://localhost:5000";

export function AnalyzeInvoicePage({ vendors, onOpenAddVendor, preselectedVendor }) {
    const [selectedVendorName, setSelectedVendorName] = useState(vendors[0]?.vendor_name || "");
    const [loading, setLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [newTestCases, setNewTestCases] = useState([]);

    useEffect(() => {
        if (preselectedVendor) {
            setSelectedVendorName(preselectedVendor);
        } else if (vendors.length > 0 && !selectedVendorName) {
            setSelectedVendorName(vendors[0].vendor_name);
        }
    }, [vendors, preselectedVendor]);

    useEffect(() => {
        axios.get(`${API}/api/memory/new-cases`)
            .then(res => setNewTestCases(res.data || []))
            .catch(() => {});
    }, []);

    const activeVendorProfile = vendors.find(
        v => v.vendor_name.toLowerCase() === selectedVendorName.toLowerCase()
    ) || vendors[0];

    const handleAnalyze = async (invoiceData) => {
        setLoading(true);
        try {
            const res = await analyzeInvoice(invoiceData);
            setAnalysisResult(res);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Unable to analyze invoice. Check if backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="dashboard-hero">
                <h1>Invoice Investigation & Analysis</h1>
                <p>Evaluate incoming invoices using DB profiles, Hindsight vector experience, and Groq AI reasoning.</p>
            </div>

            {/* Test Case Selection Bar */}
            {newTestCases.length > 0 && (
                <div className="card" style={{ padding: "14px 20px", marginBottom: "20px" }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--primary)", marginBottom: "8px" }}>
                        SAMPLE DEMO TEST CASES (`new_cases.csv`):
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {newTestCases.map((tc) => (
                            <button
                                key={tc.case_id}
                                className="btn-preset"
                                onClick={() => {
                                    setSelectedVendorName(tc.vendor_name);
                                    handleAnalyze({
                                        vendor_name: tc.vendor_name,
                                        amount: Number(tc.invoice_amount) || 50000,
                                        shipping: 3000,
                                        total_amount: (Number(tc.invoice_amount) || 50000) + 3000
                                    });
                                }}
                            >
                                {tc.case_id}: {tc.vendor_name} ({tc.exception_type})
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="dashboard-grid">
                <InvoiceForm
                    vendors={vendors}
                    onAnalyze={handleAnalyze}
                    loading={loading}
                    onOpenAddVendor={onOpenAddVendor}
                />
                <VendorIntelligenceCard
                    vendor={activeVendorProfile}
                    memoriesCount={analysisResult?.memories?.length || 0}
                />
            </div>

            {analysisResult && (
                <div>
                    <DecisionCard result={analysisResult} />
                    <HindsightCard memories={analysisResult.memories} />
                    <FeedbackCard result={analysisResult} />
                </div>
            )}
        </div>
    );
}

export default AnalyzeInvoicePage;
