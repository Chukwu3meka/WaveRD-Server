import express from "express";

import * as club from "../handlers/v1/club";

const router = express.Router();

router.route("/:club/players").get(club.clubPlayers);
// router.route("/signup").get(handler.playersInClub);

export default router;
