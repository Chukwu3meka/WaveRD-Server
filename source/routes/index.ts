import { Request, Response, NextFunction } from "express";
// import subdomain from "express-subdomain";

import v1 from "./v1";
import auth from "./auth";
import admin from "./admin";
import redirect from "./redirect";
// import Club from "./club";
// import Mass from "./mass";
// import Admin from "./admin";
// import Trend from "./trend";
// import oAuth from "./oAuth";
// import Player from "./player";
// import Profile from "./profile";

export default (app: any) => {
  // app.use(subdomain("api", router));

  app.use("/api", redirect);
  app.use("/api/v1", v1);
  app.use("/api/auth", auth);
  app.use("/api/admin", admin);
  app.use("/server/auth/signin", (req: Request, res: Response, next: NextFunction) => {
    console.log(req.headers.host, req.method);
    return res.status(200).json("admin successfull signin");
  });

  // app.use("/club/", routes.Club);
  // app.use("/mass/", routes.Mass);
  // app.use("/auth/", routes.oAuth);ff
  // app.use("/trend/", routes.Trend);
  // app.use("/admin/", routes.Admin);
  // app.use("/player/", routes.Player);
  // app.use("/profile/", routes.Profile);
};
