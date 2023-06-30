import { NextFunction, Request, Response } from "express";

import { PLAYERS } from "../../models/apihub";
import { catchError } from "../../utils/handlers";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 5 } = req.query;
    if (limit && Number(limit) > 5) throw { message: "Limit must not exceed 5", error: true };

    const result = await PLAYERS.aggregate([
      { $sample: { size: Number(limit) } },

      {
        $lookup: {
          from: "clubs",
          localField: "club",
          foreignField: "_id",
          as: "clubs",
        },
      },

      {
        $project: {
          _id: 0,
          id: "$_id",
          name: 1,
          value: 1,
          roles: 1,
          rating: 1,
          country: 1,
          club: { $arrayElemAt: ["$clubs.title", 0] },
          dob: { $dateToString: { format: "%Y-%m-%d", date: "$dob" } },
        },
      },

      { $limit: Number(limit) },
    ]);

    if (!result) throw { message: "Unable to retrieve Players", error: true };

    const data = { success: true, payload: result, message: "Players Successfully retrieved" };

    return res.status(200).json(data);
  } catch (err: any) {
    return catchError({ res, err });
  }
};
