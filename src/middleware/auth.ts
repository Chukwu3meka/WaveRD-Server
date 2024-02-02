import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import { catchError, getIdFromSession } from "../utils/handlers";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookie = req.cookies.SSID;
    if (!cookie) throw { message: "User not Authenticated" };

    let errMessage;

    jwt.verify(cookie, <string>process.env.JWT_SECRET, async (err: any, decoded: any) => {
      if (err) errMessage = "Invalid Cookie";
      if (!decoded) errMessage = "Token not available";

      const { session } = decoded;

      if (session) {
        const id = getIdFromSession(session);
        if (!id) throw { message: "Suspicious token" };

        req.body = { ...req.body, auth: { id, session } };
        errMessage = true;
        return;
      }

      errMessage = "Broken Authentication";
    });

    if (!!errMessage) return next(); //Port is important if the url has it

    throw { message: errMessage };
  } catch (err: any) {
    res.status(401).json({ success: false, message: `User not Authenticated`, data: null });

    err.respond = false;
    return catchError({ res, err });
  }
};
