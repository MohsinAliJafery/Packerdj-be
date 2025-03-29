const mongoose = require('mongoose');
const config = require('../config/config');
const Coach = require('./coaches-model');
const Email = require('./email-model');
const Setting = require('./settings-model');
const axios = require('axios');
const querystring = require('querystring');
const { google } = require('googleapis');
require('dotenv').config({ path: 'config/.env' });

const bookingSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    note: {
        type: String,
        required: true
    },
    coach_id: {
        type: String,
        required: true
    },
    slotDate: {
        type: String,
        required: true
    },
    slotTime: {
        type: String,
        required: true
    },
    booking_status: {
        type: String,
        required: true
    },
    service: {
        type: Object,
    },
    meeting_data: {
        type: Object,
    },
    transaction: {
        type: Object,
    },

    createdAt: {
        type: Date,
        required: true
    },
    updatedAt: {
        type: Date,
        required: true
    },


});

const Booking = module.exports = mongoose.model('Booking', bookingSchema);

module.exports.addBooking = async (req, res) => {

    Booking.find({ email: req.body.email, slotDate: req.body.slotDate, slotTime: req.body.slotTime }, async (error, response) => {
        if (error) {
            res.status(500).json({
                success: false,
                message: "Error occurred while getting bookings.",
            });
            return;
        }

        if (response?.length) {
            res.status(409).json({ success: false, message: 'Booking already exists against provided email.' });
            return;
        }
        if (!response?.length) {
            let coach = await Coach.findById(req.body.coach_id)

            const item = new Booking({
                name: req.body.name,
                phone: req.body.phone,
                email: req.body.email,
                note: req.body.note,
                booking_status: req.body.booking_status,
                coach_id: req.body.coach_id,
                slotDate: req.body.slotDate,
                slotTime: req.body.slotTime,
                service: req.body.service,
                transaction: req.body.transaction,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            if (req.body.booking_status == 'COMPLETED') {
                await UpdateCoachSlotStatus(item)
            }

            item.save(async (error, user) => {
                if (req.body.booking_status == 'PENDING') {
                    await sendConfirmBookingEmail(user, coach);
                }
                res.status(200).json({ success: true, result: 1, message: 'Booking added successfully.' });
            });
        }
    }).limit(1);
};

module.exports.getSessionsByUserId = (req, res) => {
    Booking.find({ user_id: req.params.id }, {}, (error, response) => {
        if (error) {
            res.status(500).json({
                success: false,
                message: "Error occurred while getting sessions.",
            });
            return;
        }

        if (response && response.length > 0) {
            const sessions = [];
            const currentDate = new Date();

            for (const session of response) {
                const sessionDateTime = new Date(`${session.slotDate} ${session.slotTime}`);
                if (sessionDateTime > currentDate) {
                    const data = {
                        slotDate: session.slotDate,
                        slotTime: session.slotTime
                    };
                    sessions.push(data)
                }
            }
            res.status(200).json({ success: true, result: 1, sessions: sessions });
            return;
        }

        if (!response) {
            res.status(200).json({ success: true, result: 1, sessions: {} });
        }
    });
};

module.exports.getSessionsByCoachId = async (req, res) => {

    const page = +req.query.page
    const itemsPerPage = +req.query.rows
    const currentDate = new Date();
    let totalReq = await Booking.find({
        coach_id: req.params.id, $expr: {
            $gt: [
                {
                    $dateFromString: {
                        dateString: { $concat: ["$slotDate", " ", "$slotTime"] }
                    }
                },
                currentDate
            ]
        }
    }).count()

    Booking.find({ coach_id: req.params.id }, {}, (error, response) => {
        if (error) {
            res.status(500).json({
                success: false,
                message: "Error occurred while getting sessions.",
            });
            return;
        }

        if (response && response.length > 0) {
            const sessions = [];
            const currentDate = new Date();

            for (const session of response) {
                const sessionDateTime = new Date(`${session.slotDate} ${session.slotTime}`);
                if (sessionDateTime > currentDate) {
                    const data = {
                        _id: session._id,
                        coach_id: session.coach_id,
                        name: session.name,
                        email: session.email,
                        phone: session.phone,
                        booking_status: session.booking_status,
                        slotDate: session.slotDate,
                        slotTime: session.slotTime,
                        meeting_data: session.meeting_data
                    };
                    sessions.push(data)
                }
            }
            res.status(200).json({ success: true, result: 1, totalReq: totalReq, sessions: sessions });
            return;
        }

        if (!response) {
            res.status(200).json({ success: true, result: 1, totalReq: totalReq, sessions: {} });
        }
    }).skip(page).limit(itemsPerPage);;
};

module.exports.getTransactions = async (req, res) => {
    const page = +req.query.page || 0
    const itemsPerPage = +req.query.rows || 10
    let query = { booking_status: 'COMPLETED' }

    if (req.query.title) {
        const fullNameRegex = new RegExp(req.query.title, 'i');
        query['$or'] = [
            {
                $expr: {
                    $regexMatch: {
                        input: {
                            $concat: [
                                '$transaction.payer.name.given_name',
                                ' ',
                                '$transaction.payer.name.surname'
                            ]
                        },
                        regex: fullNameRegex
                    }
                }
            }
        ];

    }
    if (req.query.email) {
        query['transaction.payer.email_address'] = { $regex: req.query.email, $options: 'i' }
    }

    let totalReq = await Booking.find(query).count()

    Booking.find(query, async (error, response) => {
        if (error) {
            res.status(500).json({
                success: false,
                message: "Error occurred while getting sessions.",
            });
            return;
        }

        if (response && response?.length > 0) {
            const transactions = [];
            for (const i of response) {
                const data = {
                    name: i.transaction.payer.name.given_name + " " + i.transaction.payer.name.surname,
                    email: i.transaction.payer.email_address,
                    price: i.transaction.purchase_units[0].amount.value,
                    currency: i.transaction.purchase_units[0].amount.currency_code,
                    createdAt: i.transaction.create_time
                };
                transactions.push(data)

            }

            res.status(200).json({ success: true, result: 1, totalReq: totalReq, transactions: transactions });
            return;
        }

        if (!response?.length) {
            res.status(200).json({ success: true, result: 1, totalReq: totalReq, transactions: [] });
        }
    }).skip(page).limit(itemsPerPage);;
};

module.exports.getMeetingLink = async (req, res) => {
    let meeting_link = req.body.link;
    let data = await Booking.findOne({ _id: req.body._id, coach_id: req.body.coach_id });
    let coach = await Coach.findById(data.coach_id)
    await sendBookingEmail(data, coach, meeting_link)
    await sendBookingEmailToCoach(data, coach, meeting_link)
    await UpdateCoachSlotStatus(data)
    res.status(200).json({ success: true, result: 1, message: 'Meeting Link sent sucessfully' });

};

async function sendBookingEmail(booking, coach, meetingLink = null) {
    let emailContent = await Email.findOne({ title: 'Payment_Completion' })
    const placeholders = {
        '{First_Name}': booking.name,
        '{Name_of_the_Coach}': coach.fullName,
        '{Name_of_the_Skill_chosen}': booking.service.title,
        '{Date}': booking.slotDate,
        '{Time}': booking.slotTime,
        '{Link_to_the_Pre-assessment_Test_Task}': coach.link,
        '{MEETING_LINK}': meetingLink ? meetingLink : 'MEETING_LINK'
    };

    const regex = new RegExp(Object.keys(placeholders).join('|'), 'g');
    const updatedContent = emailContent.content.replace(regex, match => placeholders[match]);

    const transporter = config.transporter;

    const mailOptions = {
        from: config.emailFrom,
        to: [booking.email, 'admin@pekerdja.co'],
        subject: 'Coach Booking',
        html: `<p>${updatedContent}</p>`
    };
    transporter.sendMail(mailOptions).then();

}
async function sendBookingEmailToCoach(booking, coach, meetingLink = null) {
    let emailContent = await Email.findOne({ title: 'Coach_Email' })
    const placeholders = {
        '{First_Name}': coach.fullName,
        '{Name_of_the_Coach}': coach.fullName,
        '{Name_of_the_Skill_chosen}': booking.service.title,
        '{Date}': booking.slotDate,
        '{Time}': booking.slotTime,
        '{MEETING_LINK}': meetingLink ? meetingLink : 'MEETING_LINK'
    };

    const regex = new RegExp(Object.keys(placeholders).join('|'), 'g');
    const updatedContent = emailContent.content.replace(regex, match => placeholders[match]);

    const transporter = config.transporter;

    const mailOptions = {
        from: config.emailFrom,
        to: coach.email,
        subject: 'Booking Session Details',
        html: `<p>${updatedContent}</p>`
    };
    transporter.sendMail(mailOptions).then();

}
async function sendConfirmBookingEmail(booking, coach) {

    let emailContent = await Email.findOne({ title: 'Coach_Booking_Manual_Transfer' })
    let setting = await Setting.findOne({})
    const placeholders = {
        '{First_Name}': booking.name,
        '{Coach_Name}': coach.fullName,
        '{Price_of_the_Coaching_Session}': booking.service.charges,
        '{Date}': booking.slotDate,
        '{Time}': booking.slotTime,
        '{Bank_Name}': setting.Bank_Name,
        '{Address}': setting.Address,
        '{Bank_Branch_Name}': setting.Bank_Branch_Name,
        '{Account_Number}': setting.Account_Number,
        '{Bank_Account_Holder}': setting.Bank_Account_Holder,
        '{Swift_Code}': setting.Swift_Code,
    };

    const regex = new RegExp(Object.keys(placeholders).join('|'), 'g');
    const updatedContent = emailContent.content.replace(regex, match => placeholders[match]);

    const transporter = config.transporter;

    const mailOptions = {
        from: config.emailFrom,
        to: booking.email,
        subject: 'Booking confirmation email',
        html: `<p>${updatedContent}</p>`
    };
    transporter.sendMail(mailOptions).then();




}

module.exports.redirect = async (req, res) => {
    try {
        const { code, state } = req.query;
        const decodedData = decodeURIComponent(state);
        const bookingDataObject = JSON.parse(decodedData);
        const tokenUrl = 'https://zoom.us/oauth/token';
        const tokenData = querystring.stringify({
            grant_type: 'authorization_code',
            code,
            redirect_uri: 'https://pekerdja.co/api/bookings/redirect',
        });
        const response = await axios.post(
            tokenUrl,
            tokenData,
            {
                auth: {
                    username: 'NMQJFTtCQby6ou2tHhMlKA',
                    password: 'Y7WNzfGFFxqJGqsGOmV02GcG1PfGZyYC',
                    // username: '7JoKpiKJSHS3X6kUANOjYA',
                    // password: '4DlPJSWUtd6QljNErcTcQjYeYGMaM5NF',
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const { access_token, refresh_token } = response.data;

        try {
            let BOOKING_DATA = await Booking.findOne({ _id: bookingDataObject._id, coach_id: bookingDataObject.coach_id });
            const topic = BOOKING_DATA.service.title
            const slotDateTime = new Date(`${BOOKING_DATA.slotDate} ${BOOKING_DATA.slotTime}`);
            const duration = BOOKING_DATA.service.duration
            const response = await axios.post(
                `https://api.zoom.us/v2/users/me/meetings`,
                {
                    topic,
                    type: 2,
                    start_time: slotDateTime.toISOString(),
                    duration,
                },
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                }
            );
            await Booking.findByIdAndUpdate(BOOKING_DATA._id, { meeting_data: response.data });
            let coach = await Coach.findById(BOOKING_DATA.coach_id)
            await UpdateCoachSlotStatus(BOOKING_DATA)
            sendBookingEmail(BOOKING_DATA, coach, response.data.join_url)
            sendBookingEmailToCoach(BOOKING_DATA, coach, response.data.start_url)
            res.status(200).json({ success: true, result: 1, data: response.data });

        } catch (error) {
            res.status(500).json({ error: 'Error generating meeting link', res: error });
        }

    }

    catch (error) {
        res.status(500).json({ error: 'Error generating access token', res: error });
    }
}

async function convertAMPMto24Hour(time) {
    const [timePart, ampm] = time.split(' ');
    const [hours, minutes] = timePart.split(':');

    let militaryHours = parseInt(hours, 10);

    if (ampm.toLowerCase() === 'pm' && militaryHours < 12) {
        militaryHours += 12;
    } else if (ampm.toLowerCase() === 'am' && militaryHours === 12) {
        militaryHours = 0;
    }

    const militaryTime = `${String(militaryHours).padStart(2, '0')}:${minutes}`;

    return militaryTime;
}

async function UpdateCoachSlotStatus(data) {
    const militaryTime = await convertAMPMto24Hour(data.slotTime);
    await Coach.updateOne(
        {
            _id: data.coach_id,
            "slot.date": data.slotDate,
            "slot.from": militaryTime,
        },
        {
            $set: {
                "slot.$.status": "Booked",
            },
        }
    );
}