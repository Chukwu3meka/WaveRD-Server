import { NextFunction, Request, Response } from "express";
import { CATEGORIES, ENDPOINTS } from "../../models/apihub";
import { catchError } from "../../utils/handlers";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ENDPOINTS.aggregate([{ $group: { _id: "$category", count: { $count: {} } } }]);

    const categories = [];

    for (const category of result) {
      const data = await CATEGORIES.findById(category._id, { updated: 0, __v: 0 });
      categories.push(data);
    }

    const data = { success: true, data: categories, message: "Endpoints Successfully retrieved" };

    return res.status(200).json(data);
  } catch (err: any) {
    return catchError({ res, err });
  }
};
