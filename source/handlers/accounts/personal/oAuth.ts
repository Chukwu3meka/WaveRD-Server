import jwt from "jsonwebtoken";
import { v4 as uniqueId } from "uuid";
import { NextFunction, Request, Response } from "express";

import pushMail from "../../../utils/pushMail";
import { SESSION } from "../../../models/accounts";
import { catchError, differenceInHour, nTimeFromNowFn, obfuscate, requestHasBody, sleep } from "../../../utils/handlers";
import validator from "../../../utils/validator";

// const Profile = require("../models/profile");
// const { validate } = require("../utils/validator");
// const { obfuscate, asterickMail } = require("../utils/serverFunctions");

// const catchErr = ({ res, req, err }: any) => {
//   if (process.env.NODE_ENV !== "production") console.log(err);

//   const email = validate("email", req.user);
//   return res.redirect(`${process.env.CLIENT}auth/signin?token=failed&rstd=${obfuscate(email)}`);
// };

const oAuthFunc = async (req: Request, res: Response) => {
  const auth = req.body.auth;
  try {
    validator({ type: "email", value: req.user, label: "Email" });

    console.log({ email: req.user, auth });

    const searchResult = await SESSION.aggregate([
      { $match: { email: req.user } },
      { $lookup: { from: "personal_profiles", localField: "email", foreignField: "email", as: "profile" } },
      { $limit: 1 },
    ]);

    // verify that account exist, else throw an error
    if (!searchResult || !searchResult[0]) throw { message: "Email not associated with any account", client: true };

    const {
      _id,
      otp,
      email,
      role,
      locked,
      status,
      session,
      password,
      verification,
      failedAttempts,
      profile: [{ fullName, handle }],
    } = searchResult[0];

    if (status !== "active")
      throw { message: "Reach out to us for assistance in reactivating your account or to inquire about the cause of deactivation", client: true };

    if (locked) await SESSION.findByIdAndUpdate({ _id }, { $set: { locked: null } }); // ?  <= unlock account, since its social auth
    if (failedAttempts) await SESSION.findByIdAndUpdate({ _id }, { $set: { failedAttempts: 0 } }); // ? <= reset counter in failed attempt

    if (!verification?.email) {
      const lastSent = differenceInHour(otp.sent) || "an";

      if (lastSent > 3) {
        const newOTP = {
          sent: new Date(),
          purpose: "email verification",
          code: `${uniqueId()}-${uniqueId()}-${uniqueId()}`,
          expiry: nTimeFromNowFn({ context: "hours", interval: 3 }),
        };

        await SESSION.findByIdAndUpdate({ _id }, { $set: { newOTP } });

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

    await SESSION.findByIdAndUpdate({ _id }, { $set: { otp: newOTP } });

    // await pushMail({ account: "accounts", template: "successfulLogin", address: email, subject: "Successful Login to SoccerMASS", payload: { fullName } });

    // const token = jwt.sign({ session, role, fullName, handle }, process.env.SECRET as string, { expiresIn: "120 days" });

    // const data = { success: true, message: "Email/Password is Valid.", payload: { role, fullName, handle } };

    // const cookiesOption = {
    //   httpOnly: true,
    //   secure: process.env.production ? true : false,
    //   // domain: req.headers.origin?.replace("http://", ".")?.replace("https://", ".")?.replace(/:\d+/, ""),
    //   expires: nTimeFromNowFn({ context: "days", interval: 120 }),
    // };

    // res.status(200).cookie("SoccerMASS", token, cookiesOption).json(data);

    // if (email) {
    //   const profile = await Profile.findOne({ email });
    //   if (!profile) throw "Profile not found";

    // console.log("adsfddsf d dsa f df ad f sad sad fdsafds");

    //   const {
    //     club,
    //     mass,
    //     handle,
    //     division,
    //     session,
    //     stat: { verified },
    //   } = profile;

    //   if (verified === "verified") {
    //     const token = jwt.sign({ session, mass, club }, process.env.SECRET, { expiresIn: "90 days" }),
    //       clientToken = jwt.sign({ token, handle, division, mass, club }, process.env.SECRET, { expiresIn: "90 days" });
    //     return res.redirect(`${process.env.CLIENT}auth/signin?token=${clientToken}`);
    //   } else {
    //     return res.redirect(`${process.env.CLIENT}auth/signin?token=verify&email=${asterickMail(email)}`);
    //   }
    // }
    // return catchErr({ err: "mail missing", res, req });

    // console.log("dsafdsfdasfds", req.cookies.session,req.cookies.session.sig );

    return res.redirect(`http://${process.env.CLIENT_DOMAIN}/auth/signin/?response=${obfuscate(oAuthId)}`);
  } catch (err: any) {
    console.log(err);

    const message = err.client ? err.message : "We encountered an oAuth error. Please wait and try again later";
    return res.redirect(`http://${process.env.CLIENT_DOMAIN}/auth/signin/?${auth}=${obfuscate(`${new Date()}`)}&response=${obfuscate(message)}`);
    // return catchError({ res, err, status: err.status, message });
  }
};

export const facebookAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body.auth = "facebook";
    await oAuthFunc(req, res);
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: err.message });
  }
};

export const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body.auth = "google";
    await oAuthFunc(req, res);
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: err.message });
  }
};

export const twitterAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body.auth = "twitter";
    await oAuthFunc(req, res);
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: err.message });
  }
};

const oAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    requestHasBody({ body: req.body, required: ["oAuthID"] });
    // const { email: authEmail, password: authPassword } = req.body;

    console.log("dsafdsfdasfds", req.body.oAuthID);

    // req.body.auth = "twitter";
    // await oAuthFunc(req, res);
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: err.message });
  }
};

export default oAuth;
