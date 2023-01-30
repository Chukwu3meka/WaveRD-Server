import "dotenv/config";
import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";

import passport from "./libs/passport";
import appRoutes from "./routes"; // enable app access database
// import mongoose from "./libs/mongoose"; // enable app access database

import envInitialized from "./libs/envInitialized";
import subDomains from "./libs/subDomains";
import * as models from "./models"; // enable app access da/tabase
// import subDomainHandler from "./middleware/sub_domain_handler";

// import subDomainHandler from "./libs/sub_domain_handler";

const server = async () => {
  try {
    envInitialized(); // detect app access env;
    models.config(); // enable app access database

    const app = express(),
      port = process.env.PORT || 5000;

    app.use(cors());
    app.use(cookieParser());
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
