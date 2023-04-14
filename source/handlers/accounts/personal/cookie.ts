import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

import { catchError } from "../../../utils/handlers";
import { PROFILE, SESSION } from "../../../models/accounts";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookie = req.cookies.SoccerMASS;
    if (!cookie) throw { message: "User not Authenticated" };

    return jwt.verify(cookie, <string>process.env.SECRET, async (err: any, decoded: any) => {
      if (err) throw { message: "Suspicious token" };
      if (!decoded) throw { message: "Token not available" };

      const { role, fullName, handle, session } = decoded;

      if (role && fullName && handle && session) {
        const userSession = await SESSION.findOne({ session }); // ensure
        if (!userSession) throw { message: "Token not found in Database" };
        if (userSession.status !== "active") throw { message: "Account not active" };

        const userProfile = await PROFILE.findOne({ email: userSession.email });
        if (!userProfile) throw { message: "Profile not found in Database" };

        const cookieConsent = userProfile?.stat?.cookieConsent;

        const data = { success: true, message: `Cookie retrieved successfully`, payload: { role, fullName, handle, cookieConsent } };
        return res.status(200).clearCookie("session").clearCookie("session.sig").json(data);
      } else {
        throw { message: "Invalid Cookie" };
      }
    });
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: err.message });
  }
};
