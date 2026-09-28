import React, { useState } from "react";
import { Send, Sparkles, Plus } from "lucide-react";

export function InvoiceForm({ vendors, onAnalyze, loading, onOpenAddVendor }) {
    const [selectedVendor, setSelectedVendor] = useState(vendors[0]?.vendor_name || "");
    const [amount, setAmount] = useState("");
    const [shipping, setShipping] = useState("");

    // Sync selected vendor if vendors list loads asynchronously
    React.useEffect(() => {
        if (!selectedVendor && vendors.length > 0) {
            setSelectedVendor(vendors[0].vendor_name);
        }
    }, [vendors, selectedVendor]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0) return;
        onAnalyze({
            vendor_name: selectedVendor,
            amount: Number(amount),
            shipping: Number(shipping) || 0,
            total_amount: (Number(amount) || 0) + (Number(shipping) || 0)
        });
    };

    const handleApplyPreset = (presetAmount, presetShipping) => {
        setAmount(String(presetAmount));
        setShipping(String(presetShipping));
    };

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title-group">
                    <h3>Analyze New Invoice</h3>
                    <div className="card-subtitle">Real-time DB lookup & vector memory recall</div>
                </div>
                <button
                    onClick={onOpenAddVendor}
                    style={{
                        background: "var(--primary-glow)",
                        color: "var(--primary)",
                        border: "1px solid var(--border-glow)",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                    }}
                >
                    <Plus size={14} /> Add Vendor
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Select Vendor (Loaded from DB)</label>
                    <select
                        className="form-select"
                        value={selectedVendor}
                        onChange={(e) => setSelectedVendor(e.target.value)}
                    >
                        {vendors.map((v) => (
                            <option key={v.id || v.vendor_name} value={v.vendor_name}>
                                {v.vendor_name} ({v.payment_terms})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Invoice Net Amount (₹)</label>
                        <input
                            type="number"
                            className="form-input"
                            required
                            placeholder="72,000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Shipping / Freight (₹)</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="4,000"
                            value={shipping}
                            onChange={(e) => setShipping(e.target.value)}
                        />
                    </div>
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? (
                        <>
                            <Sparkles className="animate-spin" size={18} /> Processing Vector Memory & AI...
                        </>
                    ) : (
                        <>
                            <Send size={18} /> Analyze Invoice
                        </>
                    )}
                </button>
            </form>

            <div style={{ marginTop: "16px" }}>
                <span className="card-subtitle">Quick Test Presets:</span>
                <div className="preset-buttons">
                    <button className="btn-preset" onClick={() => handleApplyPreset(68000, 4000)}>
                        Routine Standard (₹72K)
                    </button>
                    <button className="btn-preset" onClick={() => handleApplyPreset(92000, 8500)}>
                        High Spike (₹100.5K)
                    </button>
                    <button className="btn-preset" onClick={() => handleApplyPreset(74000, 9500)}>
                        High Shipping Discrepancy
                    </button>
                </div>
            </div>
        </div>
    );
}

export default InvoiceForm;
