import { NextFunction, Request, Response } from "express";

import validator from "../../../utils/validator";
import { catchError, requestHasBody } from "../../../utils/handlers";
import { PROFILE } from "../../../models/accounts";
// import { PROFILE } from "../../../models";
// import { PROFILE } from "../../../models";
// import { PROFILE } from "../../../models/accounts/personal";

// import models from "../../../models";
// // const { PROFILE } = models;

export const emailExistsFn = async (email: string) => {
  validator({ type: "email", value: email });

  // const {
  //   default: { PROFILE },
  // } = await import("../../../models");

  console.log({ email, emailExistsFn });
  const dbResponse = await PROFILE.findOne({ email });

  console.log(email, dbResponse);
  return !!dbResponse;
};

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    requestHasBody({ body: req.body, required: ["email"] });
    const { email } = req.body;

    const emailExists = await emailExistsFn(email);

    const data = { success: true, message: `${email} is ${emailExists ? "taken" : "available"}`, payload: { taken: emailExists } };

    res.status(200).json(data);
  } catch (err: any) {
    console.log("eerrr", err);
    return catchError({ res, err, status: err.status, message: err.message });
  }
};
