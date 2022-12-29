import express from "express";

import signin from "../handlers/auth/signin";
import signup from "../handlers/auth/signup";

const router = express.Router();

router.route("/signup").post(signin);
router.route("/signup").post(signup);

export default router;
