import { Request, Response } from "express";

import { PROFILE } from "../../models/accounts";
import { catchError } from "../../utils/handlers";

export default async (req: Request, res: Response) => {
  try {
    const { handle, id } = req.body.auth;
    await PROFILE.findByIdAndUpdate(id, { $set: { cookieConsent: Date.now() } });

    const data = { success: true, message: `${handle} has allowed cookies` };

    res.status(204).json(data);
  } catch (err: any) {
    err.status = 304;
    return catchError({ res, err });
  }
};
