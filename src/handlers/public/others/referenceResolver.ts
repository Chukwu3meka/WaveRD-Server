import * as CATEGORIES_MODEL from "../../../models/apihub";

import { Request, Response } from "express";
import { catchError, requestHasBody } from "../../../utils/handlers";

export default async function referenceResolver(req: Request, res: Response) {
  try {
    requestHasBody({ body: req.query, required: ["category", "refs"], sendError: true });

    const { refs: tempRefs, category: tempCategory } = req.query,
      refs = tempRefs?.toString().replace(/\s/g, "").split(","),
      category = tempCategory?.toString() || "",
      categories = ["players", "clubs"];

    if (!refs || !category) throw { sendError: true, message: `Invalid  Reference/Category provided` };
    if (!Array.isArray(refs)) throw { sendError: true, message: `References data format is Invalid/broken` };
    if (!categories.includes(category)) throw { sendError: true, message: `Currently unable to map category` };

    type Categories = "PLAYERS" | "CLUBS";

    const result = await CATEGORIES_MODEL[category.toUpperCase() as Categories].aggregate([
      { $match: { ref: { $in: refs } } }, //
      { $project: { title: true, ref: true, _id: false } },
    ]);

    const data = {
      success: true,
      data: result,
      message: result.length ? "Converted successfully" : "Convertion Failed",
    };

    return res.status(200).json(data);
  } catch (err: any) {
    if (err.sendError && err.type === "validate") {
      const data = { success: false, message: err.description && err.description.message, data: null };
      return res.status(400).json(data);
    }

    return catchError({ res, err });
  }
}
