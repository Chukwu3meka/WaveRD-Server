import { Request, Response, NextFunction } from "express";

import { catchError } from "../utils/handlers";
import { ALL_REQUEST, DAILY_REQUEST_STAT } from "../models/console";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const endpoint = req.url,
      endpointWithoutVersion = endpoint?.split(/\/v\d+/)[1]; // <= this matches any version - v1, v2, v3...

    // if (process.env.NODE_ENV === "development") {
    if (endpointWithoutVersion) {
      const date = new Date(),
        method = req.method,
        currHour = `${date.getHours()}`.padStart(2, "0"),
        currMeridan = date.getHours() >= 12 ? "PM" : "AM",
        currMinute = `${date.getMinutes()}`.padStart(2, "0");

      console.log(`${currHour}:${currMinute}${currMeridan} <<>> ${method} request for ${endpointWithoutVersion}`);
    }

    const [, version, domain, ...fullPath] = endpoint.split("/"),
      path = fullPath.join("");

    if (version) DAILY_REQUEST_STAT;

    if (version && domain && path) {
      await ALL_REQUEST.create({ version, domain, path });

      if (req.body && req.body.email) req.body.email = req.body.email.toLowerCase(); // ? Make email lower case for all request

      //  ? "Daily Records of Server Stat"
      await DAILY_REQUEST_STAT.findOneAndUpdate(
        { date: new Date().toDateString() },
        {
          $inc: {
            apihub: domain === "apihub" ? 1 : 0,
            logs: domain === "logs" ? 1 : 0,
            manager: domain === "manager" ? 1 : 0,
            accounts: domain === "accounts" ? 1 : 0,
          },
        },
        { upsert: true }
      );

      req.body.request = { endpoint, version, domain, path };
      return next();
    }
    throw { message: "invalid endpoint" };
  } catch (err: any) {
    return catchError({ res, err });
  }
};
