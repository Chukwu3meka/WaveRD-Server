import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

import { catchError } from "../../utils/handlers";
import { PROFILE } from "../../models/accounts";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookie = req.cookies.SoccerMASS;
    if (!cookie) throw { message: "User not Authenticated" };

    return jwt.verify(cookie, <string>process.env.SECRET, async (err: any, decoded: any) => {
      if (err) throw { message: "Suspicious token" };
      if (!decoded) throw { message: "Token not available" };

      const { role, fullName, handle, session } = decoded;

      // console.log(      if (role && fullName && handle && session) {
      //   req.body = { ...req.body, auth: { role, fullName, handle, session } };

      if (role && fullName && handle && session) {
        const profile = await PROFILE.findOne({ session }); // ensure
        if (!profile) throw { message: "Token not found in Database" };
        if (profile.status !== "active") throw { message: "Account not active" };

        // const cookieConsent = profile?.stat?.cookieConsent;

        // const data = { success: true, message: `Cookie retrieved successfully`, payload: { role, fullName, handle, cookieConsent } };
        // return res.status(200).clearCookie("session").clearCookie("session.sig").json(data);
      } else {
        throw { message: "Invalid Cookie" };
      }
    });
  } catch (err: any) {
    return catchError({ res, err });
  }
};
