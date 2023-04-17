import hub from "./hub/index";
import accounts from "./accounts/index";

import { redirectToWeb } from "../utils/handlers";

export default (app: any) => {
  // ?  Redirect calls to Server Homepage
  app.all("/", redirectToWeb);
  app.all("/api", redirectToWeb);
  app.all("/accounts", redirectToWeb);
  app.all("/hub", redirectToWeb);

  accounts(app); //  <= App-API Request
  hub(app); //  <= API Hub Request
};
