import { NextFunction, Request, Response } from "express";

import { isValidObjectId } from "mongoose";
import { ENDPOINTS } from "../../models/apihub";
import { catchError, requestHasBody } from "../../utils/handlers";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    requestHasBody({ body: req.query, required: ["limit"], error: true });
    let { limitStr } = req.query;
    const limit = Number(limitStr);

    if (limit > 20) throw { message: "Limit must not exceed 20", error: true };

    const result = await ENDPOINTS.aggregate([
      { $sample: { size: 20 } },
      { $project: { _id: 0, id: "$_id", title: 1, description: 1, snippet: 1, response: 1 } },
      { $limit: limit },
    ]);

    if (!result) throw { message: "Unable to retrieve Players", error: true };

    const data = { success: true, payload: result, message: "Players Successfully retrieved" };

    return res.status(200).json(data);
  } catch (err: any) {
    return catchError({ res, err });
  }
};
