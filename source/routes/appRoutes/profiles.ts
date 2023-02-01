import express from "express";

import * as profiles from "../../handlers/appHandlers/profiles";

const router = express.Router();

router.route("/emailTaken").post(profiles.emailTaken);

export default router;
