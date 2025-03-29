const express = require("express");
const Booking = require("../models/booking-model");
const router = express.Router();

router.post("/add-booking", (req, res) => {
    Booking.addBooking(req, res);
});
router.post("/generate-meeting-link", (req, res) => {
    Booking.getMeetingLink(req, res);
});

router.get("/get-sessions-by-userId/:id", (req, res) => {
    Booking.getSessionsByUserId(req, res);
});
router.get("/get-sessions-by-coachId/:id", (req, res) => {
    Booking.getSessionsByCoachId(req, res);
});
router.get("/get-transactions", (req, res) => {
    Booking.getTransactions(req, res);
});
router.get("/redirect", (req, res) => {
    Booking.redirect(req, res);
});

module.exports = router;
