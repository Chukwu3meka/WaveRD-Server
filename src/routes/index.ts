import { Application } from "express";

import infoRoute from "./info";
import publicRoute from "./public";
import apihubRoute from "./apihub";
import consoleRoute from "./console";
import gamesRoute from "./games";
import accountsRoute from "./accounts";

import cors from "cors";
import corsOptions from "../utils/corsOptions";
import routeGuard from "../middleware/routeGuard";
import publicGuard from "../middleware/publicGuard";
import consoleGuard from "../middleware/consoleGuard";

export default (app: Application) => {
  app.use(`${process.env.STABLE_VERSION}/info/`, cors(corsOptions), infoRoute);
  app.use(`${process.env.STABLE_VERSION}/apihub/`, cors(corsOptions), apihubRoute);
  app.use(`${process.env.STABLE_VERSION}/accounts/`, cors(corsOptions), accountsRoute);
  app.use(`${process.env.STABLE_VERSION}/games/`, cors(corsOptions), routeGuard, gamesRoute);
  app.use(`${process.env.STABLE_VERSION}/public/`, cors(corsOptions), publicGuard, publicRoute);
  app.use(`${process.env.STABLE_VERSION}/console/`, cors(corsOptions), consoleGuard, consoleRoute);

  // app.use("/api/v1/console/", cors(corsOptions.accounts), console);
  // app.use("/api/v1/accounts/", cors(corsOptions.accounts), accounts); // <= public console

  // app.use("*", createProxyMiddleware({ target: "http://localhost:3000", changeOrigin: true })); // ? Fallback URL redirects to client (web page)
  // app.use("*", createProxyMiddleware({ target: "localhost:3000", changeOrigin: true })); // ? Fallback URL redirects to client (web page)
};
