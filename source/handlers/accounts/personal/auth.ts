import jwt from "jsonwebtoken";
import { v4 as uniqueId } from "uuid";
import { Request, Response } from "express";

import pushMail from "../../../utils/pushMail";
import { SESSION } from "../../../models/accounts";
import { catchError, differenceInHour, nTimeFromNowFn, requestHasBody } from "../../../utils/handlers";

export default async (req: Request, res: Response) => {
  try {
    requestHasBody({ body: req.body, required: ["email", "password"] });
    const { email: authEmail, password: authPassword } = req.body;

    const searchResult = await SESSION.aggregate([
      { $match: { email: authEmail.toLowerCase() } },
      { $lookup: { from: "personal_profiles", localField: "email", foreignField: "email", as: "profile" } },
      { $limit: 1 },
      // { $project: { otp: 0 } },
    ]);

    // verify that account exist, else throw an error
    if (!searchResult || !searchResult[0]) throw { message: "Invalid Email/Password" };

    const {
      _id,
      otp,
      role,
      email,
      locked,
      status,
      session,
      password,
      verification,
      failedAttempts,
      profile: [{ fullName, handle, stat: cookieConsent }],
    } = searchResult[0];

    if (status !== "active")
      throw { message: "Reach out to us for assistance in reactivating your account or to inquire about the cause of deactivation", client: true };

    // ? will throw error if passwords does not match
    const matchPassword = await SESSION.comparePassword(authPassword, password);

    if (!matchPassword) {
      const currentFailedAttempts = failedAttempts + 1;
      if (currentFailedAttempts > 1 && currentFailedAttempts < 7)
        await pushMail({ account: "accounts", template: "failedLogin", address: email, subject: "Failed Login Attempt - SoccerMASS", payload: { fullName } });

      if (currentFailedAttempts === 7)
        await pushMail({ account: "accounts", template: "lockNotice", address: email, subject: "Account Lock Notice - SoccerMASS", payload: { fullName } });

      if (currentFailedAttempts > 7) {
        await SESSION.findByIdAndUpdate({ _id }, { $inc: { failedAttempts: 1 }, $set: { locked: new Date() } });
      } else {
        await SESSION.findByIdAndUpdate({ _id }, { $inc: { failedAttempts: 1 } });
      }

      throw { message: "Invalid Email/Password" };
    }

    if (locked) {
      const lockDuration = differenceInHour(locked) <= 3; // ? <= check if account has been locked for 3 hours
      if (lockDuration) throw { message: "Account is temporarily locked, Please try again later" };

      await SESSION.findByIdAndUpdate({ _id }, { $set: { locked: null } });
    }

    if (failedAttempts) await SESSION.findByIdAndUpdate({ _id }, { $set: { failedAttempts: 0 } });

    if (!verification?.email) {
      const lastSent = differenceInHour(otp.sent);

      if (lastSent > 3) {
        const newOTP = {
          sent: new Date(),
          purpose: "email verification",
          code: `${uniqueId()}-${uniqueId()}-${uniqueId()}`,
          expiry: nTimeFromNowFn({ context: "hours", interval: 3 }),
        };

        await SESSION.findByIdAndUpdate({ _id }, { $set: { otp: newOTP } });

        await pushMail({
          account: "accounts",
          template: "reVerifyEmail",
          address: email,
          subject: "Verify Your Email to Keep Your SoccerMASS Account Active",
          payload: { activationLink: `https://www.soccermass.com/auth/verify-email?registration-id=${newOTP.code}`, fullName },
        });

        throw { message: "To access our services, kindly check your inbox for the most recent verification email from us", client: true };
      }

      throw { message: `Kindly check your inbox for our latest verification email that was sent ${lastSent} hours ago`, client: true };
    }

    await SESSION.findByIdAndUpdate({ _id }, { $set: { lastLogin: new Date() } });
    await pushMail({ account: "accounts", template: "successfulLogin", address: email, subject: "Successful Login to SoccerMASS", payload: { fullName } });

    const token = jwt.sign({ session, role, fullName, handle }, process.env.SECRET as string, { expiresIn: "120 days" });

    const data = { success: true, message: "Email/Password is Valid.", payload: { role, fullName, handle, cookieConsent } };

    const cookiesOption = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      // domain: req.headers.origin?.replace("http://", ".")?.replace("https://", ".")?.replace(/:\d+/, ""),
      expires: nTimeFromNowFn({ context: "days", interval: 120 }),
    };

    res.status(200).cookie("SoccerMASS", token, cookiesOption).json(data);
  } catch (err: any) {
    const message = err.client ? err.message : "Invalid Email/Password";
    return catchError({ res, err, status: err.status, message });
  }
};
