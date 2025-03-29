const express = require("express");
const Skill = require("../models/skill-model");
const router = express.Router();

router.post("/create-skill", (req, res) => {
  Skill.createSkill(req, res);
});

router.put("/update-skill/:id", (req, res) => {
  Skill.updateSkill(req, res);
});

router.get("/get-skills", (req, res) => {
  Skill.getSkills(req, res);
});

router.get("/get-skill-by-id/:id", (req, res) => {
  Skill.getSkillByID(req, res);
});

router.delete("/delete-skill/:id", (req, res) => {
  Skill.deleteSkill(req, res);
});

module.exports = router;
