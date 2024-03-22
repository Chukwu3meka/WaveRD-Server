import validator from "../../utils/validate";

import { Request, Response } from "express";
import { ENDPOINTS } from "../../models/apihub";
import { catchError, requestHasBody, sleep } from "../../utils/handlers";

export default async (req: Request, res: Response) => {
  try {
    const hasSequenceParam = Object.hasOwn(req.query, "token");
    if (!hasSequenceParam) throw { message: "Sequence not specified", sendError: true };

    const hasTokenParam = Object.hasOwn(req.query, "token");
    if (!hasTokenParam) throw { message: "Token not specified", sendError: true };

    const hasSearchParam = Object.hasOwn(req.query, "phrase");
    if (!hasSearchParam) throw { message: "Search Param not specified", sendError: true };

    const hasLimitParam = Object.hasOwn(req.query, "limit");
    if (!hasLimitParam) throw { message: "Limit not specified", sendError: true };

    requestHasBody({ body: req.query, required: ["phrase", "token", "sequence"], sendError: true });
    if (!["next", "prev"].includes(<any>req.query.sequence)) throw { message: "Invalid Search Sequence" };

    const limit = parseInt(req.query.limit as any),
      { phrase, token, sequence } = req.query as any;

    validator({ type: "comment", value: phrase, sendError: true });
    if (token !== "initial") validator({ type: "comment", value: token, sendError: true });
    if (![3, 30].includes(limit)) throw { message: "Invalid limit specified", sendError: true };

    const result = await ENDPOINTS.aggregate([
      {
        $search:
          token === "initial"
            ? {
                index: "default",
                compound: {
                  should: [
                    {
                      autocomplete: {
                        query: phrase,
                        path: "title",
                        score: { boost: { value: 3 } },
                        fuzzy: { maxEdits: 2, prefixLength: 3 },
                      },
                    },
                    { text: { query: phrase, path: "description" } },
                    { text: { query: phrase, path: "category" } },
                  ],
                },
                sort: {
                  updated: 1,
                  unused: { $meta: "searchScore" },
                },

                count: {
                  type: "total",
                },
              }
            : {
                index: "default",
                compound: {
                  should: [
                    {
                      autocomplete: {
                        query: phrase,
                        path: "title",
                        score: { boost: { value: 3 } },
                        fuzzy: { maxEdits: 2, prefixLength: 3 },
                      },
                    },
                    { text: { query: phrase, path: "description" } },
                    { text: { query: phrase, path: "category" } },
                  ],
                },
                [sequence === "next" ? "searchAfter" : "searchBefore"]: token,
                sort: {
                  updated: 1,
                  unused: { $meta: "searchScore" },
                },

                count: {
                  type: "total",
                },
              },
      },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          title: 1,
          id: "$_id",
          description: 1,
          meta: "$$SEARCH_META",
          paginationToken: { $meta: "searchSequenceToken" },
        },
      },
    ]);

    const data = {
      success: true,
      data: result,
      message: result.length ? "Endpoints similar to Search Phrase retrieved" : "Could not match endpoints with search phrase",
    };

    await sleep(3);

    return res.status(200).json(data);
  } catch (err: any) {
    if (err.sendError && err.type === "validate") {
      const data = { success: true, message: "Endpoints could not be retrieved", data: [] };
      return res.status(200).json(data);
    }

    return catchError({ res, err });
  }
};
