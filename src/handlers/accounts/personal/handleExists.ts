import { NextFunction, Request, Response } from "express";

import validator from "../../../utils/validator";
import { PROFILE } from "../../../models/accounts";
import { catchError, requestHasBody } from "../../../utils/handlers";

export const handleExistsFn = async (handle: string) => {
  validator({ type: "handle", value: handle });

  const searchPhrase = new RegExp(`^${handle}$`); // ? FOR CASE INSENSITIVITY SEARCH
  const dbResponse = await PROFILE.findOne({ handle: { $regex: searchPhrase, $options: "i" } });

  return !!dbResponse;
};

export default async (req: Request, res: Response, next: NextFunction) => {
  console.log("sdfdsfds fdsfdsf s", req.headers);

  try {
    requestHasBody({ body: req.body, required: ["handle"] });
    const { handle } = req.body;

    const handleExists = await handleExistsFn(handle);

    const data = { success: true, message: `${handle} is ${handleExists ? "taken" : "available"}`, payload: { exists: handleExists } };

    res.status(200).json(data);
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: err.message });
  }
};
