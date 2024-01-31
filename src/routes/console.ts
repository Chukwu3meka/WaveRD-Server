import express from "express";

// middleware
import securedRoute from "../middleware/auth";

// handlers
import * as handler from "../handlers/console";

const router = express.Router({ caseSensitive: true, strict: true });

router.route("/contact-us").post(handler.contactUs);
router.route("/keep-awake").get(handler.keepAwake);

export default router;
