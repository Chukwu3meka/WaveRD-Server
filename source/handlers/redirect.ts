import { NextFunction, Request, Response } from "express";
import { catchError } from "../utils/serverFunctions";

export const redirectToClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.redirect(301, process.env.CLIENT as string);
  } catch (err) {
    return catchError({ res, err, message: "unable to locate masses" });
  }
};
