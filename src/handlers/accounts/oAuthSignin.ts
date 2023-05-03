import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

import pushMail from "../../utils/pushMail";
import validator from "../../utils/validator";
import { PROFILE } from "../../models/accounts";
import { capitalize, catchError, differenceInHour, generateOtp, nTimeFromNowFn, obfuscate } from "../../utils/handlers";

import { PushMail } from "../../interface/pushMail-handlers-interface";

const oAuthFunc = async (req: Request, res: Response) => {
  const auth = req.body.auth;
  try {
    const email = <PushMail["address"]>req.user;
    validator({ type: "email", value: email, label: "Email" });

    const profile = await PROFILE.findOne({ email });
    if (!profile || !profile.auth || !profile.auth.verification || !profile.auth.failedAttempts || !profile.auth.otp)
      throw { message: "Email not associated with any account", client: true }; // <= verify that account exist, else throw an error

    const {
      id,
      role,
      handle,
      fullName,
      status: accountStatus,
      auth: {
        locked,
        session,
        verification: { email: emailVerified },
        otp: { purpose: otpPurpose, expiry: otpExpiry },
      },
    } = profile;

    if (accountStatus !== "active")
      throw { message: "Reach out to us for assistance in reactivating your account or to inquire about the cause of deactivation", client: true };

    // update acount lock/security settings
    if (locked) {
      const hoursElapsed = differenceInHour(locked) <= 1; // ? <= check if account has been locked for 1 hours
      if (hoursElapsed) throw { message: "Account is temporarily locked, Please try again later", client: true };

      await PROFILE.findByIdAndUpdate(
        { id },
        { $set: { ["auth.locked"]: null, ["auth.failedAttempts.counter"]: 0, ["auth.failedAttempts.lastAttempt"]: null } }
      );
    }

    // Check if account email is verified
    if (!emailVerified) {
      const hoursElapsed = differenceInHour(otpExpiry);

      if (otpPurpose !== "email verification" || hoursElapsed >= 0) {
        const newOTP = {
          code: generateOtp(id),
          purpose: "email verification",
          expiry: nTimeFromNowFn({ context: "hours", interval: 3 }),
        };

        await PROFILE.findByIdAndUpdate({ id }, { $set: { ["auth.otp"]: newOTP } });

        await pushMail({
          account: "accounts",
          template: "reVerifyEmail",
          address: email,
          subject: "Verify your email to activate Your SoccerMASS account",
          payload: { activationLink: `https://www.soccermass.com/auth/verify-email?registration-id=${newOTP.code}`, fullName },
        });

        throw {
          message: "Verify your email to activate Your SoccerMASS account, kindly check your email inbox/spam for the most recent verification email from us",
          client: true,
        };
      }

      throw {
        message: `Kindly check your inbox/spam for our latest verification email that was sent ${hoursElapsed + 3 ? "few hours" : "less than an hour"} ago`,
        client: true,
      };
    }

    const cookiesOption = {
        httpOnly: true,
        expires: nTimeFromNowFn({ context: "days", interval: 120 }),
        secure: process.env.NODE_ENV === "production" ? true : false,
        domain: process.env.NODE_ENV === "production" ? ".soccermass.com" : "localhost",
      },
      SSIDJwtToken = jwt.sign({ session }, process.env.SECRET as string, { expiresIn: "180 days" }),
      USERJwtToken = jwt.sign({ role, fullName, handle, id }, process.env.SECRET as string, { expiresIn: "180 days" });

    await pushMail({
      account: "accounts",
      template: "successfulLogin",
      address: email,
      subject: `Successful Login to SoccerMASS via ${capitalize(auth)}`,
      payload: { fullName },
    });

    return res
      .cookie("SSID", SSIDJwtToken, cookiesOption)
      .cookie("USER", USERJwtToken, cookiesOption)
      .redirect(302, `http://${process.env.CLIENT_DOMAIN}/accounts/signin`);
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
