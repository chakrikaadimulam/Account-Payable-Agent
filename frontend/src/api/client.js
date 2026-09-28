import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
});

export const fetchVendors = async () => {
    const res = await api.get("/api/vendors");
    return res.data;
};

export const createVendor = async (vendorData) => {
    const res = await api.post("/api/vendors", vendorData);
    return res.data;
};

export const analyzeInvoice = async (invoiceData) => {
    const res = await api.post("/api/invoices/analyze", invoiceData);
    return res.data;
};

export const sendFeedback = async (feedbackData) => {
    const res = await api.post("/api/feedback", feedbackData);
    return res.data;
};

export const fetchDecisionHistory = async (limit = 50) => {
    const res = await api.get(`/api/invoices/history?limit=${limit}`);
    return res.data;
};

export const fetchDashboardStats = async () => {
    const res = await api.get("/api/invoices/stats");
    return res.data;
};

export const seedHistoricalMemory = async () => {
    const res = await api.post("/api/memory/seed-learning");
    return res.data;
};

export default api;
