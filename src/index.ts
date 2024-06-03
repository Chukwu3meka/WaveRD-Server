import "dotenv/config";
import { styleText } from "util";

import express from "express";
import bodyParser from "body-parser";
import routeHandlers from "./routes";
import logger from "./middleware/logger";
import header from "./middleware/header";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import passport from "./middleware/passport";
import twitterPassport from "./middleware/twitterPassport";

const PORT = process.env.PORT || 5000,
  SERVER_SECRET_KEY = process.env.SECRET,
  NODE_ENV = process.env.NODE_ENV === "development" ? "DEV" : "PROD";

const server = async () => {
  try {
    const app = express();

    app.use(cookieParser(SERVER_SECRET_KEY));
    app.use(bodyParser.json({ limit: "7mb" }));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieSession({ secret: SERVER_SECRET_KEY }));

    app.use(twitterPassport); // <= fix error with twitter passport
    app.use(passport.initialize()); // <=
    app.use(passport.session()); // <=
    app.use(header); // <= Add no index for search engines
    app.use(logger); // <=

    switch (NODE_ENV) {
      case "PROD":
        if (!process.env.API_VERSION) throw {};
        routeHandlers(app);
        break;

      case "DEV":
        process.env.API_VERSION = "v1";
        routeHandlers(app);
        break;

      default:
        break;
    }

    app.listen(PORT, () => console.info(styleText("green", `Wave Research ${NODE_ENV} running on PORT:::${PORT}`)));
  } catch (error: any) {
    console.log(`Wave Research ${NODE_ENV} Error`, (NODE_ENV === "DEV" && (error.message as string)) || error);
  }
};

server();
