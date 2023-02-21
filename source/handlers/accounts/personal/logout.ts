import { catchError } from "../../../utils/handlers";
import { NextFunction, Request, Response } from "express";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookie = req.cookies.SoccerMASS;
    if (!cookie) throw { message: "User not Authenticated" };

    const data = { success: true, message: `Successful Logout`, payload: { status: "Logout Successful" } };

    return res.status(200).clearCookie("session").clearCookie("session.sig").clearCookie("SoccerMASS").json(data);
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: err.message });
  }
};
