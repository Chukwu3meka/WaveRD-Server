import cors from "cors";
import { Application } from "express";

// utils
import { redirectToWeb } from "../utils/handlers";
import * as corsOptions from "../utils/corsOptions";

// routes
import console from "./console";
import accounts from "./accounts";

export default (app: Application) => {
  app.use("/v1/console/", cors(corsOptions.accounts), console);
  app.use("/v1/accounts/", cors(corsOptions.accounts), accounts); // <= public console

  // app.use("/console/", cors(corsOptions.accounts), console); // <= private console

  app.use("*", redirectToWeb); // ? Fallback URL redirects to client (web home page)
};
