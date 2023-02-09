import { NextFunction, Request, Response } from "express";

import validator from "../../utils/validator";
import { PROFILE } from "../../models/accounts";
import { catchError, requestHasBody } from "../../utils/handlers";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.cookies);

    console.log(req.params.id);

    requestHasBody({ body: req.params, required: ["id"] });
    const { id } = req.params;

    // const handleExists = await handleExistsFn(handle);

    const data = { success: true, message: `Club data for ${id} found}`, payload: { exists: "sads" } };

    res.status(200).json(data);
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: err.message });
  }
};
