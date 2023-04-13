import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import { catchError } from "../utils/handlers";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookie = req.cookies.SoccerMASS;
    if (!cookie) throw { message: "User not Authenticated" };

    let grantAccess = false;

    jwt.verify(cookie, <string>process.env.SECRET, async (err: any, decoded: any) => {
      if (err || !decoded) return (grantAccess = false);
      const { role, fullName, handle } = decoded;

      if (role && fullName && handle) {
        req.body = { ...req.body, auth: { role, fullName, handle } };
        grantAccess = true;
        return;
      }
    });

    if (grantAccess) return next(); //Port is important if the url has it

    throw { message: "Invalid Cookie" };
  } catch (err: any) {
    return catchError({ res, err, status: 401, message: "User not Authenticated" });
  }
};
