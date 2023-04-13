import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import { catchError } from "../utils/handlers";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookie = req.cookies.SoccerMASS;
    if (!cookie) throw { message: "User not Authenticated" };
    return jwt.verify(cookie, <string>process.env.SECRET, async (err: any, decoded: any) => {
      if (err) throw { message: "Suspicious token" };
      if (!decoded) throw { message: "Token not available" };
      const { role, fullName, handle } = decoded;
      if (role && fullName && handle) return next(); //Port is important if the url has it
      throw { message: "Invalid Cookie" };
    });
  } catch (err: any) {
    return catchError({ res, err, status: 401, message: "User not Authenticated" });
  }
};
