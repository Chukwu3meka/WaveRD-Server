import http from "http";
import cors from "cors";
import "dotenv/config";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import express from "express";

import passport from "./utils/passport";
import mongoose from "./utils/mongoose"; // enable app access database
import routes from "./routes"; // enable app access database

import envInitialized from "./utils/envInitialized";

const server = async () => {
  try {
    envInitialized();
    // import("./utils/envInitialized").; // enable app access database
    // oAuthMiddleware.config();
    // dotenv.config(); // enable reading from .env file
    // envInitialized(); // detect app access env;
    mongoose.config(); // enable app access database
    // require("./task"); // run task

    const app = express();
    // const server = http.Server(app);
    // const io = (module.exports.io = require("socket.io")(server));
    // const socketManager = require("./handlers/socketManager");

    app.use(cors());

    app.use(cookieParser());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json({ limit: "7mb" }));
    // app.use(cookieSession({ secret:process.env.SECRET, resave: true, saveUninitialized: true }));
    app.use(cookieSession({ secret: process.env.SECRET }));

    // app.use(passport.initialize());
    // app.use(passport.session());

    // if homepage is invoked, redirect user to SoccerMASS Web
    // app.use("/", (req: Request, res: Response) => res.redirect(301, process.env.CLIENT || ""));
    // app.use("/v1", (req: Request, res: Response) => res.redirect(301, process.env.CLIENT || ""));
    // app.use("/api", (req: Request, res: Response) => res.redirect(301, process.env.CLIENT || ""));

    // const routes = require("./routes");

    // routes(app);

    console.log("asdsads");

    // app.use("/club/", routes.Club);
    // app.use("/mass/", routes.Mass);
    // app.use("/auth/", routes.oAuth);ff
    // app.use("/trend/", routes.Trend);
    // app.use("/admin/", routes.Admin);
    // app.use("/player/", routes.Player);
    // app.use("/profile/", routes.Profile);

    // io.on("connection", socketManager);

    // server.listen(process.env.PORT, () => console.log(`SoccerMASS:::listening on port ${process.env.PORT}`));
    app.listen(process.env.PORT, () => console.log(`SoccerMASS:::listening on port ${process.env.PORT}`));
  } catch (error: any) {
    console.log("SoccerMASS Server Error", (process.env.NODE !== "production" && (error.message as string)) || error);
  }
};

server();
