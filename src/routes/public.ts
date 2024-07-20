import express from "express";
import * as handlers from "../handlers/public";

const router = express.Router({ caseSensitive: true, strict: true });

// ? external/public routes
router.route("/clubs/random").get(handlers.randomClubs);
router.route("/clubs/:id").get(handlers.club);
router.route("/tournament/clubs/:division").get(handlers.getDivisionClubs);

// router.route("/:club/players").get(handlers.clubPlayers);

router.route("/players/random").get(handlers.randomPlayers);

router.route("/tournament").get(handlers.getTournament);

router.route("/others/reference-resolver").get(handlers.referenceResolver);

export default router;
