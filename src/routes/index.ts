import cors from "cors";
import { Application } from "express";

// utils
import { redirectToWeb } from "../utils/handlers";
import * as corsOptions from "../utils/corsOptions";

// routes
import accounts from "./accounts";
import console from "./console";

export default (app: Application) => {
  app.use("/v1/accounts/", cors(corsOptions.accounts), accounts);
  app.use("/v1/console/", cors(corsOptions.accounts), console);

  app.use("*", redirectToWeb); // ? Fallback URL redirects to client (web home page)
};
