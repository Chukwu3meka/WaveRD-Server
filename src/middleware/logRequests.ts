import { Request, Response, NextFunction } from "express";

import { catchError } from "../utils/handlers";
import { ALL_REQUEST, DAILY_STAT } from "../models/logs";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    // ? "Translating subdomains into valid server paths"
    if (req.headers.host == `srv-apihub.${process.env.SERVER_DOMAIN}`) req.url = `/api/apihub${req.url.replace("/api", "")}`; // ?  <= calls to SoccerMASS API Hub
    if (req.headers.host == `srv-logs.${process.env.SERVER_DOMAIN}`) req.url = `/api/logs${req.url.replace("/api", "")}`; // ?  <= SoccerMASS Internal calls to logs
    if (req.headers.host == `srv-manager.${process.env.SERVER_DOMAIN}`) req.url = `/api/manager${req.url.replace("/api", "")}`; // ?  <= SoccerMASS direct call from Manager
    if (req.headers.host == `srv-accounts.${process.env.SERVER_DOMAIN}`) req.url = `/api/accounts${req.url.replace("/api", "")}`; // ? <= SoccerMASS Internal/External calls for accounts

    //  ? "Server request monitoring system"
    const endpoint = req.url,
      subdomain = req.headers.host?.split(".")[0];

    await ALL_REQUEST.create({ endpoint, subdomain });

    //  ? "Daily Records of Server Stat"

    await DAILY_STAT.findOneAndUpdate(
      { date: new Date().toDateString() },
      {
        $inc: {
          "subdomains.apihub": subdomain === "srv-apihub" ? 1 : 0,
          "subdomains.logs": subdomain === "srv-logs" ? 1 : 0,
          "subdomains.manager": subdomain === "srv-manager" ? 1 : 0,
          "subdomains.accounts": subdomain === "srv-accounts" ? 1 : 0,
        },
      },
      { upsert: true }
    );

    next(); //Port is important if the url has it
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: "Request didn't pass middleware test" });
  }
};
