const express = require("express");
const Category = require("../models/jobCategory-model");
const router = express.Router();

router.post("/create-category", (req, res) => {
  Category.createCategory(req, res);
});

router.put("/update-category/:id", (req, res) => {
  Category.updateCategory(req, res);
});

router.get("/get-categories", (req, res) => {
  Category.getCategories(req, res);
});

router.get("/get-category-by-id/:id", (req, res) => {
  Category.getCategoryByID(req, res);
});

router.delete("/delete-category/:id", (req, res) => {
  Category.deleteCategory(req, res);
});

module.exports = router;
