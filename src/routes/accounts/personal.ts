import express from "express";

import passport from "../../middleware/passport";
import securedRoute from "../../middleware/securedRoute";
import * as personal from "../../handlers/accounts/personal";

const router = express.Router();

import cors from "cors";

const allowedOrigins = [
  // ? SoccerMASS Development Web
  "http://localhost:3000",
  "http://apihub.localhost:3000",
  "http://manager.localhost:3000",
  // "http://accounts.localhost:3000",

  // ? SoccerMASS Production
  // "https://soccermass.com",
  "https://www.soccermass.com",
  "https://dev.soccermass.com",
  "https://apihub.soccermass.com",
  "https://manager.soccermass.com",
];

const corsOptions = {
  // origin: [/(?:[a-zA-Z0-9]+\.)*localhost:3000/, /(?:[a-zA-Z0-9]+\.)*soccermass/, /(?:[a-zA-Z0-9]+\.)*10\.128\.32\.176:3000/],
  //   origin: [/(?:[a-zA-Z0-9]+\.)*localhost:3000/, /(?:[a-zA-Z0-9]+\.)*soccermass/, /(?:[a-zA-Z0-9]+\.)*10\.128\.32\.176:3000/],
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  // "Access-Control-Allow-Methods"
  // allowedOrigins,
  methods: ["GET, POST, PUT, DELETE, OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
  // if (origin === "http://localhost:3000" || origin === "https://www.soccermass.com") {
  //   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  //   res.header("Access-Control-Allow-Credentials", "true"); // If credentials are required
  //   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  //   res.header("Access-Control-Allow-Origin", origin); // Replace with the appropriate origin
  // }
};

router.route("/auth").post(personal.auth);
router.route("/logout").get(personal.logout);
router.route("/cookie").get(personal.cookie);
router.route("/add_account").post(personal.addAccount);
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
//
//  export router

// module.exports = router;

export default router;
