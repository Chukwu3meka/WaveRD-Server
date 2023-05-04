import { Request, Response } from "express";

import pushMail from "../../utils/pushMail";
import { PROFILE } from "../../models/accounts";
import { catchError, differenceInHour, requestHasBody } from "../../utils/handlers";

export default async (req: Request, res: Response) => {
  try {
    requestHasBody({ body: req.body, required: ["email", "password", "gear"] });
    const { email, password, gear } = req.body;

    const profile = await PROFILE.findOne({ email, ["auth.otp.code"]: gear });
    if (!profile || !profile.auth || !profile.auth.otp) throw { message: "Invalid password reset link", client: true }; // <= verify that account exist, else throw an error

    if (profile.auth.otp.purpose === "password reset") {
      const otpSentRecently = differenceInHour(profile.auth.otp.expiry) > 0;
      if (otpSentRecently) throw { message: "Password reset link has expired", client: true };
    }

    const hashedPassword = await PROFILE.hashPassword(password);

    await PROFILE.findByIdAndUpdate(profile.id, {
      $set: { ["auth.password"]: hashedPassword, ["auth.otp"]: { code: null, purpose: null, expiry: null } },
    }).then(async () => {
      await pushMail({
        address: email,
        account: "accounts",
        template: "resetPassword",
        payload: { fullName: profile.fullName },
        subject: "SoccerMASS Password Reset Confirmation",
      });
    });

    const data = { success: true, message: "Password reset successful", payload: null }; // Always return true whether successful or failed
    return res.status(201).json(data);
  } catch (err: any) {
    return catchError({ res, err });
  }
};
