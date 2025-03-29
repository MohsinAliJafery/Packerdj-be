const express = require("express");
const Coach = require("../models/coaches-model");
const router = express.Router();

router.post("/create-coach", (req, res) => {
  Coach.createCoach(req, res);
});

router.put("/update-coach/:id", (req, res) => {
  Coach.updateCoach(req, res);
});

router.get("/get-coaches", (req, res) => {
  Coach.getCoaches(req, res);
});

router.get("/get-coach-by-id/:id", (req, res) => {
  Coach.getCoachByID(req, res);
});

router.delete("/delete-coach/:id", (req, res) => {
  Coach.deleteCoach(req, res);
});



module.exports = router;
