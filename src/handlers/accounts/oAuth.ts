import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

import pushMail from "../../utils/pushMail";
import validator from "../../utils/validator";
import { PROFILE } from "../../models/accounts";
import { cookiesOption } from "../../utils/constants";
import { capitalize, catchError, hourDiff, generateSession, calcFutureDate, obfuscate } from "../../utils/handlers";

import { PushMail } from "../../interface/pushMail-handlers-interface";

const oAuthFunc = async (req: Request, res: Response) => {
  const auth = req.body.auth;

  try {
    const email = <PushMail["address"]>req.user;
    validator({ type: "email", value: email, label: "Email" });

    const profile = await PROFILE.findOne({ email });
    if (!profile || !profile.auth || !profile.auth.verification || !profile.auth.failedAttempts || !profile.auth.otp)
      throw { message: "Email not associated with any account", error: true }; // <= verify that account exist, else throw an error

    const {
      id,
      handle,
      fullName,
      status: accountStatus,
      auth: {
        locked,
        session,
        verification: { email: emailVerified },
        otp: { purpose: otpPurpose, time: otpTime },
      },
    } = profile;

    if (accountStatus !== "active")
      throw { message: "Reach out to us for assistance in reactivating your account or to inquire about the cause of deactivation", error: true };

    // update acount lock/security settings
    if (locked) {
      const hoursElapsed = hourDiff(locked) <= 1; // ? <= check if account has been locked for 1 hours
      if (hoursElapsed) throw { message: "Account is temporarily locked, Please try again later", error: true };

      await PROFILE.findByIdAndUpdate(id, { $set: { ["auth.locked"]: null, ["auth.failedAttempts.counter"]: 0, ["auth.failedAttempts.lastAttempt"]: null } });
    }

    // Check if account email is verified
    if (!emailVerified) {
      const hoursElapsed = hourDiff(otpTime);

      if (otpPurpose !== "email verification" || hoursElapsed >= 1) {
        const newOTP = {
          code: generateSession(id),
          purpose: "email verification",
          time: calcFutureDate({ context: "hours", interval: 3 }),
        };

        await PROFILE.findByIdAndUpdate(id, { $set: { ["auth.otp"]: newOTP } });

        await pushMail({
          account: "accounts",
          template: "reVerifyEmail",
          address: email,
          subject: "Verify your email to activate Your SoccerMASS account",
          payload: {
            activationLink: `${process.env.SERVER_DOMAIN}/v1/accounts/verify-email?gear=${newOTP.code}`,
            fullName,
          },
        });

        throw {
          message: "Verify your email to activate Your SoccerMASS account, kindly check your email inbox/spam for the most recent verification email from us",
          error: true,
        };
      }

      throw {
        message: `Kindly check your inbox/spam for our latest verification email that was sent ${hoursElapsed + 3 ? "few hours" : "less than an hour"} ago`,
        error: true,
      };
    }

    const SSIDJwtToken = jwt.sign({ session, fullName, handle }, process.env.SECRET as string, { expiresIn: "180 days" });

    await pushMail({
      address: email,
      account: "accounts",
      payload: { fullName },
      template: "successfulLogin",
      subject: `Successful Login to SoccerMASS via ${capitalize(auth)}`,
    });

    return res.cookie("SSID", SSIDJwtToken, cookiesOption).redirect(302, `${process.env.CLIENT_DOMAIN}`);
  } catch (err: any) {
    const message = err.client ? err.message : "We encountered an oAuth error. Please wait and try again later";
    return res.redirect(`${process.env.CLIENT_DOMAIN}/accounts/signin/?${auth}=${obfuscate(`${new Date()}`)}&response=${obfuscate(message)}`);
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
