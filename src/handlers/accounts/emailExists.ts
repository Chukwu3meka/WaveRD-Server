import { Request, Response } from "express";

import validate from "../../utils/validator";
import { PROFILE } from "../../models/accounts";
import { catchError, requestHasBody } from "../../utils/handlers";

export const emailExistsFn = async (email: string) => {
  validate({ type: "email", value: email });
  const dbResponse = await PROFILE.findOne({ email });
  return !!dbResponse;
};

export default async (req: Request, res: Response) => {
  try {
    requestHasBody({ body: req.body, required: ["email"] });
    const { email } = req.body;

    const emailExists = await emailExistsFn(email);
    const data = { success: true, message: `${email} is ${emailExists ? "taken" : "available"}`, data: { exists: emailExists } };

    res.status(200).json(data);
  } catch (err: any) {
    err.status = 409;
    return catchError({ res, err });
  }
};
