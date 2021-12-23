const handler = require("../handlers"),
  router = require("express").Router(),
  auth = require("../middleware/authentication");

router.route("/fetchPlayer").post(auth, handler.fetchPlayer);
router.route("/randomAgents").post(auth, handler.randomAgents);
router.route("/searchPlayers").post(handler.searchPlayers);
router.route("/listPlayer").post(auth, handler.listPlayer);
// router.route("/viewsquad").post(auth, handler.viewSquad);
// router.route("/getplayers").post(auth, handler.getPlayers);
// router.route("/matchsquad").post(auth, handler.matchSquad);

module.exports = router;
