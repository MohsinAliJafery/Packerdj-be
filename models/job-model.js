const mongoose = require("mongoose");
const Employer = require('./employee-model');
const fs = require("fs");
const json2csv = require('json2csv').parse;


const JobSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },
  companyId: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },

  salaryFrom: {
    type: String,
    required: true,
  },
  salaryTo: {
    type: String,
    required: true,
  },

  jobType: {
    type: String,
    required: true,
  },
  jobCategory: {
    type: String,
    required: true,
  },
  jobCategoryId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    required: true,
  },
  updatedAt: {
    type: Date,
    required: true,
  },
});

const Job = (module.exports = mongoose.model("Job", JobSchema));


module.exports.createJob = async (req, res) => {

  const item = new Job({
    title: req.body.title,
    description: req.body.description,
    companyId: req.body.companyId,
    companyName: req.body.companyName,
    companyProfile: null,
    salaryFrom: req.body.salaryFrom,
    salaryTo: req.body.salaryTo,
    jobType: req.body.jobType,
    jobCategory: req.body.jobCategory,
    jobCategoryId: req.body.jobCategoryId,
    status: req.body.status,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  item.save((item2) => {
    res.send({ result: 1, message: "Job created successfully.", });
  });
};

module.exports.getJobByID = (req, res) => {
  Job.findById(req.params.id, {}, async (error, response) => {
    if (error) {
      res.status(500).json({
        success: false,
        message: "Error occurred while getting Job.",
      });
      return;
    }

    if (response) {
      const empList = response.companyId ? await Employer.findOne({ _id: response.companyId }) : null;

      const job = {
        _id: response._id,
        title: response.title,
        description: response.description,
        companyId: response.companyId,
        companyName: response.companyName,
        salaryFrom: response.salaryFrom,
        salaryTo: response.salaryTo,
        empImage: null,
        empDescription: null,
        jobType: response.jobType,
        jobCategory: response.jobCategory,
        jobCategoryId: response.jobCategoryId,
        status: response.status,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      };

      if (empList && empList.file) {
        job.empImage = empList.file
      }
      if (empList && empList.description) {
        job.empDescription = empList.description
      }

      res.status(200).json({ success: true, result: 1, job: job });
      return;
    }

    if (!response) {
      res.status(200).json({ success: true, result: 1, job: {} });
    }
  });
};

module.exports.getJobByEmpID = async (req, res) => {

  const page = +req.query.page
  const itemsPerPage = +req.query.rows
  let totalReq = await Job.find({ companyId: req.params.id }).count()

  Job.find({ companyId: req.params.id }, {}, async (error, response) => {
    if (error) {
      res.status(500).json({
        success: false,
        message: "Error occurred while getting Job.",
      });
      return;
    }

    if (response?.length) {
      const jobs = [];

      for (const i of response) {
        const job = {
          _id: i._id,
          title: i.title,
          description: i.description,
          companyId: i.companyId,
          companyName: i.companyName,
          salaryFrom: i.salaryFrom,
          salaryTo: i.salaryTo,
          jobType: i.jobType,
          jobCategory: i.jobCategory,
          jobCategoryId: i.jobCategoryId,
          status: i.status,
          createdAt: i.createdAt,
          updatedAt: i.updatedAt,
        };
        jobs.push(job);

      }


      res.status(200).json({ success: true, result: 1, totalReq: totalReq, jobs: jobs });
      return;
    }

    if (!response) {
      res.status(200).json({ success: true, result: 1, totalReq: totalReq, jobs: {} });
    }
  }).skip(page).limit(itemsPerPage);
};

module.exports.updateJob = (req, res) => {

  Job.findOneAndUpdate(
    { _id: req.params.id },
    { ...req.body, updatedAt: new Date() },
    {},
    async (error) => {
      if (error) {
        res.status(500).json({
          success: false,
          message: "Error occurred while updating details of Job.",
        });
        return;
      }
      if (!error) {

        res.status(200).json({
          result: 1,
          message: "Job details updated successfully.",
        });
      }
    }
  )



};

module.exports.getJobs = async (req, res) => {

  const page = +req.query.page
  const itemsPerPage = +req.query.rows
  let searched = false;

  let options = {}
  let query = {}
  if (req.query.jobType) {
    query.jobType = req.query.jobType;
    searched = true;
  }
  if (req.query.jobCategory) {
    query.jobCategory = req.query.jobCategory
    searched = true;
  }

  if (req.query.date) {
    const startDate = new Date(req.query.date);
    const endDate = new Date(req.query.date);
    endDate.setHours(23, 59, 59, 999);

    query.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };

    searched = true;
  }
  if (req.query.title) {
    query.title = { $regex: req.query.title, $options: 'i' }
    searched = true;
  }
  if (req.query.newest) {
    options = {
      sort: { createdAt: -1 }
    };
  }
  if (req.query.status) {
    query.status = req.query.status;
  }
  let totalReq = await Job.find(query).count();

  Job.find(query, async (error, response) => {
    if (error) {
      console.log(error);
      res.status(500).json({
        status: "Error",
        message: "Error occurred while getting jobs.",
      });
      return;
    }

    if (response && response.length > 0) {
      const jobs = [];

      if (response && response.length > 0) {
        for (const job of response) {
          const empList = job.companyId ? await Employer.findOne({ _id: job.companyId }) : null;

          const data = {
            _id: job._id,
            title: job.title,
            description: job.description,
            companyId: job.companyId,
            companyName: job.companyName,
            salaryFrom: job.salaryFrom,
            salaryTo: job.salaryTo,
            empImage: null,
            empDescription: null,
            jobType: job.jobType,
            jobCategory: job.jobCategory,
            jobCategoryId: job.jobCategoryId,
            status: job.status,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
          };
          if (empList && empList.file) {
            data.empImage = empList.file
          }
          if (empList && empList.description) {
            data.empDescription = empList.description
          }
          jobs.push(data);
        }
      }
      res.status(200).json({ result: 1, totalReq: totalReq, jobs: jobs });
      return;
    }

    res.status(200).json({ result: 1, totalReq: totalReq, jobs: [] });

  }).sort(options.sort).skip(page).limit(itemsPerPage);
};

module.exports.deleteJob = (req, res) => {
  Job.findByIdAndRemove(req.params.id, (error, response) => {
    if (!error) {
      res.send({ result: 1, message: 'Job deleted successfully.' });
    } else {
      console.log("Error in deleting job");
    }
  });
};

module.exports.getJobsData = async (req, res) => {

  Job.find({}, async (error, response) => {
    if (error) {
      res.status(500).json({ status: 'Error', message: 'Error occurred while getting jobs.' });
      return
    }

    if (response && response.length > 0) {
      const jobs = [];
      if (response && response.length > 0) {
        for (const job of response) {
          const jobId = job._id;
          const appliedJobs = await AppliedJobs.find({ job_id: jobId });
          const UserIds = appliedJobs.map((appliedJob) => appliedJob.user_id);
          const AppliedUsers = await Users.find({ _id: { $in: UserIds } });
          const appliedUsersEmail = AppliedUsers.map(job => job.email);
          const appliedUserName = AppliedUsers.map(job => job.firstName + ' ' + job.lastName);

          const data = {
            title: job.title,
            companyName: job.companyName,
            salaryFrom: job.salaryFrom,
            salaryTo: job.salaryTo,
            jobType: job.jobType,
            jobCategory: job.jobCategory,
            status: job.status,
            appliedUsersEmail: appliedUsersEmail.join(', '),
            appliedUsersName: appliedUserName.join(', '),

          };
          jobs.push(data);
        }
      }

      const fields = ["title", "companyName", "jobType", "jobCategory", "salaryFrom", "salaryTo", "status", "appliedUsersName", "appliedUsersEmail"]
      const csv = json2csv(jobs, { fields });
      const filePath = 'public/files/JobsData.csv';
      fs.writeFileSync(filePath, csv);
      res.status(200).json({ status: 'Success', downloadLink: 'public/files/JobsData.csv', result: 1 });
      return;
    }

    res.status(200).json({ status: 'Success', jobs: [], result: 1 });

  });
}

const Users = require('./user-model');
const AppliedJobs = require('./applied_jobs-model');
