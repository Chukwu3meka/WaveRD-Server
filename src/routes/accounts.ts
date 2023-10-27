import express from "express";

// middleware
import passport from "../middleware/passport";
// import timeout from "connect-timeout";
import timeout from "../middleware/timeout";
import securedRoute from "../middleware/verifyToken";

// handlers
import * as personal from "../handlers/accounts";
// import { haltOnTimedout } from "../utils/handlers";

const router = express.Router({ caseSensitive: true, strict: true });

router.route("/email_exists").post(personal.emailExists);
router.route("/handle_exists").post(personal.handleExists);
router.route("/signup").post(personal.signup);
router.route("/verify-email").get(personal.verifyEmail);
// router.route("/signin").post(personal.signin);
router.route("/signin").post(timeout(3), personal.signin);
// router.route("/signin").post(personal.signin);
// router.route("/signin").post(timeout(1, personal.signin as Function));
router.route("/details").get(securedRoute, personal.details);
router.route("/signout").get(personal.signout);
router.route("/forgot-password").post(personal.forgotPassword);
router.route("/reset-password").post(personal.resetPassword);
router.route("/theme").post(securedRoute, personal.theme);
router.route("/data-deletion").post(securedRoute, personal.dataDeletion);

// router.route("/:club/players").get(club.clubPlayers);

router.route("/twitter").get(passport.authenticate("twitter"));
router.route("/google").get(passport.authenticate("google", { scope: ["email"] }));
router.route("/facebook").get(passport.authenticate("facebook", { scope: ["email"] }));
router.route("/google/callback").get(passport.authenticate("google"), personal.oAuth.googleAuth);
router.route("/twitter/callback").get(passport.authenticate("twitter"), personal.oAuth.twitterAuth);
router.route("/facebook/callback").get(passport.authenticate("facebook"), personal.oAuth.facebookAuth);

export default router;
