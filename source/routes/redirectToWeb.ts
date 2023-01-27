import express from "express";
const router = express.Router();

import { Request, Response } from "express";

// export default async ;

router.route("*").all((req: Request, res: Response) => res.writeHead(302, { Location: process.env.CLIENT_BASE_URL }).end());
// router.route("/signup").post(signup);
// router.route("/:club/players").get(club.clubPlayers);

export default router;
