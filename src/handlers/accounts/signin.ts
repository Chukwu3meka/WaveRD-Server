import jwt from "jsonwebtoken";
import { Request, Response } from "express";

import pushMail from "../../utils/pushMail";
import { PROFILE } from "../../models/accounts";
import { cookiesOption } from "../../utils/constants";
import { catchError, hourDiff, calcFutureDate, requestHasBody, generateSession } from "../../utils/handlers";

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
      status: accountStatus,
      auth: {
        locked,
        session,
        password,
        verification: { email: emailVerified },
        failedAttempts: { counter, lastAttempt },
        otp: { purpose: otpPurpose, time: otpTime },
      },
    } = profile;

    if (accountStatus !== "active")
      throw { message: "Reach out to us for assistance in reactivating your account or to inquire about the cause of deactivation", client: true };

    const matchPassword = await PROFILE.comparePassword(authPassword, password);

    if (!matchPassword) {
      const failedAttempts = counter + 1,
        hoursElapsed = hourDiff(lastAttempt);

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
      const accLocked = hourDiff(locked) <= 1; // ? <= check if account has been locked for 1 hours
      if (accLocked) throw { message: "Account is temporarily locked, Please try again later", client: true };

      await PROFILE.findByIdAndUpdate(id, { $set: { ["auth.locked"]: null, ["auth.failedAttempts.counter"]: 0, ["auth.failedAttempts.lastAttempt"]: null } });
    }

    // Check if account email is verified
    if (!emailVerified) {
      const email_otp = otpPurpose === "email verification",
        expired_otp = hourDiff(otpTime) >= 3;

      if ((email_otp && expired_otp) || !email_otp) {
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
          message: "Kindly check your email inbox/spam for a verification email we just sent",
          client: true,
        };
      }

      throw {
        message: `Kindly check your inbox/spam for our latest verification email from SoccerMASS`,
        client: true,
      };
    }

    const SSIDJwtToken = jwt.sign({ session, fullName, handle }, process.env.SECRET as string, { expiresIn: "180 days" }),
      data = { success: true, message: "Email/Password is Valid.", payload: { role, fullName, handle } };

    await pushMail({ account: "accounts", template: "successfulLogin", address: email, subject: "Successful Login to SoccerMASS", payload: { fullName } });

    res.status(200).cookie("SSID", SSIDJwtToken, cookiesOption).json(data);
  } catch (err: any) {
    err.status = 401;
    return catchError({ res, err });
  }
};

// domain: req.headers.origin?.replace("http://", ".")?.replace("https://", ".")?.replace(/:\d+/, ""),
// res.status(200).cookie("SSID", SSIDJwtToken, cookiesOption).cookie("USER", USERJwtToken, cookiesOption).json(data);
