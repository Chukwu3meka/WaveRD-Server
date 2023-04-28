import express from "express";

// middleware
import passport from "../middleware/passport";
import securedRoute from "../middleware/verifyToken";

// handlers
import * as personal from "../handlers/accounts";

const router = express.Router();

router.route("/auth").post(personal.signin);
router.route("/logout").get(personal.logout);
router.route("/cookie").get(personal.cookie);
router.route("/add_account").post(personal.signup);
router.route("/email_exists").post(personal.emailExists);
router.route("/oAuthSession").post(personal.oAuthSession);
router.route("/handle_exists").post(personal.handleExists);
router.route("/cookieConsent").patch(securedRoute, personal.cookieConsent);
// router.route("/:club/players").get(club.clubPlayers);

router.route("/twitter").get(passport.authenticate("twitter"));
router.route("/google").get(passport.authenticate("google", { scope: ["email"] }));
router.route("/facebook").get(passport.authenticate("facebook", { scope: ["email"] }));
router.route("/google/callback").get(passport.authenticate("google"), personal.oAuth.googleAuth);
router.route("/twitter/callback").get(passport.authenticate("twitter"), personal.oAuth.twitterAuth);
router.route("/facebook/callback").get(passport.authenticate("facebook"), personal.oAuth.facebookAuth);

export default router;
