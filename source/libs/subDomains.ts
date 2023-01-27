import { Request, Response, NextFunction } from "express";

const subDomains = (app: any) => {
  app.all("*", function (req: Request, res: Response, next: NextFunction) {
    if (req.headers.host == `v1.${process.env.SERVER_DOMAIN}`) req.url = `/v1${req.url}`; // ? <= direct call from app
    if (req.headers.host == `api.${process.env.SERVER_DOMAIN}`) req.url = `/api${req.url}`; // ?  <= external call to apihub

    next();
  }); //Port is important if the url has it
};

export default subDomains;
