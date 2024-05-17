import express from "express";

// handlers
import * as apihub from "../handlers/apihub";
import hubGuard from "../middleware/hubGuard";
import timeout from "../middleware/timeout";

const router = express.Router({ caseSensitive: true, strict: true });

// internal
router.route("/endpoints").get(apihub.endpoints);
router.route("/endpoints/categories").get(apihub.categories);

// router.route("/endpoints/categories/:category").get(apihub.categories);
router.route("/endpoints/:path").get(apihub.endpoint);

export default router;
