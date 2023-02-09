import express from "express";

import * as personal from "../../handlers/accounts/personal";

const router = express.Router();

router.route("/email_exists").post(personal.emailExists);
router.route("/handle_exists").post(personal.handleExists);
router.route("/add_account").post(personal.addAccount);
router.route("/auth").post(personal.auth);
router.route("/cookie").get(personal.cookie);
// router.route("/:club/players").get(club.clubPlayers);

export default router;
