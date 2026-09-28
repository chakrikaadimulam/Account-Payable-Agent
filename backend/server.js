require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

// DB and Memory Initialization
require("./config/database");
const { seedVendorsFromCSV } = require("./services/seedService");
const { initializeMemory } = require("./services/hindsightService");

// Routers
const invoiceRoutes = require("./routes/invoiceRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const memoryRoutes = require("./routes/memoryRoutes");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Health check endpoint
app.get("/", (req, res) => {
    res.json({
        name: "AP Intelligence Enterprise Server",
        version: "2.0.0",
        status: "ONLINE",
        database: "SQLite (Active)",
        memory_engine: "Hindsight by Vectorize",
        llm: "Groq LLaMA 3.3 / OSS 120B",
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use("/api/invoices", invoiceRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/memory", memoryRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack);
    res.status(500).json({
        error: "Internal Server Error",
        message: err.message
    });
});

// Start Server
async function startServer() {
    try {
        await seedVendorsFromCSV();
        await initializeMemory();
        app.listen(PORT, () => {
            console.log("");
            console.log("===============================================");
            console.log(" ✦ AP Intelligence — Enterprise Agent Server");
            console.log("===============================================");
            console.log(` 🚀 Server listening on: http://localhost:${PORT}`);
            console.log(` 🗄️ Database: SQLite (ap_database.sqlite)`);
            console.log(` 🧠 Memory Engine: Hindsight Vector Client`);
            console.log("===============================================");
            console.log("");
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();