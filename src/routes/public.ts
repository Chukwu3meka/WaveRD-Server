import express from "express";
import * as handlers from "../handlers/public";

const router = express.Router({ caseSensitive: true, strict: true });

// ? external/public routes
router.route("/clubs/random").get(handlers.randomClubs);
router.route("/clubs/:id").get(handlers.club);
// router.route("/:club/players").get(handlers.clubPlayers);

router.route("/players/random").get(handlers.randomPlayers);

export default router;
