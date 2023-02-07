import { NextFunction, Request, Response } from "express";

import validator from "../../../utils/validator";
import { PROFILE } from "../../../models/accounts";
import { catchError, requestHasBody } from "../../../utils/handlers";

export const emailExistsFn = async (email: string) => {
  validator({ type: "email", value: email });

  const dbResponse = await PROFILE.findOne({ email });

  return !!dbResponse;
};

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    requestHasBody({ body: req.body, required: ["email"] });
    const { email } = req.body;

    const emailExists = await emailExistsFn(email);

    const data = { success: true, message: `${email} is ${emailExists ? "taken" : "available"}`, payload: { exists: emailExists } };

    res.status(200).json(data);
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: err.message });
  }
};