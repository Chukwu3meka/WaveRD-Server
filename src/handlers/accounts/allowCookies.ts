import { Request, Response } from "express";

import { PROFILE } from "../../models/accounts";
import { catchError } from "../../utils/handlers";

export default async (req: Request, res: Response) => {
  try {
    const { handle, session } = req.body.auth;

    const profileData = await PROFILE.findOne({ session });
    if (!profileData) throw { message: "Session not found" };

    await PROFILE.updateOne({ email: profileData.email }, { $set: { "stat.cookieConsent": true, "stat.cookieConsentDate": new Date() } });

    const data = { success: true, message: `${handle} has allowed cookies` };

    res.status(200).json(data);
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: err.message });
  }
};
