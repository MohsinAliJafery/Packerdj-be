const express = require("express");
const Job = require("../models/job-model");
// const authenticate = require('../middlewares/auth-middleware')

const router = express.Router();
// router.use(authenticate);

router.post("/create-job", (req, res) => {
  Job.createJob(req, res);
});

router.put("/update-job/:id", (req, res) => {
  Job.updateJob(req, res);
});

router.get("/get-jobs", (req, res) => {
  Job.getJobs(req, res);
});

router.get('/get-alljobs-data', (req, res) => {
  Job.getJobsData(req, res);
});

router.delete("/delete-job/:id", (req, res) => {
  Job.deleteJob(req, res);
});


router.get("/get-job-by-id/:id", (req, res) => {
  Job.getJobByID(req, res);
});
router.get("/get-job-by-emp_id/:id", (req, res) => {
  Job.getJobByEmpID(req, res);
});




module.exports = router;
