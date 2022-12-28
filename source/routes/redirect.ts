import express from "express";

import * as handler from "../handlers/redirect";

const router = express.Router();

// if homepage is invoked, redirect user to SoccerMASS Web

router.route("/").get(handler.redirectToClient);
router.route("/v1").get(handler.redirectToClient);
router.route("/game").get(handler.redirectToClient);

export default router;
