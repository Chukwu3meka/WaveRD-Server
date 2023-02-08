import { NextFunction, Request, Response } from "express";
import { PROFILE, SESSION } from "../../../models/accounts";

import { catchError, requestHasBody, sleep } from "../../../utils/handlers";
import pushMail from "../../../utils/pushMail";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    requestHasBody({ body: req.body, required: ["email", "password"] });
    const { email: authEmail, password: authPassword } = req.body;

    // verify that account exist, else throw an error
    const profileData = await SESSION.findOne({ email: authEmail });
    if (!profileData) throw { message: "Invalid Email/Password" };

    const { _id, lastLogin, locked, status, failedAttempts, role, email, password, session, verification, otp } = profileData;

    // ? will throw error if passwords does not match
    const matchPassword = await profileData.comparePassword(authPassword);

    if (!matchPassword) {
      // if (failedAttempts === 5)
      await pushMail({ account: "accounts", template: "failedLogin", address: email, subject: "Failed Login Attempt to your SoccerMASS Account" });

      await SESSION.findByIdAndUpdate({ _id }, { $inc: { failedAttempts: 1 }, $set: { locked: new Date() } });
      throw { message: "Invalid Email/Password" };
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
