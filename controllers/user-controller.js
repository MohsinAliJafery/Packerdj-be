const express = require('express');
const User = require('../models/user-model');

const router = express.Router();

router.post('/create-user', (req, res) => {
  User.createUser(req, res);
});

router.put('/update-user/:id', (req, res) => {
  User.updateUser(req, res);
});
router.put('/update-user-resume/:id', (req, res) => {
  User.updateResume(req, res);
});

router.get('/get-user-by-id/:id', (req, res) => {
  User.getUserProfileByID(req, res);
});

router.get('/get-user-resume/:id', (req, res) => {
  User.getUserResume(req, res);
});

router.get('/get-user-details/:id', (req, res) => {
  User.getUserDetail(req, res);
});
router.post('/get-user-by-email', (req, res) => {
  User.getUserByEmail(req, res);
});
router.post('/get-user-by-role', (req, res) => {
  User.getAdminUser(req, res);
});

router.get('/get-users', (req, res) => {
  User.getUsers(req, res);
});
router.get('/get-allusers-data', (req, res) => {
  User.getUsersData(req, res);
});

router.post('/google-signin', (req, res) => {
  User.externalSignin(req, res);
});

router.put('/update-emailConfirmation/:id', (req, res) => {
  User.updateEmailConfirmation(req, res);
});

// router.post('/get-resume-file', (req, res) => {
//   User.getResumeFile(req, res);
// });

module.exports = router;
