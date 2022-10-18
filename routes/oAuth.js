const handle = require("../handlers"),
  router = require("express").Router(),
  passport = require("../middleware/oAuth");

router.route("/facebook").get(passport.authenticate("facebook", { scope: ["email"] }));
router.route("/facebook/callback").get(passport.authenticate("facebook"), handle.facebookAuth);

router.route("/google").get(passport.authenticate("google", { scope: ["email"] }));
router.route("/google/callback").get(passport.authenticate("google"), handle.googleAuth);

router.route("/twitter").get(passport.authenticate("twitter"));
router.route("/twitter/callback").get(passport.authenticate("twitter"), handle.twitterAuth);

module.exports = router;
