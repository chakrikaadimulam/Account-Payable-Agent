const express = require("express");
const router = express.Router();
const memoryController = require("../controllers/memoryController");

router.post("/seed", memoryController.seedHistoricalMemory);
router.post("/seed-learning", memoryController.seedHistoricalMemory);
router.get("/new-cases", memoryController.fetchNewTestCases);
router.post("/query", memoryController.queryMemory);

module.exports = router;
