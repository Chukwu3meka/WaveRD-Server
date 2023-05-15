import "dotenv/config";

import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";

import routeHandlers from "./routes";
import passport from "./middleware/passport";
import allRequests from "./middleware/requests";

const server = async () => {
  try {
    const app = express(),
      port = process.env.PORT || 5000;

    app.use(cookieParser(process.env.SECRET));
    app.use(bodyParser.json({ limit: "7mb" }));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieSession({ secret: process.env.SECRET }));

    // Apply the middleware to all incoming requests
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(allRequests); // <= handle all requests hitting server

    routeHandlers(app);

    app.listen(port, () => console.log(`SoccerMASS:::listening on port ${port}`));
  } catch (error: any) {
    console.log("SoccerMASS Server Error", (process.env.NODE_ENV !== "production" && (error.message as string)) || error);
  }
};

server();
