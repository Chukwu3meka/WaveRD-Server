import express from "express";

import * as handler from "../handlers/redirect/client";

const router = express.Router();

router.route("/").get(handler.redirectToClient);
router.route("/v1").get(handler.redirectToClient);
router.route("/game").get(handler.redirectToClient);

export default router;
