import { NextFunction, Request, Response } from "express";

import { ENDPOINTS } from "../../../models/apihub";
import { catchError } from "../../../utils/handlers";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ENDPOINTS.aggregate([{ $project: { _id: 0, id: "$_id", title: 1, category: 1 } }, { $limit: 10 }]);

    const byCategory: any = {};

    for (const { title, category, id } of result) {
      if (byCategory[category]) {
        byCategory[category].push({ title, id });
      } else {
        byCategory[category] = [{ title, id }];
      }
    }

    const data = { success: true, data: byCategory, message: "Endpoints Successfully retrieved" };

    return res.status(200).json(data);
  } catch (err: any) {
    return catchError({ res, err });
  }
};
