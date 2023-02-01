import { NextFunction, Request, Response } from "express";
import { appModels } from "../../../models";

// import ProfileModel from "../../../model/app_schema/profile";
import { catchError, requestHasBody, sleep } from "../../../utils/handlers";
import validator from "../../../utils/validator";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    requestHasBody({ body: req.body, required: ["email"] });
    const { email } = req.body;

    validator(email);

    const dbResponse = await appModels.ProfileModel.findOne({ email });

    const data = { success: true, message: null, payload: { emailTaken: !!dbResponse } };

    res.status(200).json(data);
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: err.message });
  }
};
