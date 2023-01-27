import v1Auth from "./v1/auth";

import redirectToWeb from "./redirectToWeb";

export default (app: any) => {
  // ? Redirect Calls
  app.use("/", redirectToWeb); // domain
  app.use("/v1", redirectToWeb); // v1.domain
  app.use("/api", redirectToWeb); // api.domain

  // ? Internal Calls
  app.use("/v1/auth", v1Auth);

  // ? External Calls
  // ....
};
