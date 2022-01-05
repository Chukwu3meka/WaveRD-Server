const handler = require("../handlers"),
  router = require("express").Router();

router.route("/initializeMass").post(handler.initializeMass);
router.route("/matchTask").post(handler.matchTask);
router.route("/dailyTask").post(handler.dailyTask);
router.route("/weeklyTask").post(handler.weeklyTask);
router.route("/starter").post(handler.starter);

module.exports = router;
