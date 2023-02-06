import auth from "./auth";
import profiles from "./profiles";

import { redirectToWeb } from "../../utils/handlers";

export default (app: any) => {
  // ? Redirect Calls
  app.all("/app-api", redirectToWeb);

  // ? App-API Request
  app.use("/app-api/api/auth", auth);
  app.use("/app-api/api/profiles", profiles);
};
