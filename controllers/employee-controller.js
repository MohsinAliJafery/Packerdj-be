const express = require("express");
const Employer = require("../models/employee-model");
const router = express.Router();

router.post("/create-employer", (req, res) => {
  Employer.createEmployer(req, res);
});

router.put("/update-employer/:id", (req, res) => {
  Employer.updateEmployer(req, res);
});

router.get("/get-employers", (req, res) => {
  Employer.getEmployers(req, res);
});

router.get("/get-allemployers-data", (req, res) => {
  Employer.getAllEmployersData(req, res);
});

router.get("/get-employer-by-id/:id", (req, res) => {
  Employer.getEmployerByID(req, res);
});

router.delete("/delete-employer/:id", (req, res) => {
  Employer.deleteEmployer(req, res);
});



module.exports = router;
