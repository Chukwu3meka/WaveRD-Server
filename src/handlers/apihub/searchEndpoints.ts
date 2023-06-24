import { NextFunction, Request, Response } from "express";

import validator from "../../utils/validator";
import { ENDPOINTS } from "../../models/apihub";
import { catchError, requestHasBody } from "../../utils/handlers";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    requestHasBody({ body: req.query, required: ["phrase"], error: true });

    const { phrase } = req.query;

    validator({ type: "phrase", value: phrase, error: true });

    const result = await ENDPOINTS.aggregate([
      {
        $search: {
          index: "default",
          autocomplete: {
            query: phrase || " ",
            path: "title",
            // fuzzy: { maxEdits: 2, prefixLength: 3 },
          },
        },
      },
      {
        $project: {
          title: 1,
          category: 1,
          description: 1,
          score: {
            $meta: "searchScore",
          },
        },
      },
      {
        $limit: 10,
      },
    ]);

    const data = {
      success: true,
      payload: result,
      message: result.length ? "Endpoints similar to Search Phrase retrieved" : "Could not match endpoints with search phrase",
    };

    return res.status(200).json(data);
  } catch (err: any) {
    if (err.error && err.type === "validator") {
      const data = { success: true, message: "Endpoints counld not be retrieved", payload: [] };
      return res.status(200).json(data);
    }

    return catchError({ res, err });
  }
};
