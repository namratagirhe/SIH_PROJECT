const express = require("express");
const router = express.Router();
const consultationController = require("../controllers/consultationController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, consultationController.createRequest);
router.get("/", protect, consultationController.getConsultations);
router.put("/:id/status", protect, consultationController.updateStatus);

module.exports = router;
