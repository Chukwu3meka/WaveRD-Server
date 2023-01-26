import express from "express";

import signin from "../handlers/auth/signin";
import signup from "../handlers/auth/signup";

const router = express.Router();

router.route("/signin").post(signin);
router.route("/signup").post(signup);

export default router;
