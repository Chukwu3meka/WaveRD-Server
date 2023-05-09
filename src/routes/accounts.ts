import express from "express";

// middleware
import passport from "../middleware/passport";
import securedRoute from "../middleware/verifyToken";

// handlers
import * as personal from "../handlers/accounts";

const router = express.Router({ caseSensitive: true, strict: true });

router.route("/signup").post(personal.signup);
router.route("/signin").post(personal.signin);
router.route("/cookies").get(personal.cookies);
router.route("/cookieConsent").get(securedRoute, personal.cookieConsent);
router.route("/signout").get(personal.signout);
router.route("/email_exists").post(personal.emailExists);
router.route("/handle_exists").post(personal.handleExists);
router.route("/verify-email").get(personal.verifyEmail);
router.route("/forgot-password").post(personal.forgotPassword);
router.route("/reset-password").post(personal.resetPassword);

// router.route("/:club/players").get(club.clubPlayers);

router.route("/twitter").get(passport.authenticate("twitter"));
router.route("/google").get(passport.authenticate("google", { scope: ["email"] }));
router.route("/facebook").get(passport.authenticate("facebook", { scope: ["email"] }));
router.route("/google/callback").get(passport.authenticate("google"), personal.oAuth.googleAuth);
router.route("/twitter/callback").get(passport.authenticate("twitter"), personal.oAuth.twitterAuth);
router.route("/facebook/callback").get(passport.authenticate("facebook"), personal.oAuth.facebookAuth);

export default router;
