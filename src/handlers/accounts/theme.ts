import { Request, Response } from "express";

import { PROFILE } from "../../models/accounts";
import { catchError, requestHasBody } from "../../utils/handlers";

export default async (req: Request, res: Response) => {
  try {
    requestHasBody({ body: req.body, required: ["theme"] });
    const { theme } = req.body;

    // req.body, auth: { id

    // await PROFILE.findOneAndUpdate(
    //   { _id: id, ["auth.otp.code"]: gear, ["auth.otp.purpose"]: "email verification", ["auth.verification.email"]: null },
    //   {
    //     $set: {
    //       ["auth.verification.email"]: Date.now(),
    //       ["auth.otp"]: { code: null, purpose: null, time: null },
    //     },
    //   }
    // );

    const data = { success: true, message: `Theme set to ${theme}`, payload: null };

    res.status(201).json(data);
  } catch (err: any) {
    err.status = 409;
    return catchError({ res, err });
  }
};
