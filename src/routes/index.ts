import cors from "cors";
import { Application } from "express";

// utils
import { redirectToWeb } from "../utils/handlers";
import * as corsOptions from "../utils/corsOptions";

// routes
import accounts from "./accounts";

export default (app: Application) => {
  // ? Personal Accounts
  app.use("/api/accounts/", cors(corsOptions.accounts), accounts);

  // ?

  // ? Redirect to Web === Fallback URL
  app.use("/", redirectToWeb);
};
