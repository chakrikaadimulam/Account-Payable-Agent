const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");

router.post("/analyze", invoiceController.analyze);
router.get("/history", invoiceController.getHistory);
router.get("/stats", invoiceController.getStats);

module.exports = router;
