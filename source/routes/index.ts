import appRoutes from "./appRoutes";

import { redirectToWeb } from "../utils/handlers";

export default (app: any) => {
  // ?  Redirect calls to Server Homepage
  app.all("/", redirectToWeb);
  app.all("/api", redirectToWeb);

  appRoutes(app); //  <= App-API Request
};
