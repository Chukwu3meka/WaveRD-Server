import { NextFunction, Request, Response } from "express";
import { ProfileModel } from "../../../model/app_schema";
// import ProfileModel from "../../../model/app_schema/profile";
import { catchError, requestHasBody, sleep } from "../../../utils/handlers";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    requestHasBody({ body: req.body, required: ["email", "password"] });

    // const { acc } = req.query;

    // const account = (acc as string).replaceAll('"', "");

    console.log({ email, password, ProfileModel });

    await ProfileModel.create({ email, password, handle: "saddsa" });

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
