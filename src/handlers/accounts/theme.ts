import { Request, Response } from "express";

import { PROFILE } from "../../models/accounts";
import { themes } from "../../utils/constants";
import { catchError, requestHasBody } from "../../utils/handlers";

export default async (req: Request, res: Response) => {
  try {
    requestHasBody({ body: req.body, required: ["theme"] });
    const { theme, auth } = req.body;

    if (!themes.includes(theme)) throw { message: "Invalid theme used", client: true };

    await PROFILE.findOneAndUpdate(auth.id, { $set: { theme } });

    const data = { success: true, message: `Theme set to ${theme}`, payload: null };

    res.status(201).json(data);
  } catch (err: any) {
    err.status = 409;
    return catchError({ res, err });
  }
};
