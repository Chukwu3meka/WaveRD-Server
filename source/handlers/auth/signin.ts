import { NextFunction, Request, Response } from "express";
import { catchError } from "../../utils/handlers";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.status(200).json("successfull signin");
  } catch (err) {
    return catchError({ res, err, message: "unable to locate masses" });
  }
};
