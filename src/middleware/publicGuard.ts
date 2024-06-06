import { Request, Response, NextFunction } from "express";

import { catchError } from "../utils/handlers";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { "x-waverd-host": host, "x-waverd-key": key } = req.headers;

    // While in experimental phase
    if (host !== "Wave-Research-2018" || key !== "Wave-Research-APIHUB-2023") throw { message: "Invalid Header API Host/Key", sendError: true };

    return next();
  } catch (err: any) {
    return catchError({ res, err });
  }
};
