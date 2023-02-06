import personal from "./personal";

import { redirectToWeb } from "../../utils/handlers";

// const routes = require("./routes");

export default (app: any) => {
  // ? Redirect Calls
  app.all("/accounts", redirectToWeb);

  // ? App-API Request to Personal
  app.use("/accounts/api/personal", personal);
};
