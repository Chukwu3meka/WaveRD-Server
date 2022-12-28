import express from "express";

import * as handler from "../handlers/v1";
// import auth from "../middleware/authentication";

const router = express.Router();

// router.route("/signup").get(handler.playersInClub);
router.route("/:club/players").get(handler.clubPlayers);

export default router;
