import jwt from "jsonwebtoken";
import { v4 as uniqueId } from "uuid";
import { NextFunction, Request, Response } from "express";

import pushMail from "../../utils/pushMail";
import { PROFILE } from "../../models/accounts";
import { catchError, differenceInHour, nTimeFromNowFn, requestHasBody, sleep } from "../../utils/handlers";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    requestHasBody({ body: req.body, required: ["email", "password"] });
    const { email: authEmail, password: authPassword } = req.body;

    const searchResult = await PROFILE.aggregate([
      { $match: { email: authEmail } },
      { $lookup: { from: "profiles", localField: "email", foreignField: "email", as: "profile" } },
      { $limit: 1 },
      { $project: { otp: 0 } },
    ]);

    // verify that account exist, else throw an error
    if (!searchResult) throw { message: "Invalid Email/Password" };

    const {
      _id,
      locked,
      status,
      failedAttempts,
      role,
      email,
      password,
      session,
      verification,
      profile: [{ fullName, handle }],
    } = searchResult[0];

    if (status !== "active") throw { message: "Reach out to us for assistance in reactivating your account or to inquire about the cause of deactivation" };

    // ? will throw error if passwords does not match
    const matchPassword = await PROFILE.comparePassword(authPassword, password);

    if (!matchPassword) {
      const currentFailedAttempts = failedAttempts + 1;
      if (currentFailedAttempts < 7)
        await pushMail({ account: "accounts", template: "failedLogin", address: email, subject: "Failed Login Attempt - SoccerMASS", payload: { fullName } });

      if (currentFailedAttempts === 7)
        await pushMail({ account: "accounts", template: "lockNotice", address: email, subject: "Account Lock Notice - SoccerMASS", payload: { fullName } });

      if (currentFailedAttempts >= 7) {
        await PROFILE.findByIdAndUpdate({ _id }, { $inc: { failedAttempts: 1 }, $set: { locked: new Date() } });
      } else {
        await PROFILE.findByIdAndUpdate({ _id }, { $inc: { failedAttempts: 1 } });
      }

      throw { message: "Invalid Email/Password" };
    }

    if (locked) {
      const lockDuration = differenceInHour(locked) <= 3; // ? <= check if account has been locked for 3 hours
      if (lockDuration) throw { message: "Account is temporarily locked, Please try again later" };

      await PROFILE.findByIdAndUpdate({ _id }, { $set: { locked: null } });
    }

    if (failedAttempts) await PROFILE.findByIdAndUpdate({ _id }, { $set: { failedAttempts: 0 } });

    if (!verification?.email) {
      const otp = {
        purpose: "email verification",
        code: `${uniqueId()}-${uniqueId()}-${uniqueId()}`,
        expiry: nTimeFromNowFn({ context: "hours", interval: 3 }),
      };

      await PROFILE.findByIdAndUpdate({ _id }, { $set: { otp } });

      await pushMail({
        account: "accounts",
        template: "reVerifyEmail",
        address: email,
        subject: "Verify Your Email to Keep Your SoccerMASS Account Active",
        payload: {
          activationLink: `${process.env.PROTOCOL}${process.env.CLIENT_DOMAIN}/accounts/verify-email?gear=${otp.code}`,
          fullName,
        },
      });

      throw { message: "Unlock access to our services by verifying your account now. Check your inbox for our latest verification email." };
    }

    await PROFILE.findByIdAndUpdate({ _id }, { $set: { lastLogin: new Date() } });
    await pushMail({ account: "accounts", template: "successfulLogin", address: email, subject: "Successful Login to SoccerMASS", payload: { fullName } });

    const token = jwt.sign({ session, role, fullName, handle }, process.env.SECRET as string, { expiresIn: "120 days" });

    const data = { success: true, message: "Email/Password is Valid.", payload: { role, fullName, handle } };

    const cookiesOption = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      // domain: req.headers.origin?.replace("http://", ".")?.replace("https://", ".")?.replace(/:\d+/, ""),
      expires: nTimeFromNowFn({ context: "days", interval: 120 }),
    };

    res.status(200).cookie("SoccerMASS", token, cookiesOption).json(data);
  } catch (err: any) {
    return catchError({ res, err });
  }
};
