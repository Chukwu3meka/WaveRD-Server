import express from "express";

import * as auth from "../../handlers/appHandlers/auth";

const router = express.Router();

router.route("/signin").post(auth.signin);
// router.route("/:club/players").get(club.clubPlayers);

export default router;
