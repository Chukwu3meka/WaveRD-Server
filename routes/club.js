const handler = require("../handlers"),
  router = require("express").Router(),
  auth = require("../middleware/authentication");

router.route("/fetchClubPlayers").post(handler.fetchClubPlayers);
router.route("/fetchSquad").post(auth, handler.fetchSquad);
router.route("/fetchTactics").post(auth, handler.fetchTactics);
router.route("/fetchHistory").post(auth, handler.fetchHistory);
router.route("/fetchFinance").post(auth, handler.fetchFinance);
router.route("/saveTactics").post(auth, handler.saveTactics);
router.route("/fetchTargets").post(auth, handler.fetchTargets);
router.route("/targetPlayer").post(auth, handler.targetPlayer);

// rebuilding

// router.route("/getClubsForSignup").post(handler.getClubsForSignup);
// router.route("/viewmass").post(handler.viewMass);
// router.route("/getreport").post(handler.getReport);
// router.route("/viewstat").post(handler.getStat);
// router.route("/getPastMatch").post(handler.getPastMatch);
// router.route("/synctarget").post(auth, handler.syncTarget);
// router.route("/gettargets").post(auth, handler.getTargets);
// router.route("/makeoffer").post(auth, handler.makeOffer);
// router.route("/getoffers").post(auth, handler.getOffers);
// router.route("/gettransactions").post(auth, handler.getTransactions);
// router.route("/replyoffer").post(auth, handler.replyOffer);
// router.route("/withdrawoffer").post(auth, handler.withdrawOffer);
// router.route("/viewboard").post(auth, handler.viewBoard);
// router.route("/viewtraining").post(auth, handler.viewTraining);
// router.route("/updatetraining").post(auth, handler.updateTraining);
// router.route("/updateposition").post(auth, handler.updatePosition);
// router.route("/viewtactics").post(auth, handler.viewTactics);
// router.route("/updateTactics").post(auth, handler.updateTactics);
// router.route("/viewmedical").post(auth, handler.getMedical);
// router.route("/setformation").post(auth, handler.setFormation);
// router.route("/viewhistory").post(auth, handler.viewHistory);
// router.route("/deletereport").post(auth, handler.deleteReport);

module.exports = router;
