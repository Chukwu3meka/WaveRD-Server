import cors from "cors";
import { Application } from "express";
import corsOptions from "../utils/corsOptions"; // <= utils
import consoleGuard from "../middleware/consoleGuard";
// import { createProxyMiddleware } from "http-proxy-middleware";

// routes
import info from "./info";
import apihub from "./apihub";
import console from "./console";
import accounts from "./accounts";

export default (app: Application) => {
  app.use("/v1/info/", cors(corsOptions), info);
  app.use("/v1/apihub/", cors(corsOptions), apihub);
  app.use("/v1/accounts/", cors(corsOptions), accounts);
  app.use("/v1/console/", cors(corsOptions), consoleGuard, console);

  // app.use("/api/v1/console/", cors(corsOptions.accounts), console);
  // app.use("/api/v1/accounts/", cors(corsOptions.accounts), accounts); // <= public console

  // app.use("*", createProxyMiddleware({ target: "http://localhost:3000", changeOrigin: true })); // ? Fallback URL redirects to client (web page)
  // app.use("*", createProxyMiddleware({ target: "localhost:3000", changeOrigin: true })); // ? Fallback URL redirects to client (web page)
};
