import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

import { PROFILE } from "../../models/accounts";
import { catchError, getIdFromSession } from "../../utils/handlers";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookie = req.cookies.SSID;
    if (!cookie) throw { message: "User not Authenticated", client: true };

    return jwt.verify(cookie, <string>process.env.SECRET, async (err: any, decoded: any) => {
      if (err) throw { message: "Invalid Cookie", client: true };
      if (!decoded) throw { message: "Token not available", client: true };

      const id = getIdFromSession(decoded.session);
      if (!id) throw { message: "Suspicious token", client: true };

      const profile = await PROFILE.findById(id);
      if (!profile) throw { message: "Can't find associated profile", client: true };
      if (profile.status !== "active") throw { message: "Account not active", client: true };
      const { role, fullName, handle, theme } = profile;

      const data = {
        success: true,
        message: `Cookie retrieved successfully`,
        payload: {
          theme,
          role,
          fullName,
          handle,
        },
      };

      return res.status(200).json(data);
    });
  } catch (err: any) {
    err.status = 401;
    return catchError({ res, err });
  }
};
