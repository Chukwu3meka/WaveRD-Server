import { NextFunction, Request, Response } from "express";
import { catchError } from "../utils/handlers";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.writeHead(302, { Location: process.env.CLIENT_BASE_URL }).end();
  } catch (err) {
    return catchError({ res, err, message: "unable to locate masses" });
  }
};
