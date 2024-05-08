import { codes } from "../utils/codes";
import * as handler from "../handlers/console";
import express, { Request, Response } from "express";

const router = express.Router({ caseSensitive: true, strict: true });

// Routes
router.route("/endpoints").get(handler.endpoints);

// ? fallback route
router.route("/*").get((req: Request, res: Response) => {
  return res.status(200).json({ success: true, message: new Date().toDateString(), data: codes["Invalid Console Route"] });
});

export default router;
