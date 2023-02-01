import auth from "./auth";

import { redirectToWeb } from "../../utils/handlers";

export default (app: any) => {
  // ? Redirect Calls
  app.all("/app-api", redirectToWeb);

  // ? App-API Request
  app.use("/app-api/auth", auth);
};
