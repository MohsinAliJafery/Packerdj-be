const mongoose = require('mongoose');
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const json2csv = require('json2csv').parse;

const EmployerSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },

    address: {
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

const Employee = module.exports = mongoose.model('Employer', EmployerSchema);

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

module.exports.createEmployer = (req, res) => {

    upload(req, res, (error) => {
        if (error) {
            console.log(error);
            res.status(500).json({
                status: "Error",
                message: "Error occurred while creating product.",
            });
            return;
        }

        const employee = new Employee({
            fullName: req.body.fullName,
            address: req.body.address,
            description: req.body.description,
            file: req.file,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        employee.save((error, employee) => {
            if (error) {
                res.status(500).json({ success: false, message: 'Error occurred while creating Employee.' });
                return;
            }

            if (!error) {
                res.status(200).json({ success: true, result: 1, message: 'Employee added successfully.' });
            }
        });

    });
}

module.exports.updateEmployer = (req, res) => {
    upload(req, res, (error) => {
        if (error) {
            console.log(error);
            res.status(500).json({
                status: "Error",
                message: "Error occurred while creating product.",
            });
            return;
        }

        Employee.findOneAndUpdate({ _id: req.params.id }, { ...req.body, file: req.file, updatedAt: new Date() }, {}, error => {
            if (error) {
                res.status(500).json({ success: false, message: 'Error occurred while updating details of employee.' });
                return;
            }

            if (!error) {
                res.status(200).json({ success: true, result: 1, message: 'Employee details updated successfully.' });
            }
        });


    })
}

module.exports.getEmployers = async (req, res) => {
    const page = +req.query.page
    const itemsPerPage = +req.query.rows
    let query = {}
    if (req.query.title) {
        query.fullName = { $regex: req.query.title, $options: 'i' }
    }

    const totalReq = await Employee.find(query).count()
    Employee.find(query, async (error, response) => {
        if (error) {
            console.log(error);
            res.status(500).json({ status: 'Error', message: 'Error occurred while getting Employees.' });
            return
        }

        if (response && response.length > 0) {
            const employers = [];

            if (response && response.length > 0) {
                for (const employee of response) {
                    const data = {
                        _id: employee._id,
                        fullName: employee.fullName,
                        address: employee.address,
                        description: employee.description,
                        file: employee.file,
                        createdAt: employee.createdAt,
                        updatedAt: employee.updatedAt
                    };

                    employers.push(data);
                }
            }

            res.status(200).json({ status: 'Success', result: 1, totalReq: totalReq, employers: employers });
            return;
        }

        res.status(200).json({ status: 'Success', result: 1, totalReq: totalReq, employers: [] });
    }).skip(page).limit(itemsPerPage)
}

module.exports.getEmployerByID = (req, res) => {
    Employee.findById(req.params.id, (error, response) => {
        if (error) {
            res.status(500).json({
                success: false,
                message: "Error occurred while getting Employee.",
            });
            return;
        }

        if (response) {
            const employee = {
                _id: response._id,
                fullName: response.fullName,
                address: response.address,
                description: response.description,
                file: response.file,
                createdAt: response.createdAt,
                updatedAt: response.updatedAt
            };
            res.status(200).json({ success: true, employee: employee });
            return;
        }

        if (!response) {
            res.status(200).json({ success: true, employee: {} });
        }
    });
};

module.exports.deleteEmployer = (req, res) => {
    Employee.findByIdAndRemove(req.params.id, (error, response) => {
        if (!error) {
            res.send({ result: 1, message: 'Employee deleted successfully.' });
        } else {
            console.log("Error in deleting Employee");
        }
    });
};

module.exports.getAllEmployersData = async (req, res) => {

    Employee.find({}, async (error, response) => {
        if (error) {
            console.log(error);
            res.status(500).json({ status: 'Error', message: 'Error occurred while getting Employees.' });
            return
        }

        if (response && response.length > 0) {
            const employers = [];

            if (response && response.length > 0) {
                for (const employee of response) {
                    const data = {
                        fullName: employee.fullName,
                        address: employee.address,
                    };
                    employers.push(data);
                }
            }

            const fields = ["fullName", "address"]
            const csv = json2csv(employers, { fields });
            const filePath = 'public/files/CompaniesData.csv';
            fs.writeFileSync(filePath, csv);
            res.status(200).json({ status: 'Success', downloadLink: 'public/files/CompaniesData.csv', result: 1 });
            return;
        }

        res.status(200).json({ status: 'Success', result: 1, employers: [] });
    })
}