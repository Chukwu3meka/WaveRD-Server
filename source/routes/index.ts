import express from "express";
const router = express.Router();

import apihub from "./apihub";
import auth from "./auth";
import admin from "./admin";
// import redirect from "./redirect";
// import Club from "./club";
// import Mass from "./mass";
// import Admin from "./admin";
// import Trend from "./trend";
// import oAuth from "./oAuth";
// import Player from "./player";
// import Profile from "./profile";

import redirectToWeb from "../handlers/others/redirectToWeb";

export default (app: any) => {
  app.use("/", router.route("/").all(redirectToWeb)); // domain
  app.use("/v1", router.route("/").all(redirectToWeb)); // v1.domain
  app.use("/api", router.route("/").all(redirectToWeb)); // api.domain

  app.use("/api/players", apihub); // domain

  app.use("/api", apihub); // domain

  // app.use("/apihub", redirect);

  // app.use("/apihub/api", apihub); // api.domain

  app.use("/api/auth/signin", (req: Request, res: Response, next: NextFunction) => {
    console.log(req.headers.host, req.method);
    return res.status(200).json("api successfull signin");
  });

  // app.use("/api/v1", );

  // app.use("/v1", redirect);
  // // app.use("/v1/auth", auth);
  // app.use("/v1/admin", admin);
  app.use("/v1/auth/signin", (req: Request, res: Response, next: NextFunction) => {
    console.log(req.headers.host, req.method);
    return res.status(200).json("v1 successfull signin");
  });

  // app.use("/server", redirect);

  // app.use("/club/", routes.Club);
  // app.use("/mass/", routes.Mass);
  // app.use("/auth/", routes.oAuth);ff
  // app.use("/trend/", routes.Trend);
  // app.use("/admin/", routes.Admin);
  // app.use("/player/", routes.Player);
  // app.use("/profile/", routes.Profile);
};
