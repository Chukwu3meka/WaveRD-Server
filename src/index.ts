import "dotenv/config";

import { styleText } from "util";
import { capitalize } from "./utils/handlers";
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

const init_server = async () => {
  const APP = express(),
    APP_ENV = capitalize(process.env.NODE_ENV || ""),
    [NODE_ENV, SECRET_KEY, PORT] = [APP_ENV === "Test" ? "Preview" : APP_ENV, process.env.SECRET, process.env.PORT || 5000];

  try {
    if (!process.env.NODE_ENV) throw { message: "Invalid Node Enviroment" };
    if (!process.env.BASE_URL) throw { message: "Server URL is not specified" };
    if (!process.env.CLIENT_URL) throw { message: "Client URL is not specified" };
    if (!process.env.STABLE_VERSION) throw { message: "Application Version is undefined" };

    APP.use(cookieParser(SECRET_KEY));
    APP.use(bodyParser.json({ limit: "7mb" }));
    APP.use(bodyParser.urlencoded({ extended: true }));
    APP.use(cookieSession({ secret: SECRET_KEY }));

    APP.use(twitterPassport); // <= fix error with twitter passport
    APP.use(passport.initialize()); // <=
    APP.use(passport.session()); // <=
    APP.use(header); // <= Add no index for search engines
    APP.use(logger); // <= Application logger

    routeHandlers(APP);

    APP.listen(PORT, () => console.info(styleText("green", `Wave Research ${NODE_ENV} @ ${process.env.BASE_URL}${process.env.STABLE_VERSION}'`)));
  } catch (error: any) {
    if (NODE_ENV === "Development") console.log(`Wave Research`, (error.message as string) || error);
    await FAILED_REQUESTS.create({ data: (error.message as string) || "not available", error: error || null, request: NODE_ENV });
  }
};

init_server();
