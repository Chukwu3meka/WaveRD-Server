import jwt from "jsonwebtoken";
import { Request, Response } from "express";

import pushMail from "../../utils/pushMail";
import { PROFILE } from "../../models/accounts";
import { catchError, nTimeFromNowFn } from "../../utils/handlers";

export default async (req: Request, res: Response) => {
  try {
    const oAuthID = req.body.oAuthID;
    if (!oAuthID) throw { message: "User not Authenticated" };

    const profileData = await PROFILE.findOne({ ["otp.code"]: oAuthID });
    if (!profileData) throw { message: "Email not associated with any account", client: true };

    const { fullName, handle, stat, email } = profileData;

    await pushMail({
      address: email!,
      account: "accounts",
      payload: { fullName },
      template: "successfulLogin",
      subject: "Successful Login to SoccerMASS",
    });

    const token = jwt.sign({ session: profileData.session, role: profileData.role, fullName, handle }, process.env.SECRET as string, {
      expiresIn: "120 days",
    });

    const data = { success: true, message: "SuccessfuloAuth", payload: { role: profileData.role, fullName, handle, cookieConsent: stat?.cookieConsent } };

    const cookiesOption = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      // domain: req.headers.origin?.replace("http://", ".")?.replace("https://", ".")?.replace(/:\d+/, ""),
      expires: nTimeFromNowFn({ context: "days", interval: 120 }),
    };

    const newOTP = { code: null, sent: null, purpose: null, expiry: null };
    await PROFILE.findByIdAndUpdate({ _id: profileData._id }, { $set: { otp: newOTP } });

    res.status(200).clearCookie("session").clearCookie("session.sig").cookie("SoccerMASS", token, cookiesOption).json(data);
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: err.message });
  }
};
