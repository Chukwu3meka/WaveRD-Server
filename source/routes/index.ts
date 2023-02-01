import appRoutes from "./appRoutes";

import { redirectToWeb } from "../utils/handlers";

export default (app: any) => {
  app.all("/", redirectToWeb); // ? <=  Redirect calls to Server Homepage

  appRoutes(app); //  <= App-API Request
};
