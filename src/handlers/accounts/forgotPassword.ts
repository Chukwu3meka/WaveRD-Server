import jwt from "jsonwebtoken";
import { v4 as uniqueId } from "uuid";
import { NextFunction, Request, Response } from "express";

import pushMail from "../../utils/pushMail";
import { PROFILE } from "../../models/accounts";
import { catchError, differenceInHour, nTimeFromNowFn, requestHasBody, sleep } from "../../utils/handlers";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    requestHasBody({ body: req.body, required: ["email"] });
    const { email } = req.body;

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
    res.send("huee");
  } catch (err: any) {
    return catchError({ res, err });
  }
};
