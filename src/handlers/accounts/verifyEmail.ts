import { Request, Response } from "express";

import { PROFILE } from "../../models/accounts";
import { catchError, requestHasBody } from "../../utils/handlers";

export default async (req: Request, res: Response) => {
  try {
    requestHasBody({ body: req.query, required: ["gear"] });

    const gear = req.query.gear as string,
      subGears = gear.split("-"),
      id = subGears[subGears.length - 2];

    if (!id) throw { message: "Account", client: true };

    const updated = await PROFILE.findOneAndUpdate(
      { _id: id, ["auth.otp.code"]: gear, ["auth.otp.purpose"]: "email verification", ["auth.verification.email"]: null },
      {
        $set: {
          ["auth.verification.email"]: Date.now(),
          ["auth.otp"]: { code: null, purpose: null, time: null },
        },
      }
    );

    if (updated) return res.redirect(302, `${process.env.CLIENT_DOMAIN}/accounts/email-verification-success`);
  } catch (err: any) {
    res.redirect(302, `${process.env.CLIENT_DOMAIN}/accounts/email-verification-failed`);

    err.respond = false;
    err.status = 409;
    return catchError({ res, err });
  }
};
