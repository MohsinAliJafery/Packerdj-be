const express = require('express');
const About = require('../models/aboutPekerdja-model');

const router = express.Router();

router.put("/update-data/:id", (req, res) => {
  About.updateData(req, res);
});

router.get("/get-data", (req, res) => {
  About.getData(req, res);
});

router.get("/get-data-by-id/:id", (req, res) => {
  About.getDataByID(req, res);
});

module.exports = router;
