import { NextFunction, Request, Response } from "express";
import { catchError, requestHasBody, sleep } from "../../../utils/handlers";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    requestHasBody({ body: req.body, required: ["email", "password", "fullName", "handle"] });
    const { email, password, fullName, handle } = req.body;

    console.log({ email, password, fullName, handle });
    // const { acc } = req.query;

    // const account = (acc as string).replaceAll('"', "");
    // console.log(typeof account);

    return res.status(200).json("successfull signin");
  } catch (err: any) {
    return catchError({ res, err, status: err.status, message: err.message });
  }
};
