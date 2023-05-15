import express from "express";

import * as hub from "../../handlers/apihub";

const router = express.Router();

router.route("/clubs/:id").get(hub.club);
// router.route("/:club/players").get(hub.clubPlayers);
// router.route("/email_exists").post(hub.clubDetails);
// router.route("/handle_exists").post(personal.handleExists);
// router.route("/add_account").post(personal.addAccount);
// router.route("/accounts").post(personal.auth);

export default router;
