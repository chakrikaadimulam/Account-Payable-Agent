import React, { useState } from "react";
import { X, PlusCircle } from "lucide-react";
import { createVendor } from "../../api/client";

export function AddVendorModal({ isOpen, onClose, onVendorAdded }) {
    const [formData, setFormData] = useState({
        vendor_name: "",
        initials: "",
        normal_min: "",
        normal_max: "",
        shipping_min: "",
        shipping_max: "",
        payment_terms: "Net 30",
        approval_threshold: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const created = await createVendor(formData);
            onVendorAdded(created);
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to create vendor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <div className="card-header">
                    <h3>Add New Vendor Profile</h3>
                    <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                        <X size={20} />
                    </button>
                </div>

                {error && <div style={{ color: "#ef4444", marginBottom: "12px", fontSize: "0.85rem" }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Vendor Name</label>
                        <input
                            type="text"
                            className="form-input"
                            required
                            placeholder="e.g. Acme Tech Solutions"
                            value={formData.vendor_name}
                            onChange={e => setFormData({ ...formData, vendor_name: e.target.value })}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Normal Min Amount (₹)</label>
                            <input
                                type="number"
                                className="form-input"
                                required
                                placeholder="30000"
                                value={formData.normal_min}
                                onChange={e => setFormData({ ...formData, normal_min: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Normal Max Amount (₹)</label>
                            <input
                                type="number"
                                className="form-input"
                                required
                                placeholder="80000"
                                value={formData.normal_max}
                                onChange={e => setFormData({ ...formData, normal_max: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Shipping Min (₹)</label>
                            <input
                                type="number"
                                className="form-input"
                                required
                                placeholder="2000"
                                value={formData.shipping_min}
                                onChange={e => setFormData({ ...formData, shipping_min: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Shipping Max (₹)</label>
                            <input
                                type="number"
                                className="form-input"
                                required
                                placeholder="5000"
                                value={formData.shipping_max}
                                onChange={e => setFormData({ ...formData, shipping_max: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Payment Terms</label>
                            <select
                                className="form-select"
                                value={formData.payment_terms}
                                onChange={e => setFormData({ ...formData, payment_terms: e.target.value })}
                            >
                                <option value="Net 15">Net 15</option>
                                <option value="Net 30">Net 30</option>
                                <option value="Net 45">Net 45</option>
                                <option value="Net 60">Net 60</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Approval Threshold (₹)</label>
                            <input
                                type="number"
                                className="form-input"
                                required
                                placeholder="75000"
                                value={formData.approval_threshold}
                                onChange={e => setFormData({ ...formData, approval_threshold: e.target.value })}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "12px" }}>
                        <PlusCircle size={18} /> {loading ? "Adding to Database..." : "Save Vendor to Database"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddVendorModal;
