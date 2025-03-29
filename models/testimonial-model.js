const mongoose = require('mongoose');
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const TestimonialSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: true
    },
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

const Testimonial = module.exports = mongoose.model('Testimonial', TestimonialSchema);

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

module.exports.createTestimonial = (req, res) => {

    upload(req, res, (error) => {
        if (error) {
            console.log(error);
            res.status(500).json({
                status: "Error",
                message: "Error occurred while creating product.",
            });
            return;
        }

        const testimonial = new Testimonial({
            fullName: req.body.fullName,
            title: req.body.title,
            description: req.body.description,
            designation: req.body.designation,
            file: req.file,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        testimonial.save((error, testimonial) => {
            if (error) {
                res.status(500).json({ success: false, message: 'Error occurred while creating Testimonial.' });
                return;
            }

            if (!error) {
                res.status(200).json({ success: true, result: 1, message: 'Testimonial added successfully.' });
            }
        });

    });
}

module.exports.updateTestimonial = (req, res) => {
    upload(req, res, (error) => {
        if (error) {
            console.log(error);
            res.status(500).json({
                status: "Error",
                message: "Error occurred while creating product.",
            });
            return;
        }

        Testimonial.findOneAndUpdate({ _id: req.params.id }, { ...req.body, file: req.file, updatedAt: new Date() }, {}, error => {
            if (error) {
                res.status(500).json({ success: false, message: 'Error occurred while updating details of testimonial.' });
                return;
            }

            if (!error) {
                res.status(200).json({ success: true, result: 1, message: 'Testimonial details updated successfully.' });
            }
        });


    })
}

module.exports.getTestimonials = async (req, res) => {
    const page = +req.query.page || 0
    const itemsPerPage = +req.query.rows || 10
    const totalReq = await Testimonial.count()
    Testimonial.find({}, async (error, response) => {
        if (error) {
            console.log(error);
            res.status(500).json({ status: 'Error', message: 'Error occurred while getting Testimonials.' });
            return
        }

        if (response && response.length > 0) {
            const testimonials = [];

            if (response && response.length > 0) {
                for (const testimonial of response) {
                    const data = {
                        _id: testimonial._id,
                        fullName: testimonial.fullName,
                        title: testimonial.title,
                        description: testimonial.description,
                        designation: testimonial.designation,
                        file: testimonial.file,
                        createdAt: testimonial.createdAt,
                        updatedAt: testimonial.updatedAt
                    };

                    testimonials.push(data);
                }
            }

            res.status(200).json({ status: 'Success', result: 1, totalReq: totalReq, testimonials: testimonials });
            return;
        }

        res.status(200).json({ status: 'Success', result: 1, totalReq: totalReq, testimonials: [] });
    }).skip(page).limit(itemsPerPage)
}

module.exports.getTestimonialByID = (req, res) => {
    Testimonial.findById(req.params.id, (error, response) => {
        if (error) {
            res.status(500).json({
                success: false,
                message: "Error occurred while getting Testimonial.",
            });
            return;
        }

        if (response) {
            const testimonial = {
                _id: response._id,
                fullName: response.fullName,
                title: response.title,
                description: response.description,
                designation: response.designation,
                file: response.file,
                createdAt: response.createdAt,
                updatedAt: response.updatedAt
            };
            res.status(200).json({ success: true, result: 1, testimonial: testimonial });
            return;
        }

        if (!response) {
            res.status(200).json({ success: true, result: 1, testimonial: {} });
        }
    });
};

module.exports.deleteTestimonial = (req, res) => {
    Testimonial.findByIdAndRemove(req.params.id, (error, response) => {
        if (!error) {
            res.send({ result: 1, message: 'Testimonial deleted successfully.' });
        } else {
            console.log("Error in deleting Testimonial");
        }
    });
};