import express, { Request, Response } from "express";

// handlers
import * as managerHandler from "../handlers/games";
import { codes } from "../utils/codes";

const router = express.Router({ caseSensitive: true, strict: true });

router.route("/get-profile").get(managerHandler.getProfile);

export default router;
