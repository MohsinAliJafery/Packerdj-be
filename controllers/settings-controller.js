const express = require('express');
const Setting = require('../models/settings-model');

const router = express.Router();

router.put("/update-setting/:id", (req, res) => {
  Setting.updateSettings(req, res);
});

router.get("/get-settings", (req, res) => {
  Setting.getSettings(req, res);
});


module.exports = router;
