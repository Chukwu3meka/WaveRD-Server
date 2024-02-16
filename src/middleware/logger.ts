import { format } from "date-fns";
import { Request, Response, NextFunction } from "express";

import { catchError, sleep } from "../utils/handlers";
import { ALL_REQUEST, DAILY_REQUEST_STAT } from "../models/console";

export default async (req: Request, res: Response, next: NextFunction) => {
  // ? Simulate production delay due to network latency
  if (process.env.NODE_ENV === "development") await sleep(0.3);

  try {
    const { method, url: endpoint } = req,
      localTime = format(new Date(), "pp"),
      displayTime = localTime.split(" ")[0];

    console.log(`${displayTime} ${method} >> ${endpoint}`);

    if (endpoint.startsWith("/v1/")) {
      const [, version, domain, ...fullPath] = endpoint.split("/"),
        path = fullPath.join("");

      if (version && domain && path) {
        await ALL_REQUEST.create({ version, domain, path });

        if (req.body && req.body.email) req.body.email = req.body.email.toLowerCase(); // ? Make email lower case for all request

        //  ? "Daily Records of Server Stat"
        await DAILY_REQUEST_STAT.findOneAndUpdate(
          { date: new Date().toDateString() },
          {
            $inc: {
              apihub: domain === "apihub" ? 1 : 0,
              manager: domain === "manager" ? 1 : 0,
              console: domain === "console" ? 1 : 0,
              accounts: domain === "accounts" ? 1 : 0,
            },
          },
          { upsert: true }
        );

        req.body.request = { endpoint, version, domain, path };

        // ? Trim Request body
        const valuesToTrim = ["email", "name", "password", "handle"];
        for (const value of valuesToTrim) {
          if (req.body[value]) {
            req.body[value] = req.body[value].trim();
          }
        }

        return next();
      }

      throw { message: "invalid endpoint", status: 503, sendError: true };
    }

    throw { message: "invalid endpoint", status: 404, sendError: true };
  } catch (err: any) {
    return catchError({ res, err });
  }
};
