const express = require("express");
const router = express.Router();
const mastitisController = require("../controllers/mastitisController");

router.post("/predict", mastitisController.predictRisk);
router.get("/history/:animalId", mastitisController.getHistoryByAnimal);
router.get("/health", mastitisController.getHealth);

module.exports = router;
