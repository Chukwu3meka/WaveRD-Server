const router = require("express").Router();
const handler = require("../handlers");
const auth = require("../middleware/authentication");

router.route("/initializeMass").post(handler.initializeMass);
// router.route("/refreshPlayers").post(handler.refreshPlayers);
// // router.route("/newSeasonCalendar").post(handler.newSeasonCalendar);
// router.route("/addnews").post(auth, handler.addNews);
// router.route("/addmasstable").post(auth, handler.addMassTable);
// router.route("/addgoalassist").post(auth, handler.addGoalAssist);
// router.route("/addReport").post(auth, handler.addReport);
// router.route("/addCalendar").post(auth, handler.addCalendar);
// router.route("/updatestat").post(auth, handler.updateStat);
// router.route("/addblogpost").post(auth, handler.addBlogPost);
// router.route("/changeenergy").post(auth, handler.changeEnergy);
// router.route("/randomtransfers").post(auth, handler.randomTransfers);
// router.route("/removemanager").post(handler.removeManager);
// router.route("/playMatch").post(handler.playMatch);
// router.route("/db").post(handler.db);

module.exports = router;
