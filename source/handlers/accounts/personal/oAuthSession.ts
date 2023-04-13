import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

import { catchError, nTimeFromNowFn } from "../../../utils/handlers";

import { PROFILE, SESSION } from "../../../models/accounts";
import pushMail from "../../../utils/pushMail";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const oAuthID = req.body.oAuthID;
    if (!oAuthID) throw { message: "User not Authenticated" };

    const searchResult = await SESSION.findOne({ ["otp.code"]: oAuthID });
    if (!searchResult) throw { message: "Email not associated with any account", client: true };

    const profile = await PROFILE.findOne({ email: searchResult.email });
    if (!profile) throw { message: "Email not associated with any account", client: true };

    const { fullName, handle, stat } = profile;

    await pushMail({
      account: "accounts",
      template: "successfulLogin",
      address: searchResult.email,
      subject: "Successful Login to SoccerMASS",
      payload: { fullName },
    });

    const token = jwt.sign({ session: searchResult.session, role: searchResult.role, fullName, handle }, process.env.SECRET as string, {
      expiresIn: "120 days",
    });

    const data = { success: true, message: "SuccessfuloAuth", payload: { role: searchResult.role, fullName, handle, allowedCookies: stat?.allowedCookies } };

    const cookiesOption = {
      httpOnly: true,
      secure: process.env.production ? true : false,
      // domain: req.headers.origin?.replace("http://", ".")?.replace("https://", ".")?.replace(/:\d+/, ""),
      expires: nTimeFromNowFn({ context: "days", interval: 120 }),
    };

    const newOTP = { code: null, sent: null, purpose: null, expiry: null };
    await SESSION.findByIdAndUpdate({ _id: searchResult._id }, { $set: { otp: newOTP } });

    res.status(200).clearCookie("session").clearCookie("session.sig").cookie("SoccerMASS", token, cookiesOption).json(data);
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: err.message });
  }
};
