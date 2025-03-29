const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const config = require("./config/config");
const app = express();
const server = require("http").Server(app);
const bcryptjs = require("bcryptjs");
const USERS = require('./models/user-model');
const SETTINGS = require('./models/settings-model');
const EMAILS = require('./models/email-model');
const ABOUT = require('./models/aboutPekerdja-model');
const jwt = require('jsonwebtoken');

const authController = require("./controllers/auth-controller");
const jobController = require("./controllers/job-controller");
const skillAssessmentController = require("./controllers/skill-controller");
const employeeController = require("./controllers/employee-controller");
const userController = require("./controllers/user-controller");
const coachController = require("./controllers/coach-controller");
const appliedJobsController = require("./controllers/applied_jobs-controller");
const bookingController = require("./controllers/booking-controller");
const emailController = require("./controllers/email-controller");
const settingController = require("./controllers/settings-controller");
const jobCategoryController = require("./controllers/jobCategory-controller");
const coachCategoryController = require("./controllers/coachCategory-controller");
const coachTypeController = require("./controllers/coachType-controller");
const faqController = require("./controllers/faqs-controller");
const testimonialController = require("./controllers/testimonial-controller");
const aboutPekerdjaController = require("./controllers/aboutPekerdja-controller");


mongoose.connect(config.mongoURL).then(async () => {
  console.log(`Connected to DB: ${config.mongoURL}`);

  const user = await USERS.findOne({ role: 'IS_ADMIN' });

  if (!user) {
    const user = new USERS({
      firstName: 'Admin',
      lastName: 'User',
      profile: {},
      email: 'admin@pekerdja.co',
      password: 'PekerdjaX2023!',
      role: 'IS_ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: '1234',
    });

    const token = jwt.sign(user.toJSON(), config.ADMIN_TOKEN_SECRET, { expiresIn: 3600000 }, null);
    user.token = token;

    const salt = await bcryptjs.genSalt(10);

    if (salt) {
      const hash = await bcryptjs.hash(user.password, salt);

      if (hash) {
        user.password = hash;

        await user.save();
      }
    }
  }

  const setting = await SETTINGS.find();
  if (setting?.length === 0) {
    const setting = new SETTINGS(config.SETTINGS);
    await setting.save();
  }

  const emails = await EMAILS.find();
  if (emails?.length === 0) {
    const emails = config.EMAILS;

    for (const i of emails) {
      const email = new EMAILS(i);
      await email.save();
    }
  }

  const about = await ABOUT.find();
  if (about?.length === 0) {
    const about = config.ABOUT_PEKERDJA;

    for (const i of about) {
      const data = new ABOUT({
        title: i.title,
        content: i.content,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await data.save();
    }
  }

});

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use("/api/public", express.static("public"));

app.use(cors());
app.use(cors({
  origin: ['https://pekerdja.co', 'https://www.pekerdja.co']
  //origin: '*'
}));

app.options("*", cors());
app.use("/api/auth", authController);
app.use("/api/users", userController);
app.use("/api/jobs", jobController);
app.use("/api/skills", skillAssessmentController);
app.use("/api/employers", employeeController);
app.use("/api/coaches", coachController);
app.use("/api/appliedJobs", appliedJobsController);
app.use("/api/bookings", bookingController);
app.use("/api/emails", emailController);
app.use("/api/settings", settingController);
app.use("/api/jobCategories", jobCategoryController);
app.use("/api/faqs", faqController);
app.use("/api/testimonials", testimonialController);
app.use("/api/coachCategories", coachCategoryController);
app.use("/api/coachTypes", coachTypeController);
app.use("/api/aboutPekerdja", aboutPekerdjaController);

server.listen(config.PORT, () => {
  console.log(`Server Running On Port: ${config.PORT}`);
});

