import cors from "cors";
import { Application } from "express";

// utils
import { redirectToWeb } from "../utils/handlers";
import * as corsOptions from "../utils/corsOptions";

// routes
import accounts from "./accounts";

export default (app: Application) => {
  app.use("/v1/accounts/", cors(corsOptions.accounts), accounts);

  app.use("*", redirectToWeb); // ? Fallback URL redirects to client (web home page)
};
