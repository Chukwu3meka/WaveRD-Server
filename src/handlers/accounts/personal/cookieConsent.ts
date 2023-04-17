import { Request, Response } from "express";

import { catchError } from "../../../utils/handlers";
import { PROFILE, SESSION } from "../../../models/accounts";

export default async (req: Request, res: Response) => {
  try {
    const { handle, session } = req.body.auth;

    const userSession = await SESSION.findOne({ session });
    if (!userSession) throw { message: "Session not found" };
    const userProfile = await PROFILE.findOne({ email: userSession.email });
    if (!userProfile) throw { message: "Profile not found" };

    await PROFILE.updateOne({ email: userProfile.email }, { $set: { "stat.cookieConsent": true, "stat.cookieConsentDate": new Date() } });

    const data = { success: true, message: `${handle} has allowed cookies` };

    res.status(200).json(data);
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: err.message });
  }
};
