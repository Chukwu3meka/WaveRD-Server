import express from "express";

// handlers
import * as apihub from "../handlers/apihub";
import hubGuard from "../middleware/hubGuard";
import timeout from "../middleware/timeout";

const router = express.Router({ caseSensitive: true, strict: true });

// internal
router.route("/endpoints").get(apihub.endpoints);
router.route("/endpoints/categories").get(apihub.categories);
router.route("/endpoints/:id").get(apihub.endpoint);
router.route("/endpoints/categories/:category").get(apihub.categories);

// external
router.route("/clubs/random").get(hubGuard, apihub.randomClubs);
router.route("/clubs/:id").get(hubGuard, apihub.club);
router.route("/players/random").get(hubGuard, apihub.randomPlayers);
// router.route("/:club/players").get(hub.clubPlayers);

export default router;
