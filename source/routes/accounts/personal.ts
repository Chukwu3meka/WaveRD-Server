import express from "express";

import * as personal from "../../handlers/accounts/personal";

const router = express.Router();

router.route("/email-taken").post(personal.emailTaken);
router.route("/add").post(personal.add);
router.route("/login").post(personal.login);
// router.route("/:club/players").get(club.clubPlayers);

export default router;
