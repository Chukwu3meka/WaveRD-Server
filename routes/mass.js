const handle = require("../handlers"),
  router = require("express").Router(),
  auth = require("../middleware/authentication");

router.route("/fetchMasses").post(handle.fetchMasses);
router.route("/fetchMassData").post(handle.fetchMassData);
router.route("/fetchHomeTables").post(auth, handle.fetchHomeTables);
router.route("/fetchCalendar").post(auth, handle.fetchCalendar);

// rebuilding
// router.route("/getAvailableTeam").post(handle.getAvailableTeam);
// router.route("/getCurrentMatches").post(handle.getCurrentMatches);
// router.route("/getnews").post(handle.getnews);
// router.route("/leaguedata").post(auth, handle.leagueData);
// router.route("/getRecords").post(auth, handle.getRecords);
// router.route("/competition").post(auth, handle.competition);
// router.route("/transfers").post(auth, handle.transfers);
// router.route("/getawards").post(handle.getAwards);

module.exports = router;
