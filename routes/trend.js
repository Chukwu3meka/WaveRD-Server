const handle = require("../handlers"),
  router = require("express").Router(),
  auth = require("../middleware/authentication");

router.route("/inserttrend").post(auth, handle.insertTrend);

module.exports = router;
