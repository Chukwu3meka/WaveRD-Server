import express from "express";

import signin from "../handlers/auth/signin";

const router = express.Router();

router.route("/signup").post(signin);

export default router;
