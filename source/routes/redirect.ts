import express from "express";

import * as handler from "../handlers/redirect/client";

const router = express.Router();

router.route("/").all(handler.redirectToClient);
router.route("/api").all(handler.redirectToClient);
// router.route("/game").all(handler.redirectToClient);

export default router;
