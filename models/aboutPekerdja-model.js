const mongoose = require("mongoose");

const AboutSchema = mongoose.Schema({
  title: {
    type: String,
  },

  content: {
    type: String,
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

const About = (module.exports = mongoose.model("About", AboutSchema));


module.exports.getData = async (req, res) => {

  let query = {}
  if (req.query.Terms_Of_Use) {
    query.title = req.query.Terms_Of_Use
  }
  if (req.query.Privacy_Policy) {
    query.title = req.query.Privacy_Policy
  }
  if (req.query.Contact_Us) {
    query.title = req.query.Contact_Us
  }
  if (req.query.About_Us) {
    query.title = req.query.About_Us
  }
  About.find(query, async (error, response) => {
    if (error) {
      console.log(error);
      res.status(500).json({
        status: "Error",
        message: "Error occurred while getting data.",
      });
      return;
    }

    if (response && response.length > 0) {
      const data = [];

      if (response && response.length > 0) {
        for (const i of response) {
          const item = {
            _id: i._id,
            title: i.title,
            content: i.content,
            createdAt: i.createdAt,
            updatedAt: i.updatedAt,
          };
          data.push(item);
        }
      }

      res.status(200).json({ status: "Success", result: 1, data: data });
      return;
    }

    res.status(200).json({ status: "Success", result: 1, data: [] });
  })
};

module.exports.updateData = (req, res) => {

  About.findOneAndUpdate(
    { _id: req.params.id },
    { ...req.body, updatedAt: new Date() },
    {},
    async (error) => {
      if (error) {
        res.status(500).json({
          success: false,
          message: "Error occurred while updating data.",
        });
        return;
      }
      if (!error) {

        res.status(200).json({
          result: 1,
          message: "Data updated successfully.",
        });
      }
    }
  )



};

module.exports.getDataByID = (req, res) => {
  About.findById(req.params.id, {}, (error, response) => {
    if (error) {
      res.status(500).json({
        success: false,
        message: "Error occurred while getting data.",
      });
      return;
    }

    if (response) {
      const data = {
        _id: response._id,
        title: response.title,
        content: response.content
      };
      res.status(200).json({ success: true, data: data });
      return;
    }

    if (!response) {
      res.status(200).json({ success: true, data: {} });
    }
  });
};