const mongoose = require("mongoose");

const SkillSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  link: {
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

const Skill = (module.exports = mongoose.model("Skill", SkillSchema));


module.exports.createSkill = (req, res) => {

  const item = new Skill({
    title: req.body.title,
    description: req.body.description,
    type: req.body.type,
    link: req.body.link,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  item.save((item2) => {
    res.send({ result: 1, message: 'Assessment created successfully.' });
  });


};

module.exports.getSkillByID = (req, res) => {
  Skill.findById(req.params.id, {}, (error, response) => {
    if (error) {
      res.status(500).json({
        success: false,
        message: "Error occurred while getting Skills.",
      });
      return;
    }

    if (response) {
      const skill = {
        _id: response._id,
        title: response.title,
        description: response.description,
        type: response.type,
        link: response.link,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      };
      res.status(200).json({ success: true, skill: skill });
      return;
    }

    if (!response) {
      res.status(200).json({ success: true, skill: {} });
    }
  });
};

module.exports.getSkills = async (req, res) => {
  const page = +req.query.page
  const itemsPerPage = +req.query.rows
  let query = {}
  if (req.query.searchValue) {
    query.type = req.query.searchValue;
  }
  if (req.query.title) {
    query.title = { $regex: req.query.title, $options: 'i' }
  }
  let totalReq = await Skill.find(query).count()

  Skill.find(query, async (error, response) => {
    if (error) {
      console.log(error);
      res.status(500).json({
        status: "Error",
        message: "Error occurred while getting Skills.",
      });
      return;
    }

    if (response && response.length > 0) {
      const skills = [];

      if (response && response.length > 0) {
        for (const skill of response) {
          const data = {
            _id: skill._id,
            title: skill.title,
            description: skill.description,
            type: skill.type,
            link: skill.link,
            createdAt: skill.createdAt,
            updatedAt: skill.updatedAt,
          };
          skills.push(data);
        }
      }

      res.status(200).json({ status: "Success", result: 1, totalReq: totalReq, skills: skills });
      return;
    }

    res.status(200).json({ status: "Success", result: 1, totalReq: totalReq, skills: [] });
  }).skip(page).limit(itemsPerPage);
};

module.exports.deleteSkill = (req, res) => {
  Skill.findByIdAndRemove(req.params.id, (error, response) => {
    if (!error) {
      res.send({ result: 1, message: 'Assessment deleted successfully.' });
    } else {
      console.log("Error in deleting skill");
    }
  });
};

module.exports.updateSkill = (req, res) => {

  Skill.findOneAndUpdate(
    { _id: req.params.id },
    { ...req.body, updatedAt: new Date() },
    {},
    async (error) => {
      if (error) {
        res.status(500).json({
          success: false,
          message: "Error occurred while updating details of Skill.",
        });
        return;
      }
      if (!error) {

        res.status(200).json({
          result: 1,
          message: "Assessment details updated successfully.",
        });
      }
    }
  )



};