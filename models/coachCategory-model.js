const mongoose = require("mongoose");

const CoachCategorySchema = mongoose.Schema({
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

const CoachCategory = (module.exports = mongoose.model("CoachCategory", CoachCategorySchema));


module.exports.createCategory = (req, res) => {

  const item = new CoachCategory({
    title: req.body.title,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  item.save((item2) => {
    res.send({ result: 1, message: 'Category created successfully.' });
  });


};

module.exports.getCategoryByID = (req, res) => {
  CoachCategory.findById(req.params.id, {}, (error, response) => {
    if (error) {
      res.status(500).json({
        success: false,
        message: "Error occurred while getting Categories.",
      });
      return;
    }

    if (response) {
      const category = {
        _id: response._id,
        title: response.title,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      };
      res.status(200).json({ success: true, category: category });
      return;
    }

    if (!response) {
      res.status(200).json({ success: true, category: {} });
    }
  });
};

module.exports.getCategories = async (req, res) => {
  const page = +req.query.page
  const itemsPerPage = +req.query.rows;
  let totalReq = await CoachCategory.count()
  let query = {}

  CoachCategory.find(query, async (error, response) => {
    if (error) {
      console.log(error);
      res.status(500).json({
        status: "Error",
        message: "Error occurred while getting Categories.",
      });
      return;
    }

    if (response && response.length > 0) {
      const categories = [];

      if (response && response.length > 0) {
        for (const category of response) {
          const data = {
            _id: category._id,
            title: category.title,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
          };
          categories.push(data);
        }
      }

      res.status(200).json({ status: "Success", result: 1, totalReq: totalReq, categories: categories });
      return;
    }

    res.status(200).json({ status: "Success", result: 1, totalReq: totalReq, categories: [] });
  }).skip(page).limit(itemsPerPage);
};

module.exports.deleteCategory = (req, res) => {
  CoachCategory.findByIdAndRemove(req.params.id, (error, response) => {
    if (!error) {
      res.send({ result: 1, message: 'Category deleted successfully.' });
    } else {
      console.log("Error in deleting category");
    }
  });
};

module.exports.updateCategory = (req, res) => {

  CoachCategory.findOneAndUpdate(
    { _id: req.params.id },
    { ...req.body, updatedAt: new Date() },
    {},
    async (error) => {
      if (error) {
        res.status(500).json({
          success: false,
          message: "Error occurred while updating details of Category.",
        });
        return;
      }
      if (!error) {

        res.status(200).json({
          result: 1,
          message: "Category details updated successfully.",
        });
      }
    }
  )



};