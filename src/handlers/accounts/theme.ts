import { Request, Response } from "express";

import { THEMES } from "../../utils/constants";
import { PROFILE } from "../../models/accounts";
import { catchError, requestHasBody } from "../../utils/handlers";

export default async (req: Request, res: Response) => {
  try {
    requestHasBody({ body: req.body, required: ["theme"] });

    const { theme, auth } = req.body;
    if (!THEMES.includes(theme)) throw { message: "Invalid theme used", sendError: true };

    await PROFILE.findByIdAndUpdate(auth.id, { $set: { theme } });
    const data = { success: true, message: `Theme set to ${theme}`, data: null };

    res.status(201).json(data);
  } catch (err: any) {
    err.status = 409;
    return catchError({ res, err });
  }
};
