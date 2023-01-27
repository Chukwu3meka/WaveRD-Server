import express from "express";
import { Request, Response } from "express";

const router = express.Router();

router.route("/").all((req: Request, res: Response) => {
  console.log("asdsadsa");
  res.writeHead(302, { Location: process.env.CLIENT_BASE_URL }).end();
});
// router.route("/signup").post(signup);
// router.route("/:club/players").get(club.clubPlayers);

export default router;
