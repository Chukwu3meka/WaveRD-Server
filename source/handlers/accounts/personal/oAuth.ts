import jwt from "jsonwebtoken";
import { v4 as uniqueId } from "uuid";
import { NextFunction, Request, Response } from "express";

import pushMail from "../../../utils/pushMail";
import { SESSION } from "../../../models/accounts";
import { catchError, differenceInHour, nTimeFromNowFn, requestHasBody, sleep } from "../../../utils/handlers";
import validator from "../../../utils/validator";
import auth from "./auth";

// const Profile = require("../models/profile");
// const { validate } = require("../utils/validator");
// const { obfuscate, asterickMail } = require("../utils/serverFunctions");

// const catchErr = ({ res, req, err }: any) => {
//   if (process.env.NODE_ENV !== "production") console.log(err);

//   const email = validate("email", req.user);
//   return res.redirect(`${process.env.CLIENT}auth/signin?token=failed&rstd=${obfuscate(email)}`);
// };

const oAuthFunc = async (req: Request, res: Response) => {
  const email = req.user;
  validator({ type: "email", value: req.user, label: "Email" });

  console.log({ email });

  // if (email) {
  //   const profile = await Profile.findOne({ email });
  //   if (!profile) throw "Profile not found";

  console.log("adsfddsf d dsa f df ad f sad sad fdsafds");

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

  // return res.status(200).cookie("").redirect(`http://${process.env.CLIENT_DOMAIN}/auth/signin?token=${"clientToken"}`);
  req.body.oAuth = true;
  req.body.email = email;

  auth(req, res);
};

export const facebookAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await oAuthFunc(req, res);
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: err.message });
  }
};

export const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await oAuthFunc(req, res);
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: err.message });
  }
};

export const twitterAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await oAuthFunc(req, res);
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: err.message });
  }
};
