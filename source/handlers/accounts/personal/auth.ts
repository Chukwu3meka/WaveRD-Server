import { NextFunction, Request, Response } from "express";
// import { appModels } from "../../../models";

// import { accountsModel } from "../../../utils/models";

// import { catchError, requestHasBody } from "../../../utils/handlers";

// import validator from "../../../utils/validator";

import { PROFILE, SESSION } from "../../../models/accounts";

// import ProfileModel from "../../../model/app_schema/profile";
import { catchError, requestHasBody, sleep } from "../../../utils/handlers";

// const SESSION = appModels.appSessionModel;

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    requestHasBody({ body: req.body, required: ["email", "password"] });
    const { email, password } = req.body;

    // verify that account exist, else throw an error
    const profileData = await PROFILE.findOne({ email });
    if (!profileData) throw { message: "Invalid Email/Password" };

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

    return res.status(200).json("successfull signup");
    // } else {
    //   throw { status: 404, message: "Account number not found" };
    // }
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: err.message });
  }
};
