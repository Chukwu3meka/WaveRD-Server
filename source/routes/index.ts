import v1Auth from "./v1/auth";

import redirectToWeb from "./redirectToWeb";
// import express, { Request, Response } from "express";

export default (app: any) => {
  // ? Redirect Calls
  app.use("/", redirectToWeb); // domain
  app.use("/app-api", redirectToWeb); // v1.domain
  app.use("/hub-api", redirectToWeb); // v1.domain
  app.use("/game-api", redirectToWeb); // api.domain

  // ? Internal Calls
  app.use("/app-api/auth", v1Auth);

  // app.use("/v1/auth/signin", (req: Request, res: Response) => {
  //   console.log(req.headers, req.method);
  //   return res.status(200).json("v1 successfull signin");
  // });

  // ? External Calls
  // ....
};
