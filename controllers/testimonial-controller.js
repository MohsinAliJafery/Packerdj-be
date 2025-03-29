const express = require("express");
const Testimonial = require("../models/testimonial-model");
const router = express.Router();

router.post("/create-testimonial", (req, res) => {
  Testimonial.createTestimonial(req, res);
});

router.put("/update-testimonial/:id", (req, res) => {
  Testimonial.updateTestimonial(req, res);
});

router.get("/get-testimonials", (req, res) => {
  Testimonial.getTestimonials(req, res);
});

router.get("/get-testimonial-by-id/:id", (req, res) => {
  Testimonial.getTestimonialByID(req, res);
});

router.delete("/delete-testimonial/:id", (req, res) => {
  Testimonial.deleteTestimonial(req, res);
});



module.exports = router;
