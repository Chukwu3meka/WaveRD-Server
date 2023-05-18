import { NextFunction, Request, Response } from "express";

import { PROFILE } from "../../models/accounts";
import { catchError } from "../../utils/handlers";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.body.auth;

    const profile = await PROFILE.findById(id);

    if (!profile) throw { message: "Can't find associated profile", client: true };
    if (profile.status !== "active") throw { message: "Account not active", client: true };

    const { role, fullName, handle, theme } = profile;

    const data = { success: true, message: `Cookie retrieved successfully`, payload: { theme, role, fullName, handle } };

    return res.status(200).json(data);
  } catch (err: any) {
    err.status = 401;
    return catchError({ res, err });
  }
};
