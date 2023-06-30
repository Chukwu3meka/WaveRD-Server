import { Request, Response, NextFunction } from "express";

import { catchError } from "../utils/handlers";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { "x-soccermass-host": host, "x-soccermass-key": key } = req.headers;

    // While in experimental phase
    if (host !== "SoccerMASS-2018" || key !== "SoccerMASS-APIHUB-2023") throw { message: "Invalid Header API Host/Key", error: true };

    return next();
  } catch (err: any) {
    return catchError({ res, err });
  }
};
