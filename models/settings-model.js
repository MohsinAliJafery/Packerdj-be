const mongoose = require("mongoose");

const SettingSchema = mongoose.Schema({
  Account_Number: {
    type: String,
  },

  Address: {
    type: String,
  },
  Bank_Account_Holder: {
    type: String,
  },
  Bank_Branch_Name: {
    type: String,
  },
  Bank_Name: {
    type: String,
  },
  Swift_Code: {
    type: String,
  },
  Technical: {
    type: String,
  },
  Soft: {
    type: String,
  },
  English: {
    type: String,
  },
  Career: {
    type: String,
  },

});

const Setting = (module.exports = mongoose.model("Setting", SettingSchema));



module.exports.getSettings = async (req, res) => {

  Setting.find({}, async (error, response) => {
    if (error) {
      console.log(error);
      res.status(500).json({
        status: "Error",
        message: "Error occurred while getting settings.",
      });
      return;
    }

    if (response) {
      const data = {
        _id: response[0]._id,
        Bank_Name: response[0].Bank_Name,
        Address: response[0].Address,
        Bank_Branch_Name: response[0].Bank_Branch_Name,
        Account_Number: response[0].Account_Number,
        Bank_Account_Holder: response[0].Bank_Account_Holder,
        Swift_Code: response[0].Swift_Code,
        Soft: response[0].Soft,
        Technical: response[0].Technical,
        English: response[0].English,
        Career: response[0].Career
      };
      res.status(200).json({ status: "Success", result: 1, settings: data });
      return;
    }

    if (!response) {
      res.status(200).json({ status: "Success", result: 1, settings: {} });
    }
  })
};

module.exports.updateSettings = (req, res) => {

  Setting.findOneAndUpdate(
    { _id: req.params.id },
    { ...req.body },
    {},
    async (error) => {
      if (error) {
        res.status(500).json({
          success: false,
          message: "Error occurred while updating settings.",
        });
        return;
      }
      if (!error) {

        res.status(200).json({
          result: 1,
          message: "Settings updated successfully.",
        });
      }
    }
  )



};