import { Request, Response } from "express";
import validate from "../../utils/validator";
import { PROFILE } from "../../models/accounts";
import { catchError, requestHasBody } from "../../utils/handlers";

export default async (req: Request, res: Response) => {
  try {
    requestHasBody({ body: req.query, required: ["gear"] });

    // Validate request body before processing request
    validate({ type: "comment", value: req.query.gear });

    const gear = req.query.gear as string,
      subGears = gear.split("-"),
      id = subGears[subGears.length - 4];

    console.log({ id });

    if (!id) throw { message: "Account", error: true };

    const updated = await PROFILE.findOneAndUpdate(
      { _id: id, ["auth.otp.code"]: gear, ["auth.otp.purpose"]: "email verification", ["auth.verification.email"]: null },
      {
        $set: {
          ["auth.verification.email"]: Date.now(),
          ["auth.otp"]: { code: null, purpose: null, time: null },
        },
      }
    );

    if (updated) return res.redirect(302, `${process.env.CLIENT_URL}/accounts/email-verification?status=success`);
  } catch (err: any) {
    res.redirect(302, `${process.env.CLIENT_URL}/accounts/email-verification?status=failed`);

    err.respond = false;
    err.status = 409;
    return catchError({ res, err });
  }
};
