import { NextFunction, Request, Response } from "express";
import { appModels } from "../../../models";

import { catchError, requestHasBody } from "../../../utils/handlers";
import validator from "../../../utils/validator";

const emailExistsFn = async (email: string) => {
  validator({ type: "email", value: email });

  const dbResponse = await appModels.ProfileModel.findOne({ email });

  return !!dbResponse;
};

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    requestHasBody({ body: req.body, required: ["email"] });
    const { email } = req.body;

    const emailExists = await emailExistsFn(email);

    const data = { success: true, message: null, payload: { emailTaken: emailExists } };

    res.status(200).json(data);
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: err.message });
  }
};
