import { Request, Response, NextFunction } from "express";

import { catchError } from "../utils/handlers";
import { ALL_REQUEST, DAILY_STAT } from "../models/logs";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestOrigin = req.url,
      requestHeaderHost = req.headers.host?.split(".")[0].split(".")[0];

    // ? "Translating subdomains into valid server paths"
    if (req.headers.host?.startsWith("srv")) {
      if (req.headers.host == `srv-apihub.${process.env.SERVER_DOMAIN}`) req.url = `/api/apihub${req.url.replace("/api", "")}`; // ?  <= calls to SoccerMASS API Hub
      if (req.headers.host == `srv-logs.${process.env.SERVER_DOMAIN}`) req.url = `/api/logs${req.url.replace("/api", "")}`; // ?  <= SoccerMASS Internal calls to logs
      if (req.headers.host == `srv-manager.${process.env.SERVER_DOMAIN}`) req.url = `/api/manager${req.url.replace("/api", "")}`; // ?  <= SoccerMASS direct call from Manager
      if (req.headers.host == `srv-accounts.${process.env.SERVER_DOMAIN}`) req.url = `/api/accounts${req.url.replace("/api", "")}`; // ? <= SoccerMASS Internal/External calls for accounts
    } else {
      req.url = req.url.replace("/api/srv-", "/api/");
    }

    //  ? "Server request monitoring system"
    const endpoint = requestOrigin.startsWith("/api/") ? requestOrigin.replace("/api/srv-", "").split("/").slice(1).join("/") : req.url,
      /* Since we're setting cookie from the backend with the 'http only' flag, The client and server needs to be on the same domain and same port,
      Else server would be blocked by client from setting cookie, That's why we've allowed direct calls to the server without subdomain
      So any request without subdomain is assumed to be for accounts       */
      subdomain = requestHeaderHost?.startsWith("srv-") ? requestHeaderHost.replace("srv-", "") : "accounts";

    req.body.endpoint = `${subdomain}/${endpoint.split("?")[0].replace("api/", "")}`;
    if (process.env.NODE_ENV === "development") {
      const currHour = new Date().getHours(),
        currMinute = new Date().getMinutes();

      console.log(`${currHour}:${currMinute}${currHour >= 12 ? "PM" : "AM"} <<>> New request for ${req.body.endpoint}`);
    }

    await ALL_REQUEST.create({ endpoint, subdomain });

    //  ? "Daily Records of Server Stat"
    await DAILY_STAT.findOneAndUpdate(
      { date: new Date().toDateString() },
      {
        $inc: {
          "subdomains.apihub": subdomain === "apihub" ? 1 : 0,
          "subdomains.logs": subdomain === "logs" ? 1 : 0,
          "subdomains.manager": subdomain === "manager" ? 1 : 0,
          "subdomains.accounts": subdomain === "accounts" ? 1 : 0,
        },
      },
      { upsert: true }
    );

    if (req.body && req.body.email) req.body.email = req.body.email.toLowerCase(); // ? Make email lower case for all request

    next(); //Port is important if the url has it
  } catch (err: any) {
    return catchError({ res, err });
  }
};
