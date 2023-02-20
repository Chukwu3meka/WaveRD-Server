import express from "express";

import passport from "../../middleware/passport";
import * as personal from "../../handlers/accounts/personal";

const router = express.Router();

router.route("/email_exists").post(personal.emailExists);
router.route("/handle_exists").post(personal.handleExists);
router.route("/add_account").post(personal.addAccount);
router.route("/auth").post(personal.auth);
router.route("/cookie").get(personal.cookie);
// router.route("/:club/players").get(club.clubPlayers);

router.route("/facebook").get(passport.authenticate("facebook", { scope: ["email"] }));
router.route("/facebook/callback").get(passport.authenticate("facebook"), personal.oAuth.facebookAuth);

router.route("/google").get(passport.authenticate("google", { scope: ["email"] }));
router.route("/google/callback").get(passport.authenticate("google"), personal.oAuth.googleAuth);

router.route("/twitter").get(passport.authenticate("twitter"));
router.route("/twitter/callback").get(passport.authenticate("twitter"), personal.oAuth.twitterAuth);

module.exports = router;

export default router;
