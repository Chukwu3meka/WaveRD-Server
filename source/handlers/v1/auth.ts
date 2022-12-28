import { NextFunction, Request, Response } from "express";
import { catchError } from "../../utils/serverFunctions";

export const signin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.status(200).json("signin");
  } catch (err) {
    return catchError({ res, err, message: "unable to locate masses" });
  }
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.status(200).json("signup");
  } catch (err) {
    return catchError({ res, err, message: "unable to locate masses" });
  }
};
