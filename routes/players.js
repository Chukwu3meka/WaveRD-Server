const router = require("express").Router();
const handler = require("../handlers");
const auth = require("../middleware/authentication");

router.route("/fetchPlayer").post(handler.fetchPlayer);
router.route("/listPlayer").post(handler.listPlayer);
// router.route("/viewsquad").post(auth, handler.viewSquad);
// router.route("/getplayers").post(auth, handler.getPlayers);
// router.route("/matchsquad").post(auth, handler.matchSquad);

module.exports = router;
