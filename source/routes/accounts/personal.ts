import express, { Router } from "express";

import * as handler from "../../handlers/accounts/personal";
// import  handler from "../../handlers/accounts/personal";

const router = express.Router();

router.route("/emailTaken").post(handler.emailTaken);
router.route("/register").post(handler.register);
router.route("/signin").post(handler.login);
// router.route("/:club/players").get(club.clubPlayers);

export default router;
