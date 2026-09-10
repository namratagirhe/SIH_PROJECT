const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/stats/overview", doctorController.getPlatformStats);
router.get("/", doctorController.getDoctors);
router.get("/:id", doctorController.getDoctorById);
router.post("/:id/reviews", protect, doctorController.addReview);
router.put("/verify/:id", doctorController.verifyDoctor);

module.exports = router;
