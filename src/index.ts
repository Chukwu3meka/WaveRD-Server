import "dotenv/config";

import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";

import routeHandlers from "./routes";
import logger from "./middleware/logger";
import header from "./middleware/header";
import passport from "./middleware/passport";
import twitterPassport from "./middleware/twitterPassport";

const PORT = process.env.PORT || 5000,
  SERVER_SECRET_KEY = process.env.SECRET,
  NODE_ENV = process.env.NODE_ENV === "development" ? "DEVELOPMENT" : "PRODUCTION";

const server = async () => {
  try {
    const app = express();

    app.use(cookieParser(SERVER_SECRET_KEY));
    app.use(bodyParser.json({ limit: "7mb" }));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieSession({ secret: SERVER_SECRET_KEY }));

    app.use(twitterPassport); // <= fix error with twitter passport
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(header); // <= Add no index for search engines
    
    app.use(logger);
    routeHandlers(app);

    app.listen(PORT, () => console.info(`SoccerMASS ${NODE_ENV} Server running on PORT:::${PORT}`));
  } catch (error: any) {
    console.log("SoccerMASS Server Error", (NODE_ENV === "DEVELOPMENT" && (error.message as string)) || error);
  }
};

server();
