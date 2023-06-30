import validator from "../../utils/validator";
import { ENDPOINTS } from "../../models/apihub";
import { catchError, requestHasBody } from "../../utils/handlers";

// interfaces
import { Request, Response } from "express";

export default async (req: Request, res: Response) => {
  try {
    requestHasBody({ body: req.query, required: ["query"], error: true });

    const { query } = req.query;

    validator({ type: "query", value: query, error: true });

    const result = await ENDPOINTS.aggregate([
      {
        $search: {
          index: "default",
          compound: {
            should: [
              { autocomplete: { query, path: "title", score: { boost: { value: 3 } }, fuzzy: { maxEdits: 2, prefixLength: 3 } } },
              { text: { query, path: "description" } },
              { text: { query, path: "category" } },
            ],
          },
        },
      },
      { $project: { _id: 0, id: "$_id", title: 1, description: 1, score: { $meta: "searchScore" } } },
      { $limit: 5 },
    ]);

    const data = {
      success: true,
      data: result,
      message: result.length ? "Endpoints similar to Search Phrase retrieved" : "Could not match endpoints with search phrase",
    };

    return res.status(200).json(data);
  } catch (err: any) {
    if (err.error && err.type === "validator") {
      const data = { success: true, message: "Endpoints could not be retrieved", data: [] };
      return res.status(200).json(data);
    }

    return catchError({ res, err });
  }
};
