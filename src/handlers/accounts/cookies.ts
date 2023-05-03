import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

import { PROFILE } from "../../models/accounts";
import { catchError, getIdFromSession } from "../../utils/handlers";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookie = req.cookies.SSID;
    if (!cookie) throw { message: "User not Authenticated" };

    return jwt.verify(cookie, <string>process.env.SECRET, async (err: any, decoded: any) => {
      if (err) throw { message: "Invalid Cookie" };
      if (!decoded) throw { message: "Token not available" };

      const id = getIdFromSession(decoded.session);
      if (!id) throw { message: "Suspicious token" };

      const profile = await PROFILE.findById(id);
      if (!profile) throw { message: "Can't find associated profile" };
      if (profile.status !== "active") throw { message: "Account not active" };
      const { role, fullName, handle, cookieConsent } = profile;

      const data = { success: true, message: `Cookie retrieved successfully`, payload: { role, fullName, handle, cookieConsent } };

      return res.status(200).json(data);
    });
  } catch (err: any) {
    return catchError({ res, err });
  }
};
