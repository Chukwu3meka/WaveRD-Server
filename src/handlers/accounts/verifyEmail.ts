import { Request, Response } from "express";

import { PROFILE } from "../../models/accounts";
import { catchError } from "../../utils/handlers";

export default async (req: Request, res: Response) => {
  try {
    if (req.query.gear) {
      const gear = req.query.gear as string,
        subGears = gear.split("-"),
        id = subGears[subGears.length - 2];

      if (!id) throw { message: "Account", client: true };

      const updated = await PROFILE.findOneAndUpdate(
        { id, ["auth.otp.code"]: gear, ["auth.otp.purpose"]: "email verification", ["auth.verification.email"]: null },
        {
          $set: {
            ["auth.verification.email"]: Date.now(),
            ["auth.otp"]: { code: null, purpose: null, expiry: null },
          },
        }
      );

      if (updated) return res.redirect(302, `${process.env.PROTOCOL}${process.env.CLIENT_DOMAIN}/accounts/email-verification-success`);
    }
    res.redirect(302, `${process.env.PROTOCOL}${process.env.CLIENT_DOMAIN}/accounts/email-verification-failed`);
  } catch (err: any) {
    err.status = 409;
    return catchError({ res, err });
  }
};
