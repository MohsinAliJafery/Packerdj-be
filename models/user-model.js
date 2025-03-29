const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const config = require('../config/config');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require('axios');
const Email = require('./email-model');
const json2csv = require('json2csv').parse;



const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },

  password: {
    type: String
  },
  role: {
    type: String
  },
  firstLogin: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    required: true
  },
  updatedAt: {
    type: Date,
    required: true
  },
  profile: {
    type: Schema.Types.Mixed,
    default: {},
  },

  token: {
    type: String
  },
  idToken: {
    type: String
  },
  userJobs: {
    type: []
  },

});

const User = module.exports = mongoose.model('User', userSchema);

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


module.exports.createUser = (req, res) => {

  User.findOne({ email: req.body.email }, async (error, user) => {
    if (error) {
      res.status(500).json({ success: false, message: 'Error occurred while creating account.' });
      return;
    }

    if (user) {
      res.status(409).json({ success: false, message: 'User already exists with provided email.' });
      return;
    }

    if (!user) {
      const user = new User({
        email: req.body.email,
        password: req.body.password,
        role: 'CUSTOMER',
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const token = jwt.sign(user.toJSON(), config.TOKEN_SECRET, { expiresIn: 3600000 }, null);
      user.token = token;

      const salt = await bcryptjs.genSalt(10);

      if (salt) {
        const hash = await bcryptjs.hash(user.password, salt);

        if (hash) {
          user.password = hash;
        }

        user.save((error, user) => {
          if (error) {
            res.status(500).json({ success: false, message: 'Error occurred while creating account.' });
            return;
          }

          if (!error) {
            res.status(200).json({ success: true, result: 1, message: 'Account created successfully.' });
          }
        });
      }
      sendRegisterEmail(user)
    }
  });
}

module.exports.updateUser = (req, res) => {


  upload(req, res, (error) => {
    if (error) {
      console.log(error);
      res.status(500).json({
        status: "Error",
        message: "Error occurred while creating product.",
      });
      return;
    }


    User.findOneAndUpdate({ _id: req.params.id }, {
      $set: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        'profile.gender': req.body.gender,
        'profile.bio': req.body.bio,
        'profile.file': req.file
      }
    }, {}, async error => {

      if (error) {
        res.status(500).json({ success: false, message: 'Error occurred while updating details of user.' });
        return;
      }

      if (!error) {
        const Upateduser = await User.findOne({ _id: req.params.id });

        const updatedProfile = {
          firstName: Upateduser.firstName,
          lastName: Upateduser.lastName,
          gender: Upateduser.profile.gender,
          bio: Upateduser.profile.bio,
          file: Upateduser.profile.file,
        };
        res.status(200).json({ success: true, result: 1, updatedProfile: updatedProfile, message: 'User details updated successfully.' });
      }
    });
  });

}
module.exports.updateResume = (req, res) => {

  upload(req, res, async (error) => {
    if (error) {
      console.log(error);
      res.status(500).json({
        status: "Error",
        message: "Error occurred while creating product.",
      });
      return;
    }
    const user = await User.findOne({ _id: req.params.id });
    User.findOneAndUpdate({ _id: req.params.id }, { $push: { 'profile.resumes': { data: req.file, uploadedAt: new Date() } } }, {}, error => {

      if (error) {
        res.status(500).json({ success: false, message: 'Error occurred while updating details of user.' });
        return;
      }

      if (!error) {
        res.status(200).json({ success: true, result: 1, message: 'User details updated successfully.' });
        sendResumeEmail(user, req.file)
      }
    });
  });

}

module.exports.getUserProfileByID = (req, res) => {
  User.findById(req.params.id, req.body, {}, (error, response) => {
    if (error) {
      res.status(500).json({ success: false, message: 'Error occurred while updating details of user.' });
      return;
    }

    if (response) {
      const user = {
        _id: response._id,
        firstName: response.firstName,
        lastName: response.lastName,
        gender: response.profile.gender,
        bio: response.profile.bio,
        file: response.profile.file

      }
      res.status(200).json({ success: true, result: 1, user: user });
      return;
    }

    if (!response) {
      res.status(200).json({ success: true, result: 1, user: {} });
    }
  });
}

module.exports.getUserResume = (req, res) => {
  User.findById(req.params.id, (error, response) => {
    if (error) {
      res.status(500).json({ success: false, message: 'Error occurred while updating details of user.' });
      return;
    }

    if (response) {
      if (response.profile && response.profile.resumes) {
        const resumes = response.profile.resumes;
        res.status(200).json({ success: true, result: 1, resumes: resumes });
        return;
      }
      else {
        res.status(200).json({ success: true, result: 1, user: {} });

      }
    }

    if (!response) {
      res.status(200).json({ success: true, result: 1, user: {} });
    }
  });
}

module.exports.getUsers = async (req, res) => {

  const page = +req.query.page
  const itemsPerPage = +req.query.rows

  let query = { role: { $ne: 'IS_ADMIN' } };
  let userCount = await User.find(query).count()

  if (req.query.title) {
    query.firstName = { $regex: req.query.title, $options: 'i' }
  }
  if (req.query.email) {
    query.email = { $regex: req.query.email, $options: 'i' }
  }
  let totalReq = await User.find(query).count()


  User.find(query, (error, response) => {
    if (error) {
      res.status(500).json({ status: 'Error', message: 'Error occurred while getting users.' });
      return
    }

    if (response && response.length > 0) {
      const users = [];

      if (response && response.length > 0) {
        for (const user of response) {

          const data = new User({

            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id,
            profile: user.profile,
            role: user.role,
            createdAt: new Date(),
            updatedAt: new Date()
          });

          users.push(data);
        }
      }

      res.status(200).json({ status: 'Success', users: users, userCount: userCount, totalReq: totalReq, result: 1 });
      return;
    }

    res.status(200).json({ status: 'Success', users: [], userCount: userCount, totalReq: totalReq, result: 1 });

  }).skip(page).limit(itemsPerPage);;
}

module.exports.getUsersData = async (req, res) => {

  let query = { role: { $ne: 'IS_ADMIN' } };

  User.find(query, async (error, response) => {
    if (error) {
      res.status(500).json({ status: 'Error', message: 'Error occurred while getting users.' });
      return
    }

    if (response && response.length > 0) {
      const users = [];

      if (response && response.length > 0) {
        for (const user of response) {
          // const userId = user._id;
          // const appliedJobs = await AppliedJobs.find({ user_id: userId });
          // const jobIds = appliedJobs.map((appliedJob) => appliedJob.job_id);
          // const userJobs = await Jobs.find({ _id: { $in: jobIds } });

          const data = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            bio: user.profile?.bio,
            gender: user.profile?.gender
          };
          users.push(data);
        }
      }

      const fields = ["firstName", "lastName", "email", "bio", "gender"]
      const csv = json2csv(users, { fields });
      const filePath = 'public/files/UsersData.csv';
      fs.writeFileSync(filePath, csv);
      res.status(200).json({ status: 'Success', downloadLink: 'public/files/UsersData.csv', result: 1 });
      return;

    }

    res.status(200).json({ status: 'Success', users: [], downloadLink: '/UsersData.csv', result: 1 });

  });
}

module.exports.getUserDetail = (req, res) => {
  User.findById(req.params.id, req.body, {}, (error, response) => {
    if (error) {
      res.status(500).json({ success: false, message: 'Error occurred while updating details of user.' });
      return;
    }

    if (response) {
      const user = {
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        _id: response._id,
        profile: response.profile,
        role: response.role,
        createdAt: new Date(),
        updatedAt: new Date()

      }

      res.status(200).json({ success: true, result: 1, user: user });
      return;
    }

    if (!response) {
      res.status(200).json({ success: true, result: 1, user: {} });
    }
  });
}

module.exports.getUserByEmail = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email }, (error, user) => {
    if (error) {
      res.status(500).json({ success: false, message: 'Error occurred while finding user.' });
      return;
    }

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (user) {
      bcryptjs.compare(password, user.password, (error, isMatch) => {

        if (error) {
          res.status(500).json({ success: false, message: 'Error occurred while comparing password.' });
          return;
        }

        if (!isMatch) {
          res.status(400).json({ success: false, message: 'Password does not match.' });
          return;
        }

        if (isMatch) {

          if (!user.firstLogin) {
            user.firstLogin = true;
            user.save((error) => {
              if (error) {
                res.status(500).json({ success: false, message: 'Error occurred while saving user data.' });
                return;
              }

              res.status(200).json({
                success: true,
                result: 1,
                message: 'Logged in successfully for the first time.',
                user: {
                  _id: user._id,
                  email: user.email,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  profile: user.profile,
                  token: user.token,
                  role: user.role,
                  idToken: user.idToken,
                },
              });
              sendLoginEmail(user);
            });
          }
          else {
            res.status(200).json({
              success: true,
              result: 1,
              message: 'Logged in successfully.',
              user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                profile: user.profile,
                token: user.token,
                role: user.role,
                idToken: user.idToken,
              }
            });
          }

        }
      });
    }
  })
}

module.exports.getAdminUser = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email, role: 'IS_ADMIN' }, (error, user) => {
    if (error) {
      res.status(500).json({ success: false, message: 'Error occurred while finding user.' });
      return;
    }

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (user) {

      bcryptjs.compare(password, user.password, (error, isMatch) => {


        if (error) {
          res.status(500).json({ success: false, message: 'Error occurred while comparing password.' });
          return;
        }

        if (!isMatch) {
          res.status(400).json({ success: false, message: 'Password does not match.' });
          return;
        }

        if (isMatch) {
          res.status(200).json({
            success: true,
            message: 'Logged in successfully.',
            user: {
              _id: user._id,
              email: user.email,
              role: user.role,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
              token: user.token

            }
          });
        }
      });

    }
  });
}

module.exports.sendResetPasswordEmail = (req, res) => {
  User.findOne({ email: req.body.email }, (error, response) => {
    if (error) {
      res.status(500).json({ success: false, message: 'Error occurred while sending reset password email. Please try again.' });
      return;
    }

    if (!response) {
      res.status(500).json({ success: false, message: 'User not found with the provided email.' });
      return;
    }

    if (response) {
      const token = jwt.sign(response.toJSON(), config.TOKEN_SECRET, { expiresIn: 3600000 }, null);

      const transporter = config.transporter;

      const mailOptions = {
        from: config.emailFrom,
        to: req.body.email,
        subject: 'Reset Password link',
        html: `<p>Click link below to reset password</p>
               <a href="${config.FRONTEND_URL + 'auth/reset-password/' + token + '/' + response._id}">Reset Password</a>`
      };

      transporter.sendMail(mailOptions).then(() => {
        res.status(200).json({ success: true, message: 'Email sent successfully.' });
      }).catch(() => {
        res.status(500).json({ success: true, message: 'Error occurred while sending email.' });
      });
    }
  });

}

module.exports.resetPassword = (req, res) => {
  User.findById(req.body.id, (error, response) => {
    if (error) {
      res.status(500).json({ success: false, message: 'Error occurred while resetting password.' });
      return;
    }

    if (!response) {
      res.status(500).json({ success: false, message: 'User not found.' });
      return;
    }

    const isValidToken = verifyJsonWebToken(req.body.token);
    if (!isValidToken) {
      res.status(500).json({ success: false, message: 'Invalid token.' });
      return;
    }

    bcryptjs.genSalt(10, (error, salt) => {
      if (error) {
        res.status(500).json({ success: false, message: 'Error occurred while resetting password.' });
        return;
      }

      if (!error) {
        bcryptjs.hash(req.body.password, salt, (error, hash) => {
          if (error) {
            res.status(500).json({ success: false, message: 'Error occurred while resetting password.' });
            return;
          }

          User.findByIdAndUpdate(req.body.id, { $set: { password: hash } }, {}, error => {
            if (error) {
              res.status(500).json({ success: false, message: 'Error occurred while resetting password.' });
              return;
            }

            if (!error) {
              res.status(200).json({ success: true, message: 'Password reset successfully.' });
            }
          });
        });
      }
    });
  });
}

module.exports.verifyToken = (req, res) => {
  const isValidToken = verifyJsonWebToken(req.body.token);
  if (!isValidToken) {
    res.status(500).json({ success: false, message: 'Invalid token.' });
    return;
  }

  res.status(200).json();
}

function verifyJsonWebToken(token) {
  return jwt.verify(token, config.TOKEN_SECRET, null, (error) => {
    return !error;
  });
}

module.exports.externalSignin = (req, res) => {

  const email = req.body.email;

  User.findOne({ email: email }, (error, user) => {

    if (user) {
      res.status(200).json({
        success: true,
        result: 1,
        message: 'Logged in successfully.',
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profile: user.profile,
          token: user.token
        }
      });

    }

    if (!user) {

      const user = new User({
        email: req.body.email,
        firstName: req.body.firstName,
        profile: {},
        lastName: req.body.lastName,
        idToken: req.body.idToken,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const token = jwt.sign(user.toJSON(), config.TOKEN_SECRET, { expiresIn: 3600000 }, null);
      user.token = token;

      user.save((error, user) => {
        if (error) {
          res.status(500).json({ success: false, message: 'Error occurred while creating account.' });
          return;
        }

        if (user) {
          res.status(200).json({
            success: true,
            result: 1,
            message: 'Logged in successfully.',
            user: {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              profile: user.profile,
              token: user.token,
              idToken: user.idToken,
            }
          });
          return;
        }
      });

    }
  });

}
module.exports.getLinkedinToken = async (req, res) => {
  let userDetail = {};

  const params = {
    grant_type: req.body.grant_type,
    code: req.body.code,
    redirect_uri: req.body.redirect_uri,
    client_id: config.LINKEDIN_CLIENT_ID,
    client_secret: config.LINKEDIN_CLIENT__SECRET

  };

  const access_token = await getAccessToken(params);
  if (!access_token) {
    res.status(500).json({ success: false, message: 'Invalid token' });
    return;
  }
  const userData = await getLinkedinUserData(access_token);
  const email = await getlinkedinEmail(access_token);

  userDetail = userData;
  userDetail.email = email;
  User.findOne({ email: email }, (error, user) => {

    if (user) {
      res.status(200).json({
        success: true,
        result: 1,
        message: 'Logged in successfully.',
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profile: user.profile,
          token: user.token
        }
      });

    }

    if (!user) {

      const user = new User({
        email: userDetail.email,
        firstName: userDetail.localizedFirstName,
        lastName: userDetail.localizedLastName,
        'profile.profilePicture': userDetail.profilePicture,
        // id: userDetail.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const token = jwt.sign(user.toJSON(), config.TOKEN_SECRET, { expiresIn: 3600000 }, null);
      user.token = token;

      user.save((error, user) => {
        if (error) {
          res.status(500).json({ success: false, message: 'Error occurred while creating account.' });
          return;
        }

        if (user) {
          res.status(200).json({
            success: true,
            result: 1,
            message: 'Logged in successfully.',
            user: {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              profile: user.profile,
              token: user.token,
              idToken: user.idToken,
            }
          });

        }
      });

    }
  });

}

async function getAccessToken(params) {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  try {
    const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', params, { headers });
    const accessToken = response.data.access_token;
    return accessToken;
  } catch (error) {
    console.error('Error exchanging code for access token:', error.message);
    return;
  }
}

async function getLinkedinUserData(accessToken) {
  try {
    const response = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    let userData = response.data;
    return userData;
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    return
  }

}

async function getlinkedinEmail(accessToken) {
  const emailResponse = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  const emailData = emailResponse.data.elements[0]['handle~'].emailAddress;
  return emailData
}

async function sendLoginEmail(user) {
  let emailContent = await Email.findOne({ title: 'Login' })
  const updatedContent = emailContent.content.replace('{First_Name}', user.firstName);
  const transporter = config.transporter;

  const mailOptions = {
    from: config.emailFrom,
    to: user.email,
    subject: 'Login',
    html: `<p>${updatedContent}</p>`
  };
  transporter.sendMail(mailOptions).then();

}

async function sendRegisterEmail(user) {
  let emailContent = await Email.findOne({ title: 'Register' })
  const placeholders = {
    '{First_Name}': user.firstName,
    '{Remote_Jobs_page}': config.Remote_Jobs_page,
    '{Coaching_page}': config.Coaching_page
  };

  const regex = new RegExp(Object.keys(placeholders).join('|'), 'g');
  const updatedContent = emailContent.content.replace(regex, match => placeholders[match]);

  const transporter = config.transporter;

  const mailOptions = {
    from: config.emailFrom,
    to: user.email,
    subject: 'Register',
    html: `<p>${updatedContent}</p>`
  };
  transporter.sendMail(mailOptions).then();

}

async function sendResumeEmail(user, file) {
  let emailContent = await Email.findOne({ title: 'Add_New_resume' })
  const placeholders = {
    '{First_Name}': user.firstName,
    '{RESUME_TITLE}': file.originalname
  };

  const regex = new RegExp(Object.keys(placeholders).join('|'), 'g');
  const updatedContent = emailContent.content.replace(regex, match => placeholders[match]);

  const transporter = config.transporter;

  const mailOptions = {
    from: config.emailFrom,
    to: user.email,
    subject: 'Resume Uploaded',
    html: `<p>${updatedContent}</p>`
  };
  transporter.sendMail(mailOptions).then();

}

