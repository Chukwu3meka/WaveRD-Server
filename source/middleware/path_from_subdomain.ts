import { Request, Response, NextFunction } from "express";

const subDomains = (app: any) => {
  app.all("*", function (req: Request, res: Response, next: NextFunction) {
    if (req.headers.host == `hub.${process.env.SERVER_DOMAIN}`) req.url = `/hub${req.url}`; // ?  <= calls to SoccerMASS API Hub
    if (req.headers.host == `logs.${process.env.SERVER_DOMAIN}`) req.url = `/logs${req.url}`; // ?  <= SoccerMASS Internal calls to logs
    if (req.headers.host == `game.${process.env.SERVER_DOMAIN}`) req.url = `/game${req.url}`; // ?  <= SoccerMASS direct call from Manager
    if (req.headers.host == `accounts.${process.env.SERVER_DOMAIN}`) req.url = `/accounts${req.url}`; // ? <= SoccerMASS Internal/External calls for accounts

    next();
  }); //Port is important if the url has it
};

export default subDomains;
