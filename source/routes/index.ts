import accounts from "./accounts/index";

import { redirectToWeb } from "../utils/handlers";

export default (app: any) => {
  // ?  Redirect calls to Server Homepage
  app.all("/", redirectToWeb);
  app.all("/api", redirectToWeb);

  accounts(app); //  <= App-API Request
};
