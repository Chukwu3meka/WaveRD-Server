import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

import { catchError } from "../../../utils/handlers";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookie = req.cookies.SoccerMASS;
    if (!cookie) throw { message: "User not Authenticated" };

    return jwt.verify(cookie, <string>process.env.SECRET, async (err: any, decoded: any) => {
      if (err) throw { message: "Suspicious token" };
      if (!decoded) throw { message: "Token not available" };

      const { role, fullName, handle } = decoded;

      if (role && fullName && handle) {
        const data = { success: true, message: `Cookie retrieved successfully`, payload: { role, fullName, handle } };
        return res.status(200).clearCookie("session").clearCookie("session.sig").json(data);
      } else {
        throw { message: "Invalid Cookie" };
      }
    });
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: err.message });
  }
};
