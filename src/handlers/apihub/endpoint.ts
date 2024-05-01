import { NextFunction, Request, Response } from "express";

import { isValidObjectId } from "mongoose";
import { ENDPOINTS } from "../../models/apihub";
import { catchError, requestHasBody } from "../../utils/handlers";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    requestHasBody({ body: req.params, required: ["path"], sendError: true });
    const { path } = req.params;

    if (!path) throw { message: `Invalid Path provided` };

    const result = await ENDPOINTS.findOne({ path }, { _id: 0, id: "$_id", title: 1, description: 1, snippets: 1, response: 1 });
    if (!result) throw { message: "Unable to retrieve Endpoint", sendError: true };

    const data = { success: true, data: result, message: "Endpoint Successfully retrieved" };

    return res.status(200).json(data);
  } catch (err: any) {
    return catchError({ res, err });
  }
};
