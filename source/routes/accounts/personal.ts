import express from "express";

import * as personal from "../../handlers/accounts/personal";

const router = express.Router();

router.route("/email-exists").post(personal.emailExists);
router.route("/addAccount").post(personal.addAccount);
router.route("/auth").post(personal.auth);
// router.route("/:club/players").get(club.clubPlayers);

export default router;
