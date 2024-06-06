import validate from "../../../utils/validate";

import { Request, Response } from "express";
import { ENDPOINTS } from "../../../models/apihub";
import { HTTP_METHODS } from "../../../utils/constants";
import { catchError, requestHasBody, sleep } from "../../../utils/handlers";

export const endpointTitleExistsFn = async (title: string) => {
  validate({ type: "comment", value: title, sendError: true, label: "Title" });

  const dbResponse = await ENDPOINTS.findOne({ title });
  return !!dbResponse;
};

const composeHandler = async ({ path, method }: { path: string; method: string }) => {
  if (path.startsWith(`${process.env.STABLE_VERSION}/public/`) && HTTP_METHODS.includes(method)) {
    const startTime = Date.now(),
      endpointResponse = await fetch(process.env.BASE_URL + path, {
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
          "x-waverd-host": "Wave-Research-2018",
          "x-waverd-key": "Wave-Research-APIHUB-2023",
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
      data: { latency: (Date.now() - startTime).toString(), response: endpointResponse },
    };

    return data;
  } else {
    return { success: false, data: null, message: "Invalid Hub endpoint query" };
  }
};

const composeEndpoint = async (req: Request, res: Response) => {
  try {
    requestHasBody({ body: req.body, required: ["method", "path"] });

    const { method, path } = req.body;

    // 405

    // validate({ value: path, type: "query" });
    // validate({ value: method, type: "query" });

    const composeResponse = await composeHandler({ method, path });
    if (!composeResponse) throw { message: "Unable to compose Endpoint" };

    return res.status(composeResponse.success ? 200 : 406).json(composeResponse);
  } catch (err: any) {
    err.status = 409;
    return catchError({ res, err });
  }
};

export { composeHandler, composeEndpoint as default };
