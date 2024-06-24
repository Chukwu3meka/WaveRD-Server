import { codes } from "../utils/codes";
import express, { Request, Response } from "express";

const router = express.Router({ caseSensitive: true, strict: true });

// ? fallback route
router.route("/*").all((req: Request, res: Response) => {
  return res.status(404).json({ success: false, message: "Route not found", data: codes["Route not Found"] });
});

export default router;
