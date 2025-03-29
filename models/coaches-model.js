const mongoose = require('mongoose');
const multer = require("multer");
const path = require("path");


const CoachesSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    coachCategory: {
        type: String,
        required: true
    },
    coachCategoryId: {
        type: String,
        required: true
    },
    coachType: {
        type: String,
        required: true
    },
    coachTypeId: {
        type: String,
        required: true
    },

    expertise: [],
    fluentIn: [],
    experiences: [],
    education: [],
    coaching: [],
    slot: [],
    file: {
        type: Object
    },
    createdAt: {
        type: Date,
        required: true
    },
    updatedAt: {
        type: Date,
        required: true
    }
})

const Coach = module.exports = mongoose.model('Coach', CoachesSchema);

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

module.exports.createCoach = (req, res) => {

    upload(req, res, (error) => {
        if (error) {
            console.log(error);
            res.status(500).json({
                status: "Error",
                message: "Error occurred while creating product.",
            });
            return;
        }

        const experiences = JSON.parse(req.body.experiences);
        const education = JSON.parse(req.body.education);
        const coaching = JSON.parse(req.body.coaching);
        const fluentIn = JSON.parse(req.body.fluentIn);
        const expertise = JSON.parse(req.body.expertise);
        const slot = JSON.parse(req.body.slot);
        const coach = new Coach({
            fullName: req.body.fullName,
            email: req.body.email,
            description: req.body.description,
            designation: req.body.designation,
            link: req.body.link,
            company: req.body.company,
            coachCategory: req.body.coachCategory,
            coachCategoryId: req.body.coachCategoryId,
            coachType: req.body.coachType,
            coachTypeId: req.body.coachTypeId,
            expertise: expertise,
            fluentIn: fluentIn,
            file: req.file,
            experiences: experiences,
            education: education,
            coaching: coaching,
            slot: slot,
            createdAt: new Date(),
            updatedAt: new Date()
        });



        coach.save((error, coach) => {
            if (error) {
                res.status(500).json({ success: false, message: 'Error occurred while creating Coach.' });
                return;
            }

            if (!error) {
                res.status(200).json({ success: true, result: 1, message: 'Coach added successfully.' });
            }
        });

    });
}

module.exports.updateCoach = (req, res) => {
    upload(req, res, (error) => {
        if (error) {
            console.log(error);
            res.status(500).json({
                status: "Error",
                message: "Error occurred while creating product.",
            });
            return;
        }

        const experiences = JSON.parse(req.body.experiences);
        const education = JSON.parse(req.body.education);
        const coaching = JSON.parse(req.body.coaching);
        const fluentIn = JSON.parse(req.body.fluentIn);
        const expertise = JSON.parse(req.body.expertise);
        const slot = JSON.parse(req.body.slot);
        Coach.findOneAndUpdate({ _id: req.params.id },
            {
                $set: {
                    fullName: req.body.fullName,
                    email: req.body.email,
                    description: req.body.description,
                    designation: req.body.designation,
                    link: req.body.link,
                    company: req.body.company,
                    coachCategory: req.body.coachCategory,
                    coachCategoryId: req.body.coachCategoryId,
                    coachType: req.body.coachType,
                    coachTypeId: req.body.coachTypeId,
                    expertise: expertise,
                    fluentIn: fluentIn,
                    file: req.file,
                    experiences: experiences,
                    education: education,
                    coaching: coaching,
                    slot: slot,
                    updatedAt: new Date()
                }
            }, {}, error => {
                if (error) {
                    res.status(500).json({ success: false, message: 'Error occurred while updating details of coach.' });
                    return;
                }

                if (!error) {
                    res.status(200).json({ success: true, result: 1, message: 'Coach details updated successfully.' });
                }
            });


    })
}

module.exports.getCoaches = async (req, res) => {
    const page = +req.query.page
    const itemsPerPage = +req.query.rows

    let query = {}

    if (req.query.budget) {
        if (req.query.budget == '2.000.000') {
            const minBudget = +req.query.budget.replace('.', '');
            query = {
                coaching: {
                    $elemMatch: {
                        charges: { $gte: minBudget }
                    }
                }
            };
        }
        else {

            const budgetRange = req.query.budget.split('-');
            const minBudget = parseInt(budgetRange[0].replace('.', ''));
            const maxBudget = parseInt(budgetRange[1].replace('.', ''));

            query = {
                coaching: {
                    $elemMatch: {
                        charges: { $gte: minBudget, $lte: maxBudget }
                    }
                }
            };
        }
    }
    if (req.query.coachType) {
        query.coachType = req.query.coachType;

    }
    if (req.query.coachCategory) {
        query.coachCategory = req.query.coachCategory

    }
    if (req.query.title) {
        query.fullName = { $regex: req.query.title, $options: 'i' }

    }
    let totalReq = await Coach.find(query).count();

    Coach.find(query, async (error, response) => {
        if (error) {
            console.log(error);
            res.status(500).json({ status: 'Error', message: 'Error occurred while getting Coaches.' });
            return
        }

        if (response && response.length > 0) {
            const coaches = [];

            if (response && response.length > 0) {
                for (const coach of response) {
                    const data = {
                        _id: coach._id,
                        fullName: coach.fullName,
                        email: coach.email,
                        file: coach.file,
                        description: coach.description,
                        designation: coach.designation,
                        link: coach.link,
                        startsFrom: null,
                        company: coach.company,
                        coachCategory: coach.coachCategory,
                        coachCategoryId: coach.coachCategoryId,
                        coachType: coach.coachType,
                        coachTypeId: coach.coachTypeId,
                        expertise: coach.expertise,
                        fluentIn: coach.fluentIn,
                        experiences: coach.experiences,
                        education: coach.education,
                        coaching: coach.coaching,
                        slot: coach.slot,
                        createdAt: coach.createdAt,
                        updatedAt: coach.updatedAt
                    };
                    const lowestCharges = data?.coaching.reduce((minCharges, currentService) => {
                        return currentService.charges < minCharges.charges ? currentService : minCharges;
                    }, data.coaching[0]);
                    data.startsFrom = lowestCharges?.charges ? lowestCharges?.charges : 0

                    coaches.push(data);
                }
            }

            res.status(200).json({ status: 'Success', result: 1, totalReq: totalReq, coaches: coaches });
            return;
        }

        res.status(200).json({ status: 'Success', result: 1, totalReq: totalReq, coaches: [] });
    }).skip(page).limit(itemsPerPage);
}


module.exports.getCoachByID = (req, res) => {
    Coach.findById(req.params.id, (error, response) => {
        if (error) {
            res.status(500).json({
                success: false,
                message: "Error occurred while getting Coach.",
            });
            return;
        }

        if (response) {
            const coach = {
                _id: response._id,
                fullName: response.fullName,
                email: response.email,
                description: response.description,
                designation: response.designation,
                link: response.link,
                company: response.company,
                coachCategory: response.coachCategory,
                coachCategoryId: response.coachCategoryId,
                coachType: response.coachType,
                coachTypeId: response.coachTypeId,
                experiences: response.experiences,
                education: response.education,
                coaching: response.coaching,
                slot: response.slot,
                expertise: response.expertise,
                fluentIn: response.fluentIn,
                file: response.file,
                createdAt: response.createdAt,
                updatedAt: response.updatedAt
            };
            res.status(200).json({ success: true, coach: coach });
            return;
        }

        if (!response) {
            res.status(200).json({ success: true, coach: {} });
        }
    });
};


module.exports.deleteCoach = (req, res) => {
    Coach.findByIdAndRemove(req.params.id, (error, response) => {
        if (!error) {
            res.send({ result: 1, message: 'Coach deleted successfully.' });
        } else {
            console.log("Error in deleting Coach");
        }
    });
};