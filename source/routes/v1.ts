import express from "express";

import * as club from "../handlers/v1/club";
// import { auth, club } from "../handlers/v1";
// import auth from "../middleware/authentication";

const router = express.Router();
router.route("/:club/players").get(club.clubPlayers);
// router.route("/signup").get(handler.playersInClub);

export default router;
