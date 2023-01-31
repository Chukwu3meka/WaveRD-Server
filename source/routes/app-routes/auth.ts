import express from "express";

import * as auth from "../../handlers/app_handlers/auth";

const router = express.Router();

router.route("/signin").post(auth.signin);
router.route("/signup").post(auth.signup);
// router.route("/:club/players").get(club.clubPlayers);

export default router;