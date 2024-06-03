import "dotenv/config";
import { styleText } from "util";
import { FAILED_REQUESTS } from "./models/info";

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

    if (!process.env.STABLE_VERSION) throw {};
    routeHandlers(app);

    app.listen(PORT, () => console.info(styleText("green", `Wave Research ${NODE_ENV} running on PORT:::${PORT}`)));
  } catch (error: any) {
    if (NODE_ENV === "DEV") console.log(`Wave Research`, (error.message as string) || error);
    await FAILED_REQUESTS.create({ data: (error.message as string) || "not available", error: error || null, request: NODE_ENV });
  }
};

server();
