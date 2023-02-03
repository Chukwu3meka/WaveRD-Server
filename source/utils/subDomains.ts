import { Request, Response, NextFunction } from "express";

const subDomains = (app: any) => {
  app.all("*", function (req: Request, res: Response, next: NextFunction) {
    if (req.headers.host == `app-api.${process.env.SERVER_DOMAIN}`) req.url = `/app-api${req.url}`; // ? <= direct call from app
    if (req.headers.host == `hub-api.${process.env.SERVER_DOMAIN}`) req.url = `/hub-api${req.url}`; // ?  <= calls to soccer manager
    if (req.headers.host == `game-api.${process.env.SERVER_DOMAIN}`) req.url = `/game-api${req.url}`; // ?  <= external call to apihub

    next();
  }); //Port is important if the url has it
};

export default subDomains;
