import express from "express";

import * as auth from "../handlers/auth";

const router = express.Router();

router.route("/signup").post(auth.signup);

export default router;
