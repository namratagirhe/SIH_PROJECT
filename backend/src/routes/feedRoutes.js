const express = require("express");
const router = express.Router();
const feedController = require("../controllers/feedController");
const { protect } = require("../middleware/authMiddleware");

router.post("/analyze", protect, feedController.analyzeFeed);
router.get("/history", protect, feedController.getFeedHistory);
router.get("/trends", protect, feedController.getFeedTrends);
router.get("/alerts", protect, feedController.getAlerts);

module.exports = router;
