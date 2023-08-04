import express from "express";

// handlers
import * as apihub from "../handlers/apihub";
import hubGuard from "../middleware/hubGuard";

const router = express.Router({ caseSensitive: true, strict: true });

// routes
// router.route("/search-endpoints").get(apihub.searchEndpoints);

// internal
router.route("/endpoints/search").get(apihub.searchEndpoints);
router.route("/endpoints").get(apihub.endpoints);
router.route("/endpoints/:id").get(apihub.endpoint);

// external
router.route("/players/random").get(hubGuard, apihub.randomPlayers);
router.route("/clubs/random").get(hubGuard, apihub.randomClubs);
router.route("/clubs/:id").get(hubGuard, apihub.club);

// router.route("/:club/players").get(hub.clubPlayers);

export default router;
