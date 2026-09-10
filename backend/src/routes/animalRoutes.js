const express = require("express");
const router = express.Router();
const animalController = require("../controllers/animalController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, animalController.getAnimals);
router.post("/", protect, animalController.addAnimal);
router.delete("/:id", protect, animalController.deleteAnimal);

module.exports = router;
