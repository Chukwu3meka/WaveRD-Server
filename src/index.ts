import "dotenv/config";

import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";

// import * as routes from "./routes";
import routes from "./routes";
import passport from "./middleware/passport";
import allRequests from "./middleware/allRequests";

const server = async () => {
  try {
    const app = express(),
      port = process.env.PORT || 5000;

    // app.use(cors());
    // cors({ preflightContinue: true });
    app.use(cookieParser(process.env.SECRET));
    app.use(bodyParser.json({ limit: "7mb" }));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieSession({ secret: process.env.SECRET }));

    // Apply the middleware to all incoming requests
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(allRequests); // <= handle all requests hitting server

    // appRoutes(app); //  app routes goes here

    // app.use(routes);
    routes(app);
    // app.use(
    //   "/api/accounts/personal/",
    //   () => {
    //     console.log("sadsa");
    //   },
    //   cors(corsOptions),
    //   routes.personalAccounts
    // );

    app.listen(port, () => console.log(`SoccerMASS:::listening on port ${port}`));
  } catch (error: any) {
    console.log("SoccerMASS Server Error", (process.env.NODE_ENV !== "production" && (error.message as string)) || error);
  }
};

server();
