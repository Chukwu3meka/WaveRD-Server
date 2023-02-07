import { Request, Response, NextFunction } from "express";
import AllRequestModel from "../schema/logs/allRequests";

const request_logger = async (req: Request, res: Response, next: NextFunction) => {
  const subdomain = req.headers.host?.split(".")[0];
  const endpoint = req.url;

  await AllRequestModel.create({ endpoint, subdomain });

  console.log({ subdomain, endpoint });
  next(); //Port is important if the url has it
};

export default request_logger;
