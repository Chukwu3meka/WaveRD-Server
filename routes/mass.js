const handler = require("../handlers"),
  router = require("express").Router(),
  auth = require("../middleware/authentication");

router.route("/fetchMasses").post(handler.fetchMasses);
router.route("/fetchMassData").post(handler.fetchMassData);
router.route("/fetchHomeData").post(auth, handler.fetchHomeData);
router.route("/fetchTournament").post(auth, handler.fetchTournament);
router.route("/sendOffer").post(auth, handler.sendOffer);
router.route("/fetchOffers").post(auth, handler.fetchOffers);
router.route("/callOffOffer").post(auth, handler.callOffOffer);
router.route("/acceptOffer").post(auth, handler.acceptOffer);

// rebuilding
// router.route("/getAvailableTeam").post(handler.getAvailableTeam);
// router.route("/getCurrentMatches").post(handler.getCurrentMatches);
// router.route("/getnews").post(handler.getnews);
// router.route("/leaguedata").post(auth, handler.leagueData);
// router.route("/getRecords").post(auth, handler.getRecords);
// router.route("/competition").post(auth, handler.competition);
// router.route("/transfers").post(auth, handler.transfers);
// router.route("/getawards").post(handler.getAwards);

module.exports = router;
