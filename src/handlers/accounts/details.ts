import { Request, Response } from "express";

import { PROFILE } from "../../models/accounts";
import { catchError } from "../../utils/handlers";

export default async (req: Request, res: Response) => {
  try {
    const { id } = req.body.auth;

    const profile = await PROFILE.findById(id);

    if (!profile) throw { message: "Can't find associated profile", error: true };
    if (profile.status !== "active") throw { message: "Account not active", error: true };

    const { role, fullName, handle, theme } = profile;

    const data = { success: true, message: `Profile details retrieved successfully`, payload: { theme, role, fullName, handle } };

    return res.status(200).json(data);
  } catch (err: any) {
    return catchError({ res, err });
  }
};
