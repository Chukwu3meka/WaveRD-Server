import { v4 as uniqueId } from "uuid";
import { NextFunction, Request, Response } from "express";

import pushMail from "../../utils/pushMail";
import validator from "../../utils/validator";
import { PROFILE } from "../../models/accounts";
import { catchError, differenceInHour, nTimeFromNowFn, obfuscate } from "../../utils/handlers";

const oAuthFunc = async (req: Request, res: Response) => {
  const auth = req.body.auth;
  try {
    validator({ type: "email", value: req.user, label: "Email" });

    const searchResult = await PROFILE.aggregate([
      { $match: { email: req.user } },
      { $lookup: { from: "profiles", localField: "email", foreignField: "email", as: "profile" } },
      { $limit: 1 },
    ]);

    // verify that account exist, else throw an error
    if (!searchResult || !searchResult[0]) throw { message: "Email not associated with any account", client: true };

    const {
      _id,
      otp,
      email,
      locked,
      status,
      verification,
      failedAttempts,
      profile: [{ fullName }],
    } = searchResult[0];

    if (status !== "active")
      throw { message: "Reach out to us for assistance in reactivating your account or to inquire about the cause of deactivation", client: true };

    if (locked) await PROFILE.findByIdAndUpdate({ _id }, { $set: { locked: null } }); // ?  <= unlock account, since its social auth
    if (failedAttempts) await PROFILE.findByIdAndUpdate({ _id }, { $set: { failedAttempts: 0 } }); // ? <= reset counter in failed attempt

    if (!verification?.email) {
      const lastSent = differenceInHour(otp.sent) || "an";

      if (lastSent > 3) {
        const newOTP = {
          sent: new Date(),
          purpose: "email verification",
          code: `${uniqueId()}-${uniqueId()}-${uniqueId()}`,
          expiry: nTimeFromNowFn({ context: "hours", interval: 3 }),
        };

        await PROFILE.findByIdAndUpdate({ _id }, { $set: { newOTP } });

        await pushMail({
          account: "accounts",
          template: "reVerifyEmail",
          address: email,
          subject: "Verify Your Email to Keep Your SoccerMASS Account Active",
          payload: { activationLink: `https://www.soccermass.com/auth/verify-email?registration-id=${newOTP.code}`, fullName },
        });

        throw { message: "To access our services, kindly check your inbox for the most recent verification email from us", client: true };
      }

      throw { message: `Kindly check your inbox for our latest verification email that was sent ${lastSent} hour(s) ago`, client: true };
    }

    const oAuthId = `${uniqueId()}-${uniqueId()}-${_id}-${uniqueId()}-${uniqueId()}`;

    const newOTP = {
      code: oAuthId,
      sent: new Date(),
      purpose: "oAuth Validator",
      expiry: nTimeFromNowFn({ context: "hours", interval: 0.03 }),
    };

    await PROFILE.findByIdAndUpdate({ _id }, { $set: { otp: newOTP } });

    return res.redirect(`http://${process.env.CLIENT_DOMAIN}/accounts/signin/?response=${obfuscate(oAuthId)}`);
  } catch (err: any) {
    const message = err.client ? err.message : "We encountered an oAuth error. Please wait and try again later";
    return res.redirect(`http://${process.env.CLIENT_DOMAIN}/accounts/signin/?${auth}=${obfuscate(`${new Date()}`)}&response=${obfuscate(message)}`);
  }
};

export const facebookAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body.auth = "facebook";
    await oAuthFunc(req, res);
  } catch (err: any) {
    return catchError({ res, err });
  }
};

export const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body.auth = "google";
    await oAuthFunc(req, res);
  } catch (err: any) {
    return catchError({ res, err });
  }
};

export const twitterAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body.auth = "twitter";
    await oAuthFunc(req, res);
  } catch (err: any) {
    return catchError({ res, err });
  }
};
