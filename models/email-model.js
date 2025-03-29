const mongoose = require("mongoose");

const EmailSchema = mongoose.Schema({
  title: {
    type: String,
  },

  content: {
    type: String,

  },


});

const Email = (module.exports = mongoose.model("Email", EmailSchema));


module.exports.getEmails = async (req, res) => {
  // const page = +req.query.page || 0
  // const itemsPerPage = +req.query.rows || 10
  // let searched = false;
  // let totalReq = await Skill.count()


  Email.find({}, async (error, response) => {
    if (error) {
      console.log(error);
      res.status(500).json({
        status: "Error",
        message: "Error occurred while getting settings.",
      });
      return;
    }

    if (response && response.length > 0) {
      const emails = [];

      if (response && response.length > 0) {
        for (const i of response) {
          const data = {
            _id: i._id,
            title: i.title,
            content: i.content,
          };
          emails.push(data);
        }
      }

      res.status(200).json({ status: "Success", result: 1, emails: emails });
      return;
    }

    res.status(200).json({ status: "Success", result: 1, emails: [] });
  })
};

module.exports.updateEmail = (req, res) => {

  Email.findOneAndUpdate(
    { _id: req.params.id },
    { ...req.body },
    {},
    async (error) => {
      if (error) {
        res.status(500).json({
          success: false,
          message: "Error occurred while updating emails.",
        });
        return;
      }
      if (!error) {

        res.status(200).json({
          result: 1,
          message: "Email updated successfully.",
        });
      }
    }
  )



};

module.exports.getEmailByID = (req, res) => {
  Email.findById(req.params.id, {}, (error, response) => {
    if (error) {
      res.status(500).json({
        success: false,
        message: "Error occurred while getting Skills.",
      });
      return;
    }

    if (response) {
      const email = {
        _id: response._id,
        title: response.title,
        content: response.content
      };
      res.status(200).json({ success: true, email: email });
      return;
    }

    if (!response) {
      res.status(200).json({ success: true, email: {} });
    }
  });
};