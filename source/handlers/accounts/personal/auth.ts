import { NextFunction, Request, Response } from "express";
import { PROFILE, SESSION } from "../../../models/accounts";

import { catchError, differenceInHour, nTimeFromNowFn, requestHasBody, sleep } from "../../../utils/handlers";
import pushMail from "../../../utils/pushMail";
import { v4 as uniqueId } from "uuid";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    requestHasBody({ body: req.body, required: ["email", "password"] });
    const { email: authEmail, password: authPassword } = req.body;

    // verify that account exist, else throw an error
    const profileData = await SESSION.findOne({ email: authEmail });
    if (!profileData) throw { message: "Invalid Email/Password" };

    const { _id, lastLogin, locked, status, failedAttempts, role, email, password, session, verification, otp } = profileData;

    if (status !== "active") throw { message: "Reach out to us for assistance in reactivating your account or to inquire about the cause of deactivation" };

    // ? will throw error if passwords does not match
    const matchPassword = await profileData.comparePassword(authPassword);

    if (!matchPassword) {
      const currentFailedAttempts = failedAttempts + 1;
      if (currentFailedAttempts) await pushMail({ account: "accounts", template: "failedLogin", address: email, subject: "Failed Login Attempt - SoccerMASS" });

      if (currentFailedAttempts === 5)
        await pushMail({ account: "accounts", template: "lockNotice", address: email, subject: "Account Lock Notice - SoccerMASS" });

      if (currentFailedAttempts >= 5) {
        await SESSION.findByIdAndUpdate({ _id }, { $inc: { currentFailedAttempts: 1 }, $set: { locked: new Date() } });
      } else {
        await SESSION.findByIdAndUpdate({ _id }, { $inc: { currentFailedAttempts: 1 } });
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
      const otp = {
        purpose: "email verification",
        code: `${uniqueId()}-${uniqueId()}-${uniqueId()}`,
        expiry: nTimeFromNowFn({ context: "hours", interval: 3 }),
      };

      await SESSION.findByIdAndUpdate({ _id }, { $set: { otp } });

      await pushMail({
        account: "accounts",
        template: "reVerifyEmail",
        address: email,
        subject: "Verify Your Email to Keep Your SoccerMASS Account Active",
        payload: { activationLink: `${process.env.CLIENT_BASE_URL}/auth/verify-email?registration-id=${otp.code}` },
      });

      throw { message: "Unlock access to our services by verifying your account now. Check your inbox for our latest verification email." };
    }

    console.log(`
    
    ${authEmail}
    
    
    
    `);

    // await     SessionSchema.methods.comparePassword

    // const profile = await Profile.findOne({ email });

    // const validCredentials = await profile.comparePassword(password);
    // if (!validCredentials) throw "invalid credentials";

    // const { email, password } = validateRequestBody(req.body, ["email", "password"]);

    // const profile = await Profile.findOne({ email });

    // const validCredentials = await profile.comparePassword(password);
    // if (!validCredentials) throw "invalid credentials";

    // const { acc } = req.query;

    // const account = (acc as string).replaceAll('"', "");

    console.log({ email, password });

    // await SESSION.create({ email, password, name, profile_ID: "saddsa" });

    // await sleep(1);

    // if (account === "2020671697") {
    //   const payload = {
    //     status: "success",
    //     message: null,
    //     payload: {
    //       customerName: "Chukwuemeka Maduekwe",
    //       accountCurrency: "USD - United States Dollars",
    //       availableBalance: "450,587:84",
    //       ttBalance: "34,565",
    //       cashBalance: "367,327:20",
    //     },
    //   };

    // return res.status(200).json("successfull signup");
    // } else {
    //   throw { status: 404, message: "Account number not found" };
    // }
    const data = { success: true, message: "Valid email/password found in database.", payload: { status: "Account is active" } };
    res.status(200).json(data);
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: err.message });
  }
};
