const router = require("express").Router();
const handle = require("../handlers");
const auth = require("../middleware/authentication");

router.route("/inserttrend").post(auth, handle.insertTrend);

module.exports = router;
