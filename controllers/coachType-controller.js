const express = require("express");
const CoachType = require("../models/coachType-model");
const router = express.Router();

router.post("/create-type", (req, res) => {
  CoachType.createType(req, res);
});

router.put("/update-type/:id", (req, res) => {
  CoachType.updateType(req, res);
});

router.get("/get-types", (req, res) => {
  CoachType.getTypes(req, res);
});

router.get("/get-type-by-id/:id", (req, res) => {
  CoachType.getTypeByID(req, res);
});

router.delete("/delete-type/:id", (req, res) => {
  CoachType.deleteType(req, res);
});

module.exports = router;
