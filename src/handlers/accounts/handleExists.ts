import { Request, Response } from "express";

import validate from "../../utils/validate";
import { PROFILE } from "../../models/accounts";
import { catchError, requestHasBody } from "../../utils/handlers";

export const handleExistsFn = async (handle: string) => {
  validate({ type: "handle", value: handle });

  const searchPhrase = new RegExp(`^${handle}$`); // ? FOR CASE INSENSITIVITY SEARCH
  const dbResponse = await PROFILE.findOne({ handle: { $regex: searchPhrase, $options: "i" } });

  return !!dbResponse;
};

export default async (req: Request, res: Response) => {
  try {
    requestHasBody({ body: req.body, required: ["handle"] });

    const { handle } = req.body;
    const handleExists = await handleExistsFn(handle);

    const data = { success: true, message: `${handle} is ${handleExists ? "taken" : "available"}`, data: { exists: handleExists } };

    res.status(200).json(data);
  } catch (err: any) {
    err.status = 409;
    return catchError({ res, err });
  }
};
