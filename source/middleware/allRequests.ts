import { Request, Response, NextFunction } from "express";

import { catchError } from "../utils/handlers";
import { ALL_REQUEST, DAILY_STAT } from "../models/logs";

const allRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // ? "Translating subdomains into valid server paths"

    if (req.headers.host == `hub.${process.env.SERVER_DOMAIN}`) req.url = `/api/hub${req.url.replace("/api", "")}`; // ?  <= calls to SoccerMASS API Hub
    if (req.headers.host == `logs.${process.env.SERVER_DOMAIN}`) req.url = `/api/logs${req.url.replace("/api", "")}`; // ?  <= SoccerMASS Internal calls to logs
    if (req.headers.host == `game.${process.env.SERVER_DOMAIN}`) req.url = `/api/game${req.url.replace("/api", "")}`; // ?  <= SoccerMASS direct call from Manager
    if (req.headers.host == `accounts.${process.env.SERVER_DOMAIN}`) req.url = `/api/accounts${req.url.replace("/api", "")}`; // ? <= SoccerMASS Internal/External calls for accounts

    //  ? "Server request monitoring system"
    const subdomain = req.headers.host?.split(".")[0];
    const endpoint = req.url;

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

    next(); //Port is important if the url has it
  } catch (err: any) {
    if (process.env.NODE === "development") console.log(err.message);
    return catchError({ res, err, status: err.status, message: "Request didn't pass middleware test" });
  }
};

export default allRequests;
