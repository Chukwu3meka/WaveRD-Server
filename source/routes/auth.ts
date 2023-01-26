import express from "express";

import signin from "../handlers/v1/auth/signin";
import signup from "../handlers/v1/auth/signup";

const router = express.Router();

router.route("/signin").post(signin);
router.route("/signup").post(signup);

export default router;
