import { Request, Response, NextFunction } from "express";

const subDomainHandler = (app: any) => {
  const allowedMethods = ["get", "post"];

  for (const method of allowedMethods) {
    app[method]("*", function (req: Request, res: Response, next: NextFunction) {
      //Port is important if the url has it
      if (req.headers.host == `api.${process.env.SERVER_DOMAIN}`) {
        // for apihub
        req.url = "/api" + req.url;
      } else if (req.headers.host == `server.${process.env.SERVER_DOMAIN}`) {
        //for our soccermass
        req.url = "/server" + req.url;
      }
      next();
    });
  }
};

export default subDomainHandler;
