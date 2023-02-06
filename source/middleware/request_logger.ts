import { Request, Response, NextFunction } from "express";

const path_from_subdomain = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.headers.host == `hub.${process.env.SERVER_DOMAIN}`) req.url = `/api/hub${req.url.replace("/api", "")}`; // ?  <= calls to SoccerMASS API Hub
    if (req.headers.host == `logs.${process.env.SERVER_DOMAIN}`) req.url = `/api/logs${req.url.replace("/api", "")}`; // ?  <= SoccerMASS Internal calls to logs
    if (req.headers.host == `game.${process.env.SERVER_DOMAIN}`) req.url = `/api/game${req.url.replace("/api", "")}`; // ?  <= SoccerMASS direct call from Manager
    if (req.headers.host == `accounts.${process.env.SERVER_DOMAIN}`) req.url = `/api/accounts${req.url.replace("/api", "")}`; // ? <= SoccerMASS Internal/External calls for accounts

    console.log(req.path, req.url);

    next(); //Port is important if the url has it
  } catch (error) {
    //
  }
};

export default path_from_subdomain;
