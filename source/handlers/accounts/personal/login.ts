import { NextFunction, Request, Response } from "express";
// import { appModels } from "../../../models";

// import { accountsModel } from "../../../utils/models";

// import { catchError, requestHasBody } from "../../../utils/handlers";

// import validator from "../../../utils/validator";

import PersonalProfileModel from "../../../schema/accounts/personal/profile";
import PersonalSessionModel from "../../../schema/accounts/personal/session";

// import ProfileModel from "../../../model/app_schema/profile";
import { catchError, requestHasBody, sleep } from "../../../utils/handlers";

// const SESSION = appModels.appSessionModel;

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    requestHasBody({ body: req.body, required: ["email", "password"] });
    const { email, password, name } = req.body;

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
