const express = require('express');
const Email = require('../models/email-model');

const router = express.Router();

router.put("/update-email/:id", (req, res) => {
  Email.updateEmail(req, res);
});

router.get("/get-emails", (req, res) => {
  Email.getEmails(req, res);
});

router.get("/get-email-by-id/:id", (req, res) => {
  Email.getEmailByID(req, res);
});

module.exports = router;
