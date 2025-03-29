const mongoose = require("mongoose");

const FaqSchema = mongoose.Schema({
  faqs: [],
  createdAt: {
    type: Date,
    required: true,
  },
  updatedAt: {
    type: Date,
    required: true,
  },
});

const Faq = (module.exports = mongoose.model("Faq", FaqSchema));


module.exports.createFaqs = (req, res) => {

  const item = new Faq({
    faqs: req.body.faqs,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  item.save((item2) => {
    res.send({ result: 1, message: 'Faqs added successfully.' });
  });


};


module.exports.getFaqs = async (req, res) => {

  Faq.findOne({}, async (error, response) => {
    if (error) {
      console.log(error);
      res.status(500).json({
        status: "Error",
        message: "Error occurred while getting Faqs.",
      });
      return;
    }

    if (response) {
      const faq = {
        _id: response._id,
        faqs: response.faqs,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      };
      res.status(200).json({ success: true, result: 1, faqs: faq });
      return;
    }

    if (!response) {
      res.status(200).json({ success: true, result: 1, faqs: {} });
    }
  });
};


module.exports.updateFaqs = (req, res) => {

  Faq.findOneAndUpdate(
    { _id: req.params.id },
    { ...req.body, updatedAt: new Date() },
    {},
    async (error) => {
      if (error) {
        res.status(500).json({
          success: false,
          message: "Error occurred while updating details of Faqs.",
        });
        return;
      }
      if (!error) {

        res.status(200).json({
          result: 1,
          message: "Faqs updated successfully.",
        });
      }
    }
  )



};