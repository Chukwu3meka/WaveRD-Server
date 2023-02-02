import express from "express";

import * as profiles from "../../handlers/appHandlers/profiles";

const router = express.Router();

router.route("/emailTaken").post(profiles.emailTaken);
router.route("/register").post(profiles.register);

export default router;
