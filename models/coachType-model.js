const mongoose = require("mongoose");

const TypeSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
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

const Type = (module.exports = mongoose.model("Type", TypeSchema));


module.exports.createType = (req, res) => {

  const item = new Type({
    title: req.body.title,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  item.save((item2) => {
    res.send({ result: 1, message: 'Type created successfully.' });
  });


};

module.exports.getTypeByID = (req, res) => {
  Type.findById(req.params.id, {}, (error, response) => {
    if (error) {
      res.status(500).json({
        success: false,
        message: "Error occurred while getting types.",
      });
      return;
    }

    if (response) {
      const type = {
        _id: response._id,
        title: response.title,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      };
      res.status(200).json({ success: true, type: type });
      return;
    }

    if (!response) {
      res.status(200).json({ success: true, type: {} });
    }
  });
};

module.exports.getTypes = async (req, res) => {
  const page = +req.query.page
  const itemsPerPage = +req.query.rows;
  let totalReq = await Type.count()
  let query = {}

  Type.find(query, async (error, response) => {
    if (error) {
      console.log(error);
      res.status(500).json({
        status: "Error",
        message: "Error occurred while getting Coach Types.",
      });
      return;
    }

    if (response && response.length > 0) {
      const types = [];

      if (response && response.length > 0) {
        for (const type of response) {
          const data = {
            _id: type._id,
            title: type.title,
            createdAt: type.createdAt,
            updatedAt: type.updatedAt,
          };
          types.push(data);
        }
      }

      res.status(200).json({ status: "Success", result: 1, totalReq: totalReq, types: types });
      return;
    }

    res.status(200).json({ status: "Success", result: 1, totalReq: totalReq, types: [] });
  }).skip(page).limit(itemsPerPage);
};

module.exports.deleteType = (req, res) => {
  Type.findByIdAndRemove(req.params.id, (error, response) => {
    if (!error) {
      res.send({ result: 1, message: 'Coach type deleted successfully.' });
    } else {
      console.log("Error in deleting Coach type");
    }
  });
};

module.exports.updateType = (req, res) => {

  Type.findOneAndUpdate(
    { _id: req.params.id },
    { ...req.body, updatedAt: new Date() },
    {},
    async (error) => {
      if (error) {
        res.status(500).json({
          success: false,
          message: "Error occurred while updating details of Coach type.",
        });
        return;
      }
      if (!error) {

        res.status(200).json({
          result: 1,
          message: "Coach type updated successfully.",
        });
      }
    }
  )



};