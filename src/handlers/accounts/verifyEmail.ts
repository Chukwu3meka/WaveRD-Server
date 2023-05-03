import { Request, Response } from "express";

import { PROFILE } from "../../models/accounts";
import { catchError } from "../../utils/handlers";

export default async (req: Request, res: Response) => {
  try {
    const gear = req.query.gear as string;
    if (!gear) throw { message: "Invalid Link", client: true };

    const subGears = gear.split("-"),
      id = subGears[subGears.length - 2];
    if (!id) throw { message: "Account", client: true };

    const updated = await PROFILE.findOneAndUpdate(
      { id, ["auth.otp.code"]: gear, ["auth.otp.purpose"]: "email verification", ["auth.verification.email"]: null },
      { $set: { ["auth.verification.email"]: Date.now() } }
    );

    if (updated) return res.redirect(302, `${process.env.PROTOCOL}${process.env.CLIENT_DOMAIN}/accounts/email-verification-success`);
    res.redirect(302, `${process.env.PROTOCOL}${process.env.CLIENT_DOMAIN}/accounts/email-verification-failed`);

    res.status(200).json("data");
  } catch (err: any) {
    err.status = 409;
    return catchError({ res, err });
  }
};
