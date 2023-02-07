import { NextFunction, Request, Response } from "express";

import validator from "../../../utils/validator";
import { PROFILE } from "../../../models/accounts";
import { catchError, requestHasBody } from "../../../utils/handlers";

export const handleExistsFn = async (handle: string) => {
  validator({ type: "handle", value: handle });

  const dbResponse = await PROFILE.findOne({ handle: { $regex: new RegExp("^" + handle, "i") } }); // ? FOR INSENSITIVITY SEARCH

  return !!dbResponse;
};

export default async (req: Request, res: Response, next: NextFunction) => {
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