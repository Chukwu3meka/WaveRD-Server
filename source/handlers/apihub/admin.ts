import { NextFunction, Request, Response } from "express";
import { catchError } from "../../utils/handlers";

export const admin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.status(200).json("sigin");
  } catch (err) {
    return catchError({ res, err, message: "unable to locate masses" });
  }
};
