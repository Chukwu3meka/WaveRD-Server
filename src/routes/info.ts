import express from "express";

// handlers
import * as handler from "../handlers/info";

const router = express.Router({ caseSensitive: true, strict: true });

router.route("/keep-awake").get(handler.keepAwake);
router.route("/contact-us").post(handler.contactUs);

export default router;
