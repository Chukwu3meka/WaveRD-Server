import cors from "cors";
import { Application } from "express";
// import { createProxyMiddleware } from "http-proxy-middleware";

// utils
import * as corsOptions from "../utils/corsOptions";

// routes
import apihub from "./apihub";
import console from "./console";
import accounts from "./accounts";

export default (app: Application) => {
  // app.use("/api/v1/console/", cors(corsOptions.accounts), console);
  // app.use("/api/v1/accounts/", cors(corsOptions.accounts), accounts); // <= public console
  app.use("/v1/console/", console);
  app.use("/v1/accounts/", accounts); // <= public console
  app.use("/v1/apihub/", cors(corsOptions.accounts), apihub); // <= public console

  // app.use("*", createProxyMiddleware({ target: "http://localhost:3000", changeOrigin: true })); // ? Fallback URL redirects to client (web page)
  // app.use("*", createProxyMiddleware({ target: "localhost:3000", changeOrigin: true })); // ? Fallback URL redirects to client (web page)
};
