import validate from "../../../utils/validate";

import { Request, Response } from "express";
import { ENDPOINTS } from "../../../models/apihub";
import { HTTP_METHODS } from "../../../utils/constants";
import { catchError, requestHasBody } from "../../../utils/handlers";

export const endpointTitleExistsFn = async (title: string) => {
  validate({ type: "comment", value: title, sendError: true, label: "Title" });

  const dbResponse = await ENDPOINTS.findOne({ title });
  return !!dbResponse;
};

export default async (req: Request, res: Response) => {
  try {
    requestHasBody({ body: req.body, required: ["method", "path"] });

    const { method, path } = req.body;

    // validate({ value: path, type: "query" });
    // validate({ value: method, type: "query" });

    if (path.startsWith(`/${process.env.API_VERSION}/hub/`) && HTTP_METHODS.includes(method)) {
      const startTime = Date.now(),
        endpointResponse = await fetch(process.env.API_URL + path, {
          /* credentials: "include", tells browser will include credentials in the request,
    The server must respond with the appropriate CORS headers, including:
    Access-Control-Allow-Origin and Access-Control-Allow-Credentials,
    to allow the response to be received by the client. */
          // credentials: "include",
          credentials: "same-origin",
          /* mode: "cors", This involves sending a preflight OPTIONS request to the server to check whether the server allows the requested access,
    and then sending the actual request if the server responds with the appropriate CORS headers. */
          mode: "same-origin",
          method,
          cache: "no-store",

          headers: {
            "Content-Type": "application/json",
            "x-soccermass-host": "SoccerMASS-2018",
            "x-soccermass-key": "SoccerMASS-APIHUB-2023",
          },
        })
          .then(async (res) => {
            if (!res.ok) return null;

            return res
              .json()
              .then(async (res) => res.data)
              .catch(async (err) => null);
          })
          .catch(() => null);

      const data = {
        success: true,
        message: "API composed successfully",
        data: { latency: Date.now() - startTime, response: endpointResponse },
      };

      res.status(200).json(data);
    } else {
      res.status(200).json({ success: false, data: null, message: "Invalid Hub endpoint query" });
    }
  } catch (err: any) {
    err.status = 409;
    return catchError({ res, err });
  }
};
