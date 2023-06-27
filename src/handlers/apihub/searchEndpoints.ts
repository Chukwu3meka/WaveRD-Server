import validator from "../../utils/validator";
import { ENDPOINTS } from "../../models/apihub";
import { catchError, requestHasBody } from "../../utils/handlers";

// interfaces
import { Request, Response } from "express";

export default async (req: Request, res: Response) => {
  try {
    requestHasBody({ body: req.query, required: ["phrase"], error: true });

    const { phrase = " " } = req.query;

    validator({ type: "phrase", value: phrase, error: true });

    const result = await ENDPOINTS.aggregate([
      {
        $search: {
          index: "default",
          compound: {
            should: [
              { autocomplete: { query: phrase, path: "title", score: { boost: { value: 3 } }, fuzzy: { maxEdits: 2, prefixLength: 3 } } },
              { text: { query: phrase, path: "description" } },
              { text: { query: phrase, path: "category" } },
            ],
          },
        },
      },
      { $project: { _id: 0, id: "$_id", title: 1, category: 1, description: 1, score: { $meta: "searchScore" } } },
      { $limit: 10 },
    ]);

    const data = {
      success: true,
      payload: result,
      message: result.length ? "Endpoints similar to Search Phrase retrieved" : "Could not match endpoints with search phrase",
    };

    return res.status(200).json(data);
  } catch (err: any) {
    if (err.error && err.type === "validator") {
      const data = { success: true, message: "Endpoints could not be retrieved", payload: [] };
      return res.status(200).json(data);
    }

    return catchError({ res, err });
  }
};
