import { catchError } from "../../../utils/handlers";
import { NextFunction, Request, Response } from "express";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.status(200).clearCookie("session").clearCookie("session.sig").clearCookie("SoccerMASS").redirect(`http://${process.env.CLIENT_DOMAIN}/`);
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: err.message });
  }
};
