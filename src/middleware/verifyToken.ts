import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import { catchError, getIdFromSession } from "../utils/handlers";

export default async (req: Request, res: Response, next: NextFunction) => {
  console.log("dsfdsfdfdsfd");

  try {
    const cookie = req.cookies.SSID;
    if (!cookie) throw { message: "User not Authenticated" };

    let grantAccess = false;

    jwt.verify(cookie, <string>process.env.SECRET, async (err: any, decoded: any) => {
      if (err || !decoded) return (grantAccess = false);

      const { fullName, handle, session } = decoded;

      if (fullName && handle && session) {
        req.body = { ...req.body, auth: { id: getIdFromSession(session), fullName, handle } };
        grantAccess = true;
        return;
      }
    });

    if (grantAccess) return next(); //Port is important if the url has it

    throw { message: "Invalid Cookie" };
  } catch (err: any) {
    return catchError({ res, err });
  }
};
