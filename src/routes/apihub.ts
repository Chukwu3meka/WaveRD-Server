import express from "express";

// handlers
import * as apihub from "../handlers/apihub";

const router = express.Router({ caseSensitive: true, strict: true });

// routes
// router.route("/search-endpoints").get(apihub.searchEndpoints);
router.route("/endpoints/search").get(apihub.searchEndpoints);
router.route("/endpoints").get(apihub.getEndpoints);
router.route("/endpoints/:id").get(apihub.getEndpoint);

// router.route("/clubs/:id").get(hub.club);
// // router.route("/:club/players").get(hub.clubPlayers);
// // router.route("/email_exists").post(hub.clubDetails);
// // router.route("/handle_exists").post(personal.handleExists);
// // router.route("/add_account").post(personal.addAccount);
// // router.route("/accounts").post(personal.auth);

export default router;
