import jwt from "jsonwebtoken";
import { v4 as uniqueId } from "uuid";
import { NextFunction, Request, Response } from "express";

import pushMail from "../../utils/pushMail";
import { PROFILE } from "../../models/accounts";
import { catchError, differenceInHour, nTimeFromNowFn, requestHasBody, sleep } from "../../utils/handlers";

export default async (req: Request, res: Response, next: NextFunction) => {
  const data = { success: true, message: "Password reset link sent", payload: null }; // Always return true whether successful or failed

  try {
    requestHasBody({ body: req.body, required: ["email"] });
    const { email } = req.body;

    const otpSent = await PROFILE.findOneAndUpdate({ email }, { $set: {} }).then(async (dbResponse: any) => {
      // const emailPayload = {
      //   fullName,
      //   handle,
      //   activationLink: `${process.env.PROTOCOL}srv-accounts.${process.env.SERVER_DOMAIN}/api/verify-email?gear=${dbResponse.auth.otp.code}`,
      // };
    });

    console.log({ email });
    // if (!id) throw { message: "Account", client: true };

    // const updated = await PROFILE.findOneAndUpdate(
    //   { _id: id, ["auth.otp.code"]: gear, ["auth.otp.purpose"]: "email verification", ["auth.verification.email"]: null },
    //   {
    //     $set: {
    //       ["auth.verification.email"]: Date.now(),
    //       ["auth.otp"]: { code: null, purpose: null, expiry: null },
    //     },
    //   }
    // );

    return res.status(201).json(data);
  } catch (err: any) {
    res.status(201).json(data);

    err.respond = false;
    return catchError({ res, err });
  }
};
