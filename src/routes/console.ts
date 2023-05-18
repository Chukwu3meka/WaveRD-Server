import express from "express";

// middleware
import securedRoute from "../middleware/verifyToken";

// handlers
import * as handler from "../handlers/console";

const router = express.Router({ caseSensitive: true, strict: true });

router.route("/contact-us").post(handler.contactUs);

export default router;
