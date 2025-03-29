const express = require("express");
const Faq = require("../models/faqs-model");
const router = express.Router();

router.post("/create-faqs", (req, res) => {
  Faq.createFaqs(req, res);
});

router.put("/update-faqs/:id", (req, res) => {
  Faq.updateFaqs(req, res);
});

router.get("/get-faqs", (req, res) => {
  Faq.getFaqs(req, res);
});



module.exports = router;
