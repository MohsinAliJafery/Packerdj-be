const express = require("express");
const AppliedJobs = require("../models/applied_jobs-model");
const router = express.Router();

router.post("/add-data", (req, res) => {
    AppliedJobs.addData(req, res);
});

router.get("/get-job-details/:id", (req, res) => {
    AppliedJobs.getJobDetails(req, res);
});
router.get("/get-job-by-userId/:id", (req, res) => {
    AppliedJobs.getAppliedJobByUserId(req, res);
});
router.get("/get-job-by-month/:id", (req, res) => {
    AppliedJobs.getAppliedJobByMonth(req, res);
});
router.put('/update-job-status/:id', (req, res) => {
    AppliedJobs.updateJobStatus(req, res);
});
module.exports = router;
