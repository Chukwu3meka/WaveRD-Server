import { NextFunction, Request, Response } from "express";

import { isValidObjectId } from "mongoose";
import { ENDPOINTS } from "../../models/apihub";
import { catchError, requestHasBody } from "../../utils/handlers";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    requestHasBody({ body: req.params, required: ["id"], error: true });
    const { id } = req.params;

    const isClubIDValid = isValidObjectId(id);
    if (!isClubIDValid) throw { message: `Invalid Endpoint ID provided` };

    const result = await ENDPOINTS.findOne({ _id: id }, { _id: 0, id: "$_id", title: 1, description: 1, snippets: 1, response: 1 });
    if (!result) throw { message: "Unable to retrieve Endpoint", error: true };

    const data = { success: true, data: result, message: "Endpoint Successfully retrieved" };

    return res.status(200).json(data);
  } catch (err: any) {
    return catchError({ res, err });
  }
};
