const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const User = require('./user-model');
const Email = require('./email-model');
const config = require('../config/config');


const AppliedJobSchema = mongoose.Schema({
    user_id: {
        type: String,
        required: true,
    },

    job_id: {
        type: String,
        required: true,
    },
    job_status: {
        type: String,
        required: true,
    },
    resume: {
        type: Object
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

const AppliedJob = (module.exports = mongoose.model("AppliedJob", AppliedJobSchema));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/files/");
    },
    filename: (req, file, cb) => {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

let upload = multer({
    storage: storage,
}).single("file");

module.exports.addData = (req, res) => {

    AppliedJob.findOne({ user_id: req.body.user_id, job_id: req.body.job_id, }, async (error, response) => {

        if (response) {
            res.status(200).json({ success: false, result: -1, message: 'You have already applied for this job' });
            return;
        }

        if (!response) {
            upload(req, res, async (error) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({
                        status: "Error",
                        message: "Error occurred while creating product.",
                    });
                    return;
                }

                let user = await User.findById(req.body.user_id)
                let job = await Job.findById(req.body.job_id)

                const item = new AppliedJob({
                    user_id: req.body.user_id,
                    job_id: req.body.job_id,
                    resume: req.body.file,
                    job_status: 'Pending',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                item.save((item2) => {
                    res.status(200).json({ success: true, result: 1, message: 'Job applied successfully.' });
                    sendJobAppliedEmail(user, job, req.body.file)
                });
            })
        }
    });
};

module.exports.getJobDetails = async (req, res) => {

    const page = +req.query.page || 0
    const itemsPerPage = +req.query.rows || 10
    const jobId = req.params.id;

    const pipeline = [
        {
            $match: {
                job_id: jobId,
            },
        },
        {
            $lookup: {
                from: 'users',
                let: { userId: { $toObjectId: '$user_id' } },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$_id', '$$userId'] },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            firstName: 1,
                            lastName: 1,
                            email: 1,
                            'profile.file': 1,
                        },
                    },
                ],
                as: 'userDetails',
            },
        },
        {
            $unwind: {
                path: '$userDetails',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $facet: {
                paginatedResults: [{ $skip: page }, { $limit: itemsPerPage }],
                totalCount: [{ $count: 'count' }],
            },
        },
    ];


    AppliedJob.aggregate((pipeline), (err, result) => {
        if (err) {
            res.status(500).json({
                success: false,
                message: "Error occurred while getting data.",
            });
            return;
        }

        const totalReq = result[0]?.totalCount[0]?.count || 0;
        const data = result[0]?.paginatedResults;
        res.status(200).json({ success: true, result: 1, totalReq: totalReq, data: data });
        return;
    })

}
module.exports.getAppliedJobByUserId = async (req, res) => {

    const page = +req.query.page
    const itemsPerPage = +req.query.rows
    const userId = req.params.id;

    const pipeline = [
        {
            $match: {
                user_id: userId,
            },
        },
        {
            $project: {
                _id: 0,
                user_id: 1,
                job_id: 1,
                job_status: 1,
                createdAt: 1,

            },
        },
        {
            $lookup: {
                from: 'jobs',
                let: { jobId: { $toObjectId: '$job_id' } },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$_id', '$$jobId'] },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            companyName: 1,
                            companyId: 1,
                            createdAt: 1,
                            status: 1,
                            jobType: 1,

                        },
                    },

                    {
                        $lookup: {
                            from: 'employers',
                            let: { companyId: { $toObjectId: '$companyId' } },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: { $eq: ['$_id', '$$companyId'] },
                                    },
                                },
                                {
                                    $project: {
                                        _id: 0,
                                        file: 1,
                                    },
                                },
                            ],
                            as: 'companyDetails',
                        },
                    },

                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            companyName: 1,
                            status: 1,
                            createdAt: 1,
                            companyProfilePic: { $arrayElemAt: ['$companyDetails.file', 0] },
                        },
                    },

                ],
                as: 'userDetails',
            },
        },
        {
            $unwind: {
                path: '$userDetails',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
        {
            $facet: {
                paginatedResults: [{ $skip: page }, { $limit: itemsPerPage }],
                totalCount: [{ $count: 'count' }],
            },
        },
    ];


    AppliedJob.aggregate((pipeline), (err, result) => {
        if (err) {
            res.status(500).json({
                success: false,
                message: "Error occurred while getting data.",
            });
            return;
        }
        if (result) {
            const totalReq = result[0]?.totalCount[0]?.count || 0;
            const data = result[0]?.paginatedResults;
            res.status(200).json({ success: true, result: 1, totalReq: totalReq, data: data });
            return;
        }
    })

}

module.exports.updateJobStatus = (req, res) => {
    AppliedJob.findOneAndUpdate({ _id: req.params.id }, { job_status: req.body.status }, {}, (error) => {
        if (error) {
            res.status(500).json({ success: false, message: 'Error occurred while updating status of Job.' });
            return;
        }

        if (!error) {
            res.status(200).json({ success: true, result: 1, message: 'Job status updated successfully.' });
        }
    });
}


async function sendJobAppliedEmail(user, job, file) {
    let emailContent = await Email.findOne({ title: 'Job_Applied' })
    const placeholders = {
        '{First_Name}': user.firstName,
        '{JOB_TITLE}': job.title,
        '{COMPANY_NAME}': job.companyName,
        '{RESUME_TITLE}': file.originalname
    };

    const regex = new RegExp(Object.keys(placeholders).join('|'), 'g');
    const updatedContent = emailContent.content.replace(regex, match => placeholders[match]);

    const transporter = config.transporter;

    const mailOptions = {
        from: config.emailFrom,
        to: user.email,
        subject: 'Applied Job',
        html: `<p>${updatedContent}</p>`
    };
    transporter.sendMail(mailOptions).then();

}

module.exports.getAppliedJobByMonth = async (req, res) => {
    const userId = req.params.id;
    const currentYear = new Date().getFullYear();
    const monthsOfYear = Array.from({ length: 12 }, (_, i) => i + 1);
    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    AppliedJob.aggregate([
        {
            $match: {
                user_id: userId
            }
        },
        {
            $lookup: {
                from: 'jobs',
                let: { jobId: { $toObjectId: '$job_id' } },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$_id', '$$jobId'] }
                        }
                    }
                ],
                as: 'jobDetails'
            }
        },
        {
            $unwind: '$jobDetails'
        },
        {
            $project: {
                job_id: 1,
                createdAt: 1,
                jobType: '$jobDetails.jobType',
                month: { $month: '$createdAt' },
                year: { $year: '$createdAt' }
            }
        },
        {
            $match: {
                year: currentYear
            }
        },
        {
            $group: {
                _id: {
                    jobType: '$jobType',
                    month: '$month'
                },
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: '$_id.jobType',
                months: {
                    $push: {
                        month: '$_id.month',
                        count: '$count'
                    }
                }
            }
        }
    ]).exec((err, result) => {
        if (err) {
            console.error("Error occurred while getting data.", err);
            return;
        }

        const modifiedResult = result.map(item => {
            const countsMap = new Map(item.months.map(month => [month.month, month.count]));
            const monthsWithCounts = monthsOfYear.map(month => ({
                month: monthNames[month - 1],
                count: countsMap.get(month) || 0
            }));

            return { job_type: item._id, months: monthsWithCounts };
        });

        const jobTypes = ['Full Time', 'Part Time', 'Internship'];
        const resultByJobType = [];

        jobTypes.forEach(jobType => {
            const jobTypeData = modifiedResult.find(item => item.job_type === jobType);
            const countsArray = jobTypeData ? jobTypeData.months : [];
            const filledCountsArray = monthsOfYear.map(month => {
                const monthData = countsArray.find(item => item.month === monthNames[month - 1]);
                return { month: monthNames[month - 1], count: monthData ? monthData.count : 0 };
            });

            resultByJobType.push({ job_type: jobType, months: filledCountsArray });
        });
        res.status(200).json({ success: true, result: 1, data: resultByJobType });
        return
    });

}

const Job = require('./job-model');
