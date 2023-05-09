import { Request, Response } from "express";

import pushMail from "../../utils/pushMail";
import { PROFILE } from "../../models/accounts";
import { catchError, hourDiff, generateSession, calcFutureDate, requestHasBody } from "../../utils/handlers";

export default async (req: Request, res: Response) => {
  const data = { success: true, message: "Password reset link sent", payload: null }; // Always return true whether successful or failed

  try {
    requestHasBody({ body: req.body, required: ["email"] });
    const { email } = req.body;

    const profile = await PROFILE.findOne({ email });
    if (!profile || !profile.auth || !profile.auth.otp) throw { message: "Email does not exists" }; // <= verify that account exist, else throw an error

    if (profile.auth.otp.purpose === "password reset") {
      const hoursElapsed = hourDiff(profile.auth.otp.time);
      if (hoursElapsed <= 1) throw { message: "Password reset link sent recently" };
    }

    const otp = {
      time: new Date(),
      purpose: "password reset",
      code: generateSession(profile.id),
    };

    await PROFILE.findByIdAndUpdate(profile.id, { $set: { ["auth.otp"]: otp } }).then(async () => {
      await pushMail({
        account: "accounts",
        template: "forgotPassword",
        address: email,
        subject: "SoccerMASS Password Reset Request",
        payload: {
          activationLink: `${process.env.CLIENT_DOMAIN}/accounts/reset-password?gear=${otp.code}`,
          fullName: profile.fullName,
        },
      });
    });

    return res.status(200).json(data);
  } catch (err: any) {
    res.status(200).json(data);

    err.respond = false;
    return catchError({ res, err });
  }
};
