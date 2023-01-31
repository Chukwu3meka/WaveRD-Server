import v1Auth from "./v1/auth";

import { Request, Response } from "express";
const redirectToWeb = (req: Request, res: Response) => res.writeHead(302, { Location: process.env.CLIENT_BASE_URL }).end();

export default (app: any) => {
  // ? Redirect Calls
  app.all("/", redirectToWeb); // Server Homepage
  app.all("/app-api", redirectToWeb); // app Homepage
  app.all("/hub-api").redirectToWeb; // hub Homepage
  app.all("/game-api").redirectToWeb; // game Homepage

  // ? App-API Request
  app.use("/app-api/auth", v1Auth);

  // ? Hub-API Request
  // ? Game-API Request
};

//
