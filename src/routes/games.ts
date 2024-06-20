import express from "express";

// handlers
import * as managerHandler from "../handlers/games";

const router = express.Router({ caseSensitive: true, strict: true });

router.route("/get-profile").get(managerHandler.getProfile);

export default router;
