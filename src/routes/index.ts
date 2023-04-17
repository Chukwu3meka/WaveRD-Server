import cors from "cors";
import { Application } from "express";

// utils
import { redirectToWeb } from "../utils/handlers";
import * as corsOptions from "../utils/corsOptions";

// routes
import personalAccounts from "./accounts/personal";

export default (app: Application) => {
  // ? Personal Accounts
  app.use("/api/accounts/personal/", cors(corsOptions.personalAccounts), personalAccounts);

  // ?

  // ? Redirect to Web === Fallback URL
  app.use("/", redirectToWeb);
};
