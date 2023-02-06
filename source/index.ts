import "dotenv/config";

import cors from "cors";
import express, { Request } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";

import passport from "./utils/passport";
import appRoutes from "./routes"; // enable app access database

import subDomains from "./utils/subDomains";

const server = async () => {
  try {
    const app = express(),
      port = process.env.PORT || 5000;

    app.use(cors());

    // // app.options("*", cors()); // include before other routes
    // const myLogger = function (req: Request, res, next) {
    //   console.log("LOGGED", req.method, req.body, req.url);
    //   return res.status(200).json({ o: "ss" });
    //   // next();
    // };

    app.use(cookieParser());
    // app.use(myLogger);
    app.use(bodyParser.json({ limit: "7mb" }));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieSession({ secret: process.env.SECRET }));

    app.use(passport.initialize());
    app.use(passport.session());

    subDomains(app); // <= handle request redirect from specified sub domain
    appRoutes(app); // app routes goes here

    app.listen(port, () => console.log(`SoccerMASS:::listening on port ${port}`));
  } catch (error: any) {
    console.log("SoccerMASS Server Error", (process.env.NODE !== "production" && (error.message as string)) || error);
  }
};

server();
