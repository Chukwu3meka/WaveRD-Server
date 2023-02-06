import "dotenv/config";

import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";

import appRoutes from "./routes"; // enable app access database

import passport from "./utils/passport";
import path_from_subdomain from "./middleware/path_from_subdomain";

const server = async () => {
  try {
    const app = express(),
      port = process.env.PORT || 5000;

    app.use(cors());
    app.use(cookieParser());
    app.use(bodyParser.json({ limit: "7mb" }));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieSession({ secret: process.env.SECRET }));

    // middleware
    app.use(passport.initialize());
    app.use(passport.session());

    // Apply the middleware to all incoming requests
    app.use(path_from_subdomain);

    // subDomainToRoute(app); // <= handle request redirect from specified sub domain
    appRoutes(app); // app routes goes here

    app.listen(port, () => console.log(`SoccerMASS:::listening on port ${port}`));
  } catch (error: any) {
    console.log("SoccerMASS Server Error", (process.env.NODE !== "production" && (error.message as string)) || error);
  }
};

server();
