import { Request, Response } from "express";

import pushMail from "../../utils/pushMail";
import validate from "../../utils/validator";
import { PROFILE } from "../../models/accounts";
import { catchError, hourDiff, requestHasBody } from "../../utils/handlers";

export default async (req: Request, res: Response) => {
  try {
    requestHasBody({ body: req.body, required: ["email", "password", "gear"] });
    const { email, password, gear } = req.body;

    // Validate request body before processing request
    validate({ type: "email", value: email });
    validate({ type: "comment", value: gear });
    validate({ type: "password", value: password });

    const profile = await PROFILE.findOne({ email, ["auth.otp.code"]: gear });
    if (!profile || !profile.auth || !profile.auth.otp) throw { message: "Invalid password reset link", error: true }; // <= verify that account exist, else throw an error

    if (profile.auth.otp.purpose === "password reset") {
      const otpSentRecently = hourDiff(profile.auth.otp.time) > 3;
      if (otpSentRecently) throw { message: "Password reset link has expired", error: true };
    }

    const hashedPassword = await PROFILE.hashPassword(password);

    await PROFILE.findByIdAndUpdate(profile.id, {
      $set: { ["auth.password"]: hashedPassword, ["auth.otp"]: { code: null, purpose: null, time: null } },
    }).then(async () => {
      await pushMail({
        address: email,
        account: "accounts",
        template: "resetPassword",
        data: { fullName: profile.fullName },
        subject: "SoccerMASS Password Reset Confirmation",
      });
    });

    const data = { success: true, message: "Password reset successful", data: null }; // Always return true whether successful or failed
    return res.status(201).json(data);
  } catch (err: any) {
    return catchError({ res, err });
  }
};
