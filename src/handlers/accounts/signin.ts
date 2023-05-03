import jwt from "jsonwebtoken";
import { Request, Response } from "express";

import pushMail from "../../utils/pushMail";
import { PROFILE } from "../../models/accounts";
import { catchError, differenceInHour, generateOtp, nTimeFromNowFn, requestHasBody, generateSession } from "../../utils/handlers";

export default async (req: Request, res: Response) => {
  try {
    requestHasBody({ body: req.body, required: ["email", "password"] });
    const { email, password: authPassword } = req.body;

    const profile = await PROFILE.findOne({ email });
    if (!profile || !profile.auth || !profile.auth.verification || !profile.auth.failedAttempts || !profile.auth.otp)
      throw { message: "Invalid Email/Password", client: true }; // <= verify that account exist, else throw an error

    const {
      id,
      role,
      handle,
      fullName,
      cookieConsent,
      status: accountStatus,
      auth: {
        locked,
        session,
        password,
        verification: { email: emailVerified },
        failedAttempts: { counter, lastAttempt },
        otp: { purpose: otpPurpose, expiry: otpExpiry },
      },
    } = profile;

    if (accountStatus !== "active")
      throw { message: "Reach out to us for assistance in reactivating your account or to inquire about the cause of deactivation", client: true };

    const matchPassword = await PROFILE.comparePassword(authPassword, password);

    if (!matchPassword) {
      const failedAttempts = counter + 1,
        hoursElapsed = differenceInHour(lastAttempt);

      // Notify user on Login Attempt
      if ([5, 6].includes(failedAttempts))
        await pushMail({ account: "accounts", template: "failedLogin", address: email, subject: "Failed Login Attempt - SoccerMASS", payload: { fullName } });

      if (failedAttempts === 7)
        await pushMail({ account: "accounts", template: "lockNotice", address: email, subject: "Account Lock Notice - SoccerMASS", payload: { fullName } });

      // Increment record on Database
      if (failedAttempts >= 7 && hoursElapsed < 1) {
        await PROFILE.findByIdAndUpdate(id, {
          $inc: { ["auth.failedAttempts.counter"]: 1 },
          $set: { ["auth.locked"]: new Date(), ["auth.failedAttempts.lastAttempt"]: new Date() },
        });
      } else {
        await PROFILE.findByIdAndUpdate(id, { $inc: { ["auth.failedAttempts.counter"]: 1 }, $set: { ["auth.failedAttempts.lastAttempt"]: new Date() } });
      }

      throw { message: "Invalid Email/Password", client: true };
    }

    // update acount lock/security settings
    if (locked) {
      const hoursElapsed = differenceInHour(locked) <= 1; // ? <= check if account has been locked for 1 hours
      if (hoursElapsed) throw { message: "Account is temporarily locked, Please try again later", client: true };

      await PROFILE.findByIdAndUpdate(id, { $set: { ["auth.locked"]: null, ["auth.failedAttempts.counter"]: 0, ["auth.failedAttempts.lastAttempt"]: null } });
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

        await PROFILE.findByIdAndUpdate(id, { $set: { ["auth.otp"]: newOTP } });

        await pushMail({
          account: "accounts",
          template: "reVerifyEmail",
          address: email,
          subject: "Verify your email to activate Your SoccerMASS account",
          payload: {
            activationLink: `${process.env.PROTOCOL}${process.env.CLIENT_DOMAIN}/accounts/verify-email?registration-id=${newOTP.code}`,
            fullName,
          },
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
      SSIDJwtToken = jwt.sign({ session, fullName, handle }, process.env.SECRET as string, { expiresIn: "180 days" }),
      data = { success: true, message: "Email/Password is Valid.", payload: { role, fullName, handle, cookieConsent } };

    await pushMail({ account: "accounts", template: "successfulLogin", address: email, subject: "Successful Login to SoccerMASS", payload: { fullName } });

    res.status(200).cookie("SSID", SSIDJwtToken, cookiesOption).json(data);
  } catch (err: any) {
    err.status = 401;
    return catchError({ res, err });
  }
};

// domain: req.headers.origin?.replace("http://", ".")?.replace("https://", ".")?.replace(/:\d+/, ""),
// res.status(200).cookie("SSID", SSIDJwtToken, cookiesOption).cookie("USER", USERJwtToken, cookiesOption).json(data);
