import cors from "cors";
import { Request, Response, NextFunction } from "express";

import { catchError } from "../utils/handlers";
import { ALL_REQUEST, DAILY_STAT } from "../models/logs";

export default async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.url);
  try {
    // ? "Translating subdomains into valid server paths"
    if (req.headers.host == `hub.${process.env.SERVER_DOMAIN}`) req.url = `/api/hub${req.url.replace("/api", "")}`; // ?  <= calls to SoccerMASS API Hub
    if (req.headers.host == `logs.${process.env.SERVER_DOMAIN}`) req.url = `/api/logs${req.url.replace("/api", "")}`; // ?  <= SoccerMASS Internal calls to logs
    if (req.headers.host == `game.${process.env.SERVER_DOMAIN}`) req.url = `/api/game${req.url.replace("/api", "")}`; // ?  <= SoccerMASS direct call from Manager
    if (req.headers.host == `accounts.${process.env.SERVER_DOMAIN}`) req.url = `/api/accounts${req.url.replace("/api", "")}`; // ? <= SoccerMASS Internal/External calls for accounts

    //  ? "Server request monitoring system"
    const endpoint = req.url,
      origin = req.headers.origin,
      subdomain = req.headers.host?.split(".")[0];

    await ALL_REQUEST.create({ endpoint, subdomain });

    //  ? "Daily Records of Server Stat"

    await DAILY_STAT.findOneAndUpdate(
      { date: new Date().toDateString() },
      {
        $inc: {
          "subdomains.hub": subdomain === "hub" ? 1 : 0,
          "subdomains.logs": subdomain === "logs" ? 1 : 0,
          "subdomains.game": subdomain === "game" ? 1 : 0,
          "subdomains.accounts": subdomain === "accounts" ? 1 : 0,
        },
      },
      { upsert: true }
    );

    // // // Ensure that request is coming from 'SoccerMASS' in production or 'localhost:3000' in dev
    // if (origin === "http://localhost:3000" || origin === "https://www.soccermass.com") {
    //   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    //   res.header("Access-Control-Allow-Credentials", "true"); // If credentials are required
    //   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //   res.header("Access-Control-Allow-Origin", origin); // Replace with the appropriate origin
    // }

    // cors({ preflightContinue: true });

    console.log({ endpoint, origin, subdomain });

    next(); //Port is important if the url has it
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: "Request didn't pass middleware test" });
  }
};
