const express = require("express");
const CoachCategory = require("../models/coachCategory-model");
const router = express.Router();

router.post("/add-category", (req, res) => {
  CoachCategory.createCategory(req, res);
});

router.put("/update-category/:id", (req, res) => {
  CoachCategory.updateCategory(req, res);
});

router.get("/get-categories", (req, res) => {
  CoachCategory.getCategories(req, res);
});

router.get("/get-category-by-id/:id", (req, res) => {
  CoachCategory.getCategoryByID(req, res);
});

router.delete("/delete-category/:id", (req, res) => {
  CoachCategory.deleteCategory(req, res);
});

module.exports = router;
